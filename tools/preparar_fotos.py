"""Genera copias ligeras de las fotos originales para la web.

Los originales NO se tocan: se quedan en Abenia/, Velilla/, Cris/ y
«Primera foto.jpeg». Este script crea en assets/fotos/:
  - <nombre>.jpg      versión grande (lado largo máx. 1400 px) para ampliar
  - <nombre>-mini.jpg miniatura (lado largo máx. 520 px) para tarjetas

Para las capturas de historias de Instagram (946×2048) recorta solo la
barra de estado de arriba y la tira de miniaturas de abajo; nunca la foto.

Uso:  python3 tools/preparar_fotos.py
Para añadir una foto: añade una línea a FOTOS y vuelve a ejecutarlo.
Después, referencia su nombre en js/contenido.js.
"""

from pathlib import Path
from PIL import Image, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "assets" / "fotos"

# nombre en la web  ->  (archivo original, recorte)
#   recorte: None = ninguno · "historia" = captura de historia · (izq, arriba, der, abajo)
FOTOS = {
    "abenia-ascensor":   ("Abenia/34a253e0-eebb-4330-9f9f-61d8b418b551.jpg", None),
    "abenia-bar":        ("Abenia/WhatsApp Image 2026-10-09 at 11.51.59 (7).jpeg", "historia"),

    "cris-siesta":       ("Cris/WhatsApp Image 2026-10-09 at 11.51.59 (1).jpeg", "historia"),
    "cris-espejo-pelo":  ("Cris/WhatsApp Image 2026-10-09 at 11.51.59 (2).jpeg", "historia"),
    "cris-sudadera":     ("Cris/WhatsApp Image 2026-10-09 at 11.51.59 (3).jpeg", "historia"),
    "cris-disfraz":      ("Cris/WhatsApp Image 2026-10-09 at 11.51.59 (4).jpeg", "historia"),
    "cris-flequillo":    ("Cris/WhatsApp Image 2026-10-09 at 11.51.59 (5).jpeg", "historia"),
    "cris-halloween":    ("Cris/WhatsApp Image 2026-10-09 at 11.51.59 (6).jpeg", "historia"),
    "cris-bufanda":      ("Cris/WhatsApp Image 2026-10-09 at 11.51.59.jpeg", "historia"),
    "cris-atardecer":    ("Cris/WhatsApp Image 2026-10-09 at 11.52.00 (1).jpeg", "historia"),

    "cris-peque":        ("Primera foto.jpeg", (0, 130, 946, 2048)),

    "velilla-sofa":      ("Velilla/WhatsApp Image 2026-10-09 at 11.32.16 (1).jpeg", None),
    "velilla-ascensor":  ("Velilla/WhatsApp Image 2026-10-09 at 11.32.16 (2).jpeg", None),
    "velilla-cris-cerca": ("Velilla/WhatsApp Image 2026-10-09 at 11.32.16.jpeg", None),
    "velilla-muecas":    ("Velilla/WhatsApp Image 2026-10-09 at 11.32.17 (1).jpeg", None),
    "velilla-lenguas":   ("Velilla/WhatsApp Image 2026-10-09 at 11.32.17 (2).jpeg", None),
    "velilla-cajas":     ("Velilla/WhatsApp Image 2026-10-09 at 11.32.17 (3).jpeg", "historia"),
    "velilla-abrigos":   ("Velilla/WhatsApp Image 2026-10-09 at 11.32.17 (4).jpeg", None),
    "velilla-leopardo":  ("Velilla/WhatsApp Image 2026-10-09 at 11.32.17 (5).jpeg", None),
    "velilla-zumo":      ("Velilla/WhatsApp Image 2026-10-09 at 11.32.17 (6).jpeg", None),
    "velilla-tupper":    ("Velilla/WhatsApp Image 2026-10-09 at 11.32.17.jpeg", None),
    "velilla-fotomaton": ("Velilla/WhatsApp Image 2026-10-09 at 11.51.59 (8).jpeg", "historia"),
    "velilla-croquetas": ("Velilla/WhatsApp Image 2026-10-09 at 11.52.00 (2).jpeg", "historia"),
}

# Zona útil de una captura de historia (946×2048): sin barra de estado ni tira inferior.
HISTORIA = (0, 118, 946, 1668)


def preparar(nombre, origen, recorte):
    img = ImageOps.exif_transpose(Image.open(RAIZ / origen)).convert("RGB")
    if recorte == "historia" and img.size == (946, 2048):
        img = img.crop(HISTORIA)
    elif isinstance(recorte, tuple):
        img = img.crop(recorte)
    for sufijo, lado in (("", 1400), ("-mini", 520)):
        copia = img.copy()
        copia.thumbnail((lado, lado), Image.LANCZOS)
        copia.save(SALIDA / f"{nombre}{sufijo}.jpg", quality=80, optimize=True, progressive=True)
    return img.size


if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    for nombre, (origen, recorte) in FOTOS.items():
        ancho, alto = preparar(nombre, origen, recorte)
        print(f"{nombre:20s} {ancho}×{alto}  <- {origen}")
