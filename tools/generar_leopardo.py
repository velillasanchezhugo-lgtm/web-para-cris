"""Dibuja los estampados de leopardo (SVG repetible) con los colores
sacados de las imágenes de referencia «color inspiracion web.jpg»
(leopardo magenta) y «color inspiracion web2.jfif» (leopardo empolvado).

Uso:  python3 tools/generar_leopardo.py
"""

import math
import random
from pathlib import Path

SALIDA = Path(__file__).resolve().parent.parent / "assets"
TAM = 160

PALETAS = {
    # fondo, centro de la roseta, manchas
    "leopardo.svg": ("#f55adf", "#c23aa8", "#200b1f"),
    "leopardo-suave.svg": ("#fdd7dd", "#f09bb2", "#d97c97"),
}


def mancha(cx, cy, r, rnd):
    """Forma irregular cerrada (curvas suaves) alrededor de (cx, cy)."""
    n = 7
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n + rnd.uniform(-0.2, 0.2)
        rr = r * rnd.uniform(0.7, 1.15)
        pts.append((cx + rr * math.cos(a), cy + rr * 0.8 * math.sin(a)))
    d = f"M{(pts[0][0] + pts[1][0]) / 2:.1f},{(pts[0][1] + pts[1][1]) / 2:.1f}"
    for i in range(n):
        p1 = pts[(i + 1) % n]
        p2 = pts[(i + 2) % n]
        d += f" Q{p1[0]:.1f},{p1[1]:.1f} {(p1[0] + p2[0]) / 2:.1f},{(p1[1] + p2[1]) / 2:.1f}"
    return d + "Z"


def roseta(cx, cy, r, rnd, centro, borde):
    """Roseta de leopardo: centro tintado rodeado de 3-5 manchas irregulares
    (rellenas, no aros) con huecos entre ellas, como en la referencia."""
    partes = [f'<path fill="{centro}" d="{mancha(cx, cy, r * 0.62, rnd)}"/>']
    trozos = rnd.randint(3, 5)
    inicio = rnd.uniform(0, 2 * math.pi)
    for i in range(trozos):
        a = inicio + 2 * math.pi * i / trozos + rnd.uniform(-0.25, 0.25)
        dist = r * rnd.uniform(0.82, 0.98)
        mx, my = cx + dist * math.cos(a), cy + dist * 0.85 * math.sin(a)
        partes.append(f'<path fill="{borde}" d="{mancha_alargada(mx, my, r * rnd.uniform(0.42, 0.6), r * rnd.uniform(0.2, 0.3), a + math.pi / 2, rnd)}"/>')
    return partes


def mancha_alargada(cx, cy, largo, ancho, ang, rnd):
    """Mancha en forma de judía orientada según ang."""
    n = 8
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        x = largo * math.cos(t) * rnd.uniform(0.85, 1.1)
        y = ancho * math.sin(t) * rnd.uniform(0.75, 1.15) + (ancho * 0.35 * math.cos(t) ** 2)
        pts.append((cx + x * math.cos(ang) - y * math.sin(ang), cy + x * math.sin(ang) + y * math.cos(ang)))
    d = f"M{(pts[0][0] + pts[1][0]) / 2:.1f},{(pts[0][1] + pts[1][1]) / 2:.1f}"
    for i in range(n):
        p1 = pts[(i + 1) % n]
        p2 = pts[(i + 2) % n]
        d += f" Q{p1[0]:.1f},{p1[1]:.1f} {(p1[0] + p2[0]) / 2:.1f},{(p1[1] + p2[1]) / 2:.1f}"
    return d + "Z"


def generar(nombre, fondo, centro, borde):
    rnd = random.Random(19)
    elementos = []
    puntos = []
    intentos = 0
    while len(puntos) < 20 and intentos < 2000:
        intentos += 1
        x, y = rnd.uniform(0, TAM), rnd.uniform(0, TAM)
        r = rnd.uniform(9, 15)
        ok = True
        for (px, py, pr) in puntos:
            dx = min(abs(x - px), TAM - abs(x - px))
            dy = min(abs(y - py), TAM - abs(y - py))
            if math.hypot(dx, dy) < r + pr + 4:
                ok = False
                break
        if ok:
            puntos.append((x, y, r))
    for (x, y, r) in puntos:
        # se repite en los bordes para que el patrón encaje sin cortes
        for ox in (-TAM, 0, TAM):
            for oy in (-TAM, 0, TAM):
                if -30 < x + ox < TAM + 30 and -30 < y + oy < TAM + 30:
                    elementos += roseta(x + ox, y + oy, r, random.Random(int(x * 1000 + y)), centro, borde)
    # puntitos sueltos
    for _ in range(16):
        x, y = rnd.uniform(0, TAM), rnd.uniform(0, TAM)
        if all(math.hypot(min(abs(x - px), TAM - abs(x - px)), min(abs(y - py), TAM - abs(y - py))) > pr + 6 for px, py, pr in puntos):
            elementos.append(f'<path fill="{borde}" d="{mancha(x, y, rnd.uniform(2.5, 4.5), rnd)}"/>')
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{TAM}" height="{TAM}" viewBox="0 0 {TAM} {TAM}">'
        f'<rect width="{TAM}" height="{TAM}" fill="{fondo}"/>' + "".join(elementos) + "</svg>"
    )
    (SALIDA / nombre).write_text(svg)
    print(nombre, len(svg) // 1024, "KB")


if __name__ == "__main__":
    for nombre, colores in PALETAS.items():
        generar(nombre, *colores)
