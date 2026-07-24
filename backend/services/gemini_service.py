import json
import logging
from google import genai
from google.genai import types
from config import settings

logger = logging.getLogger("uvicorn.error")

def get_gemini_client() -> genai.Client | None:
    """Initialize and return Gemini Client if API key is set."""
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key == "MY_GEMINI_API_KEY":
        return None
    return genai.Client(api_key=api_key)

async def analyze_song_metadata(title: str, artist: str, style: str) -> dict:
    """Analyze song title, artist, and style to extract mood, genre, and visual prompt."""
    client = get_gemini_client()
    song_title = title.strip() if title else "Untitled Track"
    song_artist = artist.strip() if artist else "Unknown Artist"
    selected_style = style.strip() if style else "cinematic"

    if not client:
        # Fallback if Gemini API Key is missing
        return {
            "title": song_title,
            "artist": song_artist,
            "mood": f"Atmospheric {selected_style.title()}",
            "genre": "Ambient Electronic",
            "tempo": "Mid-tempo (100 BPM)",
            "visualDescription": f"A dramatic {selected_style} composition with atmospheric depth.",
            "imagePrompt": f"A high resolution {selected_style} album cover art for '{song_title}' by {song_artist}, cinematic lighting, 8k masterpiece",
            "colorPalette": ["#0f172a", "#3b82f6", "#ec4899", "#f59e0b"],
            "typographyStyle": "Modern Bold Sans-Serif",
            "source": "fallback"
        }

    prompt = f"""Analyze the song "{song_title}" by "{song_artist}" for a music video in "{selected_style}" style.
Generate a JSON object with:
- title: string
- artist: string
- mood: string (e.g. Energetic, Nostalgic, Ethereal)
- genre: string
- tempo: string (e.g. Fast 128 BPM, Slow Chill 75 BPM)
- visualDescription: detailed description of the video concept
- imagePrompt: optimized prompt for cover image generation
- colorPalette: array of 4 hex color codes matching the song
- typographyStyle: suggested font style
"""

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_TEXT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        if response.text:
            data = json.loads(response.text)
            data["source"] = "gemini"
            return data
    except Exception as e:
        logger.error(f"Gemini analysis error: {e}")

    return {
        "title": song_title,
        "artist": song_artist,
        "mood": f"Moody {selected_style.title()}",
        "genre": "Music Track",
        "tempo": "100 BPM",
        "visualDescription": "Atmospheric composition with vibrant color contrasts.",
        "imagePrompt": f"Cover art for '{song_title}', {selected_style} style, trending on artstation, 8k",
        "colorPalette": ["#1e1b4b", "#6366f1", "#a855f7", "#ec4899"],
        "typographyStyle": "Clean Display",
        "source": "fallback"
    }

PROMPT_STYLE_TEMPLATES = {
    "cinematic": {
        "suffix": "dramatic volumetric lighting, anamorphic lens flares, filmic 35mm grain, epic scale, 8k resolution, photorealistic masterpiece, trending on ArtStation",
        "colors": ["#0f172a", "#f59e0b", "#78350f", "#3b82f6"]
    },
    "fantasy": {
        "suffix": "ethereal bioluminescent glow, enchanted mythical flora, magic runes, soft floating particles, Studio Ghibli inspired digital painting, 8k render",
        "colors": ["#022c22", "#10b981", "#06b6d4", "#6366f1"]
    },
    "anime": {
        "suffix": "Makoto Shinkai style, lush cumulus sunset clouds, swirling cherry blossom petals, vibrant twilight, cel-shaded high detail anime artwork, 8k wallpaper",
        "colors": ["#4c0519", "#f43f5e", "#38bdf8", "#fbbf24"]
    },
    "relaxing": {
        "suffix": "cozy indoor lo-fi room, warm lamp light, rain drops on windowsill, soft pastels, relaxing study focus vibe, 8k digital illustration",
        "colors": ["#451a03", "#fb923c", "#d97706", "#1c1917"]
    },
    "cyberpunk": {
        "suffix": "neon magenta and cyan rain reflections, futuristic street cityscape, holographic billboards, dark dystopian atmosphere, Raytracing, octane render, 8k",
        "colors": ["#4a044e", "#ec4899", "#06b6d4", "#0f172a"]
    },
    "minimal": {
        "suffix": "sleek 3D geometric abstract art, smooth iridescent lighting, soft studio background, modern typography framing, Blender 3D render, pristine 8k",
        "colors": ["#0f172a", "#38bdf8", "#818cf8", "#f87171"]
    }
}

async def refine_image_prompt(title: str, style: str, keywords: str, mood: str = "", genre: str = "") -> str:
    """Refine and expand a user's prompt into a professional YouTube music cover art prompt."""
    client = get_gemini_client()
    style_key = (style or "cinematic").lower()
    tmpl = PROMPT_STYLE_TEMPLATES.get(style_key, PROMPT_STYLE_TEMPLATES["cinematic"])
    
    base_concept = f"Cover art for '{title or 'Music Track'}' ({genre or 'Music'}, mood: {mood or 'atmospheric'})"
    if keywords:
        base_concept += f", featuring {keywords}"
        
    default_prompt = f"Professional YouTube cover art: {base_concept}. Style: {style_key}. {tmpl['suffix']}"

    if not client:
        return default_prompt

    prompt = f"""You are a professional AI Art Prompt Engineer for YouTube Music Video Cover Art.
Generate an optimized, highly descriptive image generation prompt.
Input details:
- Song Title: "{title or 'Music Track'}"
- Style Category: "{style_key}" (Options: Cinematic, Fantasy, Anime, Relaxing, Cyberpunk, Minimal)
- Song Mood: "{mood or 'atmospheric'}"
- Song Genre: "{genre or 'Electronic'}"
- User Keywords: "{keywords}"

Instructions:
1. Combine the subject, lighting, atmosphere, and camera parameters into a single cohesive prompt.
2. Ensure the prompt is ideal for generating a high-converting YouTube Music Video cover image.
3. Incorporate style aesthetic markers: {tmpl['suffix']}
4. Output strictly the prompt text (60-85 words max), no intro or quotes.
"""

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_TEXT_MODEL,
            contents=prompt,
        )
        if response.text:
            return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini prompt refinement error: {e}")

    return default_prompt

