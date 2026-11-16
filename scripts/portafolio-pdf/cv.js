// CV 2026 de Rubén, en el formato del "CV 2025" de Figma (archivo
// "Cotizaciones"): 1920x1080, tarjetas de vidrio sobre brillo morado con
// grano, nombre en Monument Extended y el lockup 2K26 CURRICULUM VITAE.
// Sale en inglés y en español, con ligas y QR al portafolio.
//
//   NODE_PATH="$NODE_PATH:/tmp/claude-0/pdf/node_modules" node scripts/portafolio-pdf/cv.js [--html]
//
// PDF y PNG en scripts/portafolio-pdf/salida/CV-Ruben-Rivera-2026-EN/ES.*
// Los datos salen del CV 2025 y del sitio, más ZLM (Zero Limits Marketing),
// que Rubén agregó para 2026.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const QRCode = require('qrcode');
const { SALIDA, SITIO, a, esc } = require('./comun');

const conHtml = process.argv.includes('--html');
const utm = (ruta, idioma) => `${SITIO}${ruta}?utm_source=cv&utm_medium=pdf&utm_campaign=cv-2026&utm_content=${idioma}`;

const ROLES = {
  en: 'Social Media Designer / Web Designer<br>Video Editor / Animator',
  es: 'Diseñador de Redes / Diseñador Web<br>Editor de Video / Animador',
};

const TEXTOS = {
  en: {
    archivo: 'CV-Ruben-Rivera-2026-EN',
    cv: 'Curriculum Vitae',
    base: 'Querétaro, Mexico',
    rol: 'Designer · Animator · Web',
    edu: 'Education',
    estudios: [
      ['2011 - 2016', 'Universidad Autónoma de Querétaro', 'Faculty of Fine Arts', 'Graphic Design'],
      ['2017', 'Universidad Autónoma de Querétaro', 'Faculty of Political and Social Sciences', 'Diploma in Filmmaking'],
    ],
    casosT: 'Selected work',
    casos: [
      ['Al-Arabi SC', 'Matchday graphics system · Qatar', '/casos/al-arabi-sc/en/'],
      ['Hugo González', 'Personal branding · Mazatlán FC', '/casos/hugo-gonzalez/en/'],
      ["Women's football", 'Liga MX Femenil · Queens League', '/casos/futbol-femenil/en/'],
      ['The NotMan mark', 'Personal lettering', '/casos/notman/en/'],
    ],
    exp: 'Experience',
    trabajos: [
      ['Today', 'NotMan', 'Freelance', 'Motion Graphics / Video / Web Design'],
      ['2025-2026', 'ZLM · Zero Limits Marketing', '', ROLES.en],
      ['2024-2025', 'Victorem Sports Marketing', '', ROLES.en],
      ['2023-2024', 'Spice Studio', '', ROLES.en],
      ['2019-2022', 'Mosaico Media Makers', '', 'Web Designer / Video Editor / Animator'],
      ['2018', 'Part Design', '', 'Web Designer / Video Editor / Animator'],
      ['2017', 'Fábrica 108 Estudio', '', 'Designer / Video Editor / Animator'],
      ['2016', 'DopicVicel FA Studios', 'S.A.I.A. Short Film - EcoFilm Festival 2016', 'Graphics Designer'],
      ['2016', 'Ciudad y Poder · Reporte Querétaro', '', 'Social Media Designer'],
    ],
    skills: 'Skills',
    idioma: 'English (Language)',
    qr: 'Portfolio',
  },
  es: {
    archivo: 'CV-Ruben-Rivera-2026-ES',
    cv: 'Currículum Vitae',
    base: 'Querétaro, México',
    rol: 'Diseñador · Animador · Web',
    edu: 'Formación',
    estudios: [
      ['2011 - 2016', 'Universidad Autónoma de Querétaro', 'Facultad de Bellas Artes', 'Lic. en Diseño Gráfico'],
      ['2017', 'Universidad Autónoma de Querétaro', 'Facultad de Ciencias Políticas y Sociales', 'Diplomado en Cine'],
    ],
    casosT: 'Trabajo destacado',
    casos: [
      ['Al-Arabi SC', 'Gráficos de partido · Catar', '/casos/al-arabi-sc/'],
      ['Hugo González', 'Branding personal · Mazatlán FC', '/casos/hugo-gonzalez/'],
      ['Fútbol femenil', 'Liga MX Femenil · Queens League', '/casos/futbol-femenil/'],
      ['El logo de NotMan', 'Lettering personal', '/casos/notman/'],
    ],
    exp: 'Experiencia',
    trabajos: [
      ['Hoy', 'NotMan', 'Independiente', 'Motion Graphics / Video / Diseño Web'],
      ['2025-2026', 'ZLM · Zero Limits Marketing', '', ROLES.es],
      ['2024-2025', 'Victorem Sports Marketing', '', ROLES.es],
      ['2023-2024', 'Spice Studio', '', ROLES.es],
      ['2019-2022', 'Mosaico Media Makers', '', 'Diseñador Web / Editor de Video / Animador'],
      ['2018', 'Part Design', '', 'Diseñador Web / Editor de Video / Animador'],
      ['2017', 'Fábrica 108 Estudio', '', 'Diseñador / Editor de Video / Animador'],
      ['2016', 'DopicVicel FA Studios', 'Cortometraje S.A.I.A. - EcoFilm Festival 2016', 'Diseñador Gráfico'],
      ['2016', 'Ciudad y Poder · Reporte Querétaro', '', 'Diseñador de Redes Sociales'],
    ],
    skills: 'Habilidades',
    idioma: 'Inglés',
    qr: 'Portafolio',
  },
};

