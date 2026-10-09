# Para Cris · 19 🎁

Web-regalo de cumpleaños para Cris, de parte de Velilla y Abenia.
Es una web estática (HTML + CSS + JavaScript). No hace falta instalar ni compilar nada.

## Cómo abrirla

Desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

y abre <http://localhost:8000> en el navegador. Para verla en el móvil
conectado a la misma wifi, usa `http://IP-DEL-ORDENADOR:8000`.
(Abrir `index.html` con doble clic también suele funcionar.)

Para publicarla más adelante basta con subir la carpeta tal cual a cualquier
hosting estático (GitHub Pages, Netlify…). **Todavía no está publicada.**

## Dónde cambiar cosas

| Quiero cambiar…                                    | Archivo |
|----------------------------------------------------|---------|
| Cualquier texto, mensaje, pie de foto o el final   | `js/contenido.js` |
| Qué fotos salen en cada capítulo o tarjeta          | `js/contenido.js` (por nombre corto, p. ej. `"velilla-zumo"`) |
| Añadir una foto nueva                               | `tools/preparar_fotos.py` → ejecutar → usarla en `js/contenido.js` |
| Objetivos de los juegos (8, 6, 19 y modo tranquilo) | `js/contenido.js` → `meta` / `metaTranquila` |
| Colores, tipografías y aspecto                      | `css/estilos.css` (variables al principio) |
| Estampado de leopardo                               | `tools/generar_leopardo.py` → genera `assets/leopardo*.svg` |
| Mecánica de los minijuegos                          | `js/juegos.js` |
| Navegación, progreso y pantalla final               | `js/app.js` |

Después de tocar fotos o pegatinas puedes comprobar que no falta nada con
`python3 tools/comprobar.py`.

## Fotos

- Los **originales no se tocan**: siguen en `Abenia/`, `Velilla/`, `Cris/` y `Primera foto.jpeg`.
- `assets/fotos/` contiene copias ligeras generadas por `tools/preparar_fotos.py`
  (a las capturas de historias solo se les quita la barra de estado y la tira de miniaturas).
- `assets/perritos/`: fotos de perritos de la API pública dog.ceo (Stanford Dogs Dataset); origen de cada una en `FUENTES.txt`.
- `assets/stickers/`: pegatinas animadas (emoji animados de Google Noto, licencia CC BY 4.0).
- Los colores salen de `color inspiracion web.jpg` y `color inspiracion web2.jfif`; el estampado es un dibujo propio, no se usan esas imágenes.

## Progreso

Los desbloqueos se guardan en `localStorage` (clave `regalo-cris-19`) del navegador
en el que se juega. Repetir partidas nunca bloquea nada. El botón «Reiniciar regalo»
(abajo en «Desbloquea a tu equipo») pide confirmación antes de borrar el progreso.

Para probar desde cero en tu navegador: «Reiniciar regalo» o una ventana de incógnito.
