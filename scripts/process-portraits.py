"""Crop and export portfolio portraits — natural color, no heavy grading."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

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


def trim_portrait(img: Image.Image) -> Image.Image:
    """Drop table clutter; keep face, shoulders, and a little context."""
    w, h = img.size
    return img.crop((int(w * 0.04), int(h * 0.05), int(w * 0.96), int(h * 0.50)))


def polish(img: Image.Image) -> Image.Image:
    """Light touch only — preserve natural office lighting."""
    img = ImageEnhance.Brightness(img).enhance(1.03)
    img = ImageEnhance.Contrast(img).enhance(1.05)
    img = ImageEnhance.Color(img).enhance(1.02)
    return img.filter(ImageFilter.UnsharpMask(radius=0.9, percent=70, threshold=3))


def crop_cover(img: Image.Image, target_w: int, target_h: int, focus_y: float) -> Image.Image:
    scale = max(target_w / img.width, target_h / img.height)
    rw = int(img.width * scale)
    rh = int(img.height * scale)
    resized = img.resize((rw, rh), Image.Resampling.LANCZOS)
    x = max(0, (rw - target_w) // 2)
    y = max(0, min(int((rh - target_h) * focus_y), rh - target_h))
    return resized.crop((x, y, x + target_w, y + target_h))


def hero_crop_from_about(about: Image.Image, size: int) -> Image.Image:
    w, h = about.size
    side = int(min(w * 0.78, h * 0.46))
    left = (w - side) // 2
    top = int(h * 0.40)
    region = about.crop((left, top, left + side, top + side))
    return region.resize((size, size), Image.Resampling.LANCZOS)


def export(img: Image.Image, name: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    webp_path = OUT / f"{name}.webp"
    jpg_path = OUT / f"{name}.jpg"
    img.save(webp_path, "WEBP", quality=92, method=6)
    img.save(jpg_path, "JPEG", quality=92, optimize=True, progressive=True)
    print(f"Wrote {webp_path.name} ({webp_path.stat().st_size // 1024} KB)")
    print(f"Wrote {jpg_path.name} ({jpg_path.stat().st_size // 1024} KB)")


def main() -> None:
    source = pick_best_source()
    print(f"Source: {source}")
    raw = Image.open(source).convert("RGB")
    print(f"Original: {raw.size[0]}x{raw.size[1]}")

    trimmed = polish(trim_portrait(raw))
    about = crop_cover(trimmed, 900, 1120, focus_y=0.38)
    hero = polish(hero_crop_from_about(about, 640))

    export(about, "vijay-portrait-about")
    export(hero, "vijay-portrait-hero")


if __name__ == "__main__":
    main()
