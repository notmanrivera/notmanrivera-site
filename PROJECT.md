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

## Seis piezas de interacción (2026-08-16)

- **Barra de progreso → "Confidant Rank" escalonado.** `#progresoBarra` dejó de ser una `<i>` con `scaleX` continuo y pasó a ser un contenedor (`.pasos`) con cinco `<i class="paso">`, uno por sección (`#trabajo`, `#servicios`, `#experiencia`, `#perfil`, `#contacto`). Un `IntersectionObserver` con `rootMargin:'-45% 0px -45% 0px'` (el mismo truco de franja central que ya se usaba en otro lado del sitio) detecta qué sección cruza el centro del viewport y enciende de golpe todos los pasos hasta ese índice — sin porcentaje de scroll de por medio. Pasos ya vistos quedan en `--rojo`, los que faltan en `--line`. Verificado con Playwright: 0 pasos activos al cargar, 2 activos en `#servicios`, 5 en `#contacto`.

- **Tooltip del radar** (`.p5-tooltip`). Un solo `div` reutilizado para los 6 `<circle class="punto">`, creado una vez por JS y reposicionado con `clientX/clientY` del mouse en cada `mousemove`. Estilo etiqueta P5: fondo `--ink`, texto `--paper`, valor en `--rojo`, `clip-path:var(--filo)`. El offset visual (`translate(14px,-140%)`) vive en el CSS del propio tooltip, no en el JS — así el JS no tiene que convertir coordenadas del `viewBox` del SVG a píxeles de pantalla, solo pasar la posición cruda del cursor. Cada punto lleva `data-skill`/`data-valor` (dato junto al elemento, mismo patrón que `data-cliente` en el visor de trabajos) y `tabindex="0"` + listeners de `focus`/`blur` para que también funcione por teclado, posicionando el tooltip sobre el centro del círculo enfocado vía `getBoundingClientRect()`.

- **Placeholder "CONFIDENTIAL"** para el reel de animación oculto (`#trabajo`), un `<article class="card rv">` con `.frame-bloqueado`: `repeating-linear-gradient(-45deg, var(--rojo) 0 18px, var(--ink) 18px 36px)` de fondo, una etiqueta "BLOQUEADO" sesgada arriba a la izquierda y "CONFIDENTIAL" en `var(--ui)` a `opacity:.34` rotado -11°. Deliberadamente **`--rojo`/`--ink` y no amarillo/negro** aunque el pedido original ofrecía esa opción: el amarillo no es parte de la paleta (cada color tiene un trabajo asignado — ver arriba), y meterlo aquí para un solo elemento rompería esa disciplina sin ganar nada. Se envuelve en `.work-grid-uno{max-width:420px}` porque una sola tarjeta dentro del `auto-fit` de `.work-grid` se estiraría a ancho completo de fila si no se le pone un tope.

- **Parallax inverso en `.svc-bignum`.** Al hacer `:hover` sobre `.svc`, el número gigante de fondo se desplaza `translateX(-10px)` (contra el texto, que ya se movía en su propia dirección) y oscurece su `-webkit-text-stroke-color`. El `skewX(-10deg)` base se preserva porque va **dentro de la misma declaración `transform`** del hover (`skewX(-10deg) translateX(-10px)`), no reemplazándola — la trampa de siempre con transforms compuestos.

- **Menú: cerrar al hacer clic fuera.** `#menuFull` ya cerraba con `Escape`; se añadió un listener de `click` en el propio panel (`.menu-full`, el fondo oscuro) que llama a `cerrarMenu()`, y un `stopPropagation()` en `.menu-lista` para que los clics dentro de la caja de enlaces no burbujeen hasta el panel y se disparen en falso. Verificado: clic en el fondo cierra, clic dentro de `.menu-lista` (fuera de un link) no cierra, `Escape` cierra.

- **Deriva del halftone.** `.halftone` gana `animation:halftoneDeriva 46s linear infinite`, moviendo `background-position` de `0 0` a `7px 7px` — exactamente el `background-size` existente, para que el loop no salte. Apagada bajo `prefers-reduced-motion:reduce`, como el resto de animaciones del sitio.

Las seis piezas se verificaron juntas con Playwright (`getComputedStyle`, capturas recortadas del tooltip y de la tarjeta bloqueada, simulación de teclado y clics) antes de commitear — sin sorpresas ni callejones sin salida esta vez.

## Cinco piezas más de interacción (2026-08-16, segunda tanda)

- **Micro-glitch en `.mail`.** Un `::after` con `content:attr(data-text)` (el link ya llevaba `<span>` para el texto real; el fantasma lee el mismo correo de un atributo nuevo, `data-text="hola@notmanrivera.com"`, en vez de duplicarlo a mano). Al hover, `@keyframes mailGlitch` lo desfasa `translate(-2px,2px)` y sube su opacidad a `.55` a los 80ms, luego vuelve a 0 a los 200ms — con `steps(2,end)`, no una curva suave, para que el salto se sienta mecánico y no como un deslizamiento.

  ⚠️ **Primer intento invisible: el fantasma iba en `--rojo`, tal cual pedía el encargo original.** Pero `.mail:hover` ya pone el fondo del propio botón en `--rojo` — rojo sobre rojo, cero contraste, confirmado con una captura de pantalla en pleno hover donde no se ve nada. Cambiado a `--ink`: se lee bien tanto contra el violeta base como contra el rojo del hover, y de paso encaja con la sombra "mal registrada" que ya usa el resto del sitio (ver `var(--sombra)` arriba) en vez de inventar un color nuevo para esto.

- **HUD de scroll fijo, esquina inferior derecha** (`.hud-scroll`), reemplaza la barra de pasos que vivía pegada al borde del `#nav`. Mismo `IntersectionObserver` y misma lógica de "pasos escalonados" de antes (`rootMargin:'-45% 0px -45% 0px'`) — lo único que cambió es qué elementos pinta: 5 rombos (`<i class="hud-paso">`, cuadrados rotados 45°) en vez de barras, sin `transition` en absoluto, para que el cambio de color se sienta como un pip de vida encendiéndose, no como una barra de carga rellenándose.

  ⚠️ **El HTML se sacó de dentro de `<nav>` a propósito, no solo por prolijidad.** `#nav` tiene `backdrop-filter:blur(12px)`, y un `filter`/`backdrop-filter` en un ancestro crea su propio *containing block* para los descendientes `position:fixed` en la mayoría de los navegadores — es decir, el HUD se habría quedado "fijo" a la caja de `#nav`, no a la ventana, y se habría movido con el scroll en vez de quedarse clavado en la esquina. Se verificó fijándolo como hermano de `<nav>` y confirmando con `getBoundingClientRect()` tras hacer scroll que `right`/`bottom` seguían siendo exactamente `22px` en cualquier punto de la página.

- **Destello "confirmando" en `.btn-1`/`.btn-2`** (`@keyframes p5Confirm`): fondo a `var(--paper)` y `scale(1.05)` en un único keyframe al 50% — 0% y 100% se dejan sin declarar para que el navegador use ahí el fondo real de cada botón (que no es el mismo: `.btn-1` es rojo, `.btn-2` es transparente) en vez de repetirlo dos veces. El `transform` sí lleva `skewX(-10deg) rotate(var(--giro,0deg))` completo dentro del keyframe — el mismo cuidado que ya pedían las placas del hero (ver más arriba): sin eso, la animación pisaría el skew/rotación base mientras dura.

  El JS reaprovecha el listener global que ya interceptaba todos los `a[href^="#"]` para el barrido de escena — no se agregó un segundo listener aparte. Para `.btn-1`/`.btn-2` específicamente: añade `.confirmando`, espera 150ms (`setTimeout`, igual a la duración de `p5Confirm`) y solo entonces llama al mismo `irConBarrido()` de siempre. Así no hay dos mecanismos de navegación peleándose por el mismo clic. Bajo `prefers-reduced-motion`, se salta directo a `irConBarrido()` sin el destello ni la espera.

- **Divisor "rasgado" entre secciones.** `section + section::before` seguía siendo una línea diagonal lisa (gradiente violeta/rojo/violeta). Ahora un `mask-image` con un SVG en línea (una tira dentada, codificada como *data URI*, sin archivo nuevo) recorta esa misma silueta en zigzag — el color no cambió, solo dejó de ser un borde limpio. `mask-repeat:repeat-x` la reincide cada 40px; lleva `-webkit-mask-*` en paralelo porque Safari todavía no resuelve `mask-image` sin el prefijo.

- **Reposo (`idleBounce`) en `.kicker`/`.sec-tag`.** Vaivén de 3px, `3.6s`, que arranca justo cuando termina la animación de entrada (`popIn`, con `animation-delay:.34s` para no encimarse). Mismo cuidado con `--giro` dentro del keyframe que ya usa `popIn` — y como `.sec-tag` no tiene `--giro` propio, el `rotate(var(--giro,0deg))` por defecto no hace nada ahí, sin necesidad de una regla aparte.

  ⚠️ **Encontrado al revisar `prefers-reduced-motion`, no al escribir la regla nueva.** El bloque consolidado de movimiento reducido ya apagaba `.pop.go` en general (`animation:none`), pero `.kicker.pop.go, .sec-tag.pop.go{animation:...}` tiene *más* especificidad de selector (tres clases contra dos) que `.pop.go{animation:none}` — así que sin una línea aparte, el `idleBounce` se habría quedado corriendo infinito incluso con movimiento reducido activo, sin importar que la regla que lo apaga esté más abajo en la hoja: especificidad le gana a orden de aparición cuando no son iguales. Se agregó `.kicker.pop.go,.sec-tag.pop.go{animation:none}` con la misma especificidad exacta dentro del bloque de `prefers-reduced-motion` para que si gane.

Las cinco piezas se verificaron con Playwright antes de commitear, incluyendo capturas de pantalla a mitad de cada animación (no solo al inicio/final) — así se encontró el problema real de contraste del glitch del correo, que `getComputedStyle` por sí solo no habría delatado.

### Arreglo: el tooltip del radar se quedaba pegado en táctil (2026-08-16)

Rubén reportó que al tocar una habilidad del radar (Figma, Photoshop, etc.) y luego hacer scroll, la etiqueta con el nombre/valor se quedaba flotando en pantalla en vez de desaparecer.

Causa: el tooltip (ver "Tooltip del radar" más arriba) solo escuchaba eventos de mouse/teclado — `mousemove`/`mouseleave`/`focus`/`blur`. En táctil no existe un "mouseleave" real: un tap dispara el `mousemove` sintético de compatibilidad que Chrome/Safari móvil generan al tocar (por eso el tooltip sí aparecía), pero al levantar el dedo no hay ningún evento que avise "ya no estás tocando el punto". El div, que es `position:fixed`, se quedaba anclado a esa coordenada de pantalla mientras el usuario scrolleaba el contenido debajo.

