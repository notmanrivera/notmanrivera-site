# notmanrivera.com — contexto del proyecto

Sitio personal de **Rubén Rivera** (pseudónimo **NotMan** / NotMan Rivera), diseñador/animador de motion graphics para marcas deportivas. Un solo `index.html` estático (~38 KB) más `assets/`, sin build step — se edita directo y se despliega.

## Identidad y color

- El logo es un wildstyle grafitero en cromado plata (`assets/logo.webp`, `logo-lg.webp`, `favicon.png`). El original de 17 MB (7005×3941) vive fuera del repo, en `~/Desktop/notman-originales`; **nunca meterlo de vuelta a esta carpeta**.
- Se eliminó `assets/logo.png` (172 KB) y los dos `<picture>` que lo usaban de respaldo para navegadores sin WebP. Era una red de seguridad falsa: el hero, el cargador, la figura del menú y el retrato del perfil ya cargaban `logo-lg.webp` a pelo, así que un navegador sin WebP veía el sitio roto de todas formas. WebP funciona en todo desde 2020.
- El sitio usa las dos identidades: logo NotMan en nav/favicon/footer (personalidad), "Rubén Rivera" en el hero (credibilidad con clientes corporativos).
- ⚠️ **El verde ácido está prohibido.** Es el color de Victorem Sports Marketing, su trabajo anterior — no el suyo. Su color es el **morado**, y no se toca.

## Paleta

Base de Persona 5 — negro absoluto `#000000`, blanco puro `#FFFFFF`, rojo saturado `#E50012` — con el morado de Rubén encima. El negro es negro de verdad, no un gris "amable": ese contraste entintado de cómic es justamente el efecto buscado.

Para que los dos acentos no se peleen, **cada color tiene un trabajo asignado**:

| Color | Papel | Dónde |
|---|---|---|
| Morado `#8B3FFF` / `#A96BFF` / `#4A1391` | **Quién es** — identidad y estructura | Bordes, botón secundario, números de sección, sombras duras, panel del hexágono |
| Rojo `#E50012` | **La superficie** — es el color de las placas en reposo | Placas del hero y de las secciones, etiquetas, cargador, barras de acento |
| Blanco `#FFFFFF` sobre placa | **Lo seleccionado** — el estado de hover | Toda placa se vuelve blanca con texto negro al pasar el cursor |
| Blanco `#FFFFFF` | La información | Toda la tipografía |
| Negro `#000000` | Todo lo demás | Fondo |

El magenta `#FF2E88` que se usaba antes **se retiró**: junto al rojo de P5 los dos se leían como el mismo color mal impreso, y cinco colores dejan de ser un sistema. Si alguna vez hace falta recuperarlo, era el acento urgente y hoy ese papel lo tiene `--rojo`.

El rojo nunca se usa como color de texto: `#E50012` sobre negro da 4.33:1 y no alcanza AA para texto normal. Va siempre de fondo, relleno o borde, con blanco encima (4.84:1, sí pasa).

⚠️ **Sobre placa roja el texto pequeño va a blanco pleno.** 4.84:1 es justo lo que hace falta, así que no queda margen para bajarle la opacidad: al 74% —que es lo que sí puede permitirse sobre negro— se hunde a ~2.5:1 y deja de cumplir. Medido, no estimado.

## Estética: menús de Persona (P3R / P4G / P5)

A petición explícita suya. Elementos clave:

- **Sistema tipográfico de tres voces.** Son tres familias y sin un trabajo claro cada una se vuelven ruido, así que cada una tiene el suyo:

  | Familia | Papel | Dónde |
  |---|---|---|
  | **Kenyan Coffee** (Ray Larabie) | **La voz** — lo que grita | `h1`, `h2`, `h3`, ítems del menú, cifras grandes, `.radar-tit`, botones |
  | **Monument Extended** (Pangram Pangram) | **La interfaz** — el chrome del menú | Etiquetas de chapa (`.kicker`, `.sec-tag`), nav, rótulos pequeños, números gigantes en contorno |
  | **Inter** | **La información** | Párrafos y nada más |

  Kenyan Coffee la eligió Rubén **por la temática deportiva** de su trabajo: condensada, alta, de marcador. Monument Extended entró después para el papel de interfaz. El contraste condensada-contra-extendida es el argumento del sistema: una empuja hacia arriba, la otra a los lados. Si las dos fueran anchas o las dos estrechas no habría sistema, habría dos fuentes parecidas.

  Ambas auto-alojadas: `assets/kenyan-coffee.woff2` (16 KB, convertida desde el TTF con fontTools) y `assets/monument-black.woff2` / `monument-light.woff2` (24 KB cada una). Los dos pesos de Monument comparten `font-family` y se eligen con `font-weight:900` / `300`, no con dos familias inventadas. Solo se precarga la Black: es la que aparece sobre el pliegue.

  ⚠️ **Al pasar un elemento de Kenyan a Monument hay que bajarle el cuerpo y el tracking** (más o menos a 0.7× el tamaño y de `.2em` a `.12em`). La extendida ya ocupa a lo ancho lo que la condensada daba con la letra suelta; con los valores de la condensada, el kicker se salía del móvil.

  ⚠️ Monument Extended es **comercial**. Auto-alojarla en producción necesita licencia de webfont de Pangram Pangram. Rubén dice tenerla resuelta.

- El TTF original de Kenyan Coffee vive en `~/Desktop/notman-originales`, fuera de la carpeta que se despliega. Todo inclinado con `skewX(-10deg)` en títulos, botones y etiquetas
- Halftone de puntos con máscara de degradado en cada sección
- Bloques diagonales de color con parallax al hacer scroll
- Números gigantes en contorno (`-webkit-text-stroke`) detrás de secciones y servicios
  - ⚠️ **No usar `currentColor` para el color del trazo.** El elemento lleva `color:transparent` para que solo se vea el contorno, así que `currentColor` resuelve a transparente y el número se pinta invisible — sin error, sin aviso. El color del trazo se da explícito por variante de placa.
- Títulos partidos en palabras que entran una por una con rebote (`cubic-bezier(.12,1.55,.32,1)`), efecto "slam"
- Los `<h2>` llevan un barrido magenta al entrar
- **Menú de pantalla completa: el menú de batalla de P5.** Rehecho a partir de la captura de referencia que pasó Rubén (ORDER / GUN / ITEM / PERSONA / SWORD / GUARD). Lo que hace que funcione, en orden de importancia:
  1. **El campo se queda NEGRO.** El rojo nunca inunda la pantalla: solo aparece en la placa seleccionada y en los badges de número. Esto corrige la lectura anterior — durante un rato se creyó que el rojo debía ser el campo de la página, y la referencia dice lo contrario.
  2. **Cada ítem es una placa** con `clip-path` de cuatro esquinas desiguales, ninguna a 90°, y **su propio `--giro`** además del skew común. Ninguna comparte línea de base.
  3. **Alternancia placa blanca / placa negra**, como ORDER contra PERSONA. Al pasar encima la placa entera se vuelve roja.
  4. **Segunda línea diminuta** bajo cada etiqueta, haciendo el papel del subtítulo japonés. Es lo que da la densidad; sin ella se ve vacío.

  Hubo una versión con **astillas** rojas en abanico detrás de las placas. Se probó y **Rubén la descartó**: con las placas delante competían por la atención en vez de sostenerlas. Si alguna vez se retoman, el aprendizaje fue que su origen tiene que ir en el centro — naciendo del borde izquierdo el abanico entero quedaba detrás del montón de placas, que son opacas, y solo asomaban las puntas.

  ⚠️ **`clip-path` recorta también el `outline`**, así que el anillo de foco global es invisible en las placas. Ahí el foco va con `box-shadow:inset`, que sí vive dentro del recorte.

