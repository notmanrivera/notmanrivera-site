#!/usr/bin/env node
// Genera los GIF de la firma de correo desde scripts/firma/banner.html.
//
// No corre en el deploy -- se ejecuta a mano cuando cambia el diseño:
//   npm i --no-save playwright   (y ffmpeg en el PATH)
//   node scripts/firma/render.js
// Si el Chromium de Playwright no está instalado, apuntar a otro con
// CHROMIUM=/ruta/al/chrome.
//
// Por qué cuadro por cuadro y no una grabación: las animaciones se congelan
// con la Web Animations API y se posicionan en un instante exacto antes de
// cada captura. Grabar en tiempo real perdería cuadros del guiño, que dura
// 360ms en ranuras de 30ms.
//
// ⚠️ /assets/* se sirve con caché inmutable de un año (public/_headers). Un
// cambio de diseño NUNCA se publica encima del mismo archivo: subir VERSION,
// y los correos ya enviados se quedan con la versión con la que salieron.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const VERSION = 'v1';
const RAIZ = path.resolve(__dirname, '../..');
const SALIDA = path.join(RAIZ, 'public/assets/firma');
// ⚠️ 2x y no menos, aunque pese más: se probó 1.5x (438 KB contra 647 KB) y en
// pantalla retina el filo blanco de las placas salía doble y borroso al
// reescalar -- y ese borde nítido es media estética del sitio.
const ESCALA = 2;            // retina: se muestra a 520px, se dibuja a 1040
const PASO_BARRIDO = 60;     // ms entre cuadros del barrido de placas
const REPETICIONES = 2;      // el GIF se reproduce 3 veces y se queda en reposo

const TIPOS = { '.html': 'text/html', '.woff2': 'font/woff2', '.webp': 'image/webp', '.png': 'image/png' };

function servidor() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const ruta = path.join(RAIZ, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!ruta.startsWith(RAIZ) || !fs.existsSync(ruta) || fs.statSync(ruta).isDirectory()) {
        res.writeHead(404); return res.end();
      }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(ruta)] || 'application/octet-stream' });
      fs.createReadStream(ruta).pipe(res);
    });
    s.listen(0, () => ok(s));
  });
}

// Instantes a fotografiar, con cuánto dura cada uno en el GIF.
function plan(L) {
  const cuadros = [];
  const agrega = (t, dur) => cuadros.push({ t, dur });
  agrega(0, L.guino);
  // El guiño es step-end en 12 ranuras de 30ms: se muestrea a media ranura
  // para no caer justo en una frontera de keyframe.
  for (let k = 0; k < 12; k++) agrega(L.guino + 15 + 30 * k, 30);
  const finGuino = L.guino + 360;
  agrega(finGuino + 15, L.barrido - finGuino);
  // La chispa de la última placa arranca 60ms después de su hover y dura 900.
  const finBarrido = L.barrido + 3 * L.escalon + Math.max(L.hover, 60 + 900);
  for (let t = L.barrido; t < finBarrido; t += PASO_BARRIDO) agrega(t, PASO_BARRIDO);
  agrega(finBarrido, Math.max(40, L.total - finBarrido));
  return cuadros;
}

async function renderIdioma(navegador, base, lang) {
  const pagina = await navegador.newPage({ viewport: { width: 520, height: 208 }, deviceScaleFactor: ESCALA });
  await pagina.goto(`${base}/scripts/firma/banner.html?lang=${lang}`, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  const L = await pagina.evaluate(() => window.LINEA);

  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), `firma-${lang}-`));
  const cuadros = plan(L);
  const unicos = [];
  for (const c of cuadros) {
    await pagina.evaluate(t => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }), c.t);
    const png = await pagina.screenshot({ type: 'png' });
    const previo = unicos[unicos.length - 1];
    // Cuadros idénticos seguidos se funden en uno solo con la suma de las
    // duraciones: el reposo pesa un cuadro, no cuarenta.
    if (previo && previo.png.equals(png)) previo.dur += c.dur;
    else unicos.push({ png, dur: c.dur });
  }
  await pagina.close();

  // El primer y el último cuadro son el mismo reposo: se funden para que el
  // bucle no tenga un tartamudeo en la costura.
  if (unicos.length > 1 && unicos[0].png.equals(unicos[unicos.length - 1].png)) {
    unicos[0].dur += unicos.pop().dur;
  }

  const lista = ['ffconcat version 1.0'];
  unicos.forEach((u, i) => {
    const f = path.join(tmp, `f${String(i).padStart(3, '0')}.png`);
    fs.writeFileSync(f, u.png);
    // ⚠️ `option framerate 100` no es decorativo: sin él cada PNG entra con la
    // base de tiempo de 25 fps del demuxer de imágenes y concat redondea todas
    // las duraciones a una rejilla de 40ms. Las ranuras de 30ms del guiño
    // salían como 40, 40, 10, 30... -- medido con ffprobe. A 1/100 s la base
    // coincide con la unidad del propio GIF (centésimas) y no hay redondeo.
    lista.push(`file '${f}'`, 'option framerate 100', `duration ${(u.dur / 1000).toFixed(3)}`);
  });
  // El demuxer concat ignora la duración del último archivo si no se repite.
  lista.push(lista[lista.length - 3], 'option framerate 100');
  const listaPath = path.join(tmp, 'lista.txt');
  fs.writeFileSync(listaPath, lista.join('\n'));

  const destino = path.join(SALIDA, `banner-${lang}-${VERSION}.gif`);
  // Sin dithering: el grano propio del cromado ya tapa cualquier banda
  // (comparado cuadro a cuadro), y el dithering sobre los colores planos de
  // las placas solo metía ruido que el LZW del GIF no comprime.
  execFileSync('ffmpeg', [
    '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listaPath,
    '-vf', 'split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=none:diff_mode=rectangle',
    '-fps_mode', 'passthrough', '-loop', String(REPETICIONES), destino,
  ]);
  fs.rmSync(tmp, { recursive: true, force: true });
  const kb = (fs.statSync(destino).size / 1024).toFixed(0);
  console.log(`OK  ${path.relative(RAIZ, destino)}  ${unicos.length} cuadros  ${kb} KB`);
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const s = await servidor();
  const base = `http://localhost:${s.address().port}`;
  const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  try {
    for (const lang of ['es', 'en']) await renderIdioma(navegador, base, lang);
  } finally {
    await navegador.close();
    s.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
