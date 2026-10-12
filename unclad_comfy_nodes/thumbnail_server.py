from pathlib import Path

from aiohttp import web
from server import PromptServer

from .preset_data import (
    LOOK_AND_FEEL_PRESETS,
    LIGHTING_PRESETS,
    CAMERA_PRESETS,
    CREATIVE_ENHANCEMENT_PRESETS,
)

ALLOWED_EXTENSIONS = {".webp", ".jpg", ".jpeg", ".png"}
ROOT = Path(__file__).resolve().parent
THUMBNAIL_ROOT = ROOT / "thumbnails"

LIBRARIES = {
    "look_and_feel": LOOK_AND_FEEL_PRESETS,
    "lighting": LIGHTING_PRESETS,
    "camera": CAMERA_PRESETS,
    "creative_enhancements": CREATIVE_ENHANCEMENT_PRESETS,
}

@PromptServer.instance.routes.get("/unclad-comfy-nodes/prompt-studio/presets")
async def ucn_prompt_studio_presets(request):
    return web.json_response(LIBRARIES)

@PromptServer.instance.routes.get("/unclad-comfy-nodes/thumbnails/{library}/{filename}")
async def ucn_thumbnail(request):
    library = request.match_info.get("library", "")
    filename = request.match_info.get("filename", "")

    if library not in LIBRARIES or not filename:
        raise web.HTTPNotFound()

    safe_name = Path(filename).name
    if safe_name != filename:
        raise web.HTTPForbidden()

    extension = Path(safe_name).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise web.HTTPForbidden()

    root = (THUMBNAIL_ROOT / library).resolve()
    file_path = (root / safe_name).resolve()

    try:
        file_path.relative_to(root)
    except ValueError:
        raise web.HTTPForbidden()

    if not file_path.exists() or not file_path.is_file():
        raise web.HTTPNotFound()

    return web.FileResponse(
        file_path,
        headers={"Cache-Control": "public, max-age=3600"},
    )