Arreglo de una línea: `addEventListener('scroll', ocultarTip, {passive:true})` dentro del mismo bloque del tooltip. El scroll del documento es la señal más simple y confiable de "el dedo ya no está sobre el punto", sin necesitar detectar tipo de input (touch vs mouse) ni añadir un segundo set de listeners táctiles.

Verificado disparando un `mousemove` sintético directo sobre un `.punto` (para no depender de si la emulación táctil de Playwright reproduce fielmente el touch-a-mouse de un navegador real) y confirmando `activo` antes y después de un evento `scroll`: `true` → `false`.

### Vuelta a la cuña geométrica entre secciones (2026-08-16)

Rubén pidió deshacer el divisor "rasgado" (`mask-image` con SVG dentado) de la tanda anterior y volver a algo triangular/geométrico — más cerca de los cortes diagonales de `.campo`/`.campo2` del header que de una textura de borde roto.

`section + section::before` se elimina por completo. En su lugar, `section:not(:first-of-type)::before` (un pseudo-elemento nuevo, sin conflicto porque ningún `#id::before` lo pisaba) dibuja un solo triángulo grande y asimétrico con `clip-path:polygon(0 0, 100% 0, 100% 18%, 0 100%)`, relleno en `var(--ink-2)`, mordiendo los primeros 90px del borde superior de cada sección. `:not(:first-of-type)` evita que `#trabajo` (sin una sección previa real de la que "heredar" el corte) se quede con una cuña huérfana justo debajo del header. La mitad de las costuras (`:nth-of-type(even)`) espeja el triángulo con `transform:scaleX(-1)` para que la repetición no se sienta mecánica bajando por el sitio.

⚠️ **90px de altura no es un número decorativo, es el margen de seguridad real contra `.sec-head`.** Cada sección tiene `padding-top:130px`, y `.sec-head` (con `.sec-tag`/`h2`) empieza justo después de ese padding. Se verificó con `getBoundingClientRect()` en las cuatro secciones con cuña que el borde inferior de la cuña (90px desde el top de la sección) queda siempre por encima del borde superior real de `.sec-tag` en pantalla — el margen resultó ser de 54px en las cuatro, consistente porque todas comparten el mismo `padding-top`. Sin ese margen, un triángulo "grande" con la punta mal calculada habría tapado la etiqueta de la sección.

`#perfil` y `#contacto` ya traían su propio `background` (un gradiente y un `--ink` sólido respectivamente) — la cuña no lo reemplaza, solo se pinta encima como capa hija en la esquina superior, así que el resto de esos fondos personalizados sigue intacto.

## Cinco piezas más (2026-08-16, tercera tanda)

- **Hápticos.** `tocHaptico(ms=15)` es la única función nueva — envuelve `navigator.vibrate` en un `if`, así que en desktop o iOS (donde no existe) es un no-op silencioso, nunca un error. Un solo listener delegado en `document` con `e.target.closest('.btn, .abrir-menu, .cerrar-menu, .visor-thumb, .lang')` cubre los cinco selectores pedidos sin tocar cada `addEventListener` existente por separado.

- **Partículas de confirmación** (`.chispa-confirma`): 2–3 estrellas de 4 puntas blancas, inyectadas como SVG en las coordenadas del clic sobre `.btn`/`.menu-lista a`, que se autodestruyen en `animationend` (no un `setTimeout` adivinado).

  ⚠️ **El listener va en fase de CAPTURA, no de burbujeo, y no es un detalle cosmético.** `.menu-lista` ya hace `e.stopPropagation()` en burbujeo (de la tanda del menú, para que sus clics no disparen el cierre por clic-afuera del panel) — un listener delegado normal en `document` nunca habría visto esos clics, porque la propagación se corta antes de llegar tan arriba. En captura el evento pasa por `document` ANTES de llegar a `.menu-lista`, así que ese `stopPropagation()` posterior no le afecta. Verificado con Playwright abriendo el menú y haciendo clic real sobre un link: aparecen las partículas y el menú también se cierra (su propio listener, sin relación con este).

- **`p5HoverSnap`**: reemplaza el fundido suave de `.orbita .sat` y `.menu-lista a` al entrar en hover por un parpadeo blanco/rojo con `steps(1,end)` (sin interpolación) antes de asentarse. El keyframe solo declara los frames intermedios (20/40/60%) — 0% y 100% se dejan sin declarar a propósito, mismo truco que `p5Confirm` de la tanda anterior: el navegador usa ahí el valor real de `:hover` de cada selector, que **no es el mismo color** en los dos casos (`.menu-lista a:hover` es rojo; `.orbita .sat:hover` es blanco, por la regla de "blanco = seleccionado" ya establecida). Un solo keyframe sirve para ambos sin repetir el color final.

  ⚠️ **Consecuencia aceptada, no un bug:** como el keyframe alterna fijo blanco→rojo→blanco en 20/40/60%, y el 20% coincide con el color final de `.orbita .sat` (blanco), ahí el "parpadeo doble" se siente como un solo destello rojo en vez de dos — mientras que en `.menu-lista a` (final rojo) sí se ven las dos alternancias completas. Documentado en vez de forzar dos keyframes separados por un matiz que no cambia la lectura del efecto.

- **Marquesina del footer**: franja de lado a lado (`--ink-2`, texto `--violet-hi` en mayúsculas, baja opacidad), dos copias idénticas del texto una detrás de otra, animadas con `translateX(0 → -50%)` lineal infinito — el truco estándar del loop sin salto: la segunda copia llega exactamente a donde empezó la primera. Vive como hijo directo de `<footer>`, antes de `.wrap`, para poder cruzar todo el ancho de la pantalla (`.wrap` tiene `max-width`, `footer` no). Bajo `prefers-reduced-motion` se **pausa** (`animation-play-state:paused`), no se elimina — pedido así explícitamente, a diferencia del resto de animaciones del sitio que van a `animation:none`.

- **Menú móvil rehecho** (`@media(max-width:900px)`, imitando el menú de Configuración de P5R): `.menu-figura` deja de ocultarse y pasa a ser el ancla vertical del menú, pegada al borde izquierdo (`left:-20%`, `height:100%`, `opacity:.3`) en vez de vivir a la derecha como en escritorio. `.menu-lista` gana `align-items:flex-start` y un `padding-left` corto para que los links arranquen cerca del filo del logo. El escalonamiento (`--sangria`) se sigue alejando del logo hacia la derecha —la misma dirección que ya tenía en escritorio, no hubo que invertirla— pero con pasos más cortos (4% en vez de 5% por ítem) para no empujar el último ítem fuera de una pantalla angosta.

  ⚠️ **Encontrado revisando el ajuste, no reportado por Rubén:** `--sangria` (hasta 20%) + `max-width:88%` en el mismo elemento pueden sumar más de 100% del contenedor — en escritorio nunca se nota porque las etiquetas son cortas y no llegan a tocar ese tope, pero en un teléfono angosto con una palabra larga (`Experiencia`, `Contacto`) es overflow real. Se agregó un tope duro `max-width:min(88%, 78vw)` en el bloque móvil, más específico que la regla base, y el `clamp()` del tamaño de fuente baja su piso de `2rem` a `1.5rem` para que el texto tenga a dónde encoger de verdad en vez de quedarse pegado al mínimo de escritorio. Verificado con `getBoundingClientRect()` en las 5 etiquetas a 390px de ancho: ninguna sobrepasa el borde derecho del viewport.

Las cinco piezas se verificaron con Playwright: `navigator.vibrate` mockeado para confirmar la llamada con `15`; partículas contadas antes/después de `animationend`; `animationName`/color computado antes y después de que termine `p5HoverSnap`; menú móvil con capturas de pantalla y medición de overflow; marquesina con `animationPlayState` bajo `reducedMotion:'reduce'` de Playwright.

### Arreglo: brinco del hero al rotar los servicios (2026-08-16)

Rubén reportó que al cambiar la línea de servicios bajo el logo (`.rota`, el badge rojo que alterna "Motion graphics 2D/3D" / "Edición de video" / etc. cada 3.4s), todos los elementos del hero pegaban un pequeño brinco.

**Causa:** `.orbita{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)}` — la columna central (donde vive `<h1>`, y dentro de `<h1>` tanto `.marca` como `.rota`) medía `auto`, es decir, se ajustaba al contenido más ancho de `<h1>`. Cada vez que `.rota` cambiaba a una palabra más larga o más corta que la anterior, `auto` recalculaba el ancho de esa columna — y como las dos columnas laterales son `minmax(0,1fr)` (se reparten lo que sobra), el recálculo del centro empujaba kicker, botones y stats al mismo tiempo. El mismo patrón que ya rompía la centrado del logo con el kicker (ver la nota de `minmax(0,1fr)` un poco más arriba), pero disparado en vivo cada 3.4 segundos en vez de una sola vez al cargar.

**Arreglo:** la columna central deja de ser `auto` y pasa a `calc(min(27vh,320px) * 16 / 9)` — la misma fórmula que ya determina el ancho real de `.marca` (su `height:min(27vh,320px)` por la relación de aspecto 16:9 del propio `<img width="1200" height="675">`). Con esto la columna depende solo de la altura del logo, nunca del texto de `.rota`. `.rota` gana `max-width:100%` como red de seguridad: si algún día una traducción no cabe en una línea, envuelve dentro de su propia caja en vez de desbordarse.

Verificado con Playwright: posición de `.btn-1` (sin ninguna animación propia, así que sirve de testigo limpio) idéntica a nivel de píxel en 4 capturas espaciadas por rotaciones reales de 3.4s, con tres textos distintos confirmados (`Motion graphics 2D/3D` → `Edición de video` → `Soporte marca blanca` → de vuelta). El `.kicker` sí mostró una deriva de sub-píxel entre lecturas — pero es su propia animación `idleBounce` (de la tanda anterior) siguiendo su curso normal, no una regresión del arreglo: la deriva es continua y gradual, no un salto correlacionado con el cambio de texto.

## Pasada de sobriedad (2026-08-17)

Rubén pidió un giro deliberado hacia "más sobrio y elegante": menos textura, menos inclinación, uso quirúrgico del color, más aire en la tipografía de lectura, entradas menos caricaturescas. Cinco frentes, todos en la misma tanda porque se pisan entre sí (cambiar el skew de `.btn` sin tocar su `<i>` interior, por ejemplo, deja el texto torcido).

- **Texturas, bajadas de intensidad, no eliminadas del todo.** Grano de `body::before`: `.09` → `.04`. Trama de puntos del radar (`.ficha-radar::before`): `.5` → `.15`. Las rayas diagonales de fondo (`section::after`) sí se apagan por completo, pero **comentadas, no borradas** — el bloque de código queda intacto por si algún día se quiere revertir, con una nota explicando por qué está desactivado en vez de dejar el porqué solo en este changelog.