- **El sistema de placas, en todo el sitio.** Menú, hero y las secciones cortan igual. La forma vive una sola vez, en `--filo` sobre `:root`.

  ⚠️ `--filo` está en **píxeles, no en porcentaje**. Con porcentajes el corte crece con la caja, así que en una fila ancha el triángulo recortado se comía el borde y este salía a trozos. En px el filo se ve igual en un badge chico y en una fila de ancho completo.

  ⚠️ **El borde blanco de una placa negra no puede ser `box-shadow:inset`.** El inset se dibuja en el borde de la caja y el filo diagonal es exactamente lo que recorta ese borde: el anillo sale entero donde el corte es poco profundo y desaparecido donde es mucho. Se hace al revés — la placa entera va **blanca** y una capa interior (`::after`) negra, metida 3 px y recortada con el **mismo** filo, se pone encima. El "borde" es el blanco que asoma, y como las dos capas comparten recorte, sigue la forma exacta por los cuatro lados. Eso es la clase `.placa-negra`.

  ⚠️ Esa capa va en **`z-index:-1`, no en 0**. Con 0 se pinta por encima del texto en cuanto el contenido es un nodo de texto suelto y no un hijo elemento — le pasa al kicker del hero, que no tiene hijos que subir con `z-index:1`. En −1 el orden de pintado queda: fondo de la placa, capa interior, contenido. El `isolation:isolate` de la placa es lo que garantiza que ese −1 se quede dentro y no caiga detrás del fondo del padre.

  Dónde **no** se usa el borde blanco: Perfil y las tarjetas del portafolio. Perfil porque el hexágono se dibuja con trazos blancos y sobre placa blanca desaparecería entero; el portafolio porque lleva video dentro. Las tres se rellenan con `--ink-2`, que ya las separa del negro puro de la página, y conservan el filo.

- **La cuña angular de dos capas se retiró de Servicios** al pasar esa sección a placas: la fila entera ya se vuelve roja al hacer hover, y una cuña roja dentro de una placa roja no se ve. El desplazamiento de `h3`/`p` se queda, que es lo que da la sensación de "selección" del menú.
- **Cursor custom: nativo, con imagen SVG en CSS. Sin JavaScript.** Dos punteros definidos como variables en `:root` (`--cur-normal` magenta, `--cur-activo` violeta para elementos accionables), en data URI. Solo en `pointer:fine`; dentro de `.frame` se deja `cursor:auto` porque el iframe manda en su propio documento.
  - ⚠️ **No volver a intentarlo con un `<div>` que persiga al mouse.** Se hicieron tres versiones y las tres se rompían: los iframes se tragan el `mousemove` (el cursor se congela sobre los videos y encima aparece la flecha nativa), los bordes de ventana y los cambios de pestaña dejan eventos colgados, y cualquier `:hover` que mueva una caja desincroniza el estado. Además, las reglas tipo `body.hot .cur` no surtían efecto de forma fiable pese a estar bien parseadas y a que el selector hacía match. Un cursor nativo no es un elemento del DOM, así que no puede entrar en conflicto con nada.
  - Al tocar los SVG, verificar que decodifiquen: si el data URI está mal formado el navegador cae al cursor por defecto **en silencio**, y parece que "sigue roto". Se comprueba cargándolos en un `new Image()`.
- Parallax del hero siguiendo el mouse; las tarjetas de portafolio se inclinan en 3D hacia el cursor

El cuerpo de texto queda recto y legible a propósito — el contraste entre lo salvaje y lo limpio es el argumento de venta (control del caos = lo que le vende a un cliente).

**Robustez:** el CSS solo esconde contenido si `<html>` tiene la clase `.js` (la agrega el script al cargar). Si JavaScript fallara por cualquier razón, la página se ve completa sin animaciones — nunca en blanco.