// Mismos niveles que publica el sitio en Perfil; el inglés, como en el CV 2025.
const herramientas = (t) => [['Adobe Photoshop', 100], ['Adobe Illustrator', 100], ['Adobe After Effects', 94],
  ['Adobe Premiere Pro', 90], ['Figma', 88], ['Adobe Lightroom', 82], [t.idioma, 90]];

// Grano del CV 2025, como un SVG de ruido en data URI.
const GRANO = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const CSS = `
@font-face{font-family:"Monument Extended";src:url("${a('monument-black.woff2')}") format("woff2");font-weight:900}
@font-face{font-family:"Monument Extended";src:url("${a('monument-light.woff2')}") format("woff2");font-weight:300}
@page{size:1920px 1080px;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#000;color:#fff;font-family:"Inter",sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
a{color:inherit;text-decoration:none}
:root{--ui:"Monument Extended","Arial Black",sans-serif;--violet:#8B3FFF;--violet-hi:#A96BFF}
.hoja{width:1920px;height:1080px;position:relative;overflow:hidden;background:#000}
.brillo{position:absolute;inset:0;
  background:radial-gradient(ellipse 40% 34% at 52% 28%,rgba(170,72,200,.95),transparent 74%),
    radial-gradient(ellipse 30% 38% at 22% 42%,rgba(160,64,185,.7),transparent 72%),
    radial-gradient(ellipse 24% 30% at 84% 46%,rgba(150,64,175,.55),transparent 72%),
    radial-gradient(ellipse 30% 30% at 22% 86%,rgba(120,110,130,.18),transparent 70%)}
.grano{position:absolute;inset:0;background:${GRANO};opacity:.16}
.hoja>.c{position:absolute}
.top{top:36px;left:60px;right:60px;display:flex;justify-content:space-between;font-size:17px;font-weight:300;color:#cfc8d8}
.top i{font-style:italic}
.dato{top:108px;left:67px;font-size:17px;font-weight:400;color:#e8e2f0;letter-spacing:.02em}
.dato b{font-weight:400;color:var(--violet-hi);margin:0 10px}
.nombre{top:156px;left:64px;font-family:var(--ui);font-weight:900;font-size:76px;line-height:1;letter-spacing:.01em;text-transform:uppercase;white-space:nowrap}
.nombre .hueco{color:transparent;-webkit-text-stroke:2px #fff;margin:0 .32em}
.regla{top:246px;left:67px;right:60px;height:2px;background:rgba(255,255,255,.55)}
.tarjeta{border-radius:32px;border:1.5px solid rgba(255,255,255,.38);background:linear-gradient(160deg,rgba(255,255,255,.08),rgba(255,255,255,.02) 55%,rgba(0,0,0,.18));
  padding:22px 30px 26px}
.tarjeta h2{font-size:20px;font-weight:400;margin-bottom:16px;display:flex;align-items:center}
.tarjeta h2::after{content:"";margin-left:auto;width:58px;height:10px;
  background:radial-gradient(circle at 5px 5px,rgba(255,255,255,.55) 4.6px,transparent 5px) 0 0/24px 10px repeat-x}
.edu{top:272px;left:67px;width:640px}
.edu .an{font-style:italic;font-weight:300;font-size:18px;color:#e8e2f0;margin:0 0 12px 44px}
.edu .bl{margin:0 0 16px 68px;font-style:italic;font-weight:300;font-size:18px;line-height:1.24;color:#e8e2f0}
.edu .bl b{font-weight:700;color:#fff}
.casos{top:606px;left:67px;width:640px}
.casos ul{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 0 14px}
.casos a{display:block;border:1px solid rgba(255,255,255,.22);border-radius:16px;padding:12px 16px;background:rgba(0,0,0,.18);position:relative}
.casos a::after{content:"↗";position:absolute;right:14px;top:10px;color:var(--violet-hi);font-size:16px}
.casos .t{font-weight:700;font-style:italic;font-size:17px}
.casos .d{font-weight:300;font-style:italic;font-size:14px;color:#d9d2e8;margin-top:3px}
.casos .qr{display:flex;align-items:center;gap:16px;margin:16px 0 0 14px;font-style:italic;font-weight:300;font-size:16px;color:#e8e2f0}
.casos .qr img{width:76px;height:76px;background:#fff;padding:4px;border-radius:6px}
.casos .qr b{display:block;font-style:normal;font-weight:700;color:var(--violet-hi);font-size:17px;margin-top:2px}
.exp{top:272px;left:760px;width:640px;height:700px}
.linea{position:relative;margin:0 0 0 56px}
.linea::before{content:"";position:absolute;left:0;top:10px;bottom:22px;width:1.5px;background:rgba(255,255,255,.4)}
.trab{display:grid;grid-template-columns:108px 1fr;padding-left:22px;position:relative;margin-bottom:12px;font-style:italic;font-size:18px;line-height:1.2}
.trab::before{content:"";position:absolute;left:-3.5px;top:8px;width:8px;height:8px;border-radius:50%;background:#fff}
.trab .an{font-weight:300;color:#e8e2f0}
.trab .lu{font-weight:300;color:#e8e2f0}
.trab .ro{font-weight:700;color:#fff}
.skills{top:272px;left:1451px;width:409px}
.skills ul{list-style:none;margin:0 14px 0 44px}
.skills li{font-style:italic;font-weight:300;font-size:18px;color:#e8e2f0;margin-bottom:21px}
.skills .barra{display:block;height:4px;border-radius:3px;background:rgba(255,255,255,.28);margin-top:9px;position:relative}
.skills .barra i{position:absolute;inset:0 auto 0 0;border-radius:3px;background:#fff}
.lockup{top:786px;left:1455px;width:400px;height:180px}
.lockup .k{position:absolute;left:0;top:0;font-family:var(--ui);font-weight:900;font-size:120px;line-height:1;color:transparent;-webkit-text-stroke:2.5px #fff;letter-spacing:-.01em}
.lockup .n{position:absolute;left:153px;top:66px;font-family:var(--ui);font-weight:900;font-size:120px;line-height:1;color:#fff;letter-spacing:-.01em}
.lockup .cv{position:absolute;left:0;top:116px;font-family:var(--ui);font-weight:900;font-size:15px;line-height:1.2;letter-spacing:.02em;text-transform:uppercase}
.lockup .cv i{display:inline-block;width:74px;height:10px;background:rgba(255,255,255,.55);border-radius:2px;margin-left:8px;vertical-align:-1px}
.pie{bottom:36px;right:60px;display:flex;gap:16px;align-items:center;font-size:18px;font-weight:300;color:#f0ecf5}
.pie b{font-weight:300;color:rgba(255,255,255,.7)}
`;