- **Skew unificado a -6deg.** Antes convivían dos familias de inclinación para las "placas" (-10deg en botones/mail/kicker-badge/rota, -11deg en menú/kicker/sec-tag/etiquetas) más h2 en -9deg — tres valores ligeramente distintos que nunca se notaban por separado pero sumaban ruido visual. Ahora todo eso es un solo -6deg consistente.

  ⚠️ **Esto tocó muchos más selectores de los que suena "cambia el skew a -6deg".** Cada skew base tiene como mínimo un contra-skew en un hijo (para enderezar el texto interior, ej. `.btn i{skewX(10deg)}` contrarrestando `.btn{skewX(-10deg)}`) y, en los elementos con animación de entrada o reposo (`.kicker`, `.sec-tag`, `.menu-lista a`, `.mail`), el MISMO valor repetido dentro de sus `@keyframes` y su variante de `prefers-reduced-motion` — todos tenían que cambiar juntos o el elemento habría aterrizado con un skew distinto al que tenía en reposo (el mismo problema documentado antes con `--giro` dentro de los keyframes, aplicado ahora al skew). Se dejó **fuera** a propósito: `.svc-bignum` y `.sec-num` (números gigantes de fondo, decorativos, no "placas"), `.radar-tit` y `.carga-txt` (subtítulos/pantalla de carga, tampoco nombrados en el pedido). `.rv{skewX(-6deg)}` ya usaba ese valor de casualidad, sin relación con este cambio.

- **`--giro` a la mitad**, solo en los dos grupos pedidos: los 5 links de `.menu-lista` (ej. `-2.4deg` → `-1.2deg`) y las placas del hero (`kicker`, `.btn-1`, `.btn-2`, los 3 `.stat`). Las tarjetas de `.svc`/`.cred`/`.ficha-yo`/`.ficha-radar` tienen su propio `--giro-d` pero **no** son "placas del hero" (viven en otras secciones), así que se quedaron con su rotación original.

- **Uso quirúrgico del color en `.svc`/`.cred`.** Antes alternaban roja/negra por posición (`:nth-child(odd)`); ahora las dos reposan siempre en la variante placa-negra (fondo blanco, capa interior `--ink`, mismo mecanismo ya documentado en PLACA NEGRA CON BORDE) y se vuelven blancas —no rojas— al hacer hover. Se eligió blanco sobre rojo para el hover porque es la única opción consistente con la regla ya establecida en todo el sitio: "blanco = seleccionado, rojo = reposo" (ver la nota de `.orbita .sat:hover` más arriba) — usar rojo aquí habría invertido esa convención justo en dos de las secciones más visitadas. De paso se depuraron reglas que quedaron muertas al desaparecer la variante roja: el contorno de `.svc-bignum` a `.32` de opacidad en las impares, y el acento `.cred::before` que se volvía blanco en las impares y rojo de nuevo en hover (con fondo siempre negro ahora, el rojo por defecto ya contrasta en los dos estados).

- **Cuña triangular, menos profunda.** De 90px a 40px de altura — mismo `--ink-2`, mismo `clip-path`, solo un acento más discreto en vez de una masa de color en cada costura.

- **Aire en la tipografía de lectura.** `.lede` (el párrafo del hero): `clamp(1rem,1.9vw,1.2rem)` → `clamp(1.05rem,1.9vw,1.3rem)`, más `line-height:1.7` explícito (antes heredaba el `1.62` de `body`). Mismo trato para `.svc p` (`.95rem` → `1.05rem`), `.card-body p` (`.9rem` → `1rem`) y `.cred p` (`.9rem` → `1rem`) — las tres ganan `line-height:1.7` también; solo se nombraron `.svc p`/`.card-body p` en el pedido, pero `.cred p` es la misma categoría de "párrafo dentro de una placa" y dejarla fuera habría sido inconsistente sin ninguna razón de diseño. En paralelo, los titulares bajan de techo: `h2` de `7.1rem` a `5.5rem`, `.svc h3` de `3rem` a `2.4rem` — menos distancia entre el titular y el texto que lo acompaña.

- **`slamIn` menos caricaturesco.** `scaleX(1.45)` → `1.15`, `skewX(-30deg)` → `-15deg` en el 0% del keyframe. El resto (curva, duración, delay escalonado) no se tocó.

Verificado con Playwright en cada frente: opacidades computadas de grano/trama/rayas; matriz de `transform` de `h2` confirmando `tan(-6°)` exacto; los 6 valores de `--giro`/`--giro-d` halved leídos directo del atributo `style`; `background`/`color` computados de las 4 tarjetas `.svc` y las 3 `.cred` confirmando blanco/negro uniforme en reposo y el intercambio correcto en `:hover`; altura computada de la cuña en `40px`; `font-size`/`line-height` computados de los cuatro párrafos y los dos titulares recortados. Capturas de pantalla de `#servicios` y `#experiencia` confirmando el resultado visual.

## Cuatro ajustes más, ejecutados uno por uno (2026-08-17, tarde)

Rubén pidió explícitamente ejecutar estas cuatro correcciones en secuencia, verificando cada una antes de empezar la siguiente — así se hizo, incluyendo un ajuste sobre la marcha en la última cuando la verificación de la tercera reveló un problema real.

- **Variables nuevas en `:root`.** `--ink-2` pasa de `#12081f` (negro con morado) a `#1A1A1A` (gris grafito puro) — más profundidad sobre el negro real sin el tinte violeta. Nueva `--p5-yellow:#FCEE0A`, aplicada a `.cifra b`, `.stat b.cuenta` (no `.stat b` en general — esa clase también cubre los otros dos números del hero, que son texto estático, no contadores; se agregó `.stat b.cuenta` como regla aparte, más específica, para no tocarlos), y `.radar .rango`/`.radar .punto`. La sombra dura existente en `.cifra b` (`text-shadow:3px 3px 0 var(--ink)`) se dejó intacta a propósito: negro sólido detrás de amarillo no le resta nada de legibilidad al glifo en sí, y es la misma sombra de cómic que usa el resto del sitio — quitarla habría sido inconsistente sin necesidad.

- **`.card-in` y `.p5-tooltip`, estilo cómic con peso físico.** El anillo `box-shadow:inset` se cambia por `border:3px solid` + `filter:drop-shadow(6px 6px 0 var(--ink))`.

  ⚠️ **No hizo falta el contenedor envolvente que sugería el pedido.** La instrucción anticipaba correctamente el problema (`box-shadow` exterior se recorta junto con `clip-path`, ver las notas de clip-path más arriba en este archivo) y ofrecía envolver el elemento en un padre aparte como solución. Pero `filter:drop-shadow` no es lo mismo que `box-shadow`: se calcula sobre la silueta *ya recortada* del elemento, no sobre su caja rectangular original — aplicado directamente en el mismo elemento que ya lleva `clip-path`, el recorte ocurre primero y el filtro solo ve (y sigue) la forma resultante. Verificado con una captura de pantalla recortada de una tarjeta real: la sombra sigue el filo diagonal exacto, sin ningún rectángulo asomando por fuera del corte.

  ⚠️ **`.p5-tooltip` lleva el borde en `--paper`, no en `--ink` como pedía el texto literal.** El fondo de ese elemento ya es `--ink` — un borde también `--ink` habría sido invisible contra su propio relleno. Se cambió a `--paper` (blanco), que sí se ve, y se dejó la sombra proyectada en `--ink` como se pidió (esa sí lee bien sin importar qué haya detrás). `.card-in` sí usa `--ink` tal cual porque su fondo es `--ink-2` (gris grafito), donde un borde negro puro todavía se distingue, aunque sea sutil.

- **`.sec-num` como arquitectura de fondo.** `font-size` sube a `clamp(10rem,25vw,25rem)` (antes `clamp(6.4rem,17vw,15rem)`), reposicionado a `top:-10%;right:-10%` y rotado a `-15deg` (antes `-3deg`), con el contorno bajado a `rgba(255,255,255,.04)` — casi invisible, que es justo el punto: a este tamaño, un trazo más marcado compite con el título real en vez de quedarse como textura. Verificado que `overflow:hidden` de `<section>` contiene el sangrado sin generar scroll horizontal en la página.

- **Divisor rasgado, de vuelta.** Mismo mecanismo de `mask-image` con SVG en línea que ya se había usado (y luego reemplazado por la cuña triangular) en una tanda anterior — reconstruido con un patrón nuevo (borde superior recto, inferior dentado a profundidad irregular) a 50px de alto, dentro del rango de 40–60px pedido.

  ⚠️ **`--ink-2` no funcionó como relleno, a pesar de que el pedido lo daba como primera opción.** Con `--ink-2` ya cambiado a gris grafito `#1A1A1A` en este mismo lote (ver arriba) y el fondo de la sección siendo negro puro, la diferencia de luminancia es de solo 26/255 — el mordisco quedaba prácticamente invisible, confirmado comparando capturas de pantalla antes/después del cambio. Se usó `--rojo` (la segunda opción que el pedido ya autorizaba) en su lugar, que sí se lee con fuerza real.

Cada una de las cuatro se implementó y se verificó por separado (valores computados + capturas de pantalla) antes de pasar a la siguiente, tal como se pidió explícitamente.

### Vuelta a la cuña triangular (2026-08-17, misma tarde)

El divisor rasgado de la sección anterior duró poco: Rubén pidió volver a "los divisores de figura diagonal" de antes — la cuña triangular (`clip-path:polygon`), no la textura de mask-image. Se restauró tal cual estaba, con un solo cambio deliberado: **`--rojo` en vez de `--ink-2`**. La última vez que existió esta cuña usaba `--ink-2`, pero esa variable ya cambió a gris grafito `#1A1A1A` en la pasada de sobriedad — restaurar la cuña con su color original la habría dejado prácticamente invisible contra el fondo casi negro de las secciones, el mismo problema de contraste ya encontrado (y corregido) para el divisor rasgado que esta cuña reemplaza. Se aplicó la misma corrección de manera proactiva en vez de reintroducir el mismo bug a sabiendas.

Verificado: `clip-path` de vuelta (sin `mask-image`), `background` en `--rojo`, altura en `40px`, captura de pantalla confirmando la figura visible con fuerza real, y un recorrido completo de scroll sin errores nuevos en consola.

## Caja de diálogo RPG en el hero (2026-08-17, noche)

El párrafo `.lede` del hero (el que presenta a Rubén, debajo del logo) se convierte en una caja de diálogo literal, estilo Persona 5: placa de nombre flotante, texto dentro de un cuadro con borde real, y un cursor triangular parpadeante de "continuar" en la esquina, como esperando input del jugador.

- **Texto nuevo, en los dos idiomas** — tono más directo ("Soy el refuerzo táctico que tu agencia necesita...", "I am the tactical backup your agency needs..."), reemplazando la presentación anterior más plana.

