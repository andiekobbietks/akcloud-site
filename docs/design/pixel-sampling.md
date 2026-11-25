# AKTOps pixel and colour sampling notes

## What this reference currently shows

The visual atlas uses exact colour values declared by the repository's design contract and live CSS. It deliberately presents these as **source-token samples**. It does not claim that screenshot averages or per-pixel image extraction have been completed.

This distinction matters because glow, transparency, antialiasing and image compression produce many nearby RGB values that are not independent design tokens.

## Source-token palette

| Token | HEX / RGBA | Sampling meaning |
|---|---|---|
| Canvas | `#080808` | Exact CSS/design-contract literal |
| Surface 1 | `#111111` | Exact CSS/design-contract literal |
| Surface 2 | `#191919` | Exact CSS/design-contract literal |
| Border | `#242424` | Exact CSS/design-contract literal |
| Signal | `#39FF14` | Exact CSS/design-contract literal |
| Signal dim | `#1FCC00` | Exact design-contract literal; current use is limited |
| Signal tint | `rgba(57,255,20,0.12)` | Exact design-contract alpha value |
| Primary text | `#FFFFFF` | Exact design-contract literal |
| Body text | `#C8C8C8` | Exact CSS/design-contract literal |
| Muted text | `#787878` | Exact CSS/design-contract literal |
| Subdued text | `#3A3A3A` | Exact CSS/design-contract literal |
| Glitch red | `#FF5555` | Exact 404 CSS literal |

## Raster sample procedure

When a local clone is available, run a reproducible image audit rather than manually picking a colour from a browser screenshot.

### 1. Verify image formats and dimensions

```bash
file screenshots/*
identify -verbose screenshots/hero.png
identify -verbose screenshots/tip.png
sha256sum screenshots/*
```

The repository's two screenshot payloads currently have JPEG signatures even though their filenames end in `.png`. Keep that finding in the asset inventory.

### 2. Inspect candidate regions

Use an image viewer or ImageMagick to inspect at 100% and select flat areas. Avoid:
- text and icon edges;
- anti-aliased corners;
- transparent pixels and compositing boundaries;
- green glow fall-off;
- gradients, shadows and JPEG ringing;
- browser chrome or image viewer overlays.

### 3. Sample exact coordinates

```bash
# Replace x,y with recorded coordinates for the source image.
magick screenshots/hero.png -format '%[pixel:p{x,y}]\\n' info:
```

For a region rather than a single pixel:

```bash
# Example crop; choose coordinates and dimensions from the inspected image.
magick screenshots/hero.png -crop 80x80+x+y +repage -format %c histogram:info:- | sort -nr | head -20
```

Record:
- repository commit and image SHA-256;
- file signature, dimensions and colour profile;
- coordinate or crop rectangle;
- pixel value(s), alpha and sample count;
- whether the sample is a flat token, composite or effect;
- the matching CSS/design token, if any.

### 4. Promote only confirmed values

A screenshot sample is evidence of a rendered result, not automatically a token. If the sample differs from the source literal, investigate alpha compositing, browser rendering, colour profile and compression before changing the palette.

## Current status

- [x] Extract source-defined palette values from `DESIGN.md`, `index.html` and `404.html`.
- [x] Build a visual swatch atlas with component and effect specimens.
- [x] Record the screenshot extension/signature mismatch.
- [ ] Produce coordinate-based raster samples from the original image files.
- [ ] Compare screenshot samples against the live rendered site at known viewport sizes.
- [ ] Add a generated machine-readable token export after the source tokens are centralised.

Do not describe the unchecked raster steps as completed.
