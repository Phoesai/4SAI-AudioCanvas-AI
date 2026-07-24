import base64
import logging
from pathlib import Path
from google import genai
from google.genai import types
from config import settings
from services.gemini_service import get_gemini_client

logger = logging.getLogger("uvicorn.error")

async def generate_cover_image(
    prompt: str,
    aspect_ratio: str = "16:9",
    style: str = "cinematic",
    output_filename: str | None = None
) -> dict:
    """Generate a cover image using Gemini Image Generation model."""
    client = get_gemini_client()
    if not client:
        return {
            "success": False,
            "error": "GEMINI_API_KEY is not configured in backend settings.",
            "image_url": None
        }

    target_ar = aspect_ratio if aspect_ratio in ["16:9", "9:16", "1:1"] else "16:9"
    final_prompt = prompt or f"A stunning cover image for music video, {style} style, highly detailed 8k art"

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_IMAGE_MODEL,
            contents=final_prompt,
            config=types.GenerateContentConfig(
                image_config=types.ImageConfig(
                    aspect_ratio=target_ar
                )
            )
        )

        image_bytes = None
        mime_type = "image/png"

        if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data:
                    image_bytes = part.inline_data.data
                    mime_type = part.inline_data.mime_type or "image/png"
                    break

        if not image_bytes:
            return {
                "success": False,
                "error": "No image data returned from Gemini Image model.",
                "image_url": None
            }

        # If output filename specified, save to disk
        saved_file_path = None
        if output_filename:
            file_path = settings.OUTPUT_DIR / output_filename
            with open(file_path, "wb") as f:
                f.write(image_bytes)
            saved_file_path = str(file_path)

        base64_str = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:{mime_type};base64,{base64_str}"

        return {
            "success": True,
            "data_url": data_url,
            "saved_path": saved_file_path,
            "aspect_ratio": target_ar
        }

    except Exception as e:
        logger.error(f"Error generating cover image: {e}")
        return {
            "success": False,
            "error": str(e),
            "data_url": None
        }