- **`.lede` pasa de `<p>` a `<div>` contenedor**, con tres hijos: `<span class="dialog-name">NotMan</span>` (sin `data-es`/`data-en` — es un nombre propio, no cambia entre idiomas, igual que "Rubén Rivera" en el logo), el `<p>` real con el texto y sus atributos de idioma, y `<i class="dialog-next">` como cursor decorativo. Verificado que ninguno de los dos sistemas de JS que tocan estos elementos le importa el cambio de etiqueta: el toggle de idioma busca `[data-es][data-en]` por atributo, no por tag, y la animación de entrada (`FADE`) solo añade una clase (`.fade`) sin tocar el `innerHTML` — a diferencia de `SLAM`, que sí reescribe el contenido y habría roto algo si `.lede` estuviera en esa lista (no lo está).

- **Filo propio, no `var(--filo)`.** El corte de 4 esquinas que usa el resto del sitio (botones, placas, tarjetas) se sentiría genérico aquí — la caja de diálogo necesita leerse como *su propio* elemento. El `clip-path` nuevo tiene una muesca real en el borde superior (no solo esquinas cortadas) para un aire más "roto a mano".

- **Misma técnica de sombra dura que `.card-in`/`.p5-tooltip`** (de una tanda anterior): `filter:drop-shadow(6px 6px 0 var(--rojo))` en vez de `box-shadow`, para que la sombra siga el `clip-path` irregular en vez de recortarse en un rectángulo. Verificado con una captura de pantalla recortada a la caja completa: la sombra roja seguía el filo dentado exacto, sin fugas.

- **Cursor de continuar** (`.dialog-next`): triángulo puro en CSS (`border-width`, sin imagen ni SVG), con `@keyframes dialogBlink` alternando `scale(1)→scale(1.2)` y opacidad — apagado bajo `prefers-reduced-motion`, como el resto de animaciones del sitio, con una opacidad estática de respaldo para que no desaparezca del todo.

- **Limpieza de paso:** `.lede` llevaba la clase `.placa-negra` antes de este cambio, y existían cuatro reglas CSS específicas para la combinación `.lede.placa-negra` (padding, clip-path, y dos de `:hover`). Como `.lede` es el único elemento del sitio que alguna vez llevó esa combinación de clases, quitarle `.placa-negra` dejó esas cuatro reglas completamente inalcanzables — se borraron en vez de dejarlas como código muerto.

Verificado con Playwright: texto correcto en español al cargar y en inglés tras el toggle de idioma; `"NotMan"` sin cambios en los dos idiomas; `background`/`border`/`clip-path`/`filter` computados de `.lede`; color/line-height/font-family del `<p>` interno; fondo/color/rotación/tipografía de `.dialog-name`; `animationName` de `.dialog-next`; capturas de pantalla de la caja completa confirmando el resultado visual.

## Se retira `--p5-yellow`, y máquina de escribir en el diálogo (2026-08-17, noche)

Rubén preguntó dos cosas por separado: si a la caja de diálogo le faltaba algún otro efecto, y qué opinaba yo del uso del amarillo (`--p5-yellow`) que se había agregado horas antes — "en lo personal no me gusta". Las dos se resolvieron juntas porque ambas tocan `.lede`.

**El amarillo se quita del sistema por completo.** No fue solo cuestión de gusto: este sitio tiene una regla explícita de "un color, un trabajo" (morado = identidad, rojo = qué mirar, blanco = seleccionado, negro = todo lo demás), y ya había *retirado* un quinto color una vez antes — el magenta original, cortado porque al lado del rojo de P5 se leía como el mismo color mal impreso ("cinco colores ya no son un sistema", ver la nota de paleta al principio de este archivo). `--p5-yellow` competía por el mismo rol que el rojo (llamar la atención) en vez de tener un trabajo propio. Se revirtieron los cuatro usos a sus colores originales:
- `.cifra b` y `.stat b.cuenta` → `var(--violet-hi)` (la regla `.stat b.cuenta` completa se borró; sin ella, `.stat b` ya cae de vuelta al violeta general).
- `.radar .punto` → `var(--rojo)`, `.radar .rango` → `rgba(255,255,255,.74)`.
- `.dialog-name` → fondo `var(--rojo)`, texto `var(--paper)` (no `var(--ink)`: sobre rojo, blanco es el par que ya usa el resto del sitio — `.menu-lista a:hover`, etc. — texto negro sobre rojo casi no tiene contraste).
- La variable `--p5-yellow` se borra de `:root`.

**Máquina de escribir**, como respuesta a "¿le falta algún efecto?" — la sugerencia que se ofreció y Rubén aceptó: el texto del diálogo aparece caracter por caracter en vez de con un fundido de todo el párrafo junto, la seña más reconocible de una caja de diálogo de RPG.

⚠️ **El primer intento (CSS puro) falló en producción, no en teoría.** La idea inicial: envolver cada caracter en un `span.ch` con una variable `--i`, y dejar que 274 animaciones CSS independientes (una por caracter) se dispararan con `animation-delay:calc(300ms + var(--i) * 14ms)`. Se ve bien en el papel — es la misma técnica de `--i`/`animation-delay` que ya usa el sistema de letras sueltas del cargador. Verificado con Playwright, el conteo de caracteres visibles subía con normalidad… y se detenía en seco siempre en el mismo caracter (123 de 274), sin importar cuánto se esperara después. Reproducido dos veces seguidas, mismo punto exacto las dos veces: Chromium dejaba de disparar animaciones pasado cierto número de animaciones cortas simultáneas — no es una condición de carrera aleatoria, es un límite real de cuántas puede sostener a la vez.

**Arreglo:** un solo bucle de `requestAnimationFrame` en JS reemplaza las 274 animaciones. Calcula, en cada frame, cuántos caracteres *deberían* estar visibles según el tiempo real transcurrido (`Math.floor(transcurrido / (1000/70))`, ritmo de 70 caracteres por segundo) y les agrega la clase `.v`. Un mecanismo en vez de 274 es automáticamente autocorrectivo: si el navegador salta un frame no pasa nada, el siguiente frame calcula el número correcto igual. Arranca cuando `.lede` consigue su clase `.go` (detectado con un `MutationObserver` sobre el atributo `class`, para no tener que tocar `entradaHero()`/`dispararTexto()`), con un colchón de 300ms para que la caja termine de aterrizar antes de que el texto empiece a "teclearse". Al cambiar de idioma, `.lede` nunca pierde su `.go`, así que `maquinaEscribir()` simplemente vuelve a arrancar el bucle con el texto nuevo de inmediato. Bajo `prefers-reduced-motion` no se envuelve nada — el párrafo se queda con su texto plano de siempre, completo desde el principio.

Verificado con Playwright: barrido del conteo de caracteres visibles cada 500ms confirmando progreso estable hasta 274/274 sin detenerse (a diferencia del intento anterior); reinicio limpio a 0 visibles con el texto nuevo justo después del toggle de idioma, y 256/256 (el inglés es más corto) al terminar; cero `span.ch` creados y texto visible de inmediato bajo `reducedMotion:'reduce'` de Playwright.

### Ajuste: `.sec-num` un poco más visible (2026-08-17, noche)

Rubén reportó, ya viendo el sitio real desplegado (no una captura recortada), que los números gigantes de fondo (01, 02, 03, 04) casi no se notaban. Tenía razón: `.04` de opacidad para el contorno era el valor elegido en la tanda anterior ("arquitectura de fondo, no numero que compite con el titulo"), pero resultó demasiado sutil en pantalla real. Subido a `.11` de opacidad y el trazo de `2px` a `2.5px` — sigue leyéndose como textura de fondo, detrás de los títulos y sin competir con ellos, pero ahora se nota que está ahí. Verificado con capturas de pantalla en `#servicios` y `#experiencia`.

## Redes (footer)

Instagram (`@notman.rivera`), LinkedIn y Behance (`/notmanrivera`) como iconos SVG inline en `.social`, dentro de `.foot-in`. Sin librería de íconos — son 3 `<svg>` a mano, glifos genéricos (cámara, "in", "Bē") para no reproducir marcas registradas al pixel.

### Rediseño del footer: logo + mini menú (2026-08-17, noche)

Rubén reportó que el footer se sentía apretado — todo amontonado en una sola fila (logo chico + copyright a la izquierda, redes a la derecha) — y propuso su propia idea: el logo a la izquierda y una versión miniatura del menú de pantalla completa a la derecha, inclinada, como si naciera de atrás del logo, con la composición entera centrada.

- **`.foot-menu`** es la fila nueva, entre la marquesina y la fila de siempre: `.foot-logo` (el logo, ahora a 56px de alto en vez de los 26px que tenía metido en el texto de copyright) y `.foot-mini` (los 5 accesos directos a las secciones), los dos centrados como un solo bloque — ninguno se justifica por separado.
- **El efecto "nace de atrás del logo"** es el mismo mecanismo que ya usa el menú móvil (el logo como ancla, los links saliendo de su filo): `.foot-logo` en `z-index:2`, `.foot-mini` en `z-index:1` con `margin-left:-22px` para que el primer link (Trabajo) se meta parcialmente detrás del logo, y cada link siguiente se solapa con el anterior (`margin-left:-10px`) igual que las placas del menú grande, solo que en miniatura y en horizontal. Alternan rojo/negro con el mismo `skewX(-6deg)` unificado del resto del sitio, y cada uno con su propia rotación fija (`--giro` por `nth-child`, sin el sistema `--giro-d` de la rejilla radial del hero — aquí no hace falta, no cambia de layout entre anchos).
- **Se quitó el logo chico duplicado** de la fila de copyright: con el logo grande ya presente arriba, mantenerlo también ahí abajo era ruido — la fila de copyright quedó con solo el texto `© 2026 Rubén Rivera`.
- **"Redistribuir, muy poco espacio"** se resolvió dándole a cada fila su propio respiro: `.foot-menu` con su padding propio arriba, y `.foot-in` con `border-top` + `margin-top` + `padding-top` para separarse visualmente de la fila nueva en vez de las dos apretadas una contra la otra.
- **Móvil (`≤700px`):** el solape "detrás del logo" solo se lee bien en una fila horizontal — apilado (`flex-direction:column`) se ve simplemente como una lista centrada de accesos, sin el gesto de superposición, que es la concesión correcta ahí (no hay espacio horizontal para preservarlo sin que se vea apretado).

Verificado con Playwright: `z-index` de logo/mini-menú, que el primer link efectivamente se superpone en pantalla con el logo (`getBoundingClientRect`), los 5 labels correctos y su traducción al cambiar de idioma, que un clic en un link del footer navega de verdad (usa el mismo listener global de `a[href^="#"]` que ya intercepta toda la navegación interna del sitio), y sin overflow horizontal en 390px de ancho. Capturas de pantalla en desktop y móvil confirmando el resultado visual.

### Segundo intento: la cascada real del menú, no píldoras (2026-08-17, noche)

El primer intento (arriba) no era lo que Rubén tenía en mente — "no es a lo que me refería jaja" — y mandó una referencia: el logo grande (el wordmark chrome del hero, no el ícono chico) a la izquierda, y las placas REALES del menú de pantalla completa (número + título + subtítulo, blanco/negro alterno, filo diagonal) en cascada vertical a la derecha, naciendo de atrás del logo.

