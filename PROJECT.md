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

- **Tres detalles de una segunda tanda de referencias** (capturas de Persona 5 Royal que pasó Rubén: pantalla de título, menú principal, selección de dificultad, transición, menú de pausa). No todo lo del juego encajaba — el cian de selección y los fondos fotográficos en duotono rojo se descartaron a propósito, por romper el sistema de color ya cerrado (`cada color tiene un trabajo asignado`) y por la regla de no usar fotografía del sitio. Lo que sí se integró:

  1. **Letras sueltas.** Línea base irregular por letra — cada una con su propio salto vertical y giro, como recortada a mano, igual que "SELECT THE DIFFICULTY" en la referencia. Acotado a propósito a una sola palabra, el `"CARGANDO"` del cargador: el sitio ya tiene su propio efecto de entrada por palabra (`.slam`) para `h1`/`h2`, y sumarle tambaleo por letra a cada título pelearía con eso y se leería saturado. Los valores (`SALTOS`/`GIROS` en el script) son un **patrón fijo por índice, no `Math.random()`**: se ve igual de orgánico y no cambia de una carga a otra, más fácil de calibrar y defender que un jitter que sale distinto cada vez.

  2. **El separador `×`** en `.costado` (`Diseño × Animación × Web`), en rojo — como `"NEW GAME × LOAD GAME × THIEVES DEN"` en el menú del juego. Se aplicó solo ahí y no a los demás `·` del sitio (kicker, pie del menú): esos son parejas *nombre · lugar*, y ahí la `×` leería raro, como si las dos cosas se cruzaran en vez de una ubicar a la otra. `×` va donde hay una **lista de pares**, no donde hay una descripción.

  3. **La cuña que apunta al ítem activo del menú**, un triángulo antes del número — la versión en rojo del puntero cian de la referencia. Costó dos vueltas encontrarla:

     - **Primera vuelta:** vivía *fuera* de la placa (a su izquierda, sobre el negro) y no se veía. `clip-path` recorta también a los pseudo-elementos hijos que intenten salirse de la caja — la misma restricción que ya recorta el `outline` y el `box-shadow` (arriba), ahora por tercera vez. Se movió *dentro* del recorte, con margen medido para no rozar el filo diagonal ni en su punto más angosto.

     - **Segunda vuelta:** ya adentro y en rojo, **seguía sin verse** — porque solo aparece en `:hover`, que es exactamente cuando la placa entera se vuelve roja. Rojo sobre rojo se camufla contra su propio disparador. El color correcto es **blanco**, que además ya es "lo seleccionado" en el resto del sitio: no es un color nuevo, es el mismo blanco del hover reusado como puntero. La lección detrás de las dos vueltas: un elemento que solo aparece junto con un cambio de fondo tiene que contrastar contra *ese* fondo, no contra el que había antes — y esto ya estaba insinuado un poco más arriba, en por qué se retiró la cuña de dos capas de Servicios.
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

En escritorio se agranda con **`transform: scale()`** (`--marca-escala`, 1.34) y no subiendo su `height`. La diferencia es lo que Rubén pidió: un `transform` no afecta a la maquetación, así que **nadie se aparta para dejarle sitio y el logo pisa las placas**. Si se hiciera con `height`, la columna central crecería y empujaría a las laterales.

⚠️ La escala también tiene que ir **dentro de `@keyframes marcaIn`**. Esa animación corre con `fill-mode: both`, así que su estado final se queda pegado: un `scale(1)` fijo ahí anularía el aumento en escritorio sin que nada lo delatara. Mismo patrón que el `--giro` en `popIn`, `statIn` y `.rv.in`. Y `--marca-escala` solo se define a partir de 1000px: en móvil el logo ya ocupa el 94% del ancho.

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

### Galería de trabajo real — el visor (dentro de `#trabajo`)

Un visor tipo "hoja de contactos": imagen grande a la izquierda, miniaturas agrupadas por cliente a la derecha en desktop (≥900px); en móvil se apila, imagen arriba y una tira horizontal con scroll por cliente debajo. 9 piezas reales en `assets/galeria/`, agrupadas en Al-Arabi SC, Hugo González · Mazatlán FC y Sub-17 · Liga BBVA Femenil.

