"""Pixel-diff two screenshot folders: python3 diff.py before after diffs"""
import os, sys
from PIL import Image, ImageChops
a_dir, b_dir, d_dir = sys.argv[1:4]
os.makedirs(d_dir, exist_ok=True)
same = changed = 0
for name in sorted(os.listdir(a_dir)):
    if not name.endswith(".png"): continue
    b_path = os.path.join(b_dir, name)
    if not os.path.exists(b_path): print("MISSING", name); continue
    a, b = Image.open(os.path.join(a_dir, name)).convert("RGB"), Image.open(b_path).convert("RGB")
    if a.size != b.size:
        print(f"SIZE   {name} {a.size} -> {b.size}"); changed += 1; continue
    diff = ImageChops.difference(a, b)
    box = diff.getbbox()
    if not box: same += 1; continue
    px = sum(1 for p in diff.getdata() if max(p) > 24)
    if px == 0: same += 1; continue
    changed += 1
    print(f"DIFF   {name} {px} px in {box}")
    marked = b.copy(); marked.paste((255, 0, 255), mask=diff.convert("L").point(lambda v: 255 if v > 24 else 0))
    marked.save(os.path.join(d_dir, name))
print(f"{same} identical, {changed} changed")