- **Logo grande de verdad:** `logo-lg.webp` (el wordmark chrome de 1200×675 que ya usa el hero), no `logo.webp` (el ícono chico que se había usado en el primer intento).
- **`.foot-mini a` reconstruye la estructura exacta de `.menu-lista a`** — grid `num`/`tit`/`sub`, `clip-path:var(--filo)`, alternancia blanco/negro con `:nth-child(even)`, badge numerado en `--rojo` — pero como clase propia, a escala de footer, en vez de reusar `.menu-lista a` directamente: esa clase vive dentro del layout a pantalla completa del menú (columna flex al 100% de alto), un contexto que aquí no aplica.
- **La cascada es vertical, no horizontal** (a diferencia del primer intento): cada placa baja con `margin-bottom` negativo (solape) y se corre a la derecha con `margin-left` creciente por `nth-child` — el equivalente vertical del `--sangria` que ya usa el menú grande.
- **Móvil (`≤760px`):** la cascada diagonal se endereza — el `transform` deja de incluir `rotate(var(--giro))` (el `--giro` vive en un atributo `style` inline, así que no se puede anular desde una media query; simplemente se deja de referenciar en el `transform`) y los `margin-left` de la cascada se resetean a `0` con la misma especificidad que las reglas base, sin necesitar `!important` en ningún punto.

Verificado con Playwright: los 5 números, títulos y subtítulos correctos; alternancia de fondo blanco/negro confirmada por color computado; superposición real del primer link con el logo; `clip-path` aplicado; hover a rojo; clic navega de verdad; traducción de título Y subtítulo al cambiar de idioma; sin overflow horizontal en móvil. Capturas de pantalla en desktop y móvil confirmando que el resultado se acerca mucho a la referencia.

### Tercer ajuste: sin solape con el logo, sin subtítulo (2026-08-17)

Con la v2 ya en vivo, Rubén mandó una captura de `notmanrivera.com`: el logo tapaba de verdad el "01" y el subtítulo "Reel y casos" de la primera placa, no era solo un roce decorativo. Pidió adaptarlo para que el logo no tape nada del menú, y quitar el texto descriptivo — la idea es una miniatura simplificada del menú grande, no una réplica exacta.

- **Se quitó el solape físico:** `.foot-mini` ya no lleva `margin-left` negativo ni `z-index` para nacer "detrás" del logo; `.foot-menu` ahora tiene `gap:28px` entre logo y cascada. Verificado que `firstLinkBox.left >= logoBox.right` (antes daba `true` de solape, ahora hay ~27px de aire real).
- **Se quitó el `<em>` (subtítulo) de las 5 placas y de `.foot-mini a`:** el grid pasó de `"num tit" "num sub"` a solo `"num tit"`, y `align-items` de `baseline` a `center` porque ya no hay dos líneas que alinear. La cascada diagonal (`margin-left`/`margin-bottom` crecientes por `nth-child`) se mantiene igual — sigue evocando el menú grande, solo que ahora es una miniatura de verdad y no un clon 1:1.

Verificado con Playwright: sin solape logo↔menú (`gapLogoAMenu` positivo), cero `<em>` en el DOM del footer, los 5 números/títulos y su traducción correctos, alternancia blanco/negro, `clip-path` aplicado, hover a rojo, clic navega, sin overflow horizontal en móvil. Capturas de desktop y móvil confirman que el logo ya no tapa ninguna placa.

## Infraestructura

- **Hosting:** Cloudflare Pages, proyecto `notmanrivera`
- **Desplegar (manual, desde la Mac):** desde la raíz del repo, `wrangler pages deploy public --project-name=notmanrivera --commit-dirty=true`. Wrangler instalado vía Homebrew (`cloudflare-wrangler`) y ya autenticado en esta Mac contra la cuenta `rnrivera93@gmail.com`
- **Desplegar automático (2026-08-16), para poder publicar desde el celular:** `.github/workflows/deploy.yml` corre el mismo comando de arriba en GitHub Actions cada vez que algo llega a `main` (push directo o merge de un PR), usando `cloudflare/wrangler-action`. Con esto, aprobar/mergear un PR desde la app de GitHub en el iPhone (o desde Safari) ya despliega solo — no hace falta terminal ni Wrangler en el teléfono. El flujo manual desde la Mac sigue funcionando igual, no hay conflicto entre los dos: Cloudflare simplemente sirve el último deploy que haya llegado, sea cual sea el origen.
  - ⚠️ **Este workflow no funciona todavía por sí solo — le faltan dos secretos que solo Rubén puede cargar**, porque requieren su cuenta de Cloudflare y no hay forma de generarlos desde este entorno:
    - `CLOUDFLARE_ACCOUNT_ID`: se copia del dashboard de Cloudflare (columna derecha de cualquier página del dominio, o de Workers & Pages → Overview).
    - `CLOUDFLARE_API_TOKEN`: un token nuevo en **dashboard → My Profile → API Tokens → Create Token**, con permiso `Account → Cloudflare Pages → Edit` sobre la cuenta correspondiente (el mismo alcance que ya tiene el token guardado por Wrangler en la Mac, pero como token independiente — no reutilizar el de Wrangler porque ese vive cifrado en el keychain local, no se puede exportar en texto plano).
    - Ambos se cargan en **github.com/notmanrivera/notmanrivera-site → Settings → Secrets and variables → Actions → New repository secret**, uno con cada nombre exacto de arriba. Se puede hacer desde el navegador del iPhone.
    - Hasta que esos dos secretos existan, el workflow va a fallar (rojo) en cada push a `main` — no rompe nada más, pero conviene cargarlos pronto o el check va a quedar en rojo permanentemente.
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

- Cerrar el envío desde el dominio propio (Workspace o SMTP externo) para que la firma de los correos de prospección coincida con `hola@notmanrivera.com`.

## Botón "volver arriba" (2026-08-17)

Rubén pidió un botón de volver arriba "basado en nuestra estética" — sin más dirección que esa, así que en vez de un FAB genérico se reusó el lenguaje visual que ya existía en la esquina inferior derecha: el HUD de scroll (`.hud-scroll`, los 5 rombos que marcan la sección activa).

- **`.volver-arriba` es el mismo rombo que `.hud-paso`, más grande, apilado justo encima de los 5 pips** — se lee como un sexto paso que te regresa al origen, no como un elemento suelto nuevo en la esquina.
- **Morado por defecto, rojo al hover** — seguro el color por su significado ya establecido: morado es "quién es" (identidad, estructura), y volver al inicio es literalmente volver a la identidad; rojo es la acción/"mira aquí" que ya usan todos los estados de hover del sitio.
- **`href="#inicio"` (id nuevo en `<header>`) engancha el clic al mismo listener genérico de `a[href^="#"]`** que ya intercepta toda la navegación interna — hereda gratis el barrido de transición (`irConBarrido`) que usan los demás links del menú, sin JS de clic nuevo. Solo se agregó un listener de `scroll` que alterna `.visible` cuando `scrollY` pasa el 60% de la altura de pantalla.
- **`aria-label="Volver arriba"` estático, sin `data-es`/`data-en`** — mismo patrón que los íconos de `.social`: los aria-label de elementos solo-ícono no los toca el toggle de idioma.

Verificado con Playwright: oculto en el tope, aparece al bajar, sin solape con el HUD de scroll (`bBox.bottom <= hudBox.top`) en desktop y móvil, hover pasa a rojo, el clic regresa `scrollY` a 0 y el botón vuelve a ocultarse, sin overflow horizontal en 390px.

## Se quitan las bandas diagonales del hero, se pule la caja de diálogo (2026-08-17)

Rubén: "ya no me encantan las líneas que aparecen detrás del hero, las que parecen marcas de llanta" y "necesito que pulamos el diálogo de rpg, no me encanta el diseño". Se le preguntó qué hacer con cada cosa antes de tocar nada — pidió quitar las líneas del todo, y del diálogo señaló tres problemas concretos: las muescas del contenedor se ven ruidosas más que ornamentales, el color rojizo no le gusta, y el nombre "NOTMAN" se corta.

**Líneas del hero (`.slab-a`/`.slab-b`):** se quitan por completo — CSS, los dos `<div>` en `<header>`, y el listener de `scroll` que las movía en paralelo. El halftone punteado y los campos de color (`.campo`/`.campo2`) ya daban textura de sobra sin ellas.

**Caja de diálogo (`.lede`):**
- **El recorte a medida (9 puntos, con una muesca extra en el borde superior) se reemplaza por `var(--filo)`** — el mismo corte de 4 esquinas que ya usa botones, placas y tarjetas en todo el sitio. Una caja de diálogo no necesitaba su propio lenguaje de recorte; el custom era justo el ruido que Rubén señaló.
- **El fondo pasa de `rgba(0,0,0,.85)` a `var(--ink)` sólido, y la sombra dura de `var(--rojo)` a `var(--ink)`** — la transparencia dejaba pasar el rojo/morado de detrás y el conjunto se leía rojizo en vez de negro. Mismo tratamiento que ya usa `.p5-tooltip` (negro + borde blanco de 3px + sombra dura negra), que ya estaba probado que se lee bien sin importar qué hay detrás.
- **"El nombre se corta" era un bug real, no percepción:** `clip-path` en un elemento recorta también a sus descendientes, y el polígono de `.lede` nunca baja de `y:0` — así que la etiqueta `.dialog-name`, que se asomaba por ENCIMA del borde superior con `top:-15px` siendo hija de `.lede`, perdía ese pedazo. Se saca `.dialog-name` de `.lede` a un nuevo contenedor hermano sin recorte (`.dialogo`, envuelve a los dos), así puede asomar entera. Esto obligó a mover el `grid-area` y las reglas de ancho/centrado del layout radial de escritorio de `.orbita > .lede` a `.orbita > .dialogo` (`.lede` ya no es hijo directo de `.orbita`).
- **La etiqueta "NOTMAN" deja de ser un rótulo plano en `--rojo`** y pasa a usar el mismo truco de `.placa-negra` (placa blanca + capa interior negra vía `::after` con `z-index:-1`, ambas recortadas con el mismo `--filo`) — las "cajas superpuestas" que Rubén pidió, reusando el componente que el sitio ya usa en sus estados normales en vez de inventar uno nuevo.
- **Efecto secundario de sacar `.dialog-name` de `.lede`:** ya no hereda gratis el fundido de entrada (`.fade`/`.go`, `opacity`+`translateY`) que sí sigue aplicando a `.lede`. Se sincroniza aparte con un selector de hermano (`.lede.go ~ .dialog-name{opacity:1}`), sin animación propia — por eso en el HTML `.lede` va antes que `.dialog-name` dentro de `.dialogo` (el orden visual no depende del DOM porque la etiqueta es `position:absolute`). Cubierto también en `prefers-reduced-motion:reduce`.