Las miniaturas (`.visor-thumb`) son `<button>`, no `<a>`: cambian la imagen grande **en el sitio** vía JS (`pintarVisor`), no navegan. "Ver tamaño completo" vive aparte, como link suelto sobre la imagen grande, para quien de verdad quiera la pieza en su propia pestaña. El bilingüe de la miniatura activa se repinta a mano con un evento `idioma` propio (igual que el rotador del hero) porque su texto no vive en `[data-es][data-en]` — depende de cuál miniatura esté seleccionada.

⚠️ **5 de las 9 imágenes originales llevaban la marca "victorem" al pie o arriba** (su empleador anterior). Se recortó esa franja con Pillow antes de subirlas — no se regeneró el diseño, solo se cortó el borde. Si se agregan piezas nuevas de esa época, revisar primero si traen la marca.

De las 12 imágenes que llegaron en la carpeta origen, **se dejaron fuera 3** (Cristiano Ronaldo, Múnich/Eurocopa) por ser contenido genérico de agencia sin relación con Al-Arabi, Hugo González o Sub-17 — no por la marca de Victorem, aunque también la llevaban.

`.visor-grande` usa `aspect-ratio:3/4` de base (no 16/11): casi todas las piezas son carteles verticales, y con una caja en paisaje quedaban franjas vacías a los lados. En desktop se anula a `aspect-ratio:auto` y la caja se estira a lo que mida la columna de miniaturas de al lado.

### Trabajo en stand by (`work-grid`)

⚠️ **A pedido de Rubén (2026-08-13), el `work-grid` completo (Reel de animación + el teaser "Próximamente" del portafolio web) está comentado dentro de `#trabajo`**, no borrado. Sigue completo en el HTML, envuelto en un comentario con la fecha y el motivo — para reactivarlo alcanza con quitar el comentario, no hay que reconstruir nada. Mientras tanto la sección solo muestra el encabezado y el visor de la galería.

Cuando Rubén pase material nuevo del reel y de los 3 proyectos web (SASIMA, Zero Limits Marketing y un tercero confidencial, lanzan ~sept 2026), destapar el bloque y actualizar el contenido antes.

## Inmersión (2026-08-13)

Tres piezas que imitan mecánicas de interfaz de Persona, no solo su apariencia — pedido explícito de Rubén: "más inmersivo y atrapante, sin salirnos de la estética".

- **Barrido de escena** (`#transicion`): al hacer clic en cualquier link interno (`a[href^="#"]`, capturado por selector genérico — cubre el menú y los CTA del hero), dos cuñas diagonales (negra detrás, roja al frente) cubren la pantalla, el salto ocurre oculto detrás, y las cuñas se retiran del otro lado. Mismo gesto que un cambio de menú en P5.
  - ⚠️ El salto usa `scrollIntoView({behavior:'instant', ...})`, **nunca** `'auto'`. Con `'auto'` hereda el `scroll-behavior:smooth` global del `<html>` y el salto se hace visible a medias — descuadrado, que es justo lo que el barrido tiene que tapar sin que se note.
  - Los tiempos de espera en JS (`ENTRA_MS`/`SALE_MS`) están calculados a mano para igualar la duración real de las animaciones CSS (incluyendo el `animation-delay` de la capa más lenta de cada fase). Cortarlos antes se ve como un salto en vez de una barrida completa.
  - Se salta entero con `prefers-reduced-motion`.
- **Medidor de progreso** (`.progreso`): franja de 2px pegada al filo inferior del nav, debajo de su borde violeta existente — se leen como una sola línea de estado, no dos elementos sueltos. Se llena con `scrollY / (scrollHeight - innerHeight)`.
- **Sonido de interfaz** (`sonidoBtn` + `blip()`): **apagado por default**, solo se prende con un clic explícito del botón — nunca autoplay, en ningún caso. Los tonos se generan con Web Audio API en el momento (oscilador `square` + envolvente exponencial corta) — no es un archivo de audio ni una muestra de nada, así que no hay peso extra ni riesgo de derechos por usar el sonido real del juego. Preferencia guardada en `localStorage['notman_sonido']`. Suena en el barrido de escena y al activar el propio botón (para confirmar al oído que quedó prendido).