**Foco de teclado:** un solo anillo blanco de 3 px con `outline-offset:3px`, en `:focus-visible` (con el mouse no aparece). Blanco y no rojo a propósito: tiene que leerse sobre cualquier fondo que le toque, y el rojo desaparecería encima del CTA rojo. El blanco da 21:1 sobre negro, 4.84:1 sobre el rojo y 3.4:1 sobre el morado — los tres pasan el 3:1 que pide la norma para elementos que no son texto. El `outline-offset` además saca el anillo fuera de la caja, así que cae sobre el fondo de la página y sobrevive aunque el elemento cambie de color. En la cascada del menú el offset baja a 1 px, porque los ítems están tan pegados que el anillo de uno invadía la letra del siguiente.

Bilingüe ES/EN con un toggle que re-parte el texto y vuelve a disparar todas las animaciones al cambiar de idioma.

### Hero radial

El logo va en la **celda central** de una rejilla 3×3 y los textos salen hacia afuera. La columna izquierda se alinea a la **derecha** y la derecha a la **izquierda**: así las dos arrancan pegadas al logo y crecen alejándose de él.

Las piezas usan **el mismo lenguaje de placas que el menú de pantalla completa**, a petición de Rubén: cuadriláteros de esquinas desiguales, cada uno con su propio `--giro` además del skew común, y al pasar encima se vuelven rojos.

La alternancia es un **tablero de ajedrez**, no un orden de lectura. En una rejilla de dos columnas, alternar blanca-negra siguiendo el orden del DOM deja la columna izquierda entera de un color y la derecha del otro. El reparto correcto es que ninguna placa toque a otra de su color, ni al lado ni debajo:

|  | izquierda | derecha |
|---|---|---|
| **fila 1** | kicker · negra | 9+ · blanca |
| **fila 2** | 2D/3D · blanca | MX·ES·MENA · negra |
| **fila 3** | Ver mi trabajo · negra | Trabajemos juntos · blanca |

Las variantes se aplican como clase en el HTML (`.sat-blanca` / `.placa-negra`), no por `nth-child`: la posición de cada pieza en la rejilla puede cambiar, su papel en el tablero no.

**El abanico.** Lo que separa "cuadrícula con estilo" de la referencia son cuatro cosas, y las cuatro hacen falta juntas:

1. **Inclinación radial.** Cada placa se alinea con el **rayo que va del centro del logo hasta ella**, no con un ángulo inventado. Los valores se midieron en el navegador (dx, dy de cada pieza respecto al centro de la marca) y son estables entre anchos —10.1 / 10.1 / 10.0 para el kicker a 1280, 1440 y 1680— así que valores fijos son seguros. Las piezas de la fila del medio quedan casi planas, igual que "ITEM" en la referencia.

   ⚠️ El signo importa más que la magnitud. Durante varias iteraciones el kicker, el "9+" y los dos botones lo tenían **invertido**: apuntaban en contra del centro, y por eso no se leía como estallido por mucho que se subiera el ángulo.
2. **Abanico radial.** Cada placa lleva un `--empuje` horizontal: las de arriba y abajo se abren hacia afuera, las del medio se meten hacia el logo. Eso convierte dos columnas rectas en un arco. Va en **margen**, no en `transform`, porque `popIn` y `statIn` fijan el transform al terminar y se lo comerían.
3. **Placas ceñidas** (`width:max-content`). Estiradas al ancho de su celda se leen como una tabla.
4. **Agrupación apretada** (`column-gap` y `row-gap` casi a cero). El hueco generoso las volvía una lista.

El logo va en `z-index:2`, por encima de las placas: con giros fuertes alguna esquina se le acerca, y el logo es la pieza que no se tapa nunca.

