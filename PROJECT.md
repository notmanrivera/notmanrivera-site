# notmanrivera.com — contexto del proyecto

Sitio personal de **Rubén Rivera** (pseudónimo **NotMan** / NotMan Rivera), diseñador/animador de motion graphics para marcas deportivas. Un solo `index.html` estático (~38 KB) más `assets/`, sin build step — se edita directo y se despliega.

## Identidad y color

- El logo es un wildstyle grafitero en cromado plata (`assets/logo.webp`, `logo-lg.webp`, `favicon.png`). El original de 17 MB (7005×3941) vive fuera del repo, en `~/Desktop/notman-originales`; **nunca meterlo de vuelta a esta carpeta**.
- El sitio usa las dos identidades: logo NotMan en nav/favicon/footer (personalidad), "Rubén Rivera" en el hero (credibilidad con clientes corporativos).
- ⚠️ **El verde ácido está prohibido.** Es el color de Victorem Sports Marketing, su trabajo anterior — no el suyo. Su color es el **morado**, y no se toca.

## Paleta

Base de Persona 5 — negro absoluto `#000000`, blanco puro `#FFFFFF`, rojo saturado `#E50012` — con el morado de Rubén encima. El negro es negro de verdad, no un gris "amable": ese contraste entintado de cómic es justamente el efecto buscado.

Para que los dos acentos no se peleen, **cada color tiene un trabajo asignado**:

| Color | Papel | Dónde |
|---|---|---|
| Morado `#8B3FFF` / `#A96BFF` / `#4A1391` | **Quién es** — identidad y estructura | Bordes, botón secundario, números de sección, sombras duras, panel del hexágono |
| Rojo `#E50012` | **Qué mirar** — urgencia y acción | Etiquetas de sección, CTA principal, cuña de hover, cursor, cargador, barras de acento |
| Blanco `#FFFFFF` | La información | Toda la tipografía |
| Negro `#000000` | Todo lo demás | Fondo |

El magenta `#FF2E88` que se usaba antes **se retiró**: junto al rojo de P5 los dos se leían como el mismo color mal impreso, y cinco colores dejan de ser un sistema. Si alguna vez hace falta recuperarlo, era el acento urgente y hoy ese papel lo tiene `--rojo`.

El rojo nunca se usa como color de texto: `#E50012` sobre negro da 4.33:1 y no alcanza AA para texto normal. Va siempre de fondo, relleno o borde, con blanco encima (4.84:1, sí pasa).

## Estética: menús de Persona (P3R / P4G / P5)

A petición explícita suya. Elementos clave:

- Tipografía de títulos: **Kenyan Coffee** (Ray Larabie / larabiefonts.com), auto-alojada en `assets/kenyan-coffee.woff2` (16 KB, convertida desde el TTF con fontTools). El TTF original vive en `~/Desktop/notman-originales`, fuera de la carpeta que se despliega. Cuerpo de texto: Inter, desde Google Fonts. Todo inclinado con `skewX(-10deg)` en títulos, botones y etiquetas
- Halftone de puntos con máscara de degradado en cada sección
- Bloques diagonales de color con parallax al hacer scroll
- Números gigantes en contorno (`-webkit-text-stroke`) detrás de secciones y servicios
- Títulos partidos en palabras que entran una por una con rebote (`cubic-bezier(.12,1.55,.32,1)`), efecto "slam"
- Los `<h2>` llevan un barrido magenta al entrar
- **Hover = cuña angular de dos capas** (violeta atrás, magenta al frente, bordes cortados en diagonal como la bandera de "SKILL" en el menú del juego) — no un brochazo irregular, se probó y se descartó
- **Cursor custom: nativo, con imagen SVG en CSS. Sin JavaScript.** Dos punteros definidos como variables en `:root` (`--cur-normal` magenta, `--cur-activo` violeta para elementos accionables), en data URI. Solo en `pointer:fine`; dentro de `.frame` se deja `cursor:auto` porque el iframe manda en su propio documento.
  - ⚠️ **No volver a intentarlo con un `<div>` que persiga al mouse.** Se hicieron tres versiones y las tres se rompían: los iframes se tragan el `mousemove` (el cursor se congela sobre los videos y encima aparece la flecha nativa), los bordes de ventana y los cambios de pestaña dejan eventos colgados, y cualquier `:hover` que mueva una caja desincroniza el estado. Además, las reglas tipo `body.hot .cur` no surtían efecto de forma fiable pese a estar bien parseadas y a que el selector hacía match. Un cursor nativo no es un elemento del DOM, así que no puede entrar en conflicto con nada.
  - Al tocar los SVG, verificar que decodifiquen: si el data URI está mal formado el navegador cae al cursor por defecto **en silencio**, y parece que "sigue roto". Se comprueba cargándolos en un `new Image()`.
- Parallax del hero siguiendo el mouse; las tarjetas de portafolio se inclinan en 3D hacia el cursor

El cuerpo de texto queda recto y legible a propósito — el contraste entre lo salvaje y lo limpio es el argumento de venta (control del caos = lo que le vende a un cliente).