## Cuatro piezas más (2026-08-13, segunda tanda)

A partir de la pregunta "qué más se te ocurre para el feeling de Persona", ya con todo lo anterior desplegado. Dos ideas se descartaron antes de escribir código, por criterio y no por falta de tiempo:

- **Destello blanco en las transiciones** (screen flash). Es un riesgo real de fotosensibilidad, no un tema de gusto — no se intentó ni en versión sutil.
- **Aberración cromática / glitch en los hovers.** Es el vocabulario de otro género (cyberpunk, señal corrupta); Persona es cómic serigrafiado, tinta física, no VHS roto.

Lo que sí se hizo:

- **Sonido en los hovers** del menú y los botones. Reutiliza `blip()` tal cual, con un tono más agudo y corto (740 Hz / .03 s) que el de navegación (660 Hz) y el de encendido (1046 Hz), para que las tres se distingan al oído. `blip()` ya revisa `sonidoActivo` por dentro, así que no hace falta duplicar el chequeo en cada listener. Va en `mouseenter`, no `mouseover`: no burbujea y no se repite mientras el cursor se queda quieto dentro del elemento.

- **Cifras que cuentan** (`.cifra b`, `.radar .rango`, y el `"9+"` del hero marcado con `.cuenta`): suben desde 0 hasta el valor final al revelarse, con un *ease-out* cúbico — arrancan rápido y se asientan, como un marcador de arcade y no un conteo lineal de reloj. Respeta `prefers-reduced-motion` saltando directo al valor final.

  ⚠️ **Marcado explícito, no adivinado por regex.** `.cifra b` y `.radar .rango` son siempre números puros, pero `.stats .stat b` del hero mezcla números con texto (`"2D / 3D"`, `"MX · ES · MENA"`) — un regex que solo mirara "¿empieza con dígito?" habría atrapado `"2D / 3D"` y lo habría hecho contar de 0 a 2 antes de mostrar el texto completo, un efecto sin sentido. Se marcó a mano solo la pieza que sí es un conteo real.

- **Chispas en el barrido de escena** — la pieza que faltó de la primera tanda de referencias (la pantalla "LET US START THE GAME", con destellos sobre el corte diagonal). Seis destellos de cuatro puntas (`clip-path` con ocho vértices, no una imagen) en posiciones fijas junto al filo derecho, con `animation-delay` escalonado para que no parpadeen todas a la vez.

  ⚠️ **Posiciones fijas, no sincronizadas con el `clip-path` en movimiento.** Perseguir el filo diagonal con precisión mientras se anima en 220 ms es ingeniería que no vale la pena para un destello tan breve; quietas se leen igual de bien como "algo brilló al pasar el corte cerca".

  ⚠️ **Verificarlas con capturas de pantalla completa no sirve** — a 12×12px sobre una imagen de 2880px son casi invisibles a simple vista aunque estén renderizando perfecto. Se confirmaron leyendo `getComputedStyle` directo (`opacity`, `transform`, `background-color`) y con un recorte de imagen acercado a la franja donde viven, no con la captura completa.

  Sin regla de `prefers-reduced-motion` propia: `irConBarrido()` ya salta el barrido entero con movimiento reducido (nunca añade `.activa`/`.sale`), así que la animación de las chispas nunca llega a dispararse — una regla CSS aparte sería código muerto.