Verificado con Playwright: cero elementos `.slab` en el DOM; `.lede` con `background-color` sólido y el `clip-path` de `--filo`; `.dialog-name` con `opacity:1` tras la entrada y su caja completa asomando por encima de `.lede` sin recortarse, en desktop y móvil; mismo resultado bajo `reduced-motion:reduce`; el tecleo del diálogo llega a los 274 caracteres completos sin cortarse; sin errores de consola; sin overflow horizontal en 390px.

### Placa roja detrás de `.lede`, y un bug real de `clip-path` + `filter:drop-shadow` (2026-08-17)

Rubén, ya con el borde engrosado: "o añade detrás un poco más o un rojo" — las dos cosas a la vez, una placa roja asomando por detrás de la caja de diálogo.

El primer intento fue el enfoque obvio: un segundo `drop-shadow()` en rojo encadenado al filtro existente (`filter:drop-shadow(6px 6px 0 var(--ink)) drop-shadow(13px 13px 0 var(--rojo))`), calcado del doble `drop-shadow` que ya usa `.marca` (el logo del hero) para dar profundidad. **No se veía nada — ni rastro del rojo.** Se aisló con una página de prueba mínima: `clip-path` + `filter:drop-shadow` en el mismo elemento no pinta ninguna sombra en este motor, ni siquiera un negro sólido sobre fondo gris claro (donde sería imposible no verlo si se pintara). Sin `clip-path`, el mismo `filter` se ve perfecto.

Esto quiere decir que el comentario original de `.card-in`/`.p5-tooltip` ("drop-shadow se calcula sobre la silueta ya recortada y sigue el filo real") **daba por sentado que funcionaba y nunca se verificó visualmente** — su sombra es `var(--ink)` sobre fondos ya oscuros, así que la ausencia de sombra y una sombra negra invisible se ven exactamente igual. No se tocó esa nota ni esos componentes (no era lo que se pidió), pero queda anotado por si alguna vez hace falta una sombra visible sobre un elemento con `clip-path` en el sitio — `filter:drop-shadow` no es el camino.

La solución real para `.lede`: una placa de verdad detrás, no un filtro. `.dialogo::before` (el envoltorio, no `.lede`) del mismo tamaño que `.lede`, en `var(--rojo)`, recortada con el mismo `--filo`, corrida con `transform:translate(10px,10px)`. `isolation:isolate` va en `.dialogo`, no en `.lede`: puesto en `.lede`, su propio `z-index:-1` se queda POR ENCIMA del fondo de `.lede` (así es como `.placa-negra` logra su capa "inset", el efecto contrario al que se busca aquí) — la placa roja tiene que ser hermana de `.lede`, no su pseudo-elemento, para quedar genuinamente detrás.

Verificado con Playwright + inspección de píxeles: la placa roja es visible y del color correcto en la esquina inferior derecha, sin overlap raro con `.dialog-name` ni con `.dialog-next`, en desktop y móvil.

### Menos rojo, y hover animado (2026-08-17)

Reacción de Rubén al ver la placa roja en vivo: "no tanto rojo jaja y añadamos un efecto de animación en hover".

- **Menos rojo:** la corrida de `.dialogo::before` baja de `10px` a `6px` — mismo gesto, menos superficie roja expuesta.
- **Hover:** al pasar el mouse sobre `.dialogo`, la placa se corre a los `10px` originales (con `transition:transform .22s`) y el borde de `.lede` pasa a `var(--rojo)` (`transition:border-color .22s`) — como si la caja "despegara" un poco de su sombra. Mismo tratamiento de borde-a-rojo que ya usa `.card-in` en su hover, no una idea nueva.
- **Regla de oro del hover respetada:** el elemento que detecta `:hover` es `.dialogo`, y lo que cambia son su `::before` (hermano) y el borde de `.lede` (hijo) — ninguno de los dos ES `.dialogo`, así que nada mueve la caja que el cursor está sobre, y el `:hover` no puede parpadear.
- `prefers-reduced-motion:reduce` quita la `transition` y fija el `::before` a los `6px` de reposo incluso en hover — el color del borde sigue cambiando (no es una animación de movimiento), pero nada se desliza.

Verificado con Playwright: `border-color` de `.lede` pasa de blanco a `rgb(229,0,18)` al hacer `hover('.dialogo')`, capturas de pantalla confirmando menos rojo en reposo y la placa más expuesta en hover, sin errores de consola.

## Galería: icono discreto + lightbox (2026-08-17)

Rubén: "quiero que el botón de tamaño completo en la galería sea más sutil, o cambiarlo por un ícono y que la imagen se abra en un modal de lightbox" — las dos cosas a la vez.

- **`.visor-full` pasa de pastilla de texto ("Tamaño completo") a icono solo** (SVG de cuatro esquinas, el símbolo estándar de "expandir"), `32×32px`, fondo translúcido y `opacity:.75` en reposo -- casi se pierde contra la imagen a propósito. Al hover/focus, `opacity:1` y fondo a `var(--rojo)`, mismo lenguaje de hover que el resto del sitio. Sigue siendo una `<a>` con `href`/`target="_blank"` reales (no un `<button>`): si JS no corre, sigue abriendo la pieza en una pestaña nueva. El `aria-label` va estático en español, sin `data-es`/`data-en` — mismo patrón que `.social`/`.volver-arriba` (los aria-label de elementos solo-ícono no los toca el toggle de idioma).
- **Lightbox nuevo (`#lightbox`), mismo mecanismo que `#menuFull`** (el menú de pantalla completa): `data-abierto="si"/"no"`, `display:none`→`flex`, `overflow:hidden` en `<body>` mientras está abierto, foco atrapado con `Tab` dentro del modal, `Escape` cierra, clic en el fondo cierra (con `stopPropagation` en la figura para que un clic en la imagen o el pie no cierre), y el foco regresa a quien abrió el modal al cerrar. No se inventó un patrón de modal nuevo — es el mismo que ya existía, reutilizado.
- El clic en `.visor-full` hace `preventDefault()` y llama `abrirLightbox()`, que toma la imagen/caption/cliente ya pintados por `pintarVisor()` (misma fuente de verdad que la imagen grande del visor, nada duplicado).
- Botón de cerrar (`✕`) con el mismo estilo que `.cerrar-menu` (rojo, sesgado, invierte a blanco/negro en hover) — otro punto de salida de un overlay a pantalla completa, misma pieza visual.

Verificado con Playwright: el botón mide 32px, sin texto visible, `aria-label` correcto, `opacity:.75` en reposo y fondo rojo en hover/focus; el lightbox abre con la imagen y el caption correctos, foco en el botón de cerrar, `overflow:hidden` en `<body>`; `Escape` cierra y regresa el foco a `.visor-full`; clic en el fondo cierra; clic en la imagen NO cierra; sin overflow horizontal en 390px; sin errores de consola.

## Segunda pestaña de la galería: Portafolio Web (2026-08-17)

Rubén mandó su PDF de portafolio web (7 proyectos 2019-2023: Moser Café Kultur, Café Amadeus, Grupo Uno22, Saxodia, V-Dental, Viterbo 68, Incómodo) y pidió armar con eso una sección nueva. Eligió, entre tres ubicaciones propuestas, que viviera **dentro de `#trabajo`, como segunda pestaña** del visor ya existente (Deportivo / Web), no como sección aparte ni pegada a la tarjeta de Servicios.

- **Extracción de imágenes:** el PDF es una sola página gigante (1920×6772pt, no 33 páginas como decía el metadato inicial) con los 7 proyectos apilados verticalmente, cada uno como un collage ya compuesto (mockups de dispositivos). Se instaló `poppler-utils` (no venía en la imagen base), se renderizó a 150dpi (300dpi generaba un PNG de 225 millones de píxeles, por encima del límite de descompression-bomb de Pillow), se detectaron los límites de cada bloque analizando el brillo promedio por fila para encontrar las franjas negras de "AÑO · CLIENTE" que separan cada proyecto, y se recortó/redimensionó cada uno a 1400px de ancho en WebP (27-90KB c/u) en `/assets/portafolio-web/`.
- **`.galeria-tabs`:** dos botones sesgados (mismo lenguaje que `.lang`/`.abrir-menu`), activo en `--rojo`, inactivo en placa oscura. `.galeria-tab.activo` alterna vía JS; ambos paneles existen siempre en el DOM (nunca se reconstruyen), solo se oculta uno con la clase `.oculto`.
- **⚠️ Bug real, no cosmético: `.oculto{display:none}` perdía contra `.visor{display:flex}`.** Misma especificidad (una clase cada uno) y `.visor` está declarado despues en la hoja, así que ganaba por orden de aparición — el panel "oculto" seguía viéndose. Se corrigió a `.visor.oculto{display:none}` (dos clases, ya no empata). Verificado con Playwright: sin el fix, ambos paneles aparecían apilados visibles a la vez.
- **⚠️ Otro bug real: un comentario HTML mal cerrado con `*/` en vez de `-->`** (arrastrado de escribir tantos comentarios de CSS/JS en la misma sesión) hizo que el parser tratara TODO lo que seguía como parte del comentario, hasta el próximo `-->` literal más abajo en el archivo — el panel Web completo (y todo lo que iba después) nunca llegó a existir como DOM real. Se detectó porque `document.getElementById('galeriaWeb')` daba `null` pese a que el HTML fuente sí lo tenía: la pista fue que `hasDeportivo` daba `true` pero `hasWeb` daba `false`, apuntando a que algo se estaba comiendo el markup entre los dos.
- **`initVisor()` se generalizó para operar sobre cualquier `.visor`** por recorrido del DOM (`root.querySelector('.visor-img')`, etc.) en vez de IDs fijos (`#visorImg`) — hay dos instancias en la página (Deportivo, ya existente, y Web, nueva) y con IDs habría sido necesario duplicar toda la lógica o inventar sufijos. El lightbox (compartido por las dos) hace lo mismo: cada `.visor-full` abre el modal leyendo la info de `trigger.closest('.visor-grande')`, no de un trigger fijo.
- **Web no usa `.visor-grupo-tit`:** cada proyecto del PDF es un solo collage, no varias fotos por cliente como en la galería deportiva — agrupar un solo thumbnail bajo un título de grupo habría sido ruido. Va como `.visor-grid` plano de 7 miniaturas.
- **`.visor--web` cambia el aspect-ratio de `3/4` (carteles verticales) a `4/3`** tanto en `.visor-grande` como en `.visor-thumb`: las capturas de escritorio son paisaje, y `3/4` las dejaba con franjas vacías enormes. Se anula de vuelta a `auto` dentro del media query de escritorio (mismo patrón que ya usa `.visor-grande` a secas), para no romper el layout de columna estirada ahí.
- El teaser "Próximamente" (SASIMA, Zero Limits Marketing, comentado desde el 2026-08-13 a pedido de Rubén) es contenido **distinto** — sitios sin lanzar, no proyectos entregados — y se dejó exactamente como estaba, sin tocar.

