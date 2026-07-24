import os
import base64
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from config import settings
from utils.file_handler import save_upload_file, cleanup_old_temp_files, generate_unique_id
from services.gemini_service import analyze_song_metadata, refine_image_prompt
from services.image_service import generate_cover_image
from services.ffmpeg_service import combine_image_and_audio, generate_ffmpeg_cli_command

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="FastAPI backend for AI Music Video Creator with Gemini API & FFmpeg pipeline"
)

# Enable CORS for Next.js / React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class AnalyzeAudioRequest(BaseModel):
    title: str | None = None
    artist: str | None = None
    fileName: str | None = None
    selectedStyle: str | None = "cinematic"

class GenerateCoverRequest(BaseModel):
    prompt: str | None = None
    aspectRatio: str | None = "16:9"
    style: str | None = "cinematic"

class RefinePromptRequest(BaseModel):
    title: str | None = None
    style: str | None = "cinematic"
    keywords: str | None = None
    mood: str | None = None
    genre: str | None = None

class RenderVideoRequest(BaseModel):
    fileId: str
    imageUrl: str | None = None  # Base64 data URL or path
    aspectRatio: str | None = "16:9"
    title: str | None = None
    artist: str | None = None
    showWaveform: bool = True
    enableCameraPan: bool = True

@app.get("/")
def read_root():
    """Root health check endpoint."""
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }

@app.get("/api/health")
def health_check():
    """API health status."""
    return {"status": "ok", "gemini_configured": bool(settings.GEMINI_API_KEY)}

@app.post("/api/upload-audio")
async def upload_audio(
    background_tasks: BackgroundTasks,
    audio: UploadFile = File(...)
):
    """
    Endpoint 1: Handle MP3 upload and store temporarily on disk.
    """
    background_tasks.add_task(cleanup_old_temp_files)
    file_path, file_id = await save_upload_file(audio)

    # Read binary bytes to create base64 preview for web audio context
    with open(file_path, "rb") as f:
        audio_bytes = f.read()

    base64_audio = base64.b64encode(audio_bytes).decode("utf-8")
    mime_type = audio.content_type or "audio/mp3"

    return {
        "fileId": file_id,
        "originalName": audio.filename,
        "savedPath": str(file_path),
        "mimeType": mime_type,
        "dataUrl": f"data:{mime_type};base64,{base64_audio}"
    }

@app.post("/api/analyze-audio")
async def analyze_audio(body: AnalyzeAudioRequest):
    """
    Endpoint 2: Analyze song metadata and produce visual concept via Gemini 3.6 Flash.
    """
    analysis = await analyze_song_metadata(
        title=body.title or "",
        artist=body.artist or "",
        style=body.selectedStyle or "cinematic"
    )
    return {"analysis": analysis, "source": analysis.get("source", "gemini")}

@app.post("/api/generate-cover")
async def generate_cover(body: GenerateCoverRequest):
    """
    Endpoint 3: Generate AI Cover Art image using Gemini Image Model.
    """
    result = await generate_cover_image(
        prompt=body.prompt or "",
        aspect_ratio=body.aspectRatio or "16:9",
        style=body.style or "cinematic"
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to generate cover image"))

    return {
        "success": True,
        "imageUrl": result.get("data_url"),
        "aspectRatio": result.get("aspect_ratio")
    }

@app.post("/api/generate-prompt")
async def generate_prompt(body: RefinePromptRequest):
    """
    Endpoint 4: Refine image text prompt with Gemini and style templates.
    """
    refined = await refine_image_prompt(
        title=body.title or "Track",
        style=body.style or "cinematic",
        keywords=body.keywords or "",
        mood=body.mood or "",
        genre=body.genre or ""
    )
    return {"prompt": refined}

@app.post("/api/render-video")
async def render_video(body: RenderVideoRequest):
    """
    Endpoint 5: FFmpeg Processing Pipeline to combine cover image + audio into MP4 video file.
    """
    # Locate audio file
    audio_files = list(settings.UPLOAD_DIR.glob(f"{body.fileId}.*"))
    if not audio_files:
        raise HTTPException(status_code=404, detail="Audio file not found for the provided fileId")

    audio_path = audio_files[0]
    output_filename = f"music_video_{body.fileId}_{generate_unique_id()}.mp4"
    output_path = settings.OUTPUT_DIR / output_filename

    # Save image to temp path if provided as base64
    temp_img_path = settings.UPLOAD_DIR / f"cover_{body.fileId}.png"

    if body.imageUrl and body.imageUrl.startswith("data:image"):
        header, encoded = body.imageUrl.split(",", 1)
        img_data = base64.b64decode(encoded)
        with open(temp_img_path, "wb") as f:
            f.write(img_data)
    else:
        # Fallback placeholder image if none provided
        raise HTTPException(status_code=400, detail="Valid base64 imageUrl is required for video rendering")

    # Run FFmpeg pipeline with 7 animation layers
    result = await combine_image_and_audio(
        image_path=temp_img_path,
        audio_path=audio_path,
        output_path=output_path,
        aspect_ratio=body.aspectRatio or "16:9",
        title=body.title,
        artist=body.artist,
        enable_waveform=body.showWaveform,
        enable_camera_pan=body.enableCameraPan,
        enable_light_leak=True,
        enable_fade=True
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=f"FFmpeg render error: {result.get('error')}")

    ffmpeg_cli = generate_ffmpeg_cli_command(
        image_file="cover.png",
        audio_file="audio.mp3",
        output_file="output.mp4",
        aspect_ratio=body.aspectRatio or "16:9",
        title=body.title or "Song Title"
    )

    return {
        "success": True,
        "videoFilename": output_filename,
        "downloadUrl": f"/api/download-video/{output_filename}",
        "ffmpegCommand": ffmpeg_cli
    }

@app.get("/api/download-video/{filename}")
async def download_video(filename: str):
    """
    Endpoint 6: Download exported MP4 video file.
    """
    file_path = settings.OUTPUT_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found or expired")

    return FileResponse(
        path=file_path,
        media_type="video/mp4",
        filename=filename
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
