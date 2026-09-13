# video/ — composiciones de HyperFrames

Videos hechos con [HyperFrames](https://hyperframes.heygen.com): se escribe HTML,
CSS y GSAP, y el framework lo renderiza cuadro por cuadro a MP4. **No anima el
sitio** — el sitio sigue siendo CSS propio. Esto produce archivos de video para
prospección y redes.

## Qué hay

| Composición | Formato | Para qué |
|---|---|---|
| `reel/` | 1080×1920 · 18s | Instagram. El sitio en móvil dentro de un teléfono, cierre con llamada a DM. |
| `sitio-tour/` | 1920×1080 · 28s | LinkedIn y correo. Recorrido de escritorio en ventana de navegador. |
| `prospecto/` | 1080×1920 · 14s | Un prospecto concreto. Las dos constantes de arriba del `<script>` salen de las columnas A y D de la hoja de prospección; cambiarlas y re-renderizar es una variante nueva. |
| `prueba/` | 1080×1920 · 11s | El primer experimento. Se queda como referencia del formato mínimo. |

## Levantar el entorno

```sh
cd video
npm init -y && npm install hyperframes gsap playwright-core
npx hyperframes doctor          # dice qué falta
```

En una Mac basta `brew install ffmpeg` y `npx hyperframes browser ensure`.
En un contenedor sin ninguno de los dos: `npm install ffmpeg-static ffprobe-static`
y `source env.sh`, que apunta las tres variables que hyperframes lee.

## Los assets no están en el repo

Cada composición espera un `assets/` con las fuentes (`kenyan-coffee.woff2`,
`monument-black.woff2`), el logo (`logo-lg.webp`), `gsap.min.js` y las piezas de
obra. Todo eso ya vive en `public/assets/` — se copia al armar, no se duplica en
git. Los `renders/` tampoco: 60 MB entre los cuatro y se regeneran en minutos.

## Grabar el scroll del sitio

`captura/grabar-escritorio.js` y `captura/grabar-movil.js` manejan un scroll
guionizado con easing y pausas por sección, y lo graban con Playwright.

⚠️ **Se graba en TIEMPO REAL, no cuadro por cuadro.** El carácter del sitio son
sus animaciones; si se salta de posición en posición, los reveals y los halftones
corren a destiempo y el video miente sobre cómo se siente el sitio.

```sh
cd video && python3 -m http.server 8899 --directory ../public   # o la copia parcheada
HF=$PWD node captura/grabar-movil.js
```

⚠️ **Dos sustituciones al grabar desde un entorno sin salida a internet:**

1. **Inter viene de Google Fonts.** Si no carga, todo el texto de cuerpo cae a una
   fuente del sistema y el video no representa el sitio. Solución: copiar el sitio,
   `npm i @fontsource/inter` y cambiar el `<link>` de googleapis por `@font-face`
   locales.
2. **El iframe de Vimeo no carga** y ese bloque queda como un hueco negro. Se
   sustituye por un cartel. Se nota en el metraje de escritorio, donde el cartel
   se encima sobre el título del caso.

Las dos se hacen sobre una copia de `public/`, nunca sobre el original.

⚠️ **El tamaño de video de Playwright no escala el viewport, lo rellena.** Grabando
un viewport de 430×932 con `size: 860×1864` el contenido queda en la esquina
superior izquierda y el resto es gris. Hay que recortar esa región y escalarla:

```sh
ffmpeg -i raw.webm -vf "crop=430:932:0:0,scale=720:1560:flags=lanczos" salida.mp4
```

## Lo que enseñó el linter

`npx hyperframes check` rechaza cosas que valen para el sitio también:

- **Solo transform y opacity.** Animar `letter-spacing` reflowea el texto y GSAP
  redondea el valor a píxel entero; bajo captura cuadro por cuadro se ve como
  tembleque. Para separar letras hay que partir el texto en glifos y animar la `x`
  de cada uno. Es la misma regla que ya documenta `PROJECT.md` para el sitio.
- **La visibilidad de los clips la maneja el framework.** Las animaciones de salida
  van sobre un `<div>` interno, con un `tl.set(..., {opacity:0})` en el límite del
  clip para que el seek no lineal no deje estado viejo.
- **Contraste.** Cachó un kicker violeta encima de una astilla violeta — la misma
  trampa del `×` rojo sobre placa roja y de la cuña del menú.

## Marca de agua en la obra

⚠️ De las 23 piezas de `public/assets/galeria/` que se revisaron, **diez llevan la
marca `victorem` estampada abajo** (Hugo Monterrey, Hugo J2, Hugo Juárez, Hugo
Leagues Cup 2024, Hugo Necaxa, Hugo Pachuca, Champions, CR7, Euro, Santiago Ulloa)
y varias traen el verde de la plantilla de Victorem dentro del arte. **Las ocho de
Al-Arabi están limpias.**

En el visor del sitio, a tamaño miniatura, se lee como atribución honesta. En un
video a pantalla completa durante segundo y medio, un prospecto ve la marca de otra
agencia. Decisión de Rubén, no de diseño: no recortar sin preguntar.
