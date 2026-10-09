/* =====================================================================
   CONTENIDO DEL REGALO
   ---------------------------------------------------------------------
   Aquí están TODOS los textos y la asociación de fotos a personajes.
   Puedes cambiar cualquier frase sin tocar el resto del código.

   Fotos: se usan por su nombre corto (por ejemplo "velilla-zumo").
   Cada nombre corresponde a dos archivos en assets/fotos/:
     velilla-zumo.jpg       (grande, para ampliar)
     velilla-zumo-mini.jpg  (pequeña, para las tarjetas)
   Para añadir una foto nueva: añádela en tools/preparar_fotos.py,
   ejecuta  python3 tools/preparar_fotos.py  y usa aquí su nombre.

   "pos" (opcional) indica qué parte de la foto se ve cuando hay que
   recortarla en un marco: "50% 30%" = centrada, un poco hacia arriba.

   Tipos de tarjeta en los capítulos:
     { tipo: "mensaje", texto, firma? }          texto corto
     { tipo: "foto", foto, pie, giro? }          polaroid que se amplía
     { tipo: "sobre", titulo, texto }            se abre al tocar
     { tipo: "cupon", titulo, texto }            cupón con borde leopardo
     { tipo: "sorpresa", boton, texto, stickers } suelta pegatinas
     { tipo: "perritos", boton }                 enlace al rincón perruno
     { tipo: "galeria", titulo, fotos: [...] }   rejilla de fotos
   ===================================================================== */

