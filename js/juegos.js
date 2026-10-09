/* =====================================================================
   MINIJUEGOS
   Cada juego recibe un contenedor y unas opciones:
     { tranquilo, meta, alGanar(), alPuntuar(n, meta), sonar(tipo) }
   y devuelve { destruir() } para limpiar al salir de la pantalla.
   El estado de cada partida vive solo aquí, en memoria: nunca toca
   el progreso guardado (eso lo hace app.js al ganar).
   ===================================================================== */

window.JUEGOS = (function () {
  const reducido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const azar = (a, b) => a + Math.random() * (b - a);

  /* ---------------------------------------------------------------
     1 · VELILLA — Recoge Coca-Colas y croquetas en el Line
     --------------------------------------------------------------- */
  function bar(zona, controles, op) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Barra del bar con objetos cayendo y una bandeja");
    zona.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let ancho = 0, alto = 0, dpr = 1;
    const bandeja = { x: 0.5, ancho: 0, alto: 16, y: 0 };
    let objetos = [];
    let destellos = [];
    let recogidos = 0;
    let ultimo = performance.now();
    let proximo = 300;
    let raf = 0;
    let terminado = false;
    let pausado = false;
    let direccion = 0; // botones: -1, 0, 1

    function medir() {
      const r = zona.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      ancho = r.width; alto = r.height;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bandeja.ancho = Math.max(92, ancho * (op.tranquilo ? 0.42 : 0.3));
      bandeja.y = alto - 46;
    }
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(zona);

    // --- control con el dedo: la bandeja sigue al dedo en horizontal
    function mover(ev) {
      if (terminado) return;
      const r = canvas.getBoundingClientRect();
      bandeja.x = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
    }
    function abajo(ev) {
      ev.preventDefault();
      canvas.setPointerCapture?.(ev.pointerId);
      mover(ev);
    }
    function arrastre(ev) {
      if (ev.pointerType === "mouse" && ev.buttons === 0) return mover(ev);
      ev.preventDefault();
      mover(ev);
    }
    canvas.addEventListener("pointerdown", abajo);
    canvas.addEventListener("pointermove", arrastre);

    // --- botones grandes (mantener pulsado) y teclado
    const [izq, der] = controles.querySelectorAll("button");
    const pulsar = (d) => (ev) => { ev.preventDefault(); direccion = d; };
    const soltar = () => { direccion = 0; };
    const enlaces = [];
    [[izq, -1], [der, 1]].forEach(([b, d]) => {
      const p = pulsar(d);
      b.addEventListener("pointerdown", p);
      b.addEventListener("pointerup", soltar);
      b.addEventListener("pointerleave", soltar);
      b.addEventListener("pointercancel", soltar);
      // clic de teclado o lector de pantalla: un paso
      const clic = (ev) => { if (ev.detail === 0) bandeja.x = Math.min(1, Math.max(0, bandeja.x + d * 0.14)); };
      b.addEventListener("click", clic);
      enlaces.push([b, p, clic]);
    });
    function teclado(ev) {
      if (ev.key === "ArrowLeft") { direccion = -1; ev.preventDefault(); }
      if (ev.key === "ArrowRight") { direccion = 1; ev.preventDefault(); }
    }
    function tecladoSuelta(ev) {
      if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") direccion = 0;
    }
    window.addEventListener("keydown", teclado);
    window.addEventListener("keyup", tecladoSuelta);

    function visibilidad() {
      pausado = document.hidden;
      ultimo = performance.now();
    }
    document.addEventListener("visibilitychange", visibilidad);

    function nuevoObjeto() {
      const tipo = Math.random() < 0.5 ? "coca" : "croqueta";
      const margen = 30;
      objetos.push({
        tipo,
        x: azar(margen, ancho - margen),
        y: -40,
        v: (op.tranquilo ? azar(95, 125) : azar(130, 175)) * Math.max(0.8, alto / 520),
        giro: azar(-0.4, 0.4),
        vg: azar(-1.5, 1.5),
      });
    }

    function dibujarCoca(o) {
      ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.giro);
      const w = 24, h = 42;
      ctx.fillStyle = "#e41e2b";
      redondo(-w / 2, -h / 2, w, h, 6); ctx.fill();
      ctx.fillStyle = "#c9cfd6";
      redondo(-w / 2 + 2, -h / 2 - 4, w - 4, 6, 3); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-w / 2, 2); ctx.bezierCurveTo(-4, -8, 4, 12, w / 2, 0); ctx.stroke();
      ctx.restore();
    }
    function dibujarCroqueta(o) {
      ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.giro);
      ctx.fillStyle = "#c98a2b";
      ctx.beginPath(); ctx.ellipse(0, 0, 22, 13, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#e7b45a";
      ctx.beginPath(); ctx.ellipse(-2, -2, 18, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#f6d58c";
      [[-9, -4], [-2, -6], [6, -3], [10, 1], [-6, 2], [2, 2]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill(); });
      ctx.restore();
    }
    function redondo(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
    }
    function dibujarBandeja() {
      const bx = bandeja.x * (ancho - bandeja.ancho);
      // barra del bar
      ctx.fillStyle = "#5a2347";
      ctx.fillRect(0, alto - 22, ancho, 22);
      ctx.fillStyle = "#7d3463";
      ctx.fillRect(0, alto - 22, ancho, 4);
      // bandeja
      ctx.fillStyle = "#a41880";
      redondo(bx, bandeja.y + 6, bandeja.ancho, bandeja.alto, 8); ctx.fill();
      ctx.fillStyle = "#f09bb2";
      redondo(bx, bandeja.y, bandeja.ancho, bandeja.alto, 8); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.55)";
      redondo(bx + 10, bandeja.y + 3, bandeja.ancho - 20, 4, 2); ctx.fill();
      // lo recogido se apila (un poco) en la bandeja
      const apilados = Math.min(recogidos, 8);
      for (let i = 0; i < apilados; i++) {
        const o = { x: bx + 18 + (i % 4) * ((bandeja.ancho - 36) / 3), y: bandeja.y - 8 - Math.floor(i / 4) * 12, giro: 0 };
        ctx.save(); ctx.globalAlpha = 0.9; ctx.translate(0, 0);
        if (i % 2) { ctx.scale(1, 1); dibujarCrocMini(o); } else dibujarCocaMini(o);
        ctx.restore();
      }
    }
    function dibujarCocaMini(o) { ctx.fillStyle = "#e41e2b"; redondo(o.x - 6, o.y - 10, 12, 18, 3); ctx.fill(); }
    function dibujarCrocMini(o) { ctx.fillStyle = "#d9a441"; ctx.beginPath(); ctx.ellipse(o.x, o.y, 10, 6, 0, 0, 7); ctx.fill(); }

    function bucle(t) {
      raf = requestAnimationFrame(bucle);
      const dt = Math.min(0.05, (t - ultimo) / 1000);
      ultimo = t;
      if (pausado) return;

      if (direccion) bandeja.x = Math.min(1, Math.max(0, bandeja.x + direccion * dt * 1.1));

      if (!terminado) {
        proximo -= dt * 1000;
        if (proximo <= 0) {
          nuevoObjeto();
          proximo = op.tranquilo ? azar(900, 1200) : azar(650, 950);
        }
      }

      const bx = bandeja.x * (ancho - bandeja.ancho);
      objetos.forEach((o) => {
        o.y += o.v * dt;
        o.giro += o.vg * dt;
        const dentro = o.x > bx - 14 && o.x < bx + bandeja.ancho + 14;
        if (!o.fuera && !terminado && dentro && o.y > bandeja.y - 18 && o.y < bandeja.y + 18) {
          o.fuera = true;
          recogidos++;
          destellos.push({ x: o.x, y: bandeja.y - 10, t: 0, texto: o.tipo === "coca" ? "¡Coca-Cola!" : "¡Croqueta!" });
          op.sonar("recoger");
          op.alPuntuar(recogidos, op.meta);
          if (recogidos >= op.meta) {
            terminado = true;
            setTimeout(op.alGanar, 450);
          }
        }
        if (o.y > alto + 50) o.fuera = true;
      });
      objetos = objetos.filter((o) => !o.fuera);

      ctx.clearRect(0, 0, ancho, alto);
      // estanterías del fondo
      ctx.fillStyle = "rgba(240,155,178,.08)";
      for (let i = 1; i <= 3; i++) ctx.fillRect(0, alto * 0.2 + i * 46, ancho, 4);
      objetos.forEach((o) => (o.tipo === "coca" ? dibujarCoca(o) : dibujarCroqueta(o)));
      dibujarBandeja();
      destellos.forEach((d) => {
        d.t += dt;
        ctx.globalAlpha = Math.max(0, 1 - d.t * 1.4);
        ctx.fillStyle = "#ffe1f6";
        ctx.font = "700 22px Caveat, cursive";
        ctx.textAlign = "center";
        ctx.fillText(d.texto, d.x, d.y - d.t * 60);
        ctx.globalAlpha = 1;
      });
      destellos = destellos.filter((d) => d.t < 0.8);
    }
    raf = requestAnimationFrame(bucle);

    return {
      destruir() {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("keydown", teclado);
        window.removeEventListener("keyup", tecladoSuelta);
        document.removeEventListener("visibilitychange", visibilidad);
        enlaces.forEach(([b, p, clic]) => { b.removeEventListener("pointerdown", p); b.removeEventListener("click", clic); });
        canvas.remove();
      },
    };
  }

  /* ---------------------------------------------------------------
     2 · ABENIA — Memoria de parejas
     --------------------------------------------------------------- */
  const MOTIVOS = [
    { id: "coca", texto: "Coca-Cola", img: "svg:coca" },
    { id: "corazon", texto: "Corazón", img: "assets/stickers/2764_fe0f.webp" },
    { id: "risas", texto: "Risas", img: "assets/stickers/1f923.webp" },
    { id: "abrazo", texto: "Abrazo", img: "assets/stickers/1f917.webp" },
    { id: "estrella", texto: "Estrella", img: "assets/stickers/1f31f.webp" },
    { id: "cabezon", texto: "100% cabezón", img: "assets/stickers/1f4af.webp" },
  ];
  const LATA_SVG =
    '<svg viewBox="0 0 40 64" aria-hidden="true" class="lata"><rect x="4" y="6" width="32" height="54" rx="8" fill="#e41e2b"/>' +
    '<rect x="7" y="2" width="26" height="8" rx="4" fill="#c9cfd6"/><path d="M4 34c10-14 22 10 32-4" stroke="#fff" stroke-width="4" fill="none"/>' +
    '<text x="20" y="27" font-family="Caveat,cursive" font-weight="700" font-size="12" fill="#fff" text-anchor="middle">cola</text></svg>';

  function memoria(tablero, op) {
    const parejas = op.meta;
    const motivos = MOTIVOS.slice(0, parejas);
    const mazo = [...motivos, ...motivos].map((m, i) => ({ ...m, clave: i }));
    for (let i = mazo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
    }
    tablero.className = "tablero";
    tablero.innerHTML = "";

    let levantadas = [];
    let bloqueado = false;
    let encontradas = 0;
    let temporizador = 0;

    mazo.forEach((carta, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "carta";
      b.setAttribute("aria-label", `Carta ${i + 1}, boca abajo`);
      const frente = carta.img === "svg:coca" ? LATA_SVG : `<img src="${carta.img}" alt="" width="128" height="128">`;
      b.innerHTML =
        `<span class="carta-cara carta-dorso" aria-hidden="true"></span>` +
        `<span class="carta-cara carta-frente" aria-hidden="true">${frente}<span>${carta.texto}</span></span>`;
      b.addEventListener("click", () => girar(b, carta, i));
      carta.boton = b;
      tablero.appendChild(b);
    });

    function girar(b, carta, i) {
      // toques rápidos: se ignoran mientras se comprueba una pareja,
      // y nunca se puede girar dos veces la misma carta
      if (bloqueado || carta.hecha || levantadas.includes(carta)) return;
      b.classList.add("girada");
      b.setAttribute("aria-label", `Carta ${i + 1}: ${carta.texto}`);
      levantadas.push(carta);
      op.sonar("girar");
      if (levantadas.length < 2) return;

      const [a, c] = levantadas;
      if (a.id === c.id) {
        a.hecha = c.hecha = true;
        [a, c].forEach((x) => {
          x.boton.classList.add("pareja");
          x.boton.setAttribute("aria-disabled", "true");
          x.boton.setAttribute("aria-label", `Pareja encontrada: ${x.texto}`);
        });
        levantadas = [];
        encontradas++;
        op.sonar("acierto");
        op.alPuntuar(encontradas, parejas);
        if (encontradas === parejas) temporizador = setTimeout(op.alGanar, 650);
      } else {
        bloqueado = true;
        temporizador = setTimeout(() => {
          [a, c].forEach((x, k) => {
            x.boton.classList.remove("girada");
            x.boton.setAttribute("aria-label", x.boton.getAttribute("aria-label").replace(/:.*$/, ", boca abajo"));
          });
          levantadas = [];
          bloqueado = false;
        }, reducido() ? 700 : 900);
      }
    }

    return {
      destruir() { clearTimeout(temporizador); tablero.innerHTML = ""; },
    };
  }

  /* ---------------------------------------------------------------
     3 · CRIS — Reparte sonrisas
     --------------------------------------------------------------- */
  const TONOS = ["#ffd9c2", "#f7c6a8", "#e8b08a", "#c98d66", "#fbe0d0"];
  const PELOS = ["#3b2416", "#6b4226", "#200b1f", "#a0522d", "#d9a441"];

  function caraSVG(tono, pelo) {
    return `<svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="52" r="42" fill="${tono}"/>
      <path d="M12 46c0-26 18-38 38-38s38 12 38 38c-8-10-22-14-38-14S20 36 12 46z" fill="${pelo}"/>
      <g class="seria">
        <circle cx="36" cy="54" r="4.5" fill="#200b1f"/><circle cx="64" cy="54" r="4.5" fill="#200b1f"/>
        <path d="M38 74h24" stroke="#200b1f" stroke-width="4.5" stroke-linecap="round"/>
      </g>
      <g class="feliz">
        <path d="M30 55q6-7 12 0M58 55q6-7 12 0" stroke="#200b1f" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <circle cx="27" cy="66" r="6" fill="#f09bb2" opacity=".8"/><circle cx="73" cy="66" r="6" fill="#f09bb2" opacity=".8"/>
        <path d="M34 68q16 18 32 0z" fill="#a41880" stroke="#200b1f" stroke-width="3.5" stroke-linejoin="round"/>
      </g>
    </svg>`;
  }
  function perroSVG(pelo, oreja) {
    return `<svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M14 30c-6 14-4 34 8 40 6-10 8-26 6-40-4-4-10-4-14 0z" fill="${oreja}"/>
      <path d="M86 30c6 14 4 34-8 40-6-10-8-26-6-40 4-4 10-4 14 0z" fill="${oreja}"/>
      <ellipse cx="50" cy="54" rx="34" ry="36" fill="${pelo}"/>
      <ellipse cx="50" cy="70" rx="18" ry="14" fill="#fff6ee"/>
      <ellipse cx="50" cy="62" rx="7" ry="5" fill="#200b1f"/>
      <g class="seria">
        <circle cx="37" cy="47" r="4.5" fill="#200b1f"/><circle cx="63" cy="47" r="4.5" fill="#200b1f"/>
        <path d="M44 76h12" stroke="#200b1f" stroke-width="3.5" stroke-linecap="round"/>
      </g>
      <g class="feliz">
        <path d="M31 48q6-7 12 0M57 48q6-7 12 0" stroke="#200b1f" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M38 72q12 12 24 0" stroke="#200b1f" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M45 77q5 14 10 0z" fill="#f2668b"/>
      </g>
    </svg>`;
  }
  const PERROS = [["#c98a2b", "#8a5a1c"], ["#f3e3c8", "#c9a77a"], ["#5b3a29", "#3a2418"], ["#e8e8e8", "#b8a89a"], ["#d9a441", "#a87522"]];

  function sonrisas(zona, op) {
    const meta = op.meta;
    let dadas = 0;
    let terminado = false;
    const tam = op.tranquilo ? 92 : 80;
    const maxVisibles = op.tranquilo ? 3 : 4;
    const vivas = new Set();
    const timers = new Set();
    let creadas = 0;

    const tarde = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); return t; };

    function sitioLibre() {
      const r = zona.getBoundingClientRect();
      const m = 10;
      const maxX = Math.max(m, r.width - tam - m);
      const maxY = Math.max(m, r.height - tam - m);
      for (let intento = 0; intento < 40; intento++) {
        const x = azar(m, maxX), y = azar(m, maxY);
        let ok = true;
        vivas.forEach((v) => { if (Math.hypot(v.x - x, v.y - y) < tam * 1.15) ok = false; });
        if (ok) return { x, y };
      }
      return { x: azar(m, maxX), y: azar(m, maxY) };
    }

    function crear() {
      if (terminado || vivas.size >= maxVisibles || dadas + vivas.size >= meta) return;
      creadas++;
      const esPerro = creadas % 3 === 0;
      const { x, y } = sitioLibre();
      const b = document.createElement("button");
      b.type = "button";
      b.className = "carita";
      b.style.cssText = `left:${x}px;top:${y}px;width:${tam}px;height:${tam}px;animation-delay:0s,${azar(0, 1).toFixed(2)}s`;
      b.setAttribute("aria-label", esPerro ? "Perrito serio. Tócalo para que sonría" : "Carita seria. Tócala para que sonría");
      b.innerHTML = esPerro
        ? perroSVG(...PERROS[creadas % PERROS.length])
        : caraSVG(TONOS[creadas % TONOS.length], PELOS[(creadas * 7) % PELOS.length]);
      const info = { b, x, y };
      vivas.add(info);
      b.addEventListener("pointerdown", (ev) => { ev.preventDefault(); tocar(info, esPerro); });
      b.addEventListener("click", (ev) => { if (ev.detail === 0) tocar(info, esPerro); });
      zona.appendChild(b);
      // si nadie la toca, se cambia de sitio con calma (sin castigo)
      info.cambio = tarde(() => {
        if (b.classList.contains("sonrie")) return;
        vivas.delete(info);
        b.classList.add("se-va");
        tarde(() => b.remove(), 400);
        tarde(crear, 200);
      }, op.tranquilo ? 9000 : 6000);
    }

    function tocar(info, esPerro) {
      const b = info.b;
      if (terminado || b.classList.contains("sonrie")) return;
      clearTimeout(info.cambio);
      b.classList.add("sonrie");
      b.setAttribute("aria-label", esPerro ? "Perrito feliz" : "Carita feliz");
      dadas++;
      op.sonar(esPerro ? "guau" : "acierto");
      op.alPuntuar(dadas, meta);
      if (!reducido()) {
        const s = document.createElement("img");
        s.className = "mini-burbuja";
        s.alt = "";
        s.src = `assets/stickers/${esPerro ? "1f43e" : ["1f496", "1f60a", "2728", "1f970"][dadas % 4]}.webp`;
        s.style.left = info.x + tam / 2 - 28 + "px";
        s.style.top = info.y - 20 + "px";
        zona.appendChild(s);
        tarde(() => s.remove(), 1000);
      }
      tarde(() => {
        vivas.delete(info);
        b.classList.add("se-va");
        tarde(() => b.remove(), 400);
        if (dadas >= meta) {
          terminado = true;
          tarde(op.alGanar, 300);
        } else {
          crear();
        }
      }, 650);
    }

    for (let i = 0; i < maxVisibles; i++) tarde(crear, i * 250);

    return {
      destruir() {
        terminado = true;
        timers.forEach(clearTimeout);
        zona.innerHTML = "";
      },
    };
  }

  return { bar, memoria, sonrisas, LATA_SVG };
})();
