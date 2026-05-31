"""Crop, grade, and export portfolio portrait assets."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "photos"
SOURCES = [
    Path.home() / "OneDrive" / "Documents" / "Desktop" / "IMG20260518164513.jpg",
    Path.home() / "OneDrive" / "Documents" / "Desktop" / "IMG20260518164518.jpg",
]


def pick_best_source() -> Path:
    valid = [p for p in SOURCES if p.exists()]
    if not valid:
        raise FileNotFoundError("No source portraits found on Desktop.")
    return max(valid, key=lambda p: p.stat().st_size)


def center_crop(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    ratio = max(target_w / img.width, target_h / img.height)
    resized = img.resize(
        (int(img.width * ratio), int(img.height * ratio)), Image.Resampling.LANCZOS
    )
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def trim_portrait(img: Image.Image) -> Image.Image:
    """Remove excess table foreground; keep subject + upper context."""
    w, h = img.size
    left = int(w * 0.06)
    right = int(w * 0.94)
    top = int(h * 0.04)
    bottom = int(h * 0.54)
    return img.crop((left, top, right, bottom))


def grade_for_dark_ui(img: Image.Image) -> Image.Image:
    img = ImageEnhance.Brightness(img).enhance(0.96)
    img = ImageEnhance.Contrast(img).enhance(1.1)
    img = ImageEnhance.Color(img).enhance(0.9)

    overlay = Image.new("RGBA", img.size, (13, 148, 136, 16))
    base = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    w, h = base.size
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((-w * 0.08, -h * 0.06, w * 1.08, h * 1.04), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=min(w, h) * 0.12))
    black = Image.new("RGB", (w, h), (6, 8, 12))
    return Image.composite(base, black, mask)


def hero_crop(about: Image.Image, size: int) -> Image.Image:
    w, h = about.size
    side = int(min(w * 0.78, h * 0.5))
    left = (w - side) // 2
    top = int(h * 0.24)
    region = about.crop((left, top, left + side, top + side))
    return region.resize((size, size), Image.Resampling.LANCZOS)


def export(img: Image.Image, name: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    webp_path = OUT / f"{name}.webp"
    jpg_path = OUT / f"{name}.jpg"
    img.save(webp_path, "WEBP", quality=86, method=6)
    img.save(jpg_path, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"Wrote {webp_path.name} ({webp_path.stat().st_size // 1024} KB)")
    print(f"Wrote {jpg_path.name} ({jpg_path.stat().st_size // 1024} KB)")


def main() -> None:
    source = pick_best_source()
    print(f"Source: {source}")
    raw = Image.open(source).convert("RGB")
    print(f"Original: {raw.size[0]}x{raw.size[1]}")

    trimmed = trim_portrait(raw)
    graded = grade_for_dark_ui(trimmed)

    about = center_crop(graded, 800, 1000)
    hero = hero_crop(about, 560)

    export(about, "vijay-portrait-about")
    export(hero, "vijay-portrait-hero")


if __name__ == "__main__":
    main()
