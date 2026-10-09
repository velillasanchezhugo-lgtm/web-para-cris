"""Comprueba que todas las fotos y pegatinas que usa js/contenido.js existen.

Uso:  python3 tools/comprobar.py
"""

import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
texto = (RAIZ / "js" / "contenido.js").read_text(encoding="utf-8")
faltan = []

# fotos por nombre corto: "velilla-zumo" -> assets/fotos/velilla-zumo.jpg y -mini.jpg
for nombre in sorted(set(re.findall(r'"((?:velilla|abenia|cris)-[a-z0-9-]+)"', texto))):
    for sufijo in ("", "-mini"):
        if not (RAIZ / "assets" / "fotos" / f"{nombre}{sufijo}.jpg").exists():
            faltan.append(f"assets/fotos/{nombre}{sufijo}.jpg")

# pegatinas por código: "1f389" -> assets/stickers/1f389.webp
for codigo in sorted(set(re.findall(r'"([0-9a-f]{4,5}(?:_fe0f)?)"', texto))):
    if not (RAIZ / "assets" / "stickers" / f"{codigo}.webp").exists():
        faltan.append(f"assets/stickers/{codigo}.webp")

# perritos
for i in range(1, 27):
    if not (RAIZ / "assets" / "perritos" / f"perrito-{i:02d}.jpg").exists():
        faltan.append(f"assets/perritos/perrito-{i:02d}.jpg")

if faltan:
    print("Faltan archivos:\n  " + "\n  ".join(faltan))
    sys.exit(1)
print("Todo en orden: no falta ninguna foto ni pegatina.")
