"""Renders the app icons in public/icons/ from icon-master.jpg (the deckchair with the inflatable 7).

One-off tool, not part of the build. Needs Python 3 with Pillow:
    python3 icons-src/render.py

The master is a 1024x1024 opaque, full-bleed image with the chair and the 7 inside the central
~65%, so the same artwork works as the iOS icon (iOS rounds the corners itself, so it must be
opaque) and as the Android maskable icon (the OS crops it to a circle or squircle).
"""
from pathlib import Path

from PIL import Image

here = Path(__file__).resolve().parent
out = here.parent / "public" / "icons"
out.mkdir(parents=True, exist_ok=True)
master = Image.open(here / "icon-master.jpg").convert("RGB")

JOBS = [
    ("icon-192.png", 192),
    ("icon-512.png", 512),
    ("icon-maskable-512.png", 512),
    ("apple-touch-icon.png", 180),
    ("favicon-32.png", 32),
]

for name, size in JOBS:
    img = master.resize((size, size), Image.LANCZOS)
    img.save(out / name, format="PNG", optimize=True)
    print("wrote", name, size, (out / name).stat().st_size, "bytes")
