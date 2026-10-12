# Unclad Comfy Nodes

A growing ComfyUI custom-node package from Unclad Collection.

## Included in this first build

### Unclad Prompt Studio
An all-in-one prompt composer with:

- Prompt Prefix
- Main Prompt Content
- Look & Feel visual library
- Lighting visual library
- Camera visual library
- Prompt Suffix
- Live concatenated prompt preview
- One final STRING output

`No Preset` is available inside each visual library so a selected preset can be removed. Preset dropdowns are intentionally hidden; presets are selected through the libraries.

## Install

Copy the `unclad_comfy_nodes` folder into:

```text
ComfyUI/custom_nodes/
```

Restart ComfyUI. Find the node under:

```text
Unclad Comfy Nodes > Prompt Tools > Unclad Prompt Studio
```

## Thumbnail libraries

Thumbnail folders are:

```text
unclad_comfy_nodes/thumbnails/look_and_feel/
unclad_comfy_nodes/thumbnails/lighting/
unclad_comfy_nodes/thumbnails/camera/
```

Use the same slugged filenames as the existing galleries, for example:

```text
Pixar-Inspired 3D -> pixar-inspired-3d.webp
Golden Hour -> golden-hour.webp
Natural 50mm -> natural-50mm.webp
```

Supported formats: `.webp`, `.jpg`, `.jpeg`, `.png`.

This build intentionally does not include the Composition preset node.

## Before public publishing

- Copy your existing thumbnail images into the three thumbnail folders.
- Choose and add a license.
- Add repository/author metadata to `pyproject.toml` if desired.
- Test on a clean ComfyUI installation.
