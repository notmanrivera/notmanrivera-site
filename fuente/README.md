# fuente/

Archivos de origen que **no se publican** (el deploy solo sube `public/`), pero
que hacen falta para poder rehacer cosas.

## `logo-vector.svg`

El logo en vector de verdad: 9 rutas, una por letra, exportadas de Illustrator.
4.6 KB, `viewBox="0 0 945 520"`.

De aquí salen las rutas que van inline en `public/index.html` para el trazo del
hero (buscar `class="trazo"`). Si el logo cambia, se re-exporta aquí y se
vuelven a pegar las rutas.

⚠️ **No confundir con el otro "SVG" que circula del logo**, que es un PNG en
escala de grises metido dentro de una etiqueta `<svg>` — sin una sola ruta, y
más chico (945x520) que el `logo-lg.webp` que el sitio ya usa (1200x675). Ese
no sirve para animar nada.

### El viewBox del sitio no es el de este archivo

En `index.html` el SVG lleva `viewBox="-6.401 -7.966 960.203 537.729"`. No es un
número mágico: encuadra la obra vectorial dentro del lienzo de 1200x675 del
`logo-lg.webp`, que trae 8px de margen transparente a la izquierda y 10 arriba.
Sin ese reencuadre el contorno sale un 4.8% más grande que el cromado.
