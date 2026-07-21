# Landing knight statue source

- Original asset: **LowPoly Animated Knight** by Quaternius
- Official page: https://quaternius.com/packs/knightcharacter.html
- Download mirror maintained by the author: https://quaternius.itch.io/lowpoly-animated-knight
- License: **CC0 1.0 Universal**
- Source character SHA-256: `edc8036644626dbe20fbf2d2bd3b046688496962c0dacc516b3ea78f519a35e9`

The shipped `landing-knight-statue.glb` is a static, stone-styled derivative made for the Wen13 landing area. It combines the source Knight character with the source Helmet 3, shoulder pads, and sword, then bakes the pose, adds a project-authored pedestal and a fixed cuboid collider.

Re-export with:

```bash
WEN13_KNIGHT_SOURCE_DIR=/absolute/path/to/Blends \
  tools/blender/Blender.app/Contents/MacOS/Blender \
  --background --python scripts/blender-export-landing-statue.py
```
