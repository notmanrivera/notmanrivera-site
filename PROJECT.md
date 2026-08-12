# notmanrivera.com — contexto del proyecto

Sitio personal de **Rubén Rivera** (pseudónimo **NotMan** / NotMan Rivera), diseñador/animador de motion graphics para marcas deportivas. Un solo `index.html` estático (~38 KB) más `assets/`, sin build step — se edita directo y se despliega.

## Identidad y color

- El logo es un wildstyle grafitero en cromado plata (`assets/logo.webp`, `logo-lg.webp`, `favicon.png`). El original de 17 MB (7005×3941) vive fuera del repo, en `~/Desktop/notman-originales`; **nunca meterlo de vuelta a esta carpeta**.
- El sitio usa las dos identidades: logo NotMan en nav/favicon/footer (personalidad), "Rubén Rivera" en el hero (credibilidad con clientes corporativos).
- ⚠️ **El verde ácido está prohibido.** Es el color de Victorem Sports Marketing, su trabajo anterior — no el suyo. Su color es el **morado**. Paleta: violeta eléctrico `#8B3FFF` + magenta `#FF2E88` sobre casi-negro `#0b0410`.

## Estética: menús de Persona (P3R / P4G / P5)

A petición explícita suya. Elementos clave:

- Tipografía de títulos: **Kenyan Coffee** (Ray Larabie / larabiefonts.com), auto-alojada en `assets/kenyan-coffee.woff2` (16 KB, convertida desde el TTF con fontTools). El TTF original vive en `~/Desktop/notman-originales`, fuera de la carpeta que se despliega. Cuerpo de texto: Inter, desde Google Fonts. Todo inclinado con `skewX(-10deg)` en títulos, botones y etiquetas
- Halftone de puntos con máscara de degradado en cada sección
- Bloques diagonales de color con parallax al hacer scroll
- Números gigantes en contorno (`-webkit-text-stroke`) detrás de secciones y servicios
- Títulos partidos en palabras que entran una por una con rebote (`cubic-bezier(.12,1.55,.32,1)`), efecto "slam"
- Los `<h2>` llevan un barrido magenta al entrar
- **Hover = cuña angular de dos capas** (violeta atrás, magenta al frente, bordes cortados en diagonal como la bandera de "SKILL" en el menú del juego) — no un brochazo irregular, se probó y se descartó
- **Cursor custom**: flecha sólida de orientación fija (se probó rotarla hacia la dirección del movimiento y quedaba apuntando hacia atrás al detenerse) + un rombo que lo persigue con retraso (interpolación 18%/frame). Crece y cambia de color sobre elementos accionables. Solo en `pointer:fine`, desactivado en táctil y con `prefers-reduced-motion`.
  - ⚠️ **Su estado se aplica con estilos directos desde JS, no con clases en `<body>`.** Se intentó con clases (`body.hot .cur`, etc.) y las reglas no surtían efecto de forma fiable pese a estar bien parseadas y a que el selector hacía match. No vale la pena volver a intentarlo con clases.
  - Los videos son iframes y **se tragan el `mousemove`**: sin tratamiento, el cursor se congela sobre ellos y además aparece la flecha nativa (el iframe tiene su propio documento, así que `cursor:none` no aplica dentro). Por eso al entrar a un `.frame` el cursor propio se esconde y se deja el nativo. Cualquier `mousemove` posterior lo recupera solo.
- Parallax del hero siguiendo el mouse; las tarjetas de portafolio se inclinan en 3D hacia el cursor

El cuerpo de texto queda recto y legible a propósito — el contraste entre lo salvaje y lo limpio es el argumento de venta (control del caos = lo que le vende a un cliente).

**Robustez:** el CSS solo esconde contenido si `<html>` tiene la clase `.js` (la agrega el script al cargar). Si JavaScript fallara por cualquier razón, la página se ve completa sin animaciones — nunca en blanco.

Bilingüe ES/EN con un toggle que re-parte el texto y vuelve a disparar todas las animaciones al cambiar de idioma.

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
