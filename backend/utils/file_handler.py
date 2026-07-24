import uuid
import shutil
import time
from pathlib import Path
from fastapi import UploadFile, HTTPException
from config import settings

def generate_unique_id() -> str:
    """Generate a short unique identifier for session or file tracking."""
    return uuid.uuid4().hex[:10]

async def save_upload_file(upload_file: UploadFile) -> tuple[Path, str]:
    """Save an uploaded audio file to the temporary upload directory."""
    if not upload_file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file missing filename")

    ext = Path(upload_file.filename).suffix.lower()
    if ext not in [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"]:
        raise HTTPException(status_code=400, detail=f"Unsupported audio extension: {ext}")

    file_id = generate_unique_id()
    saved_filename = f"{file_id}{ext}"
    dest_path = settings.UPLOAD_DIR / saved_filename

    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save upload file: {str(e)}")

    return dest_path, file_id

def cleanup_old_temp_files(max_age_seconds: int = 3600) -> None:
    """Delete temporary files older than max_age_seconds (default 1 hour)."""
    now = time.time()
    for directory in [settings.UPLOAD_DIR, settings.OUTPUT_DIR]:
        for file_path in directory.glob("*"):
            if file_path.is_file():
                if now - file_path.stat().st_mtime > max_age_seconds:
                    try:
                        file_path.unlink()
                    except Exception:
                        pass
