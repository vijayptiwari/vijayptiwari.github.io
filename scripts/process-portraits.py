"""Copy portfolio photos as-is — format export only, no crop or color edits."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "photos"
SRC = OUT / "sources"

CURSOR_ASSETS = (
    Path.home()
    / ".cursor/projects/c-Users-Vijay-Prakash-Tiwari-OneDrive-Documents-Codebase-githubPortfolio/assets"
)

DESKTOP_OFFICE = Path.home() / "OneDrive" / "Documents" / "Desktop" / "IMG20260518164518.jpg"

FILE_MAP = {
    "profile": ("c06111a1", SRC / "photo-profile.png"),
    "formal": ("874bd43f", SRC / "photo-formal.png"),
    "office": ("7a0c2599", SRC / "photo-office.png"),
}

EXPORTS = {
    "vijay-photo-hero": "profile",
    "vijay-photo-about": "formal",
}


def read_bytes(path: Path) -> bytes:
    return Path("\\\\?\\" + str(path.resolve())).read_bytes()


def hydrate_sources() -> None:
    SRC.mkdir(parents=True, exist_ok=True)
    if not CURSOR_ASSETS.exists():
        return

    for file in CURSOR_ASSETS.iterdir():
        name = file.name.lower()
        for _key, (token, dest) in FILE_MAP.items():
            if token in name and not dest.exists():
                dest.write_bytes(read_bytes(file))
                print(f"Saved source: {dest.name}")


def export_unchanged(img: Image.Image, name: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    png_path = OUT / f"{name}.png"
    webp_path = OUT / f"{name}.webp"
    img.save(png_path, "PNG", optimize=True)
    img.save(webp_path, "WEBP", lossless=True, method=6)
    print(f"Wrote {png_path.name} ({png_path.stat().st_size // 1024} KB, {img.size[0]}x{img.size[1]})")


def export_contact_office() -> None:
    source = DESKTOP_OFFICE if DESKTOP_OFFICE.exists() else FILE_MAP["office"][1]
    if not source.exists():
        raise FileNotFoundError(f"Missing office photo: {source}")
    print(f"Using contact source: {source}")
    img = Image.open(source).convert("RGB")
    OUT.mkdir(parents=True, exist_ok=True)
    jpg_path = OUT / "vijay-photo-contact.jpg"
    webp_path = OUT / "vijay-photo-contact.webp"
    jpg_path.unlink(missing_ok=True)
    (OUT / "vijay-photo-contact.png").unlink(missing_ok=True)
    img.save(jpg_path, "JPEG", quality=92, optimize=True, progressive=True)
    img.save(webp_path, "WEBP", quality=92, method=6)
    print(f"Wrote {jpg_path.name} ({jpg_path.stat().st_size // 1024} KB, {img.size[0]}x{img.size[1]})")


def main() -> None:
    hydrate_sources()

    for export_name, source_key in EXPORTS.items():
        source_path = FILE_MAP[source_key][1]
        if not source_path.exists():
            raise FileNotFoundError(f"Missing source for {source_key}: {source_path}")
        img = Image.open(source_path).convert("RGB")
        export_unchanged(img, export_name)

    export_contact_office()


if __name__ == "__main__":
    main()