**Robustez:** el CSS solo esconde contenido si `<html>` tiene la clase `.js` (la agrega el script al cargar). Si JavaScript fallara por cualquier razón, la página se ve completa sin animaciones — nunca en blanco.

Bilingüe ES/EN con un toggle que re-parte el texto y vuelve a disparar todas las animaciones al cambiar de idioma.

### Cargador

Al entrar se ve una pantalla de título: campo **rojo** en diagonal, el logo cromado con sombra dura negra, una barra que se llena y "CARGANDO" parpadeando; al terminar barre hacia arriba con el filo inferior cortado en diagonal. Se va cuando la página termina de cargar, nunca antes de 950 ms ni después de 2.6 s.

⚠️ Tres cosas que no se deben tocar sin entenderlas:
- Se activa con la clase `.cargando`, que pone un `<script>` diminuto al abrir el `<body>` — **no** con `.js`. Si compartieran clase, un fallo del script principal dejaría el sitio entero escondido; así, lo único que se rompe es el cargador.
- El scroll se libera añadiendo `.cargado`, no quitando `.cargando`: quitarla lo manda a `display:none` de golpe y se come la transición de salida. `.cargando` se retira 720 ms después.
- El CSS lo aparta solo a los 6 s con una animación (`rescate`) que nadie tiene que llamar. Es la garantía de que la página no se puede quedar atrapada detrás de él.

La entrada del hero espera al cargador (bandera `heroListo`); si no, la animación se gastaría detrás del telón.

### Sección 04 · Perfil

El CV leído como una pantalla de estado de Persona, pero **sin jerga de videojuego** — nada de "nivel", "EXP" ni aptitudes inventadas; eso se probó y se descartó a petición suya. Panel izquierdo con las dos cifras duras (9 años, 7 estudios), disponibilidad y formación; a la derecha un hexágono con las seis herramientas y los porcentajes que él mismo puso en su CV.

El hexágono está calculado a mano sobre centro `310,205` y radio `145`: si cambia un valor hay que recalcular el `<polygon class="valor">` **y** su `<circle class="punto">`, con `r = 145 × valor / 100`.

## Infraestructura

- **Hosting:** Cloudflare Pages, proyecto `notmanrivera`
- **Desplegar:** desde esta carpeta, `wrangler pages deploy . --project-name=notmanrivera --commit-dirty=true`. Wrangler instalado vía Homebrew (`cloudflare-wrangler`) y ya autenticado en esta Mac contra la cuenta `rnrivera93@gmail.com`
- **Repo:** privado, `github.com/notmanrivera/notmanrivera-site`
- **Dominio:** registrado en Hostinger, DNS administrado en Cloudflare (nameservers `aarav`/`dawn.ns.cloudflare.com`). Apex y `www` son CNAME proxeados a `notmanrivera.pages.dev`. Renovación automática apagada — Rubén la renueva a mano cuando se acerca la fecha, no hace falta recordárselo
- **Correo:** `hola@notmanrivera.com` vía Cloudflare Email Routing, reenvía a su Gmail (MX, SPF y DKIM puestos por Cloudflare). Esto **solo recibe** — para *enviar* desde el dominio hace falta Google Workspace (~$6/mes, da DKIM/DMARC propios) o un SMTP externo. Relacionado con su Apps Script de prospección deportiva, que hoy sigue enviando desde `rnrivera93@gmail.com`

## Pendientes conocidos

- Los tres videos del portafolio son **embeds de Google Drive** y se ven con la marca de Google. Conviene subir el reel a Vimeo y cambiar el `src` del `<iframe>`.
- Cerrar el envío desde el dominio propio (Workspace o SMTP externo) para que la firma de los correos de prospección coincida con `hola@notmanrivera.com`.

## Notas para quien retome esto

- El dashboard de Cloudflare y Gmail están bloqueados para el agente vía navegador — pero **la API de Cloudflare sí responde** usando el token OAuth que Wrangler guarda en `~/Library/Preferences/.wrangler/config/default.toml`. Ese token puede leer/escribir Pages y Email Routing, pero **no** puede escribir registros DNS — eso lo tiene que hacer Rubén a mano en el dashboard.
- Antes de tocar `index.html`, revisa qué versión está realmente desplegada (`curl` a la URL del último deploy) — el caché del edge de Cloudflare a veces sirve una versión vieja por unos minutos tras el despliegue.
- **Regla de oro para el hover:** ningún elemento que detecte `:hover` debe mover su propia caja. Si lo hace, se sale de debajo del cursor, el navegador quita el `:hover`, la caja vuelve, y el ciclo se repite decenas de veces por segundo. El desplazamiento visual siempre va en un hijo interno (por eso existen `.card-in`, y los `translate` viven en `i`, `h3`, `p`, `span`, `img`).
- `.assetsignore` **no funciona en Cloudflare Pages** (es de Workers Static Assets). Para que un archivo no se publique, sácalo de la carpeta. Ojo: Pages responde `200` con el `index.html` para rutas inexistentes, así que un `200` no prueba que el archivo esté ahí — hay que mirar el `content-type` y el tamaño.
