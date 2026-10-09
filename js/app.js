/* =====================================================================
   APP · navegación, progreso guardado, recuerdos y final
   Los textos están en js/contenido.js; los juegos en js/juegos.js.
   ===================================================================== */

(function () {
  const C = window.CONTENIDO;
  const ORDEN = ["velilla", "abenia", "cris"];
  const CLAVE = "regalo-cris-19";
  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reducido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Progreso (localStorage) ----------------
     Solo guarda QUÉ está desbloqueado y la preferencia de sonido.
     Las partidas no guardan nada: repetir un juego nunca bloquea.
     Los recuerdos vistos NO se guardan: al recargar, las fotos
     del equipo vuelven a salir tapadas. */
  const progreso = (function () {
    let datos = { desbloqueados: {}, sonido: false };
    const vistos = new Set();
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE) || "null");
      if (guardado && typeof guardado === "object") datos = { ...datos, ...guardado };
    } catch (e) { /* sin almacenamiento: el progreso dura mientras la pestaña esté abierta */ }
    const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) {} };
    return {
      tiene: (id) => !!datos.desbloqueados[id],
      desbloquear(id) { if (!datos.desbloqueados[id]) { datos.desbloqueados[id] = Date.now(); guardar(); return true; } return false; },
      visto: (id) => vistos.has(id),
      marcarVisto(id) { vistos.add(id); },
      cuantos: () => ORDEN.filter((id) => datos.desbloqueados[id]).length,
      todos: () => ORDEN.every((id) => datos.desbloqueados[id]),
      sonido: () => !!datos.sonido,
      ponerSonido(v) { datos.sonido = v; guardar(); },
      reiniciar() { datos = { desbloqueados: {}, sonido: datos.sonido }; vistos.clear(); try { localStorage.removeItem(CLAVE); } catch (e) {} guardar(); },
    };
  })();

  function disponible(id) {
    if (id === "cris") return progreso.tiene("velilla") && progreso.tiene("abenia");
    return true;
  }

  /* ---------------- Sonido (opcional, apagado por defecto) ---------------- */
  let audio = null;
  function sonar(tipo) {
    if (!progreso.sonido()) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const notas = { recoger: [660, 880], girar: [420], acierto: [523, 659, 784], guau: [300, 240], fiesta: [523, 659, 784, 1047] }[tipo] || [600];
      notas.forEach((f, i) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = tipo === "guau" ? "square" : "triangle";
        o.frequency.value = f;
        const t = audio.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(g).connect(audio.destination);
        o.start(t); o.stop(t + 0.2);
      });
    } catch (e) {}
  }
  const btnSonido = $("#btn-sonido");
  function pintarSonido() {
    const on = progreso.sonido();
    btnSonido.setAttribute("aria-pressed", String(on));
    btnSonido.setAttribute("aria-label", on ? "Silenciar sonido" : "Activar sonido");
  }
  btnSonido.addEventListener("click", () => { progreso.ponerSonido(!progreso.sonido()); pintarSonido(); sonar("girar"); });
  pintarSonido();

  /* ---------------- Fotos ---------------- */
  const foto = (n) => `assets/fotos/${n}.jpg`;
  const mini = (n) => `assets/fotos/${n}-mini.jpg`;
  const sticker = (c) => `assets/stickers/${c}.webp`;
  const stickersHTML = (lista, clase = "") => lista.map((c) => `<img class="${clase}" src="${sticker(c)}" alt="" width="128" height="128" loading="lazy" decoding="async">`).join("");

  // fundido suave cuando termina de cargar cada foto
  function alCargar(raiz) {
    raiz.querySelectorAll("img[data-fundido]").forEach((img) => {
      const listo = () => img.classList.add("cargada");
      if (img.complete && img.naturalWidth) listo();
      else { img.addEventListener("load", listo, { once: true }); img.addEventListener("error", listo, { once: true }); }
    });
  }

  /* ---------------- Visor de fotos ---------------- */
  const visor = $("#visor"), visorImg = $("#visor-img"), visorPie = $("#visor-pie");
  let visorLista = [], visorPos = 0;
  function abrirVisor(lista, pos) {
    visorLista = lista; visorPos = pos;
    pintarVisor();
    if (!visor.open) visor.showModal();
  }
  function pintarVisor() {
    const f = visorLista[visorPos];
    visorImg.src = f.src;
    visorImg.alt = f.alt || "";
    visorPie.textContent = f.pie || "";
    const varias = visorLista.length > 1;
    $("#visor-ant").hidden = !varias;
    $("#visor-sig").hidden = !varias;
  }
  function moverVisor(d) { visorPos = (visorPos + d + visorLista.length) % visorLista.length; pintarVisor(); }
  $("#visor-cerrar").addEventListener("click", () => visor.close());
  $("#visor-ant").addEventListener("click", () => moverVisor(-1));
  $("#visor-sig").addEventListener("click", () => moverVisor(1));
  visor.addEventListener("click", (ev) => { if (ev.target === visor) visor.close(); });
  visor.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowLeft") moverVisor(-1);
    if (ev.key === "ArrowRight") moverVisor(1);
  });
  // deslizar para cambiar de foto
  let xInicio = null;
  visorImg.addEventListener("pointerdown", (ev) => { xInicio = ev.clientX; });
  visorImg.addEventListener("pointerup", (ev) => {
    if (xInicio === null) return;
    const dx = ev.clientX - xInicio; xInicio = null;
    if (Math.abs(dx) > 50 && visorLista.length > 1) moverVisor(dx < 0 ? 1 : -1);
  });
  visor.addEventListener("close", () => { visorImg.removeAttribute("src"); });

  /* ---------------- Confirmación ---------------- */
  function confirmar(texto) {
    const d = $("#aviso");
    $("#aviso-texto").textContent = texto;
    d.showModal();
    return new Promise((ok) => {
      const fin = (v) => { d.close(); $("#aviso-si").onclick = $("#aviso-no").onclick = null; ok(v); };
      $("#aviso-si").onclick = () => fin(true);
      $("#aviso-no").onclick = () => fin(false);
      d.oncancel = () => fin(false);
    });
  }

  /* ---------------- Celebración ---------------- */
  const capa = $("#celebracion");
  function celebrar(stickers = C.stickers.victoria, cantidad = 70) {
    sonar("fiesta");
    if (reducido()) return;
    const colores = ["#f544d8", "#a41880", "#fdd7dd", "#d9a441", "#e41e2b", "#ffffff", "#b646a7"];
    for (let i = 0; i < cantidad; i++) {
      const p = document.createElement("span");
      const corazon = i % 7 === 0;
      p.className = "confeti" + (corazon ? " corazon" : "");
      if (corazon) p.textContent = "♥";
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colores[i % colores.length];
      p.style.color = colores[i % 3];
      p.style.setProperty("--dx", (Math.random() * 120 - 60).toFixed(0) + "px");
      p.style.setProperty("--rot", (Math.random() * 900 - 450).toFixed(0) + "deg");
      p.style.setProperty("--dur", (1.8 + Math.random() * 1.4).toFixed(2) + "s");
      p.style.animationDelay = (Math.random() * 0.5).toFixed(2) + "s";
      capa.appendChild(p);
      setTimeout(() => p.remove(), 4000);
    }
    stickers.slice(0, 5).forEach((c, i) => {
      const s = document.createElement("img");
      s.className = "sticker-salto";
      s.src = sticker(c);
      s.alt = "";
      s.style.left = 8 + ((i * 21) % 80) + "vw";
      s.style.top = 18 + ((i * 37) % 55) + "vh";
      s.style.animationDelay = i * 0.12 + "s";
      capa.appendChild(s);
      setTimeout(() => s.remove(), 2800);
    });
  }

  /* ---------------- Barra y progreso ---------------- */
  const barra = $("#barra");
  function pintarProgreso() {
    const n = progreso.cuantos();
    $("#progreso").innerHTML =
      `<span class="progreso-iconos" aria-hidden="true">${ORDEN.map((id) => `<span class="progreso-punto ${progreso.tiene(id) ? "hecho" : ""}"></span>`).join("")}</span>` +
      `<span>${n} de 3</span><span class="solo-lector"> personajes desbloqueados</span>`;
  }

  /* ---------------- Navegación por #ruta ----------------
     #inicio · #equipo · #juego/velilla · #recuerdos/abenia · #perritos · #final
     Así el botón «atrás» del móvil también funciona. */
  const pantallas = ["entrada", "equipo", "juego", "recuerdos", "perritos", "final"];
  let juegoActivo = null;
  let destinoVolver = "#equipo";

  function ir(ruta) { if (location.hash !== ruta) location.hash = ruta; else mostrar(); }

  function mostrar() {
    if (juegoActivo) { juegoActivo.destruir(); juegoActivo = null; }
    if (visor.open) visor.close();
    const [nombre, id] = location.hash.replace(/^#/, "").split("/");

    let p = "entrada";
    if (nombre === "equipo") p = "equipo";
    else if (nombre === "juego" && ORDEN.includes(id) && disponible(id)) p = "juego";
    else if (nombre === "recuerdos" && ORDEN.includes(id) && progreso.tiene(id)) p = "recuerdos";
    else if (nombre === "perritos") p = "perritos";
    else if (nombre === "final" && progreso.todos()) p = "final";
    else if (nombre && nombre !== "inicio") { history.replaceState(null, "", "#equipo"); p = "equipo"; }

    pantallas.forEach((n) => { $("#p-" + n).hidden = n !== p; });
    barra.hidden = p === "entrada";
    pintarProgreso();

    destinoVolver = { entrada: "#inicio", equipo: "#inicio", juego: "#equipo", recuerdos: "#equipo", perritos: "#equipo", final: "#equipo" }[p];
    if (p === "perritos" && sessionStorage.getItem("perritos-desde")) destinoVolver = sessionStorage.getItem("perritos-desde");

    ({ entrada: pintarEntrada, equipo: pintarEquipo, juego: () => pintarJuego(id), recuerdos: () => pintarRecuerdos(id), perritos: pintarPerritos, final: pintarFinal })[p]();
    window.scrollTo(0, 0);
    const titulo = $("#p-" + p + " h1, #p-" + p + " h2");
    if (titulo && p !== "entrada") { titulo.setAttribute("tabindex", "-1"); titulo.focus({ preventScroll: true }); }
  }
  window.addEventListener("hashchange", mostrar);
  $("#btn-volver").addEventListener("click", () => ir(destinoVolver));

  /* ---------------- Entrada ---------------- */
  function pintarEntrada() {
    const e = C.entrada;
    const decor = reducido() ? "" : C.stickers.entrada.map((c, i) => `<img class="sticker s${i + 1}" src="${sticker(c)}" alt="" width="128" height="128">`).join("");
    $("#p-entrada").innerHTML = `
      <div class="tarjeta-entrada">
        ${decor}
        <div class="velas" aria-hidden="true">${'<span class="vela"></span>'.repeat(19)}</div>
        <p class="antetitulo mano">${esc(e.antetitulo)}</p>
        <h1 id="entrada-titulo">${esc(e.titulo)}</h1>
        <p class="subtitulo">${esc(e.subtitulo)}</p>
        <p class="texto">${esc(e.texto)}</p>
        <button class="btn btn-grande" type="button" id="btn-abrir">${esc(e.boton)}</button>
        <p class="firma mano">${esc(e.firma)}</p>
      </div>`;
    $("#btn-abrir").addEventListener("click", () => ir("#equipo"));
  }

  /* ---------------- Equipo ---------------- */
  const CANDADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  const CANDADO_ABIERTO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.9-1"/></svg>';

  function pintarEquipo() {
    const q = C.equipo;
    const tarjetas = ORDEN.map((id) => {
      const p = C.personajes[id];
      const hecho = progreso.tiene(id);
      const libre = disponible(id);
      const estado = hecho ? "desbloqueado" : libre ? "disponible" : "pendiente";
      const etiqueta = { desbloqueado: "Desbloqueado" + (id === "cris" ? "a" : ""), disponible: "Disponible", pendiente: "Pendiente" }[estado];
      const acciones = hecho
        ? `<a class="btn" href="#recuerdos/${id}">Ver recuerdos</a><a class="btn btn-secundario" href="#juego/${id}">Jugar otra vez</a>`
        : libre
          ? `<a class="btn" href="#juego/${id}">Jugar</a>`
          : "";
      const pista = !hecho && !libre ? `<p class="reto">Se abre cuando desbloquees a Velilla y a Abenia.</p>` : `<p class="reto">${esc(p.juego.titulo)}</p>`;
      // la foto sigue tapada hasta que se ven sus recuerdos
      const tapada = !(hecho && progreso.visto(id));
      return `
        <article class="personaje ${estado}" aria-label="${esc(p.nombre)}: ${etiqueta}">
          <div class="marco ${id === "abenia" ? "suave" : ""} ${tapada ? "tapada" : ""}">
            <img src="${mini(p.foto)}" alt="${tapada ? "" : "Foto de " + esc(p.nombre) + (id === "cris" ? "" : " con Cris")}" style="object-position:${p.pos || "50% 40%"}" loading="lazy" decoding="async">
            ${tapada ? `<span class="candado">${hecho ? CANDADO_ABIERTO : CANDADO}</span>` : `<span class="sello">${CANDADO_ABIERTO}</span>`}
          </div>
          <div class="personaje-info">
            <h2>${esc(p.nombre)}</h2>
            <span class="estado estado-${estado}">${etiqueta}</span>
            ${pista}
            ${acciones ? `<div class="personaje-acciones">${acciones}</div>` : ""}
          </div>
        </article>`;
    }).join("");

    const final = progreso.todos()
      ? `<div class="final-cta"><h2>${esc(q.final)}</h2><p>${esc(q.finalTexto)}</p><a class="btn btn-grande" href="#final">Abrir</a></div>`
      : "";

    $("#p-equipo").innerHTML = `
      <div class="cabecera">
        <h1 id="equipo-titulo">${esc(q.titulo)}</h1>
        <p><strong>${progreso.cuantos()} de 3 personajes desbloqueados</strong></p>
        <p>${esc(q.intro)}</p>
      </div>
      <div class="lista-personajes">${tarjetas}</div>
      ${final}
      <button class="extra" type="button" id="btn-perritos">
        <img src="${sticker("1f415")}" alt="" width="128" height="128" loading="lazy">
        <span><strong>${esc(q.perritos)} 🐾</strong><span>${esc(q.perritosTexto)}</span></span>
      </button>
      <div class="pie-equipo">
        ${progreso.cuantos() ? `<button class="btn-texto" type="button" id="btn-reiniciar">${esc(q.reiniciar)}</button>` : ""}
      </div>`;

    $("#btn-perritos").addEventListener("click", () => { sessionStorage.setItem("perritos-desde", "#equipo"); ir("#perritos"); });
    const r = $("#btn-reiniciar");
    if (r) r.addEventListener("click", async () => {
      if (await confirmar(q.reiniciarPregunta)) { progreso.reiniciar(); pintarEquipo(); pintarProgreso(); }
    });
  }

  /* ---------------- Juegos ---------------- */
  let modoTranquilo = false;

  function pintarJuego(id) {
    const p = C.personajes[id], j = p.juego;
    const raiz = $("#p-juego");
    raiz.innerHTML = `
      <div class="juego-intro">
        <div class="cabecera"><p class="mano" style="font-size:24px">Reto de ${esc(p.nombre)}</p><h1>${esc(j.titulo)}</h1></div>
        <p class="cita">«${esc(j.intro)}»</p>
        <p class="como">${esc(j.instrucciones)}</p>
        <label class="tranquilo">
          <input type="checkbox" id="chk-tranquilo" ${modoTranquilo ? "checked" : ""}>
          <span>Modo tranquilo<small>Objetivo más fácil: ${j.metaTranquila} en vez de ${j.meta}${id === "abenia" ? " parejas" : ""}.</small></span>
        </label>
        <button class="btn btn-grande" type="button" id="btn-empezar">Empezar</button>
        ${progreso.tiene(id) ? `<p class="como">Ya lo tienes desbloqueado: juega todo lo que quieras, no se pierde nada.</p>` : ""}
      </div>`;
    $("#chk-tranquilo").addEventListener("change", (ev) => { modoTranquilo = ev.target.checked; });
    $("#btn-empezar").addEventListener("click", () => empezar(id));
  }

  function empezar(id) {
    const p = C.personajes[id], j = p.juego;
    const meta = modoTranquilo ? j.metaTranquila : j.meta;
    const raiz = $("#p-juego");
    const unidad = id === "abenia" ? "parejas" : id === "cris" ? "sonrisas" : "recogidos";
    raiz.innerHTML = `
      <div class="juego-hud">
        <h1 style="font-size:18px">${esc(j.titulo)}</h1>
        <span class="contador" aria-live="polite"><span id="cuenta">0</span> / ${meta} <span class="solo-lector">${unidad}</span></span>
      </div>
      <div id="zona"></div>`;
    const zona = $("#zona");
    const op = {
      tranquilo: modoTranquilo,
      meta,
      sonar,
      alPuntuar: (n) => { $("#cuenta").textContent = n; },
      alGanar: () => ganar(id),
    };

    if (id === "velilla") {
      zona.className = "zona-juego zona-bar";
      zona.innerHTML = `<div class="neon" aria-hidden="true"><b>Line</b><small>Arrabal</small></div>`;
      const ctrl = document.createElement("div");
      ctrl.className = "controles";
      ctrl.innerHTML = `
        <button class="btn btn-claro" type="button" aria-label="Mover bandeja a la izquierda"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>
        <button class="btn btn-claro" type="button" aria-label="Mover bandeja a la derecha"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button>`;
      zona.after(ctrl);
      juegoActivo = JUEGOS.bar(zona, ctrl, op);
    } else if (id === "abenia") {
      juegoActivo = JUEGOS.memoria(zona, op);
    } else {
      zona.className = "zona-juego zona-sonrisas";
      juegoActivo = JUEGOS.sonrisas(zona, op);
    }
  }

  function ganar(id) {
    if (juegoActivo) { juegoActivo.destruir(); juegoActivo = null; }
    const p = C.personajes[id];
    const nuevo = progreso.desbloquear(id);
    pintarProgreso();
    const v = C.victoria;
    const otro = progreso.todos()
      ? `<a class="btn btn-secundario" href="#final">${esc(C.equipo.final)}</a>`
      : `<a class="btn btn-secundario" href="#equipo">${esc(v.seguir)}</a>`;
    $("#p-juego").innerHTML = `
      <div class="victoria">
        <div class="stickers-fila" aria-hidden="true">${stickersHTML(C.stickers.victoria.slice(0, 4))}</div>
        <div class="marco ${id === "abenia" ? "suave" : ""} ${progreso.visto(id) ? "" : "tapada"}"><img src="${mini(p.foto)}" alt="" style="object-position:${p.pos || "50% 40%"}">${progreso.visto(id) ? "" : `<span class="candado">${CANDADO_ABIERTO}</span>`}</div>
        <h1>${nuevo ? "¡Desbloqueado!" : "¡Otra vez!"}</h1>
        <p class="mensaje-victoria">${esc(p.juego.victoria)}</p>
        <div class="columna-botones">
          <a class="btn btn-grande" href="#recuerdos/${id}">${esc(v.recuerdos)}</a>
          ${otro}
          <button class="btn-texto" type="button" id="btn-repetir">${esc(v.repetir)}</button>
        </div>
      </div>`;
    $("#btn-repetir").addEventListener("click", () => empezar(id));
    $("#p-juego h1").focus?.();
    celebrar();
  }

  /* ---------------- Recuerdos ---------------- */
  function pintarRecuerdos(id) {
    const p = C.personajes[id], cap = p.capitulo;
    progreso.marcarVisto(id);
    const fotosCap = [];
    const registrar = (nombre, pie) => { fotosCap.push({ src: foto(nombre), pie, alt: pie || "Foto de " + p.nombre }); return fotosCap.length - 1; };

    const html = cap.tarjetas.map((t, i) => {
      switch (t.tipo) {
        case "mensaje":
          return `<div class="tarjeta tarjeta-mensaje"><p>${esc(t.texto)}</p>${t.firma ? `<span class="firma mano">${esc(t.firma)}</span>` : ""}</div>`;
        case "foto": {
          const n = registrar(t.foto, t.pie);
          return `<figure class="polaroid" style="--giro:${t.giro || 0}deg;margin:0">
              <button type="button" data-foto="${n}" aria-label="Ampliar foto: ${esc(t.pie)}"><img data-fundido src="${mini(t.foto)}" alt="${esc(t.pie)}" loading="lazy" decoding="async"></button>
              <span class="lupa" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5M11 8v6M8 11h6"/></svg></span>
              <figcaption>${esc(t.pie)}</figcaption>
            </figure>`;
        }
        case "sobre":
          return `<button class="sobre" type="button" aria-expanded="false">
              <span class="sobre-interior">
                <span class="sobre-cara sobre-delante"><span class="etiqueta-sobre"><strong>${esc(t.titulo)}</strong><span class="toca">toca para abrir</span></span></span>
                <span class="sobre-cara sobre-detras">${esc(t.texto)}</span>
              </span>
            </button>`;
        case "cupon":
          return `<div class="cupon"><div class="cupon-interior">${JUEGOS.LATA_SVG}<div><h3>${esc(t.titulo)}</h3><p>${esc(t.texto)}</p></div></div></div>`;
        case "sorpresa":
          return `<div class="sorpresa"><button class="btn btn-secundario" type="button" data-sorpresa="${i}">${esc(t.boton)}</button><p class="respuesta" aria-live="polite"></p></div>`;
        case "perritos":
          return `<div class="sorpresa"><button class="btn" type="button" data-perritos>${esc(t.boton)}</button></div>`;
        case "galeria": {
          const celdas = t.fotos.map((f) => {
            const n = registrar(f, "");
            return `<button type="button" data-foto="${n}" aria-label="Ampliar foto"><img data-fundido src="${mini(f)}" alt="Foto de ${esc(p.nombre)}${id === "cris" ? "" : " con Cris"}" loading="lazy" decoding="async"></button>`;
          }).join("");
          return `<section class="galeria-bloque"><h2>${esc(t.titulo)}</h2><div class="galeria">${celdas}</div></section>`;
        }
        default:
          return "";
      }
    }).join("");

    const siguiente = ORDEN.find((o) => !progreso.tiene(o) && disponible(o));
    $("#p-recuerdos").innerHTML = `
      <header class="capitulo-cabecera">
        <div class="stickers-fila" aria-hidden="true">${stickersHTML(C.stickers.capitulo[id])}</div>
        <p class="etiqueta mano">Capítulo ${ORDEN.indexOf(id) + 1}</p>
        <h1>${esc(cap.titulo)}</h1>
        <p>${esc(cap.subtitulo)}</p>
      </header>
      <div class="album">${html}</div>
      <div class="fin-capitulo">
        ${progreso.todos() ? `<a class="btn btn-grande" href="#final">${esc(C.equipo.final)}</a>` : siguiente ? `<a class="btn btn-grande" href="#juego/${siguiente}">Siguiente reto: ${esc(C.personajes[siguiente].nombre)}</a>` : ""}
        <a class="btn btn-secundario" href="#equipo">Volver al equipo</a>
      </div>`;

    const raiz = $("#p-recuerdos");
    alCargar(raiz);
    raiz.querySelectorAll("[data-foto]").forEach((b) => b.addEventListener("click", () => abrirVisor(fotosCap, +b.dataset.foto)));
    raiz.querySelectorAll(".sobre").forEach((b) => b.addEventListener("click", () => {
      const abierto = b.classList.toggle("abierto");
      b.setAttribute("aria-expanded", String(abierto));
      if (abierto) sonar("girar");
    }));
    raiz.querySelectorAll("[data-sorpresa]").forEach((b) => b.addEventListener("click", () => {
      const t = cap.tarjetas[+b.dataset.sorpresa];
      b.nextElementSibling.textContent = t.texto;
      celebrar(t.stickers, 40);
    }));
    raiz.querySelectorAll("[data-perritos]").forEach((b) => b.addEventListener("click", () => {
      sessionStorage.setItem("perritos-desde", "#recuerdos/" + id);
      ir("#perritos");
    }));
  }

  /* ---------------- Rincón perruno ---------------- */
  function pintarPerritos() {
    const d = C.perritos;
    const lista = d.fotos.map((f, i) => ({ src: "assets/perritos/" + f, alt: "Perrito " + (i + 1), pie: "" }));
    $("#p-perritos").innerHTML = `
      <div class="cabecera">
        <div class="huellas" aria-hidden="true">${stickersHTML(["1f43e", "1f415", "1f429", "1f43e"])}</div>
        <h1>${esc(d.titulo)}</h1>
        <p>${esc(d.texto)}</p>
      </div>
      <div class="perros">${lista.map((f, i) => `<button type="button" data-perro="${i}" aria-label="Ampliar ${f.alt}"><img data-fundido src="${f.src}" alt="${f.alt}" loading="lazy" decoding="async"></button>`).join("")}</div>
      <div class="fin-capitulo"><button class="btn btn-secundario" type="button" id="perritos-volver">Volver</button></div>`;
    const raiz = $("#p-perritos");
    alCargar(raiz);
    raiz.querySelectorAll("[data-perro]").forEach((b) => b.addEventListener("click", () => abrirVisor(lista, +b.dataset.perro)));
    $("#perritos-volver").addEventListener("click", () => ir(destinoVolver));
  }

  /* ---------------- Final ---------------- */
  function pintarFinal() {
    const f = C.final;
    let paso = 0;
    const raiz = $("#p-final");
    raiz.innerHTML = `
      <h1 class="solo-lector">${esc(C.equipo.final)}</h1>
      <button class="escenario" type="button" id="escenario" aria-describedby="frase">
        <span class="foto-final">
          <img id="foto-peque" src="${foto(f.fotoPeque)}" alt="Cris de pequeña">
          <img id="foto-ahora" class="oculta" src="${foto(f.fotoAhora)}" alt="Cris ahora, sonriendo">
        </span>
        <span class="frase-final" id="frase" aria-live="polite"></span>
      </button>
      <div class="pasos" aria-hidden="true">${f.pasos.map(() => "<i></i>").join("")}</div>
      <div id="final-acciones" class="columna-botones">
        <button class="btn btn-grande" type="button" id="final-seguir">Seguir</button>
        <button class="btn-texto" type="button" id="final-atras">Atrás</button>
      </div>`;

    function pintar() {
      const ultimo = paso === f.pasos.length - 1;
      const frase = $("#frase");
      frase.className = "frase-final" + (ultimo ? " ultima" : "");
      frase.innerHTML = `<span>${esc(f.pasos[paso])}</span>`;
      $("#foto-ahora").classList.toggle("oculta", paso < f.pasoFotoAhora);
      $("#foto-peque").classList.toggle("oculta", paso >= f.pasoFotoAhora);
      raiz.querySelectorAll(".pasos i").forEach((el, i) => el.classList.toggle("activo", i <= paso));
      $("#final-atras").hidden = paso === 0;
      if (ultimo) {
        $("#final-acciones").innerHTML = `
          <a class="btn btn-grande" href="#equipo">${esc(f.volver)}</a>
          <button class="btn btn-secundario" type="button" id="final-jugar">${esc(f.jugar)}</button>`;
        $("#final-jugar").addEventListener("click", () => ir("#juego/velilla"));
        setTimeout(() => $("#final-acciones").scrollIntoView({ block: "nearest", behavior: reducido() ? "auto" : "smooth" }), 600);
        celebrar(C.stickers.final, 110);
        setTimeout(() => celebrar(C.stickers.final.slice(4), 50), 1200);
      }
    }
    function avanzar() { if (paso < f.pasos.length - 1) { paso++; pintar(); } }
    $("#escenario").addEventListener("click", avanzar);
    $("#final-seguir").addEventListener("click", avanzar);
    $("#final-atras").addEventListener("click", () => { if (paso > 0) { paso--; pintar(); } });
    pintar();
  }

  /* ---------------- Arranque ---------------- */
  mostrar();
})();