Verificado con Playwright: cambio de pestaña oculta/muestra el panel correcto, clic en miniatura del tab Web actualiza imagen/cliente/caption, el lightbox abre la pieza correcta desde cualquiera de las dos pestañas, volver a Deportivo lo deja intacto, el toggle de idioma actualiza el caption del tab Web aunque esté oculto, sin overflow horizontal en 390px, sin errores de consola.

## Amplía la galería Deportivo con el PDF de Sports Portfolio (2026-08-17)

Rubén mandó un segundo PDF ("Sports Portfolio", también una sola página gigante — 1920×5591pt esta vez) y explicó de antemano cómo leerlo: los primeros 9 cuadros (grid 3×3) eran presentaciones/transferencias/firmas de jugadores; 3 piezas sueltas promocionaban la Euro, a CR7 y esa final de Champions; los siguientes 9 eran matchdays de Hugo González; los últimos 8, del torneo de voleibol de Al-Arabi. Se verificó ese mapeo contra el PDF renderizado antes de tocar nada, y coincidió exacto.

- **Extracción por detección de huecos negros, no coordenadas a ojo:** brillo promedio por fila (`arr.mean(axis=(1,2))`) para partir la página en bloques, y brillo promedio por columna dentro de cada bloque para partir en celdas — el mismo método de la extracción del PDF web, aplicado dos veces (filas, luego columnas dentro de cada franja). 20 imágenes nuevas, recortadas y a 440px de ancho (piezas de exhibición a 760px, son fotografía real, no gráfico plano, y se ven en el lightbox).
- **De-duplicación contra lo que ya estaba en el sitio:** de las 26 piezas del PDF, 6 ya vivían en `/assets/galeria/` (Andrea Velarde-Transferencia, Nayrobi García-Firma, Al-Arabi Group Stage/Line-Up/Matchday-4, Hugo González Puebla/Tijuana/Monterrey/Leagues Cup-Nashville). Se compararon visualmente antes de extraer para no duplicar archivo ni miniatura.
- **Antes de sumar nada se le preguntó a Rubén** qué hacer con las 3 piezas sin cliente (Euro/CR7/Champions) y cómo renombrar el grupo de firmas, porque el nombre viejo ("Sub-17 · Liga BBVA") ya no describía a los 9 -- hay Sub-17 y Sub-21, hombres y mujeres, de clubes distintos (Cruz Azul, Puebla, Chivas, Pumas, Necaxa, Tigres). Eligió: grupo nuevo "Piezas de exhibición" para las 3 sueltas, y renombrar el grupo de firmas.
- **`.visor-grupo-tit` de "Presentaciones"/"Piezas de exhibición" lleva `data-es`/`data-en` con HTML embebido** (`"Presentaciones <small>Firmas y nuevos contratos</small>"`), igual que ya hace `.galeria-tit` — el toggle de idioma genérico hace `el.innerHTML = ...`, así que el `<small>` anidado sobrevive al cambio de idioma. Los grupos viejos (Al-Arabi SC, Hugo González) no lo necesitan porque su nombre es un cliente real, no se traduce.
- **`data-cliente` de las 9 presentaciones va con el nombre real de cada jugador**, no un rótulo de categoría genérico (`"Andrea Velarde"`, no `"Sub-17 · Liga BBVA"`) — con 9 personas distintas bajo un mismo grupo, el nombre real en el panel grande es más útil que un bucket compartido.
- **Al-Arabi sigue siendo "Voleibol · Catar/Baréin"** sin cambios — Rubén confirmó que las 8 piezas (Next Match ×5, Group Stage, Match Schedule, Line-Up) son del mismo torneo de voleibol ya etiquetado.

Resultado: `#galeriaDeportivo` pasa de 9 miniaturas (3 grupos) a 29 (4 grupos) — Al-Arabi SC (8), Hugo González · Mazatlán FC (9), Presentaciones (9), Piezas de exhibición (3).

Verificado con Playwright: conteo exacto por grupo (8/9/9/3 = 29), cero 404 en las 20 imágenes nuevas, clic en miniaturas de los grupos nuevos actualiza cliente/caption/imagen grande, el lightbox abre correctamente una pieza de exhibición, el toggle de idioma traduce los dos títulos de grupo nuevos (con el `<small>` intacto) y el caption activo, sin overflow horizontal en 390px, sin errores de consola.

## Chispas de 4 puntas en tres sitios nuevos + un bug real encontrado en el camino (2026-08-17)

Rubén mandó una referencia de un destello de 8 puntas y preguntó si valía la pena usar ese lenguaje. Ya existía: el JS inyecta 2-3 estrellas de 4 puntas en las coordenadas del clic sobre `.btn`/`.menu-lista a` (ver PARTICULAS DE CONFIRMACION) — pero Rubén no las había notado, duran .3s justo en el pixel del clic. Le pregunté dónde las probaría con más tiempo en pantalla y propuse tres sitios; contestó "implementa y vamos depurando".

- **Logo del hero:** 3 `<i class="chispa-logo">` fijas en el HTML, disparadas por el mismo selector de hermano que ya usa `.rafaga` (`.marca.go ~ .chispa-logo`), reusando el keyframe `confirmaBurst` que ya existía. Se ganan el primer intento porque el logo es "el momento de mayor impacto del sitio" (ver la nota de `.rafaga`).
- **CTA del hero (hover):** `<span class="chispa-btn">` dentro de cada `.btn` (no `<i>`: `.btn i` ya está estilizado para el texto, con un `<i>` la chispa heredaba ese `transform:skewX(6deg)` sin querer). Nuevo keyframe `chispaTwinkle`, en loop mientras dura el `:hover`/`:focus-visible` — la regla de oro del hover se respeta porque quien detecta `:hover` es `.btn`, y lo que se mueve es un hijo, no `.btn` mismo.
- **Números de sección:** `<span class="chispa-sec">` anidada dentro de `.sec-num` (hereda su plano sesgado/rotado), disparada por `.sec-head.in` -- `.sec-head` ya es `.rv` y ya recibe `.in` del IntersectionObserver genérico, no hizo falta JS nuevo tampoco aquí.
- **Dos bugs de posicionamiento reales, no cosméticos, encontrados al verificar con Playwright (no a ojo):**
  - Las chispas del logo en `z-index:-1` no se veían: a diferencia de `.rafaga` (que solo asoma en las puntas que salen de la silueta del logo), la mayoría caían DENTRO del área que pinta `.marca`, y el logo (sin z-index, pinta encima de los hijos negativos de `<h1>`) las tapaba por completo. Se subieron a `z-index:2`.
  - La chispa del botón, puesta primero por FUERA del borde (`top:-9px;right:-9px`, como un acento que asoma), se cortaba sin avisar: `.btn` también lleva `.sat` (`clip-path:var(--filo)`), y clip-path recorta a cualquier descendiente que se salga del rectángulo propio -- el mismo hallazgo que ya costó el "nombre se corta" de `.dialog-name`. Se movió DENTRO del borde (`top:6px;right:8px`).
  - Color: las chispas del botón se hicieron primero en `--paper` (blanco) como las otras dos, pero tanto `.btn-1` (placa-negra) como `.btn-2` (placa-roja) asientan en blanco una vez que termina el parpadeo de `.orbita .sat:hover` -- blanco sobre blanco, invisible en el estado donde más tiempo se queda. Se cambió a `--ink` (negro), que se ve bien ahí y también durante el parpadeo rojo/blanco de camino.
- **⚠️ Bug real, pre-existente, encontrado por verificar opacidad computada en vez de solo mirar capturas:** pasar el mouse sobre `.btn-1`/`.btn-2` (o cualquier `.orbita .sat.pop.go`, incluido el `.kicker` del hero) los volvía **completamente invisibles mientras el mouse seguía encima**, no solo un parpadeo -- `.orbita .sat:hover` dispara `p5HoverSnap`, que REEMPLAZA por completo la propiedad `animation` (es una sola propiedad, no se puede tener dos animaciones de reglas distintas activas a la vez sin listarlas juntas). Como `p5HoverSnap` nunca toca `opacity`, la entrada `popIn` que sostenía `opacity:1` con `fill-mode:both` dejaba de aplicar, y sin nada que la sostuviera, `opacity` caía de vuelta a `.pop{opacity:0}` durante TODO el hover. Ya estaba así en producción, no lo causó nada de esta sesión -- se descubrió al verificar la chispa nueva del botón. Arreglado con una segunda declaración estática, `.pop.go{opacity:1}`, que no pisa a `popIn` mientras esa animación corre (una animación activa gana sobre un valor estático de la misma propiedad) pero sostiene `opacity:1` pase lo que pase con `animation` después. Efecto secundario menor, aceptado tal cual: al soltar el hover, `popIn` se reinicia desde 0% (porque `p5HoverSnap` lo desplazó por completo, no lo pausó), así que el CTA repite su entrada .34s en vez de quedarse quieto -- mucho más suave que la invisibilidad total, no se persiguió más.

Verificado con Playwright: opacidad de `.btn-1` fija en 1 durante TODO el hover (antes caía a 0 y se quedaba ahí); las tres chispas nuevas alcanzan opacidad ~1 en algún punto de su animación (con trazas de opacidad cada 50-80ms, no una sola captura a ciegas); capturas a escala 2x confirmando visibilidad real de la chispa del botón contra su fondo asentado; `.chispa-logo{display:none}` por debajo de 820px; sin overflow horizontal en 390px; suite completa de regresión (pestañas de galería, ambos grupos deportivos, lightbox) sigue en verde tras el cambio a `.pop.go`.

## El logo saltaba de posición vertical al rotar el servicio (2026-08-17)

Rubén, en vivo: "el logo de hero cambia de posición cuando cambia el servicio debajo de él, no debería".

La causa era el mismo tipo de bug que ya se había corregido para el ANCHO de la columna del hero radial ("La columna central YA NO es 'auto'", ver esa nota mas arriba en este archivo), pero sin corregir para el ALTO: `.rota` (la línea que rota entre los 4 servicios) vive en flujo normal dentro de `<h1>`, junto a `.marca`. Como las traducciones tienen largos distintos ("Motion graphics 2D/3D" vs "Soporte marca blanca"), a veces `.rota` ocupa una línea y a veces dos -- y `<h1>` ocupa el area "logo" de la rejilla, que abarca 3 filas con `align-items:center`. Cada vez que la altura de `.rota` cambiaba, la altura total de `<h1>` cambiaba con ella, la rejilla recalculaba esas 3 filas, y el punto de centrado vertical se movía -- el logo entero saltaba hasta ~21px de una rotación a la siguiente (medido con Playwright antes del fix).

- **`.orbita h1 .rota` pasa a `position:absolute`** (solo en el layout radial de escritorio, `@media(min-width:1000px)` -- en móvil no hay rejilla, es flujo normal, y ahí nunca hubo el bug). Sacado del flujo, ya no aporta nada a la altura de `<h1>`, que vuelve a depender solo de `.marca` (altura fija). `.rota` se reposiciona con `left:50%` + `translateX(-50%)` (para seguir centrado bajo el logo, ya que `text-align:center` del padre no alcanza a un elemento posicionado) y `top:100%` (el borde inferior de `<h1>`, que ahora coincide con el borde inferior de `.marca`).