window.CONTENIDO = {
  entrada: {
    antetitulo: "Para Cris, en sus 19",
    titulo: "Cris, hay gente que hace la vida más bonita.",
    subtitulo: "Hoy nos toca intentarlo a nosotros.",
    texto: "Tres personajes. Un montón de recuerdos. Y tú en el centro.",
    boton: "Abrir mi regalo 🎁",
    firma: "de Velilla y Abenia",
  },

  equipo: {
    titulo: "Desbloquea a tu equipo",
    intro: "Supera un minijuego para desbloquear a cada personaje y su capítulo de recuerdos.",
    final: "Nos queda una cosa…",
    finalTexto: "Ya está todo el equipo. Falta lo más importante.",
    perritos: "Rincón perruno",
    perritosTexto: "Porque esta web no podía no tener perritos.",
    reiniciar: "Reiniciar regalo",
    reiniciarPregunta: "¿Seguro? Se volverán a bloquear los tres personajes en este navegador. Las fotos no se borran.",
  },

  personajes: {
    velilla: {
      nombre: "Velilla",
      foto: "velilla-lenguas",
      pos: "50% 45%",
      juego: {
        titulo: "Una Coca-Cola y una croqueta en el Line",
        intro: "Hay planes increíbles. Y luego está nuestro plan de siempre.",
        instrucciones: "Mueve la bandeja con el dedo (o con los botones) y recoge Coca-Colas y croquetas. Lo que se caiga, no resta.",
        meta: 8,
        metaTranquila: 5,
        victoria: "Velilla desbloqueado. Cinco años de amistad y todavía nos quedan muchísimas croquetas.",
      },
      capitulo: {
        titulo: "Velilla y Cris",
        subtitulo: "Cinco años. Muchos planes. El mismo bar.",
        tarjetas: [
          { tipo: "mensaje", texto: "Cris, aquí Velilla. Cinco años de amistad, que se dice pronto. Y aquí sigo, encantado de la vida." },
          { tipo: "foto", foto: "velilla-lenguas", pie: "Nivel de seriedad: el de siempre." },
          { tipo: "sobre", titulo: "Un plan difícil de mejorar", texto: "Cinco años después, sigo pensando que una Coca-Cola, una croqueta y tú enfrente es un plan difícil de mejorar." },
          { tipo: "foto", foto: "velilla-croquetas", pie: "Aquí pone «croquetas». No hace falta decir más." },
          { tipo: "mensaje", texto: "Hacemos muchísimos planes, pero mi favorito sigue siendo el más sencillo: el Line, en el Arrabal, tú y yo." },
          { tipo: "foto", foto: "velilla-muecas", pie: "Tú poniendo caras. Yo con la cámara. Reparto justo.", giro: 2 },
          { tipo: "sobre", titulo: "Algo que no te digo lo suficiente", texto: "Contigo me río muchísimo. De verdad: es de mis cosas favoritas de estar contigo." },
          { tipo: "foto", foto: "velilla-leopardo", pie: "Tú ya ibas de leopardo antes que esta web.", giro: -2 },
          { tipo: "mensaje", texto: "Para lo que sea, ya lo sabes. Para lo bueno, para lo raro y para lo que no apetece contar. Ahí voy a estar." },
          { tipo: "foto", foto: "velilla-abrigos", pie: "Equipo abrigo." },
          { tipo: "galeria", titulo: "Más pruebas del delito", fotos: ["velilla-zumo", "velilla-cajas", "velilla-ascensor", "velilla-fotomaton", "velilla-sofa", "velilla-cris-cerca", "velilla-tupper"] },
          { tipo: "mensaje", texto: "Ser tu mejor amigo es un título que pienso defender muchos años más. Feliz 19, Cris.", firma: "Velilla" },
        ],
      },
    },

    abenia: {
      nombre: "Abenia",
      foto: "abenia-bar",
      pos: "50% 58%",
      juego: {
        titulo: "Cabezonería nivel experto",
        intro: "A veces nos picamos. Pero para estar a tu lado, siempre hacemos pareja.",
        instrucciones: "Toca las cartas de dos en dos y encuentra las parejas. Sin prisas y sin fallos que cuenten.",
        meta: 6,
        metaTranquila: 4,
        victoria: "Abenia desbloqueado. Un poco cabezón. Muy de estar cuando hace falta.",
      },
      capitulo: {
        titulo: "Abenia y Cris",
        subtitulo: "Piques, Coca-Colas y estar cuando hace falta.",
        tarjetas: [
          { tipo: "mensaje", texto: "Hola, Cris. Soy Abenia. Sí, el cabezón. Vengo en son de paz (y con una Coca-Cola)." },
          { tipo: "foto", foto: "abenia-bar", pie: "Foto oficial de una tregua." },
          { tipo: "sobre", titulo: "Lo reconozco", texto: "Vale, a veces soy un cabezón. Pero hay algo en lo que pienso seguir siendo igual de pesado: en estar cuando me necesites." },
          { tipo: "foto", foto: "abenia-ascensor-gafas", pie: "2022. Ya entonces te tocaba aguantarme de cerca.", giro: 2 },
          { tipo: "mensaje", texto: "Nos picamos, sí. Y se nos pasa enseguida, porque lo importante nunca ha estado en juego." },
          { tipo: "foto", foto: "abenia-ascensor", pie: "Abrazo de ascensor. Cuenta doble.", giro: -2 },
          { tipo: "foto", foto: "abenia-ascensor-espejo", pie: "Ascensor, segunda temporada. Tú sacando la lengua, yo dando el visto bueno.", giro: 1 },
          { tipo: "cupon", titulo: "Vale por una Coca-Cola", texto: "Canjeable en días malos para animarte. En días buenos, también. Caduca: nunca." },
          { tipo: "foto", foto: "abenia-kfc", pie: "Ese vaso es de Pepsi. Por eso te debo una Coca-Cola.", giro: -1 },
          { tipo: "sobre", titulo: "Para los días regulares", texto: "Cuando estés mal y necesites compañía o alguien que te anime, ya sabes a quién escribir. Y llevar una Coca-Cola también ayuda." },
          { tipo: "foto", foto: "abenia-chuches", pie: "Cara de «esto no se comparte». Mensaje recibido.", giro: 2 },
          { tipo: "sorpresa", boton: "Toca aquí si hoy te apetece una Coca-Cola", texto: "Apuntado. Abenia ya está en ello.", stickers: ["1f942", "1f973", "1f389"] },
          { tipo: "galeria", titulo: "Más recuerdos (y alguna cara rara)", fotos: ["abenia-videollamada", "abenia-morritos", "abenia-terraza"] },
          { tipo: "mensaje", texto: "Gracias por aguantar mi cabezonería. A cambio, aquí me tienes: para animarte, para acompañarte o para lo que haga falta. Feliz 19.", firma: "Abenia" },
        ],
      },
    },

    cris: {
      nombre: "Cris",
      foto: "velilla-cris-cerca",
      pos: "50% 45%",
      juego: {
        titulo: "Reparte sonrisas",
        intro: "Llevas mucho tiempo alegrándole el día a los demás. Esta partida va de eso.",
        instrucciones: "Toca las caritas serias (y los perritos) para sacarles una sonrisa. No hay prisa ni castigos.",
        meta: 19,
        metaTranquila: 10,
        victoria: "Cris desbloqueada. La protagonista lo era desde el principio.",
      },
      capitulo: {
        titulo: "Cris",
        subtitulo: "Un capítulo entero sobre ti. De parte de los dos.",
        tarjetas: [
          { tipo: "mensaje", texto: "Este capítulo va de ti. Lo hemos escrito entre los dos, así que la culpa es compartida." },
          { tipo: "foto", foto: "cris-atardecer", pie: "Hora dorada, versión Cris." },
          { tipo: "sobre", titulo: "Algo que se te da muy bien", texto: "Tienes esa forma tan tuya de conseguir que un día normal acabe teniendo algo bonito." },
          { tipo: "foto", foto: "cris-flequillo", pie: "Flequillo: presente. Actitud: también.", giro: 2 },
          { tipo: "mensaje", texto: "Siempre estás sacándole una sonrisa a alguien. No sabemos si te das cuenta, pero se nota muchísimo." },
          { tipo: "foto", foto: "cris-disfraz", pie: "Compromiso con un disfraz: máximo.", giro: -2 },
          { tipo: "foto", foto: "cris-halloween", pie: "Esta mirada también es tuya. Pocas veces, pero existe.", giro: 1 },
          { tipo: "sobre", titulo: "Ex jugadora de vóley", texto: "Hace dos años jugabas al vóley. Lo de levantar cosas se te sigue dando genial: sobre todo, el ánimo de los demás." },
          { tipo: "mensaje", texto: "Si hay un perro cerca, lo vas a ver antes que nadie. Tu cariño por los perros viene de lejos: que se lo digan a Elvis." },
          { tipo: "perritos", boton: "Abrir el rincón perruno 🐾" },
          { tipo: "foto", foto: "cris-siesta", pie: "Batería agotada después de alegrarle el día a todo el mundo." },
          { tipo: "sobre", titulo: "Lo que pasa cuando estás", texto: "Disfrutas tanto con la gente que es imposible no pasarlo bien a tu lado." },
          { tipo: "foto", foto: "cris-bufanda", pie: "Modo invierno activado.", giro: -1 },
          { tipo: "galeria", titulo: "Más Cris", fotos: ["cris-sudadera", "cris-espejo-pelo", "velilla-tupper"] },
          { tipo: "mensaje", texto: "Eres muy buena persona, Cris. De las de verdad. Gracias por hacernos los días un poco mejores.", firma: "Velilla y Abenia" },
        ],
      },
    },
  },

  victoria: {
    recuerdos: "Ver nuestros recuerdos",
    seguir: "Seguir jugando",
    repetir: "Jugar otra vez",
  },

  final: {
    fotoPeque: "cris-peque",
    fotoAhora: "velilla-tupper",
    pasos: [
      "Esta peque cumple 19.",
      "Y ahora es esa persona que nos hace reír, que nos mejora los planes y que queremos tener cerca.",
      "Hoy queríamos que pudieras verte un poquito como te vemos nosotros.",
      "Feliz cumpleaños, Cris.\nTe queremos.\nVelilla y Abenia.",
    ],
    // a partir de qué paso se ve la foto actual (0 = el primero)
    pasoFotoAhora: 1,
    volver: "Volver a mis recuerdos",
    jugar: "Jugar otra vez",
  },

  perritos: {
    titulo: "Rincón perruno",
    texto: "Una colección de perritos, porque sabemos lo que te gustan. Toca cualquiera para verlo en grande.",
    // archivos en assets/perritos/ (fuentes en assets/perritos/FUENTES.txt)
    fotos: Array.from({ length: 26 }, (_, i) => `perrito-${String(i + 1).padStart(2, "0")}.jpg`),
  },

  // Pegatinas animadas (emoji animados de Google Noto, licencia CC BY 4.0) en assets/stickers/
  stickers: {
    entrada: ["1f382", "1f389", "1f415", "1f496"],
    victoria: ["1f973", "1f389", "1f483", "1f38a", "2728"],
    final: ["1f382", "1f496", "1f973", "1f388", "1f429", "1f38a", "1f970", "2728"],
    capitulo: {
      velilla: ["1f602", "1f60e", "1f923"],
      abenia: ["1f917", "2764_fe0f", "1f64c"],
      cris: ["1f60a", "1f415", "1f31f", "1f429"],
    },
  },
};
