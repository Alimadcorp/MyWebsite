import string
from fontTools.ttLib import TTFont, newTable
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib.tables._g_l_y_f import Glyph
from fontTools.pens.basePen import BasePen

# 1. Define ASCII range
ascii_chars = [chr(i) for i in range(32, 127)]  # space to tilde

# 2. Define procedural pattern generator
def char_pattern(ch):
    # Example: deterministic 4xY pattern based on character code
    code = ord(ch)
    Y = (code % 6) + 4  # height 4–9
    grid = []
    for y in range(Y):
        row = [(code >> (x + y)) & 1 for x in range(4)]
        grid.append(row)
    return grid
def grid_to_coords(grid, pixel_size=100):
    paths = []
    for y, row in enumerate(grid):
        for x, val in enumerate(row):
            if val:
                x0, y0 = x*pixel_size, y*pixel_size
                paths.append([(x0, y0), (x0+pixel_size, y0),
                              (x0+pixel_size, y0+pixel_size), (x0, y0+pixel_size)])
    return paths
def paths_to_glyph(paths):
    pen = TTGlyphPen(None)
    for path in paths:
        pen.moveTo(path[0])
        for p in path[1:]:
            pen.lineTo(p)
        pen.closePath()
    return pen.glyph()
from fontTools.fontBuilder import FontBuilder

fb = FontBuilder(1024)
fb.setupGlyphOrder([".notdef"] + ascii_chars)
fb.setupCharacterMap({ord(ch): ch for ch in ascii_chars})

pixel_size = 50
default_width = 4 * pixel_size + pixel_size  # width proportional to 4 pixels
advanceWidths = {".notdef": (default_width, 0)}  # map glyphName -> (advanceWidth, lsb)
glyphs = {".notdef": Glyph()}

for ch in ascii_chars:
    grid = char_pattern(ch)
    paths = grid_to_coords(grid, pixel_size=pixel_size)
    glyph = paths_to_glyph(paths)
    glyphs[ch] = glyph
    advanceWidths[ch] = (default_width, 0)  # (advanceWidth, leftSideBearing)

fb.setupGlyf(glyphs)
fb.setupHorizontalMetrics(advanceWidths)
fb.setupHorizontalHeader(ascent=1000, descent=0)
fb.setupOS2()
fb.setupPost()
fb.setupNameTable({"familyName": "ProceduralMono", "styleName": "Regular"})
fb.setupMaxp()
fb.save("procedural_ascii.ttf")
print("Font 'procedural_ascii.ttf' generated successfully.")