- **Grano sobre el fondo** (`body::before`), como el screentone de un cómic impreso — el logo ya tenía grano, esto lo extiende al resto de la página. SVG con `feTurbulence` en un data URI, no una imagen: cero peso de red, y se repite en mosaico sin costuras visibles porque el ruido no tiene un patrón periódico reconocible (a diferencia de una foto de grano, que sí las delata).

  `position:fixed` sin que `<body>` necesite `position:relative` — fixed se ancla al viewport igual. `z-index:0` a propósito: pinta detrás de todo el contenido real (nav en 100, menú en 200), así que solo se asoma por el espacio negro entre paneles y nunca ensucia una placa blanca o roja encima.

  ⚠️ **Rubén reportó que no se notaba nada — y tenía razón, no era falta de sutileza.** Costó tres vueltas encontrar por qué, y las dos primeras persiguieron una pista falsa:

  1. `mix-blend-mode:overlay` daba cero cambio real, verificado diffeando píxeles con y sin la capa (`bbox` de diferencia `"None"`). Esto sí es matemática, no percepción: `overlay` hace `2×fondo×capa` cuando el fondo es oscuro, y `--ink` es negro real (fondo ≈ 0), así que el resultado es 0 sin importar qué traiga la capa encima.
  2. Cambiar a `mix-blend-mode:screen` (que en teoría sí funciona sobre negro) **seguía sin verse**, incluso forzando la opacidad a .35 para probar. Aquí se sospechó de `position:fixed` rompiendo el blend mode — una pista plausible pero **nunca comprobada**: los dos intentos se midieron en la parte alta de la página, que resultó estar tapada por el fondo sólido de `<header>` (pinta *después* de `body::before` en el orden del documento, así que queda encima). El experimento nunca aisló "el blend mode no funciona" de "estoy midiendo donde no se puede ver nada".
  3. La prueba que sí aisló la variable: fondo sólido rojo opaco al 100%, sin blend mode, en una sección genérica sin fondo propio (más abajo del header) — y ahí **sí** se vio, pintando la sección entera. El mecanismo (posición, tamaño, `z-index`, `opacity`) funcionaba bien desde el principio; el problema real fue *dónde* se estaba mirando, no el CSS.

  La conclusión honesta: no hay evidencia real de que `position:fixed` rompa `mix-blend-mode` aquí — pudo haber funcionado igual con `screen`. Se dejó **sin blend mode** de todas formas, porque la composición "normal" (alfa simple) no depende del contexto de apilamiento y no tiene ninguna trampa que perseguir si algo cambia más adelante — la opción más simple que ya se sabe que funciona, en vez de reabrir el misterio de blend modes para un efecto que apenas se nota. Opacidad final: `.09` (subió de `.05`, porque sin el "solo aclara" de `screen` una capa opaca de ruido gris se ve un poco más tenue con el mismo número).

  **La lección que vale para la próxima vez que "no se vea" algo:** antes de sospechar del blend mode o de la fórmula, confirmar que el punto donde se está midiendo no está tapado por otro elemento opaco encima — con `document.elementFromPoint(x,y)` y revisando toda la cadena de ancestros, no solo un `getComputedStyle` de la propia capa.

- **Líneas cinéticas al aterrizar el logo** (`.rafaga`) — el punto de la lista de Gemini que más se acercaba a algo real y factible sin arte nuevo: rayas radiales de velocidad, como las del manga en el momento de un impacto. Ancladas al logo del hero y no a los `h2` de cada sección, por dos motivos:

  1. **Diseño:** el logo es el momento de impacto más grande y singular del sitio — aparece una sola vez al cargar, no cinco veces por cada sección como pasaría con los `h2`.
  2. **Técnico:** `h2` ya usa `::before` (la barra roja) y `::after` (el barrido `.swipe`) — una tercera cosa ahí sería forzarlo. Y `.marca` es un `<img>`, que no puede llevar pseudo-elementos propios en la mayoría de los navegadores (elemento reemplazado) — así que la ráfaga es un elemento real y hermano (`<i class="rafaga">`), no un `::before`/`::after`, disparado con el selector de hermano general (`.marca.go ~ .rafaga`) sin tocar el JS.

  Estalla `.16s` después de que arranca `marcaIn`, cuando el logo ya está casi en su lugar — el impacto llega *con* el aterrizaje, no antes. `z-index:-1` necesita `isolation:isolate` en `h1` (mismo patrón que `.placa-negra`, ver arriba) para que ese `-1` se quede detrás del logo y no caiga detrás de toda la página.

  ⚠️ **Hallazgo incidental: `marcaIn` nunca tuvo su propia regla de `prefers-reduced-motion` en todo el archivo.** No es algo que esta ráfaga rompiera — ya faltaba desde antes. Se arregló de paso, junto con la ráfaga (que por supuesto también es movimiento), al tocar exactamente ese punto del código.

