"""Export portfolio portraits from multiple source photos."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "photos"
SRC = OUT / "sources"


def resolve_sources() -> dict[str, Path]:
    SRC.mkdir(parents=True, exist_ok=True)
    mapping = {
        "profile": SRC / "professional-profile.png",
        "formal": SRC / "professional-formal.png",
        "office": Path.home() / "OneDrive" / "Documents" / "Desktop" / "IMG20260518164518.jpg",
    }

    if not mapping["profile"].exists() or not mapping["formal"].exists():
        cursor_assets = Path.home() / ".cursor" / "projects" / (
            "c-Users-Vijay-Prakash-Tiwari-OneDrive-Documents-Codebase-githubPortfolio"
        ) / "assets"
        if cursor_assets.exists():
            for file in cursor_assets.iterdir():
                name = file.name.lower()
                target = None
                if "c06111a1" in name:
                    target = mapping["profile"]
                elif "874bd43f" in name:
                    target = mapping["formal"]
                if target is not None:
                    src = Path("\\\\?\\" + str(file.resolve()))
                    target.write_bytes(src.read_bytes())

    return mapping


def polish(img: Image.Image) -> Image.Image:
    img = ImageEnhance.Brightness(img).enhance(1.02)
    img = ImageEnhance.Contrast(img).enhance(1.04)
    img = ImageEnhance.Color(img).enhance(1.01)
    return img.filter(ImageFilter.UnsharpMask(radius=0.8, percent=65, threshold=3))


def crop_cover(
    img: Image.Image,
    target_w: int,
    target_h: int,
    *,
    focus_x: float = 0.5,
    focus_y: float = 0.5,
) -> Image.Image:
    scale = max(target_w / img.width, target_h / img.height)
    rw = int(img.width * scale)
    rh = int(img.height * scale)
    resized = img.resize((rw, rh), Image.Resampling.LANCZOS)
    x = max(0, min(int((rw - target_w) * focus_x), rw - target_w))
    y = max(0, min(int((rh - target_h) * focus_y), rh - target_h))
    return resized.crop((x, y, x + target_w, y + target_h))


def trim_office(img: Image.Image) -> Image.Image:
    w, h = img.size
    return img.crop((int(w * 0.04), int(h * 0.05), int(w * 0.96), int(h * 0.50)))


def load_source(key: str) -> Image.Image:
    path = resolve_sources()[key]
    if not path.exists():
        raise FileNotFoundError(f"Missing source image: {path}")
    print(f"Using {key}: {path}")
    return Image.open(path).convert("RGB")


def export(img: Image.Image, name: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    webp_path = OUT / f"{name}.webp"
    jpg_path = OUT / f"{name}.jpg"
    img.save(webp_path, "WEBP", quality=92, method=6)
    img.save(jpg_path, "JPEG", quality=92, optimize=True, progressive=True)
    print(f"Wrote {webp_path.name} ({webp_path.stat().st_size // 1024} KB)")


def main() -> None:
    profile = polish(load_source("profile"))
    formal = polish(load_source("formal"))
    office = polish(trim_office(load_source("office")))

    # Trim phone from the right of the mirror selfie
    fw, fh = formal.size
    formal = formal.crop((int(fw * 0.05), int(fh * 0.02), int(fw * 0.60), int(fh * 0.98)))

    # Hero: studio profile (navy shirt, grey background)
    hero = crop_cover(profile, 900, 1120, focus_x=0.42, focus_y=0.38)
    export(hero, "vijay-portrait-hero")

    # About: formal waist-up portrait
    about = crop_cover(formal, 900, 1120, focus_x=0.5, focus_y=0.16)
    export(about, "vijay-portrait-about")

    # Contact strip: approachable office photo
    contact = crop_cover(office, 720, 720, focus_x=0.5, focus_y=0.34)
    export(contact, "vijay-portrait-contact")


if __name__ == "__main__":
    main()