function pagina(t, idioma, qr) {
  const sep = '<b>•</b>';
  return `<section class="hoja">
    <div class="brillo"></div><div class="grano"></div>
    <div class="c top"><span>Rubén Núñez Rivera</span><span>2026</span><i>${esc(t.cv)}</i></div>
    <div class="c dato">${esc(t.base)}<b>/</b>${esc(t.rol)}</div>
    <h1 class="c nombre">Rubén<span class="hueco">Núñez</span>Rivera</h1>
    <div class="c regla"></div>

    <div class="c tarjeta edu"><h2>${esc(t.edu)}</h2>
      ${t.estudios.map(([an, u, f, ti]) => `<div class="an">${esc(an)}</div><div class="bl">${esc(u)}<br>${esc(f)}<br><b>${esc(ti)}</b></div>`).join('')}
    </div>

    <div class="c tarjeta casos"><h2>${esc(t.casosT)}</h2>
      <ul>${t.casos.map(([ti, d, ruta]) => `<li><a href="${utm(ruta, idioma)}"><div class="t">${esc(ti)}</div><div class="d">${esc(d)}</div></a></li>`).join('')}</ul>
      <a class="qr" href="${utm('/portfolio', idioma)}"><img src="${qr}" alt=""><span>${esc(t.qr)}<b>notmanrivera.com/portfolio</b></span></a>
    </div>

    <div class="c tarjeta exp"><h2>${esc(t.exp)}</h2>
      <div class="linea">${t.trabajos.map(([an, lugar, extra, rol]) => `<div class="trab"><span class="an">${esc(an)}</span><span><span class="lu">${esc(lugar)}</span>${extra ? `<br><span class="lu">${esc(extra)}</span>` : ''}<br><span class="ro">${rol}</span></span></div>`).join('')}</div>
    </div>

    <div class="c tarjeta skills"><h2>${esc(t.skills)}</h2>
      <ul>${herramientas(t).map(([n, v]) => `<li>${esc(n)}<span class="barra"><i style="width:${v}%"></i></span></li>`).join('')}</ul>
    </div>

    <div class="c lockup"><span class="k">2K</span><span class="n">26</span><span class="cv">Curriculum<br>Vitae<i></i></span></div>

    <div class="c pie">
      <a href="https://wa.me/524421411230">442 141 1230</a>${sep}
      <a href="mailto:hola@notmanrivera.com">hola@notmanrivera.com</a>${sep}
      <a href="${utm(idioma === 'en' ? '/en/' : '/', idioma)}">notmanrivera.com</a>${sep}
      <a href="https://www.instagram.com/notman.rivera">instagram.com/notman.rivera</a>${sep}
      <a href="https://www.behance.net/notmanrivera">behance.net/notmanrivera</a>
    </div>
  </section>`;
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const nav = await chromium.launch();
  for (const idioma of ['en', 'es']) {
    const t = TEXTOS[idioma];
    const qr = await QRCode.toDataURL(utm('/portfolio', idioma), { margin: 0, width: 300 });
    const html = `<!doctype html><html lang="${idioma}"><head><meta charset="utf-8"><title>Rubén Núñez Rivera · ${esc(t.cv)} 2026</title><style>${CSS}</style></head><body>${pagina(t, idioma, qr)}</body></html>`;
    const archivoHtml = path.join(SALIDA, t.archivo + '.html');
    fs.writeFileSync(archivoHtml, html);
    const p = await nav.newPage({ viewport: { width: 1920, height: 1080 } });
    await p.goto('file://' + archivoHtml, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    const medidas = await p.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const linea = r('.exp .linea'), exp = r('.exp');
      return { nombreDer: Math.round(r('.nombre').right), expSobra: Math.round(exp.bottom - linea.bottom), casosAbajo: Math.round(r('.casos').bottom), skillsAbajo: Math.round(r('.skills').bottom) };
    });
    console.log(idioma, medidas);
    await p.screenshot({ path: path.join(SALIDA, t.archivo + '.png') });
    await p.pdf({ path: path.join(SALIDA, t.archivo + '.pdf'), width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
    await p.close();
    if (!conHtml) fs.unlinkSync(archivoHtml);
  }
  await nav.close();
})();
