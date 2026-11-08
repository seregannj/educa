#!/usr/bin/env python3
"""Генерирует иконки PWA: лупа с мордочкой на синем фоне (как конец ленты)."""
from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "icons"
OUT.mkdir(parents=True, exist_ok=True)


def gradient(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size))
    top = (57, 183, 255)
    bottom = (24, 126, 205)
    px = img.load()
    for y in range(size):
        t = y / max(1, size - 1)
        color = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        for x in range(size):
            px[x, y] = color
    return img


def mascot(img: Image.Image, scale: float = 1.0) -> None:
    size = img.size[0]
    draw = ImageDraw.Draw(img)
    cx, cy = size * 0.44, size * 0.40
    r = size * 0.19 * scale
    w = max(2, round(size * 0.055 * scale))

    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(255, 255, 255), width=w)
    draw.line(
        [(cx + r * 0.72, cy + r * 0.72), (cx + r * 1.45, cy + r * 1.45)],
        fill=(255, 255, 255),
        width=round(w * 1.35),
    )
    eye = size * 0.018 * scale
    for dx in (-0.34, 0.34):
        draw.ellipse(
            [cx + r * dx - eye, cy - r * 0.18 - eye, cx + r * dx + eye, cy - r * 0.18 + eye],
            fill=(255, 255, 255),
        )
    draw.arc(
        [cx - r * 0.42, cy - r * 0.12, cx + r * 0.42, cy + r * 0.52],
        start=25,
        end=155,
        fill=(255, 255, 255),
        width=round(w * 0.85),
    )


def rounded(img: Image.Image, radius_ratio: float = 0.22) -> Image.Image:
    size = img.size[0]
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=round(size * radius_ratio), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def make(size: int, name: str, radius: float = 0.22, scale: float = 1.0) -> None:
    base = gradient(size)
    mascot(base, scale)
    img = rounded(base, radius) if radius else base.convert("RGBA")
    img.save(OUT / name)
    print("·", name, f"{size}×{size}")


make(192, "icon-192.png")
make(512, "icon-512.png")
make(180, "apple-touch-icon.png")
make(512, "icon-maskable-512.png", radius=0, scale=0.62)
