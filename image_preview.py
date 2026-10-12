from __future__ import annotations

import re
import shutil
import uuid

from collections import OrderedDict
from pathlib import Path
from typing import Any

import numpy as np
import torch

from aiohttp import web
from PIL import Image

import folder_paths

from server import PromptServer


# =========================================================
# Pending preview cache
# =========================================================

_PENDING_PREVIEWS: "OrderedDict[str, dict[str, Any]]" = (
    OrderedDict()
)

_MAX_PENDING_PREVIEWS = 200


# =========================================================
# Image helpers
# =========================================================

def _tensor_to_pil(
    image: torch.Tensor,
) -> Image.Image:
    if image.ndim == 4:
        image = image[0]

    image = (
        image
        .detach()
        .cpu()
        .clamp(
            0.0,
            1.0,
        )
    )

    array = (
        image.numpy() *
        255.0
    ).round().astype(
        np.uint8
    )

    if array.ndim == 2:
        return Image.fromarray(
            array,
            mode="L",
        ).convert(
            "RGB"
        )

    if array.shape[-1] == 4:
        return Image.fromarray(
            array,
            mode="RGBA",
        )

    return Image.fromarray(
        array,
        mode="RGB",
    )


def _sanitize_filename_prefix(
    value: str,
) -> str:
    value = (
        value or "image"
    ).strip()

    value = re.sub(
        r'[<>:"/\\|?*]+',
        "_",
        value,
    )

    value = re.sub(
        r"\s+",
        "_",
        value,
    )

    value = value.strip(
        "._"
    )

    return value or "image"


def _next_available_path(
    directory: Path,
    filename_prefix: str,
    extension: str,
) -> Path:
    index = 1

    while True:
        candidate = (
            directory /
            (
                f"{filename_prefix}_"
                f"{index:05d}."
                f"{extension}"
            )
        )

        if not candidate.exists():
            return candidate

        index += 1


# =========================================================
# Pending preview management
# =========================================================

def _trim_pending_previews() -> None:
    while (
        len(_PENDING_PREVIEWS) >
        _MAX_PENDING_PREVIEWS
    ):
        _, item = (
            _PENDING_PREVIEWS
            .popitem(
                last=False
            )
        )

        for temp_path in item.get(
            "temp_paths",
            [],
        ):
            try:
                Path(
                    temp_path
                ).unlink(
                    missing_ok=True
                )

            except OSError:
                pass


def _register_pending_preview(
    token: str,
    temp_paths: list[str],
    output_directory: str,
    filename_prefix: str,
    image_format: str,
    quality: int,
) -> None:
    _PENDING_PREVIEWS[
        token
    ] = {
        "temp_paths":
            temp_paths,

        "output_directory":
            str(
                Path(
                    output_directory
                ).expanduser()
            ),

        "filename_prefix":
            _sanitize_filename_prefix(
                filename_prefix
            ),

        "image_format":
            image_format
            .strip()
            .lower(),

        "quality":
            int(
                quality
            ),
    }

    _PENDING_PREVIEWS.move_to_end(
        token
    )

    _trim_pending_previews()


def _save_pending_preview(
    token: str,
) -> dict[str, Any]:
    if (
        not token or
        token not in
        _PENDING_PREVIEWS
    ):
        raise FileNotFoundError(
            "This preview is no longer available. "
            "Run the workflow again to create "
            "a new preview."
        )

    item = (
        _PENDING_PREVIEWS[
            token
        ]
    )

    output_directory = Path(
        item[
            "output_directory"
        ]
    ).expanduser()

    output_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    image_format = item[
        "image_format"
    ]

    if image_format not in {
        "png",
        "jpg",
        "webp",
    }:
        image_format = "png"

    saved_paths: list[str] = []

    for temp_path_text in item[
        "temp_paths"
    ]:
        temp_path = Path(
            temp_path_text
        )

        if not temp_path.exists():
            raise FileNotFoundError(
                "Temporary preview file "
                "is missing: "
                f"{temp_path}"
            )

        output_path = (
            _next_available_path(
                directory=
                    output_directory,

                filename_prefix=
                    item[
                        "filename_prefix"
                    ],

                extension=
                    image_format,
            )
        )

        if image_format == "png":
            shutil.copy2(
                temp_path,
                output_path,
            )

        else:
            with Image.open(
                temp_path
            ) as image:

                if image.mode not in {
                    "RGB",
                    "L",
                }:
                    image = (
                        image.convert(
                            "RGB"
                        )
                    )

                if (
                    image_format ==
                    "jpg"
                ):
                    image.save(
                        output_path,
                        format="JPEG",

                        quality=
                            item[
                                "quality"
                            ],

                        subsampling=0,
                    )

                else:
                    image.save(
                        output_path,
                        format="WEBP",

                        quality=
                            item[
                                "quality"
                            ],

                        method=6,
                    )

        saved_paths.append(
            str(
                output_path
            )
        )

    message = (
        f"Saved "
        f"{len(saved_paths)} "
        f"image(s) to "
        f"{output_directory}"
    )

    print(
        "\n"
        "========== UNCLAD IMAGE PREVIEW SAVED ==========\n"
        f"{message}\n"
        +
        "\n".join(
            saved_paths
        )
        +
        "\n"
        "================================================\n"
    )

    return {
        "ok":
            True,

        "message":
            message,

        "paths":
            saved_paths,
    }