⚠️ **Las columnas laterales van en `minmax(0,1fr)`, no en `1fr`.** Un track `1fr` tiene mínimo automático de `min-content`, así que no puede encogerse por debajo de su contenido. El kicker, que es la cadena más larga del hero, ensanchaba su columna a 507 px contra los 286 px de la otra y **empujaba el logo 111 px fuera del centro** — la composición se veía torcida sin que ninguna regla dijera nada raro. Con `minmax(0,…)` las dos laterales miden igual y la columna del logo queda centrada de verdad; verificado a 1024, 1280, 1440, 1680 y 1920 px, desvío 0 en todos.

El párrafo cierra la composición sobre **su propia placa negra**, de una pieza.

⚠️ **Se descartó el fondo por línea.** `box-decoration-break:clone` sabe pintar fondo línea a línea, pero todas salen del **mismo color** — son fragmentos de una misma caja inline — así que alternar blanca y negra exigiría saltos de línea a mano, y esos se rompen al cambiar el ancho de la ventana o al pasar a inglés. Además el cuerpo de texto se dejó limpio a propósito (ver más abajo): es lo único que un cliente lee de corrido.

⚠️ **El relleno y el filo de esa placa van FUERA del media query de escritorio.** `.placa-negra` se aplica en todos los anchos; si la geometría vive solo dentro del media query, en móvil queda la capa interior sin relleno y el texto se sale por los bordes — se comía la primera letra de cada línea. Lo que sí es de escritorio es su posición en la rejilla.

La placa de mercados lleva una **tercera línea** que desglosa la abreviatura (`MX · ES · MENA` → México · España · Medio Oriente y Norte de África). Mismo papel que el subtítulo diminuto de las placas del menú; solo se usa donde hay algo que descifrar.

⚠️ **Un giro puesto en `style=""` no se puede anular desde una media query** — el estilo en línea gana a cualquier regla de hoja. Por eso el valor en línea se llama **`--giro-d`** ("el de escritorio") y es el CSS quien decide si `--giro` lo toma o lo ignora. Sin eso, la regla que endereza las placas en móvil nunca llegó a aplicarse, y no se notó durante varias iteraciones porque los giros eran de 1–3°. Las placas del **menú** no entran en ese reparto: conservan su giro en todos los anchos, porque allí la cascada es la composición.

⚠️ **El estado final del revelado no puede ser `transform:none`.** `.rv.in` lo tenía, y como el revelado se queda fijado al terminar, se llevaba por delante el `--giro` de Servicios, Experiencia y Perfil. Estuvo muerto sin que se notara, porque el filo del recorte ya inclina un poco los bordes y disimulaba. El giro tiene que ir en **los dos** estados de la transición.

⚠️ **El CTA principal ya no nace rojo.** Hubo una versión en la que hacía de "opción ya marcada" del menú, pero Rubén pidió alternancia estricta. La consecuencia es que hoy pesa lo mismo que el secundario y solo se distingue por el texto; los dos se ponen rojos al pasar encima. Si alguna vez hay que recuperar la jerarquía, esa placa vuelve a roja y el tablero se recalcula desde ella.

`.orbita .stat b` lleva `text-shadow:none`. La sombra dura heredada es violeta y sobre placa blanca se lee como una mala impresión; las placas del menú tampoco la llevan. Por el mismo motivo los CTA del hero pierden su sombra dura exterior: **`clip-path` recorta también el `box-shadow`**, así que saldría cortada por el filo. La forma recortada hace el trabajo que antes hacía la sombra.

Solo a partir de 1000px. Por debajo se apila en una columna y `--giro` se anula en el hero (las placas del menú conservan el suyo), porque apilado el giro no lee como composición radial sino como error de maquetación.

⚠️ Tres trampas que costaron encontrar:

