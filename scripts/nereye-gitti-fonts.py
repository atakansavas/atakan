#!/usr/bin/env python3
"""Build the self-hosted woff2 fonts for /nereye-gitti.

Outputs (content-hashed names, so they can be cached forever):
  public/nereye-gitti/fonts/sora-var.<hash>.woff2           Sora, variable wght 400-700
  public/nereye-gitti/fonts/ibm-plex-mono-{400,500}.<hash>.woff2
  public/nereye-gitti/fonts/OFL-Sora.txt, OFL-IBMPlexMono.txt
  app/nereye-gitti/_lib/fonts.generated.ts                  manifest used by the pages

Each face is one woff2 holding Google Fonts' latin + latin-ext ranges plus a few
extras used in page text. All OpenType layout features are kept; hinting is dropped.

Requirements (any Python 3.9+):
  python3 -m venv /tmp/ng-fonts-venv
  /tmp/ng-fonts-venv/bin/pip install fonttools brotli
  /tmp/ng-fonts-venv/bin/python scripts/nereye-gitti-fonts.py
"""

import hashlib
import io
import shutil
import tempfile
import urllib.request
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

# --- Sources -----------------------------------------------------------------
REPO = Path(__file__).resolve().parent.parent
EXPO = Path("/Users/atakan/Projects/gidertakip/apps/mobile/node_modules/@expo-google-fonts")

# Official Sora variable font from google/fonts (ofl/sora), pinned by hash.
SORA_VF_URL = "https://github.com/google/fonts/raw/main/ofl/sora/Sora%5Bwght%5D.ttf"
SORA_VF_SHA256 = "84ff7096ae3ec6c8be47d906d1a0ba4de7f2ce78c615275c77301964a316e16c"
SORA_VF = Path(tempfile.gettempdir()) / "nereye-gitti-fonts" / "Sora[wght].ttf"
SORA_LICENSE = EXPO / "sora/LICENSE_FONT"  # same text as google/fonts ofl/sora/OFL.txt

PLEX = {
    "400": EXPO / "ibm-plex-mono/400Regular/IBMPlexMono_400Regular.ttf",
    "500": EXPO / "ibm-plex-mono/500Medium/IBMPlexMono_500Medium.ttf",
}
PLEX_LICENSE = EXPO / "ibm-plex-mono/LICENSE_FONT"

OUT_DIR = REPO / "public/nereye-gitti/fonts"
MANIFEST = REPO / "app/nereye-gitti/_lib/fonts.generated.ts"
URL_PREFIX = "/nereye-gitti/fonts"

# --- Character set -----------------------------------------------------------
LATIN = ("U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,"
         "U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD")
LATIN_EXT = ("U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,"
             "U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,"
             "U+2113,U+2C60-2C7F,U+A720-A7FF")
EXTRAS = "U+2192,U+2190,U+2022,U+00B7,U+2014,U+2026,U+2212,U+20BA"  # → ← • · — … − ₺


def parse_ranges(spec):
    cps = set()
    for part in spec.split(","):
        lo, _, hi = part.strip().removeprefix("U+").partition("-")
        cps.update(range(int(lo, 16), int(hi or lo, 16) + 1))
    return cps


UNICODES = sorted(parse_ranges(",".join([LATIN, LATIN_EXT, EXTRAS])))


def ensure_sora_vf():
    if not SORA_VF.exists():
        SORA_VF.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(SORA_VF_URL, SORA_VF)
    digest = hashlib.sha256(SORA_VF.read_bytes()).hexdigest()
    if digest != SORA_VF_SHA256:
        raise SystemExit(f"Sora VF hash mismatch: {digest} (upstream changed? update the pin)")
    return SORA_VF


def build(font, stem):
    """Subset `font` (TTFont) to UNICODES, write a hashed woff2, return (url, bytes)."""
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]  # keep kern, liga, calt, ss01, tnum, ...
    opts.hinting = False          # --no-hinting
    opts.drop_tables += ["meta"]  # Plex's meta table can't be subset (it'd be dropped anyway)
    # name table: default IDs 0-6 plus any fvar/STAT references; Windows/English only.
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)
    tmp = OUT_DIR / f"{stem}.tmp.woff2"
    subset.save_font(font, str(tmp), opts)
    data = tmp.read_bytes()
    name = f"{stem}.{hashlib.sha256(data).hexdigest()[:8]}.woff2"
    tmp.rename(OUT_DIR / name)
    return f"{URL_PREFIX}/{name}", len(data)


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in [*OUT_DIR.glob("sora-*.woff2"), *OUT_DIR.glob("ibm-plex-mono-*.woff2")]:
        old.unlink()  # drop previous hashed builds

    faces = []
    # recalcTimestamp=False keeps head.modified from the source -> byte-identical rebuilds.
    vf = TTFont(ensure_sora_vf(), recalcTimestamp=False)
    vf = instancer.instantiateVariableFont(vf, {"wght": (400, 700)})  # narrow axis to 400-700
    buf = io.BytesIO()
    vf.save(buf)  # round-trip: the subsetter needs a freshly compiled gvar
    vf = TTFont(buf, recalcTimestamp=False)
    faces.append(("Sora", "400 700", *build(vf, "sora-var")))
    for weight, path in PLEX.items():
        font = TTFont(path, recalcTimestamp=False)
        faces.append(("IBM Plex Mono", weight, *build(font, f"ibm-plex-mono-{weight}")))

    shutil.copyfile(SORA_LICENSE, OUT_DIR / "OFL-Sora.txt")
    shutil.copyfile(PLEX_LICENSE, OUT_DIR / "OFL-IBMPlexMono.txt")

    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    rows = "".join(
        f'  {{ family: "{fam}", weight: "{w}", file: "{url}", bytes: {n} }},\n'
        for fam, w, url, n in faces
    )
    MANIFEST.write_text(
        "// Generated by scripts/nereye-gitti-fonts.py — do not edit by hand.\n"
        f"export const FONT_FACES = [\n{rows}] as const;\n",
        encoding="utf-8",
    )
    for fam, w, url, n in faces:
        print(f"{fam:14} {w:8} {n:7,d} B  {url}")


if __name__ == "__main__":
    main()
