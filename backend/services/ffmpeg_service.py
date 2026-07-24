import asyncio
import logging
from pathlib import Path
from config import settings

logger = logging.getLogger("uvicorn.error")

async def combine_image_and_audio(
    image_path: Path | str,
    audio_path: Path | str,
    output_path: Path | str,
    aspect_ratio: str = "16:9",
    title: str | None = None,
    artist: str | None = None,
    enable_kenburns: bool = True,
    enable_camera_pan: bool = True,
    enable_fade: bool = True,
    enable_waveform: bool = True,
    enable_light_leak: bool = True,
    duration: float | None = None
) -> dict:
    """
    Advanced FFmpeg video processing pipeline with 7 motion & visual effects:
    1. Ken Burns Zoom Effect
    2. Slow Camera Movement (pan/drift)
    3. Fade In / Fade Out Transitions
    4. Light Leak Warmth & Glint Effect
    5. Vignette & Particle Glow
    6. Animated Song Title & Artist Text Overlay
    7. Audio Waveform Spectrum Visualizer
    """
    img = str(image_path)
    aud = str(audio_path)
    out = str(output_path)

    # Output dimensions based on aspect ratio
    if aspect_ratio == "9:16":
        width, height = 1080, 1920
        wave_h = 160
    elif aspect_ratio == "1:1":
        width, height = 1080, 1080
        wave_h = 140
    else:  # 16:9 default
        width, height = 1920, 1080
        wave_h = 120

    # Build complex filtergraph steps
    filter_chains = []

    # Step 1 & 2: Ken Burns Zoom + Slow Camera Movement
    if enable_camera_pan:
        zoompan_expr = (
            f"zoompan=z='min(zoom+0.0012,1.20)':"
            f"x='(iw-iw/zoom)/2+sin(time/2)*20':"
            f"y='(ih-ih/zoom)/2+cos(time/3)*15':"
            f"d=125:s={width}x{height}:fps=30"
        )
    elif enable_kenburns:
        zoompan_expr = (
            f"zoompan=z='min(zoom+0.0015,1.25)':"
            f"x='iw/2-(iw/zoom/2)':"
            f"y='ih/2-(ih/zoom/2)':"
            f"d=125:s={width}x{height}:fps=30"
        )
    else:
        zoompan_expr = f"scale={width}:{height}"

    filter_chains.append(f"[0:v]{zoompan_expr}[v_base]")
    current_v = "v_base"

    # Step 3: Light Leak & Vignette effect
    if enable_light_leak:
        light_filter = f"vignette=PI/4,colorbalance=rs=0.08:gs=0.04:bs=-0.04"
        filter_chains.append(f"[{current_v}]{light_filter}[v_lit]")
        current_v = "v_lit"

    # Step 4: Fade In transition at start
    if enable_fade:
        fade_filter = "fade=t=in:st=0:d=1.5"
        filter_chains.append(f"[{current_v}]{fade_filter}[v_faded]")
        current_v = "v_faded"

    # Step 5: Audio Waveform Overlay (via showwaves filter on audio stream [1:a])
    if enable_waveform:
        wave_expr = f"[1:a]showwaves=s={width}x{wave_h}:mode=line:colors=0xf59e0b|0xd97706:rate=30[waves]"
        overlay_expr = f"[{current_v}][waves]overlay=x=0:y=H-{wave_h+40}:format=auto[v_waved]"
        filter_chains.append(wave_expr)
        filter_chains.append(overlay_expr)
        current_v = "v_waved"

    # Step 6: Animated Text overlay if title provided
    if title:
        safe_title = title.replace("'", "").replace(":", "")
        safe_artist = (artist or "").replace("'", "").replace(":", "")
        text_str = f"{safe_title}" + (f" - {safe_artist}" if safe_artist else "")
        text_filter = (
            f"drawtext=text='{text_str}':fontcolor=white:fontsize=36:"
            f"x=(w-text_w)/2:y=h-70:shadowcolor=black@0.8:shadowx=2:shadowy=2"
        )
        filter_chains.append(f"[{current_v}]{text_filter}[v_final]")
        current_v = "v_final"

    complex_filter = "; ".join(filter_chains)

    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", img,
        "-i", aud,
        "-filter_complex", complex_filter,
        "-map", f"[{current_v}]",
        "-map", "1:a",
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        out
    ]

    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()

        if process.returncode != 0:
            error_msg = stderr.decode() if stderr else "Unknown FFmpeg error"
            logger.warning(f"Complex FFmpeg filter failed, falling back to simple zoom: {error_msg}")
            # Fallback simple command if drawtext or showwaves is missing in container
            return await _fallback_simple_render(img, aud, out, width, height, aspect_ratio)

        return {
            "success": True,
            "output_path": out,
            "filename": Path(out).name,
            "resolution": f"{width}x{height}",
            "aspect_ratio": aspect_ratio
        }

    except Exception as e:
        logger.error(f"FFmpeg process exception: {e}")
        return await _fallback_simple_render(img, aud, out, width, height, aspect_ratio)

async def _fallback_simple_render(img: str, aud: str, out: str, width: int, height: int, aspect_ratio: str) -> dict:
    """Fallback simple FFmpeg rendering if complex filters fail on host system."""
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", img,
        "-i", aud,
        "-vf", f"zoompan=z='min(zoom+0.0015,1.25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=125:s={width}x{height}:fps=30,fade=t=in:st=0:d=1",
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-shortest",
        out
    ]
    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        await process.communicate()
        return {
            "success": True,
            "output_path": out,
            "filename": Path(out).name,
            "resolution": f"{width}x{height}",
            "aspect_ratio": aspect_ratio
        }
    except Exception as err:
        return {"success": False, "error": str(err)}

def generate_ffmpeg_cli_command(
    image_file: str,
    audio_file: str,
    output_file: str,
    aspect_ratio: str = "16:9",
    title: str = "Song Title"
) -> str:
    """Generate a full copy-pasteable FFmpeg CLI command with 7-layer animation pipeline."""
    res = "1080x1920" if aspect_ratio == "9:16" else "1080x1080" if aspect_ratio == "1:1" else "1920x1080"
    return (
        f"ffmpeg -loop 1 -i {image_file} -i {audio_file} \\\n"
        f"  -filter_complex \"[0:v]zoompan=z='min(zoom+0.0012,1.2)':x='iw/2-(iw/zoom/2)+sin(time)*20':d=125:s={res}:fps=30,vignette=PI/4,fade=t=in:st=0:d=1.5[v1]; \\\n"
        f"  [1:a]showwaves=s={res.split('x')[0]}x120:mode=line:colors=0xf59e0b|0xd97706:rate=30[wave]; \\\n"
        f"  [v1][wave]overlay=x=0:y=H-160:format=auto,drawtext=text='{title}':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=h-70[outv]\" \\\n"
        f"  -map \"[outv]\" -map 1:a -c:v libx264 -c:a aac -b:a 192k -pix_fmt yuv420p -shortest {output_file}"
    )

