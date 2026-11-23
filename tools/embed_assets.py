#!/usr/bin/env python3
"""Put the fonts and the example drawing inside index.html, so the app stays one file that works offline.

Run from the repository root after changing anything in fonts/ or examples/example_tree.svg:

    python3 tools/embed_assets.py

It rewrites two blocks in index.html in place: the <style id="fonts"> block, and the EXAMPLE_SVG string.
Running it twice gives the same file.
"""
import base64
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parent.parent
page = root / "index.html"

# Font files and the CSS family/weight each one provides
fonts = [
    ("Barlow", 400, "Barlow-400.woff2"),
    ("Barlow", 500, "Barlow-500.woff2"),
    ("Barlow", 600, "Barlow-600.woff2"),
    ("Barlow Condensed", 500, "BarlowCondensed-500.woff2"),
    ("Barlow Condensed", 600, "BarlowCondensed-600.woff2"),
]

# 1. Build the @font-face rules with each font inlined as base64
rules = ["/* Barlow and Barlow Condensed (latin), SIL Open Font License 1.1: fonts/OFL.txt. Rebuilt by tools/embed_assets.py. */"]
for family, weight, name in fonts:
    data = base64.b64encode((root / "fonts" / name).read_bytes()).decode("ascii")
    rules.append(
        f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:swap;"
        f"src:url(data:font/woff2;base64,{data}) format('woff2')}}"
    )
font_css = "\n".join(rules)

# 2. Read the example drawing; it goes inside a JavaScript template string, so it must not contain ` or ${
svg = (root / "examples" / "example_tree.svg").read_text(encoding="utf-8").rstrip("\n")
if "`" in svg or "${" in svg or "\\" in svg:
    sys.exit("examples/example_tree.svg contains ` or ${ or a backslash, which would break the JavaScript string")

html = page.read_text(encoding="utf-8")

# 3. Swap in the two blocks
html, n_fonts = re.subn(r'(<style id="fonts">\n).*?(\n</style>)', lambda m: m.group(1) + font_css + m.group(2), html, count=1, flags=re.S)
html, n_svg = re.subn(r"(const EXAMPLE_SVG = `).*?(`;)", lambda m: m.group(1) + svg + m.group(2), html, count=1, flags=re.S)
if n_fonts != 1 or n_svg != 1:
    sys.exit(f"Couldn't find the blocks to replace in index.html (fonts: {n_fonts}, example: {n_svg})")

page.write_text(html, encoding="utf-8")
print(f"index.html: {len(html.encode('utf-8')) / 1024:.0f} KB")