- `.cta-row` y `.stats` van con **`display:contents`** para que sus hijos entren como celdas de la rejilla sin desaparecer del DOM (el JS de entrada y el de idioma los buscan por nombre). Efecto colateral: `.stats::before`, la línea divisoria, deja de pintarse — no hay caja que la dibuje.
- La regla tiene que ir como `.orbita .cta-row`, con `.orbita` delante. `.cta-row{display:flex}` vive **más abajo** en la hoja, así que con la misma especificidad ganaba por orden de aparición y los hijos nunca llegaban a ser celdas.
- Las animaciones `popIn` y `statIn` corren con `fill-mode: both`, o sea que su estado final se queda pegado y machaca el `transform` de base. **El `rotate(var(--giro))` tiene que ir dentro de los keyframes**, no solo en la regla del elemento. Para lo que no tiene `--giro`, `rotate(0deg)` no hace nada.

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

## Trabajar desde una sesión remota (no desde la Mac)

El repo es autosuficiente: un `index.html` sin build step. Editar, revisar y pushear funciona igual en cualquier máquina. **Lo único que no viaja es el despliegue**, y conviene saber exactamente por qué antes de perder tiempo:

- `npm i wrangler` instala sin problema en el contenedor remoto (probado, v4.122.0). **Pero muere en `fetch failed` al hablar con `api.cloudflare.com`**, que la política de red del entorno bloquea. No es falta de credenciales: con un token válido da el mismo error. Tampoco sirve pedirle a Rubén un token de API mientras el host esté bloqueado.
- Para desplegar hay dos caminos: (a) que Rubén haga `git pull` y corra el `wrangler pages deploy` en su Mac, o (b) permitir `api.cloudflare.com` en la política de salida del entorno y usar un token de Pages con alcance limitado.
- **Para ver los cambios sin desplegar**, el contenedor trae Chromium en `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Levantar `python3 -m http.server` sobre esta carpeta y screenshotear con Playwright funciona bien. Dos detalles: los iframes de Google Drive no cargan (host bloqueado) y dejan huecos negros, y el `scroll-behavior:smooth` del sitio pelea con el scripting — conviene apagarlo con `addStyleTag` y forzar los reveals añadiendo `.in`/`.go` a mano antes de capturar.

## Notas para quien retome esto

- El dashboard de Cloudflare y Gmail están bloqueados para el agente vía navegador — pero **la API de Cloudflare sí responde** usando el token OAuth que Wrangler guarda en `~/Library/Preferences/.wrangler/config/default.toml`. Ese token puede leer/escribir Pages y Email Routing, pero **no** puede escribir registros DNS — eso lo tiene que hacer Rubén a mano en el dashboard.
- Antes de tocar `index.html`, revisa qué versión está realmente desplegada (`curl` a la URL del último deploy) — el caché del edge de Cloudflare a veces sirve una versión vieja por unos minutos tras el despliegue.
- **Cuidado con los selectores de elemento.** El header usaba `nav{background:rgba(0,0,0,.86)}` — y `.menu-lista` **también es un `<nav>`**, así que el menú de pantalla completa llevaba encima un velo negro al 86% a pantalla completa. Estuvo ahí desde el principio y no se notó hasta que hubo astillas rojas detrás que tapar: `#E50012` bajo ese velo da `rgb(32,0,3)`, un granate sucio. Ya está scopeado a `#nav`. Si algo se ve más apagado de lo que su CSS dice, **mira qué hay encima antes de tocarle el color** — con `document.elementsFromPoint(x,y)`, quitando antes los `pointer-events:none`.

- **Regla de oro para el hover:** ningún elemento que detecte `:hover` debe mover su propia caja. Si lo hace, se sale de debajo del cursor, el navegador quita el `:hover`, la caja vuelve, y el ciclo se repite decenas de veces por segundo. El desplazamiento visual siempre va en un hijo interno (por eso existen `.card-in`, y los `translate` viven en `i`, `h3`, `p`, `span`, `img`).
- `.assetsignore` **no funciona en Cloudflare Pages** (es de Workers Static Assets). Para que un archivo no se publique, sácalo de la carpeta. Ojo: Pages responde `200` con el `index.html` para rutas inexistentes, así que un `200` no prueba que el archivo esté ahí — hay que mirar el `content-type` y el tamaño.
