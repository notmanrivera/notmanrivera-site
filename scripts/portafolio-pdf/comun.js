// Lo que comparten el portafolio (render.js) y el manual de identidad
// (manual.js): rutas, imágenes comprimidas, estilos base y el marco de página.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = __dirname;
const RAIZ = path.join(DIR, '..', '..');
const PUB = path.join(RAIZ, 'public');
const SALIDA = path.join(DIR, 'salida');
const SITIO = 'https://notmanrivera.com';

const CACHE = path.join(SALIDA, '.cache');

// Chrome mete las imágenes al PDF casi sin comprimir (≈35 MB). Por eso cada
// imagen pasa antes por ffmpeg: JPG para fotos y PNG chico para lo que lleva
// transparencia (logos). Se guardan en salida/.cache y se reusan.
function a(p, ancho = 1200) {
  const origen = path.join(PUB, 'assets', p);
  if (/\.woff2$/.test(p)) return 'file://' + origen;
  const alfa = /logo|apple-touch/.test(p);
  const destino = path.join(CACHE, p.replace(/[\/]/g, '__').replace(/\.\w+$/, '') + '-' + ancho + (alfa ? '.png' : '.jpg'));
  if (!fs.existsSync(destino)) {
    fs.mkdirSync(CACHE, { recursive: true });
    const args = ['-v', 'error', '-y', '-i', origen, '-vf', `scale='min(${ancho},iw)':-2`];
    if (!alfa) args.push('-q:v', '4');
    execFileSync('ffmpeg', [...args, destino]);
  }
  return 'file://' + destino;
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Página de 1280x720 con encabezado (logo + sección) y pie con número.
function marco(num, seccion, cuerpo, clase = '') {
  return `<section class="pg ${clase}" id="p-${num}">
    <div class="fondo"></div>
    <header class="top"><img class="mini" src="${a('logo-lg.webp', 200)}" alt=""><span class="firma">Rubén Rivera</span><span class="sec">${esc(seccion)}</span></header>
    ${cuerpo}
    <footer class="pie"><span>NotMan · Rubén Rivera · Querétaro, Mexico</span><span>notmanrivera.com</span><span class="n">${String(num).padStart(2, '0')}</span></footer>
  </section>`;
}


// El logo en vector (fuente/logo-vector.svg): contorno para la página de
// construcción y relleno sólido para la versión a una tinta.
function svgsDelLogo() {
  const crudo = fs.readFileSync(path.join(RAIZ, 'fuente', 'logo-vector.svg'), 'utf8');
  const rutas = (crudo.match(/<path[^>]*\/>/g) || []).map((p) => p.replace(/\s(class|style|fill|stroke)="[^"]*"/g, ''));
  const caja = 'viewBox="0 0 945 520" xmlns="http://www.w3.org/2000/svg"';
  return {
    linea: `<svg ${caja}><g fill="none" stroke="#fff" stroke-width="2.2">${rutas.join('')}</g></svg>`,
    solido: `<svg ${caja}><g fill="#fff">${rutas.join('')}</g></svg>`,
    rutas,
  };
}


// Colores y tipografías del sitio (public/index.html), página de 1280x720.
const CSS_BASE = `
@font-face{font-family:"Kenyan Coffee";src:url("${a('kenyan-coffee.woff2')}") format("woff2");font-style:italic}
@font-face{font-family:"Monument Extended";src:url("${a('monument-black.woff2')}") format("woff2");font-weight:900}
@font-face{font-family:"Monument Extended";src:url("${a('monument-light.woff2')}") format("woff2");font-weight:300}
:root{--ink:#000;--violet:#8B3FFF;--violet-hi:#A96BFF;--violet-deep:#4A1391;--rojo:#E50012;--paper:#fff;--muted:#A99CC4;--line:#33204f;
  --disp:"Kenyan Coffee",Impact,sans-serif;--ui:"Monument Extended","Arial Black",sans-serif;--body:"Inter",sans-serif}
@page{size:1280px 720px;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#000;color:var(--paper);font-family:var(--body);-webkit-print-color-adjust:exact;print-color-adjust:exact}
a{color:inherit;text-decoration:none}
.pg{width:1280px;height:720px;position:relative;overflow:hidden;page-break-after:always;break-after:page;background:#000;padding:84px 64px 64px}
.fondo{position:absolute;inset:0;z-index:0;
  background:radial-gradient(ellipse 60% 70% at 85% 30%,rgba(74,19,145,.55),transparent 70%),
    linear-gradient(118deg,transparent 0 58%,rgba(43,10,82,.55) 58% 100%),
    radial-gradient(rgba(169,107,255,.09) 1px,transparent 1.2px) 0 0/7px 7px}
.pg>*:not(.fondo){position:relative;z-index:1}
.top{position:absolute!important;top:24px;left:64px;right:64px;display:flex;align-items:center;gap:14px;border-bottom:1px solid var(--line);padding-bottom:12px}
.top .mini{height:28px}
.top .firma{font-family:var(--disp);font-size:20px;letter-spacing:.02em;text-transform:uppercase;border-left:2px solid var(--violet);padding-left:12px}
.top .sec{margin-left:auto;font-family:var(--ui);font-weight:900;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--muted)}
.pie{position:absolute!important;bottom:20px;left:64px;right:64px;display:flex;gap:28px;font-family:var(--ui);font-size:8px;font-weight:300;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.pie .n{margin-left:auto;color:var(--paper);font-weight:900;border-top:3px solid var(--rojo);padding-top:4px}
.kicker{font-family:var(--ui);font-weight:900;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--violet-hi);margin-bottom:12px}
.kicker.mt{margin-top:18px}
h1{font-family:var(--disp);font-weight:400;font-size:74px;line-height:.88;text-transform:uppercase;margin-bottom:10px}
h2{font-family:var(--disp);font-weight:400;font-size:44px;line-height:.92;text-transform:uppercase;margin-bottom:14px}
h3{font-family:var(--ui);font-weight:900;font-size:13px;letter-spacing:.06em;text-transform:uppercase;margin:6px 0 8px}
p{font-size:13.5px;line-height:1.5;color:#d9d2e8;margin-bottom:10px}
p b{color:#fff}
.sub{font-family:var(--ui);font-weight:900;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#fff;margin-bottom:16px;border-left:3px solid var(--rojo);padding-left:10px}
.lead{font-size:17px;line-height:1.5;color:#eee}
`;

// Imprime una lista de páginas HTML a PDF en salida/<nombre>.pdf.
async function aPdf(navegador, nombre, paginas, css, { conHtml = false, titulo = 'NotMan' } = {}) {
  fs.mkdirSync(SALIDA, { recursive: true });
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(titulo)}</title><style>${CSS_BASE}${css}</style></head><body>${paginas.join('\n')}</body></html>`;
  const archivoHtml = path.join(SALIDA, nombre + '.html');
  fs.writeFileSync(archivoHtml, html);
  const pagina = await navegador.newPage({ viewport: { width: 1280, height: 720 } });
  await pagina.goto('file://' + archivoHtml, { waitUntil: 'load' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(300);
  await pagina.pdf({ path: path.join(SALIDA, nombre + '.pdf'), width: '1280px', height: '720px', printBackground: true, preferCSSPageSize: true });
  await pagina.close();
  if (!conHtml) fs.unlinkSync(archivoHtml);
}

module.exports = { DIR, RAIZ, PUB, SALIDA, SITIO, a, esc, marco, svgsDelLogo, CSS_BASE, aPdf };