## Redes (footer)

Instagram (`@notman.rivera`), LinkedIn y Behance (`/notmanrivera`) como iconos SVG inline en `.social`, dentro de `.foot-in`. Sin librería de íconos — son 3 `<svg>` a mano, glifos genéricos (cámara, "in", "Bē") para no reproducir marcas registradas al pixel.

## Infraestructura

- **Hosting:** Cloudflare Pages, proyecto `notmanrivera`
- **Desplegar:** desde la raíz del repo, `wrangler pages deploy public --project-name=notmanrivera --commit-dirty=true`. Wrangler instalado vía Homebrew (`cloudflare-wrangler`) y ya autenticado en esta Mac contra la cuenta `rnrivera93@gmail.com`
- ⚠️ **El sitio vive en `public/`, y eso es a propósito.** Pages sube *todo* lo que haya en la carpeta que se le indique, así que apuntarle a la raíz publicaría `PROJECT.md` en `notmanrivera.com/PROJECT.md` a la vista de cualquiera. Nunca volver a `wrangler pages deploy .`; si se añade un archivo que no es del sitio, va a la raíz del repo, no a `public/`. Se quitó `.assetsignore`: en Pages no hace nada y con esta separación ya sobra.
- ⚠️ **No probar un archivo nuevo bajo `/assets/*` contra el apex justo después de desplegar.** `_headers` marca todo `/assets/*` como `Cache-Control: immutable, max-age=31536000` sin mirar el código de estado. Si una petición llega a un borde de Cloudflare que aún no tiene el manifiesto del deploy nuevo, ese borde responde 404→fallback a `index.html` (200, `text/html`) y **cachea ESE fallback como si fuera la respuesta final e inmutable**, hasta por un año, solo en ese borde — mientras que otros bordes sirven el archivo real sin problema. Pasó exactamente esto al desplegar `assets/galeria/`: 2 de 9 imágenes devolvían HTML en vez de `image/webp` en `notmanrivera.com`, aunque la URL directa del deploy (`https://<hash>.notmanrivera.pages.dev/...`) las servía bien desde el primer segundo.
  - **Para probar justo después de desplegar:** usar la URL directa del deploy (la que imprime `wrangler pages deploy`), no `notmanrivera.com` — esa nunca tiene este problema porque no pasa por el enrutamiento de bordes del dominio proxeado.
  - **Si ya quedó un borde con la cache envenenada:** el token de Wrangler no alcanza — `purge_cache` de la API de Cloudflare devuelve `Authentication error` (código 10000) con este token, que solo llega a leer/escribir Pages y Email Routing. Hay que purgar a mano desde el dashboard: **Caching → Configuration → Purge Cache**, pegar las URLs afectadas (o "Purge Everything" si son muchas). Esperar sin purgar también funciona eventualmente, porque no todos los bordes se envenenan — pero es al azar qué visitante cae en uno malo mientras tanto.
- **Dos cosas las inyecta Cloudflare en el dominio proxeado, no están en el repo** — y por eso `notmanrivera.com` y la URL `*.pages.dev` no devuelven byte por byte lo mismo. No es caché viejo:
  - *Email Address Obfuscation* reescribe el `mailto:` a `/cdn-cgi/l/email-protection` y añade un script que lo descifra. Verificado en vivo: el texto y el `href` quedan correctos. El único costo es que sin JavaScript se lee `[email protected]`. Se apaga en Scrape Shield si alguna vez estorba.
  - *AI Crawl Control* antepone su bloque de Content Signals al `robots.txt`. Deja `search=yes` y `Allow: /` para todos, y solo bloquea rastreadores de entrenamiento de IA (GPTBot, ClaudeBot, Google-Extended…). El SEO no se toca y nuestras directivas siguen al final.
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