# =========================================================
# Temporary preview creation
# =========================================================

def _create_temp_previews(
    images,
    token: str,
    image_label: str,
) -> tuple[list[dict[str, str]], list[str]]:
    temp_directory = Path(
        folder_paths
        .get_temp_directory()
    )

    temp_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    preview_entries: list[
        dict[str, str]
    ] = []

    temp_paths: list[str] = []

    for (
        index,
        tensor_image
    ) in enumerate(
        images
    ):
        pil_image = (
            _tensor_to_pil(
                tensor_image
            )
        )

        temp_filename = (
            "ucn_image_preview_"
            f"{image_label.lower()}_"
            f"{token}_"
            f"{index:03d}.png"
        )

        temp_path = (
            temp_directory /
            temp_filename
        )

        pil_image.save(
            temp_path,
            format="PNG",
            optimize=True,
        )

        temp_paths.append(
            str(
                temp_path
            )
        )

        preview_entries.append(
            {
                "filename":
                    temp_filename,

                "subfolder":
                    "",

                "type":
                    "temp",
            }
        )

    return (
        preview_entries,
        temp_paths,
    )


# =========================================================
# Unclad Image Preview
# =========================================================

class UCNImagePreview:
    """
    Preview one image input or interactively compare
    Image A and Image B.

    With only Image A connected, the node behaves as a
    normal ComfyUI preview.

    With both A and B connected, the frontend displays an
    interactive A/B reveal comparison.

    If auto_save is False, A and B can be saved separately.

    If auto_save is True, all connected image inputs are
    saved automatically.
    """

    OUTPUT_NODE = True


    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "image_a": (
                    "IMAGE",
                ),

                "output_directory": (
                    "STRING",
                    {
                        "default":
                            r"C:\LoRA\selected",

                        "multiline":
                            False,
                    },
                ),

                "filename_prefix_a": (
                    "STRING",
                    {
                        "default":
                            "selected_A",

                        "multiline":
                            False,
                    },
                ),

                "filename_prefix_b": (
                    "STRING",
                    {
                        "default":
                            "selected_B",

                        "multiline":
                            False,
                    },
                ),

                "image_format": (
                    [
                        "png",
                        "jpg",
                        "webp",
                    ],
                    {
                        "default":
                            "png",
                    },
                ),

                "jpeg_webp_quality": (
                    "INT",
                    {
                        "default":
                            95,

                        "min":
                            1,

                        "max":
                            100,
                    },
                ),

                "auto_save": (
                    "BOOLEAN",
                    {
                        "default":
                            False,
                    },
                ),
            },

            "optional": {
                "image_b": (
                    "IMAGE",
                ),
            },

            "hidden": {
                "prompt":
                    "PROMPT",

                "extra_pnginfo":
                    "EXTRA_PNGINFO",
            },
        }


    RETURN_TYPES = (
        "IMAGE",
        "STRING",
    )

    RETURN_NAMES = (
        "image_a",
        "status",
    )

    FUNCTION = "preview"

    CATEGORY = (
        "Unclad Comfy Nodes/Image Tools"
    )


    def preview(
        self,
        image_a,
        output_directory,
        filename_prefix_a,
        filename_prefix_b,
        image_format,
        jpeg_webp_quality,
        auto_save,
        image_b=None,
        prompt=None,
        extra_pnginfo=None,
    ):
        # -------------------------------------------------
        # Image A
        # -------------------------------------------------

        token_a = (
            uuid.uuid4().hex
        )

        (
            preview_a,
            temp_paths_a,
        ) = _create_temp_previews(
            image_a,
            token_a,
            "a",
        )

        _register_pending_preview(
            token=
                token_a,

            temp_paths=
                temp_paths_a,

            output_directory=
                output_directory,

            filename_prefix=
                filename_prefix_a,

            image_format=
                image_format,

            quality=
                jpeg_webp_quality,
        )


        # -------------------------------------------------
        # Image B
        # -------------------------------------------------

        has_image_b = (
            image_b is not None
        )

        token_b = ""

        preview_b: list[
            dict[str, str]
        ] = []

        temp_paths_b: list[str] = []


        if has_image_b:
            token_b = (
                uuid.uuid4().hex
            )

            (
                preview_b,
                temp_paths_b,
            ) = _create_temp_previews(
                image_b,
                token_b,
                "b",
            )

            _register_pending_preview(
                token=
                    token_b,

                temp_paths=
                    temp_paths_b,

                output_directory=
                    output_directory,

                filename_prefix=
                    filename_prefix_b,

                image_format=
                    image_format,

                quality=
                    jpeg_webp_quality,
            )


        # -------------------------------------------------
        # Save behavior
        # -------------------------------------------------

        auto_saved_a = False
        auto_saved_b = False

        status_parts: list[str] = []


        if bool(
            auto_save
        ):
            try:
                result_a = (
                    _save_pending_preview(
                        token_a
                    )
                )

                status_parts.append(
                    "Image A: " +
                    result_a[
                        "message"
                    ]
                )

                auto_saved_a = True

            except Exception as exc:
                status_parts.append(
                    "Image A auto-save "
                    f"failed: {exc}"
                )


            if has_image_b:
                try:
                    result_b = (
                        _save_pending_preview(
                            token_b
                        )
                    )

                    status_parts.append(
                        "Image B: " +
                        result_b[
                            "message"
                        ]
                    )

                    auto_saved_b = True

                except Exception as exc:
                    status_parts.append(
                        "Image B auto-save "
                        f"failed: {exc}"
                    )

        else:
            if has_image_b:
                status_parts.append(
                    "Comparison ready. "
                    "Use Save Image A or "
                    "Save Image B."
                )

            else:
                status_parts.append(
                    "Preview ready. "
                    "Press Save Image A."
                )


        status = (
            " | ".join(
                status_parts
            )
        )


        # -------------------------------------------------
        # UI response
        # -------------------------------------------------

        ui = {
            "image_a_entries":
                preview_a,

            "image_b_entries":
                preview_b,

            "save_token_a": [
                token_a,
            ],

            "save_token_b": [
                token_b,
            ],

            "has_image_b": [
                has_image_b,
            ],

            "auto_saved_a": [
                auto_saved_a,
            ],

            "auto_saved_b": [
                auto_saved_b,
            ],

            "save_status": [
                status,
            ],
        }


        # With only A connected, let ComfyUI render its
        # normal built-in preview exactly as before.
        if not has_image_b:
            ui[
                "images"
            ] = preview_a


        return {
            "ui":
                ui,

            "result": (
                image_a,
                status,
            ),
        }


# =========================================================
# Manual Save API
# =========================================================

@PromptServer.instance.routes.post(
    "/unclad-comfy-nodes/image-preview/save"
)
async def ucn_image_preview_save(
    request
):
    try:
        payload = (
            await request.json()
        )

    except Exception:
        return web.json_response(
            {
                "ok":
                    False,

                "message":
                    (
                        "The save request "
                        "did not contain "
                        "valid JSON."
                    ),
            },
            status=400,
        )


    token = str(
        payload.get(
            "token",
            "",
        )
    ).strip()


    try:
        result = (
            _save_pending_preview(
                token
            )
        )

        return web.json_response(
            result
        )

    except FileNotFoundError as exc:
        return web.json_response(
            {
                "ok":
                    False,

                "message":
                    str(
                        exc
                    ),
            },
            status=404,
        )

    except Exception as exc:
        return web.json_response(
            {
                "ok":
                    False,

                "message":
                    (
                        "Could not save "
                        "preview: "
                        f"{exc}"
                    ),
            },
            status=500,
        )