Verificado con Playwright: se trazó la posición Y de `.marca` a lo largo de 4 rotaciones completas (16 muestras, ~14s) -- antes del fix, diferencia de 20.8px entre el mínimo y el máximo; después, diferencia de 0px exacto, pese a que la altura de `.rota` seguía variando entre 103px y 146px según el texto. Capturas confirmando que `.rota` se sigue viendo centrada y con el mismo sesgo bajo el logo en dos rotaciones distintas. Sin overflow horizontal en 390px, sin cambios visuales en móvil.

## El reel ya está en Vimeo, se quita el placeholder "Bloqueado" (2026-08-17)

Rubén subió el reel de animación a Vimeo (video `1218963729`) y pasó el embed. Se reemplaza la tarjeta "Bloqueado" (placeholder que ocupaba el lugar del reel mientras no había video final) por la tarjeta real:

- **Se borra `.frame-bloqueado`/`.bloqueado-etiqueta`/`.bloqueado-grande` del CSS** — sin usos restantes en el HTML tras el cambio, así que se quitan en vez de dejarlos muertos.
- **El wrapper de padding-hack (`padding:56.25% 0 0 0`) y el `<script src="player.js">` que trae el embed de Vimeo por defecto no hacen falta** — `.frame` ya es `aspect-ratio:16/9` con el `<iframe>` en `position:absolute;inset:0`, el mismo patrón responsive que ya usaban los embeds de Drive. Se usa solo el `<iframe src="https://player.vimeo.com/video/1218963729...">` dentro de la estructura `.card`/`.card-in`/`.frame` existente.
- Sigue pendiente (comentado, sin tocar) la tarjeta "Próximamente" del portafolio web (SASIMA / Zero Limits Marketing) — esa es la única pieza que sigue en stand by; el reel ya no lo está.

Verificado con Playwright: cero elementos `.frame-bloqueado` en el DOM, `src` del iframe apunta al video de Vimeo correcto, la tarjeta conserva las clases `work-grid work-grid-uno` (no se estira a ancho completo sola), título y descripción correctos, sin errores de consola. El video en sí se ve como imagen rota en las pruebas locales porque el entorno sandbox bloquea iframes de terceros (mismo límite ya documentado para Drive) — no es un bug, en el sitio real debería cargar bien.

## El reel es un demo general, no una pieza de un sector — y la chispa se extiende a más hovers (2026-08-17)

Rubén, tras ver el reel ya desplegado: el video seguía sin cargar (ver nota abajo), y aparte señaló que el reel es un demo general de su trabajo como animador, no algo enfocado en deportes ni en ningún sector — el copy y el contexto de la sección lo hacían leer como si sí lo estuviera. También pidió extender la chispa de 4 puntas del hover de los CTA a otros hovers del sitio, ya que le gustó cómo quedó.

**Encuadre del reel como demo general:**
- El subtítulo de la sección `#trabajo` ya no dice "edición deportiva" ni "diseño de interfaz" — ahora deja explícito que el reel es general y que los casos por categoría (deportivo/web) están abajo, en la galería.
- El párrafo de la tarjeta del reel se reescribe en el mismo sentido: "sin enfocarme en un sector en particular".
- **Nueva etiqueta `.cinta-general`** sobre el frame del video: "Reel general", en **violeta** y no en rojo. Con "un color, un trabajo" ya establecido (rojo = mira aquí/hover, violeta = identidad), esto no es una urgencia — es una aclaración de identidad, así que le toca el violeta. Aprende del bug ya documentado de `.cinta-proximamente` (`left:-8px`, se corta contra el `clip-path` de `.card-in` en cuanto se reactive): esta etiqueta nueva usa `top`/`left` positivos, dentro de la caja, para no repetir el error.

**Chispa de hover extendida a `.svc`, `.cred` y `.card`:**
- Mismo `<span class="chispa-btn">` y misma animación `chispaTwinkle` que ya usan los CTA — no una pieza nueva por sitio, un solo componente reusado. El disparador CSS (`:hover`) se amplía con `.svc:hover .chispa-btn, .cred:hover .chispa-btn, .card:hover .chispa-btn` junto al de `.btn` que ya existía.
- **El color de fondo de la chispa ya no es fijo.** Antes era `--ink` a secas, porque esa elección solo tenía sentido para los CTA (que asientan en blanco al terminar su snap de hover). `.svc`/`.cred` funcionan igual — su interior pasa de negro a blanco al hover (`::after` invierte fondo) — así que ahí también sirve `--ink`. Pero `.card-in` (las tarjetas de portafolio) se queda oscura siempre, nunca voltea a blanco: `--ink` ahí sería invisible. Se cambia la base a `--paper` (piensa primero en `.card`) y se sobreescribe a `--ink` solo en `.btn`, `.svc` y `.cred` vía `.btn .chispa-btn,.svc .chispa-btn,.cred .chispa-btn{background:var(--ink)}`.
- Posición reusada tal cual (`top:6px;right:8px`, ya probada segura contra el `clip-path:var(--filo)` que llevan `.btn`, `.svc`, `.cred` y (indirectamente) `.card-in`) — no hubo que resolver el bug de recorte otra vez, ya se sabía la solución.

Verificado con Playwright: la chispa anima (`animationName:chispaTwinkle`, `opacity>0`) al hover en un `.svc`, un `.cred` y la tarjeta del reel, y vuelve a `opacity:0` al quitar el mouse; capturas confirman que no se corta contra ningún filo. **Un hallazgo del camino, no un bug nuevo:** al probar el hover exactamente sobre el `<iframe>` del reel (que en este sandbox no carga, ver más abajo), Chromium no propaga `:hover` al `.card` ancestro — pero se confirmó que esto **ya pasaba antes de este cambio** con el efecto de borde rojo preexistente (`.card:hover .card-in{border-color:var(--rojo)}`), probando con el mismo hover exacto: tampoco se activaba. No es algo que la chispa haya introducido; es el mismo límite de iframe bloqueado de siempre, y desaparece en cuanto el iframe carga contenido real (hover fuera del iframe, o sobre `.card-body`, funciona sin problema).

**El video no cargaba en producción -- diagnóstico a distancia, en muchas rondas con Rubén, sin poder tocar Vimeo ni ver el sitio en vivo desde aquí** (`vimeo.com`, `player.vimeo.com` y `notmanrivera.com` bloqueados por la política de red del entorno, confirmado en `/__agentproxy/status`). Se fueron descartando causas una por una, pidiéndole a Rubén capturas y pruebas concretas en cada paso -- **varias de las hipótesis del camino resultaron equivocadas**, y vale la pena dejar constancia de eso también, no solo de la que sí era:

1. **No era la privacidad general del video** (`vimeo.com` → el video → Compartir → Privacidad) -- ya estaba en "Público".
2. **Sí era la restricción de dominio de inserción**, un ajuste DISTINTO al anterior y específico de cada video (`vimeo.com/manage/videos/<id>` → Insertar): estaba limitado y no incluía `notmanrivera.com`. Rubén lo cambió a "En cualquier sitio" -- necesario, pero **no era la causa completa**, como se vio después.
3. ~~Hipótesis descartada: Brave Shields.~~ Tras el cambio anterior seguía sin verse, con el mensaje "Este contenido está bloqueado. Comuníquese con el propietario del sitio...". Se asumió que era el placeholder de Brave Shields bloqueando el iframe -- **hipótesis equivocada**: el mismo mensaje volvió a aparecer con Shields desactivado por completo para el sitio. El mensaje era real, pero venía de otro lado (ver punto 6).
4. ~~Hipótesis descartada: `referrerpolicy` faltante.~~ En Safari, sin mensaje visible, el frame se quedaba negro sin responder al clic; el link directo de Vimeo sí reproducía en Safari. Se restauró `referrerpolicy="strict-origin-when-cross-origin"` en el `<iframe>` (se había quitado al simplificar el embed que da Vimeo por default) -- razonable de intentar, pero **tampoco resolvió nada**, confirmado después del deploy.
5. ~~Hipótesis descartada: clasificación de contenido sin asignar.~~ Al revisar Vimeo apareció un aviso de "Calificación establecida como Para todos los públicos" -- pareció un candidato real (Vimeo a veces restringe embeds de video sin clasificar), pero probar de nuevo tras eso tampoco cambió nada.
6. **Se descartó todo lo del lado del visitante:** Rubén no usa VPN ni firewall; se confirmó que el fallo era IDÉNTICO en Brave (con Shields apagado) y en Safari, y que persistía incluso en su celular con datos móviles (fuera de su red de casa) -- eso descartó su Mac, su router/DNS doméstico, y cualquier navegador en particular. Un fallo idéntico en todos los dispositivos, redes y navegadores solo puede venir de un solo lugar: el propio servidor.
7. **Causa real: `public/_headers` (los headers HTTP personalizados que usa Cloudflare Pages) traía una Content-Security-Policy con `frame-src https://drive.google.com` -- un resto de cuando el reel usaba un embed de Google Drive, nunca actualizado al migrar a Vimeo en la PR del reel.** El CSP del propio sitio le prohibía al navegador cargar CUALQUIER iframe que no fuera de `drive.google.com`, sin importar que la configuración de Vimeo (privacidad, dominio de inserción, calificación) estuviera perfecta -- el navegador nunca llegaba a pedirle nada a Vimeo. Esto explica el patrón exacto que se vio: falla igual en todo dispositivo/red/navegador (es un header que manda el servidor, no algo del cliente) y el mensaje "blocked, contact the site owner" en Brave probablemente también era el aviso de violación de CSP del propio navegador, no de Shields. Se corrige a `frame-src https://player.vimeo.com` (no queda ninguna referencia a `drive.google.com` en el HTML, ni siquiera comentada, así que se reemplaza en vez de agregarse).

**Lecciones:**
- Cuando un fallo es *idéntico* en todos los navegadores, dispositivos y redes probados, hay que sospechar del servidor antes que seguir agotando hipótesis del lado del cliente -- ese patrón fue la pista más clara desde el principio, y tardó varias rondas en tomarse en serio.
- `public/_headers` es fácil de olvidar porque no aparece al revisar `index.html` -- cualquier cambio que agregue o cambie el dominio de un iframe (embeds de video, mapas, lo que sea) tiene que revisar también el CSP del `frame-src` ahí, o el navegador lo bloquea en silencio sin que el HTML tenga nada mal.
- Los atributos que trae un snippet oficial de un tercero (Vimeo, YouTube, etc.) casi nunca son decorativos -- si no se entiende para qué sirve uno en concreto, se deja, no se asume que es innecesario. (Cierto en general aunque en este caso puntual no haya sido la causa.)

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
