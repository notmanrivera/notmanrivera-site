// CV de Rubén con la imagen de notmanrivera.com: A4 vertical, una página,
// en inglés y en español, con ligas y QR al portafolio.
//
//   NODE_PATH=/tmp/claude-0/pdf/node_modules node scripts/portafolio-pdf/cv.js [--html]
//
// Sale en scripts/portafolio-pdf/salida/CV-Ruben-Rivera-EN.pdf y -ES.pdf.
// Los datos salen del CV 2025 de Figma (archivo "Cotizaciones", artboard
// "CV 2025") y del sitio; no se agregó nada que no esté en una de las dos.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const QRCode = require('qrcode');
const { SALIDA, SITIO, a, esc } = require('./comun');

const conHtml = process.argv.includes('--html');
const utm = (ruta, idioma) => `${SITIO}${ruta}?utm_source=cv&utm_medium=pdf&utm_campaign=cv-2026&utm_content=${idioma}`;

const TEXTOS = {
  en: {
    archivo: 'CV-Ruben-Rivera-EN',
    titulo: 'Rubén Núñez Rivera · CV',
    rol: 'Motion designer · Video editor · Web designer',
    linea: 'Sports marketing · 9 years in agencies',
    perfil: 'Designer and 2D/3D animator from Querétaro, Mexico, specialised in sports marketing. I build graphics <b>systems</b>, not one-off pieces: matchday templates, player branding and vertical video that a team can keep using all season. I design, animate, edit and build the website, end to end, in Spanish and English.',
    exp: 'Experience',
    trabajos: [
      {
        anios: '2025 – now', lugar: 'NotMan · Independent studio', rol: 'Motion graphics, video editing and web',
        puntos: ['Reels and animated pieces for sports marketing agencies, also as white-label support', 'Designed and built notmanrivera.com, bilingual, with its own lettering mark'],
      },
      {
        anios: '2024 – 2025', lugar: 'Victorem Sports Marketing', rol: 'Social media designer · Web designer · Video editor · Animator',
        puntos: ['Matchday graphics system for Al-Arabi SC (volleyball, Qatar) at the West Asian Clubs Championship 2024', 'Personal branding and a video for every key match of goalkeeper Hugo González (Mazatlán FC), Liga MX and Leagues Cup', 'Signing, presentation, matchday and goal pieces for Liga MX Femenil and Queens League Américas players'],
      },
      { anios: '2023 – 2024', lugar: 'Spice Studio', rol: 'Social media designer · Web designer · Video editor · Animator' },
      { anios: '2019 – 2022', lugar: 'Mosaico Media Makers', rol: 'Web designer · Video editor · Animator' },
      { anios: '2018', lugar: 'Part Design', rol: 'Web designer · Video editor · Animator' },
      { anios: '2017', lugar: 'Fábrica 108 Estudio', rol: 'Designer · Video editor · Animator' },
      { anios: '2016', lugar: 'DopicVicel FA Studios', rol: 'Graphic designer · S.A.I.A. short film, EcoFilm Festival 2016' },
      { anios: '2016', lugar: 'Ciudad y Poder · Reporte Querétaro', rol: 'Social media designer' },
    ],
    casosT: 'Selected work',
    casos: [
      ['Al-Arabi SC', 'Matchday system · Qatar', '/casos/al-arabi-sc/en/'],
      ['Hugo González', 'Player branding · Mazatlán FC', '/casos/hugo-gonzalez/en/'],
      ["Women's football", 'Liga MX Femenil · Queens League', '/casos/futbol-femenil/en/'],
      ['The NotMan mark', 'Personal lettering', '/casos/notman/en/'],
    ],
    herrT: 'Tools',
    hacerT: 'What I do',
    hacer: ['2D/3D motion graphics', 'Video editing', 'Template systems', 'Player branding', 'UI/UX web design', 'Lettering'],
    eduT: 'Education',
    edu: [
      ['2011 – 2016', 'BA in Graphic Design', 'Universidad Autónoma de Querétaro · Fine Arts'],
      ['2017', 'Diploma in Filmmaking', 'UAQ · Political and Social Sciences'],
    ],
    idiT: 'Languages',
    idi: [['Spanish', 'Native'], ['English', 'Professional']],
    qr: 'Full portfolio',
    base: 'Querétaro, Mexico · Remote',
  },
  es: {
    archivo: 'CV-Ruben-Rivera-ES',
    titulo: 'Rubén Núñez Rivera · CV',
    rol: 'Motion designer · Editor de video · Diseñador web',
    linea: 'Marketing deportivo · 9 años en agencias',
    perfil: 'Diseñador y animador 2D/3D de Querétaro, especializado en marketing deportivo. Hago <b>sistemas</b> gráficos, no piezas sueltas: plantillas de matchday, branding de jugadores y video vertical que un equipo puede seguir usando toda la temporada. Diseño, animo, edito y construyo el sitio web, de principio a fin, en español e inglés.',
    exp: 'Experiencia',
    trabajos: [
      {
        anios: '2025 – hoy', lugar: 'NotMan · Estudio independiente', rol: 'Motion graphics, edición de video y web',
        puntos: ['Reels y piezas animadas para agencias de marketing deportivo, también como soporte de marca blanca', 'Diseñé y construí notmanrivera.com, bilingüe, con un logo de lettering propio'],
      },
      {
        anios: '2024 – 2025', lugar: 'Victorem Sports Marketing', rol: 'Diseñador de redes · Diseñador web · Editor de video · Animador',
        puntos: ['Sistema de gráficos de partido para Al-Arabi SC (voleibol, Catar) en el West Asian Clubs Championship 2024', 'Branding personal y un video por cada partido clave del portero Hugo González (Mazatlán FC), Liga MX y Leagues Cup', 'Piezas de fichaje, presentación, matchday y gol para jugadoras de Liga MX Femenil y Queens League Américas'],
      },
      { anios: '2023 – 2024', lugar: 'Spice Studio', rol: 'Diseñador de redes · Diseñador web · Editor de video · Animador' },
      { anios: '2019 – 2022', lugar: 'Mosaico Media Makers', rol: 'Diseñador web · Editor de video · Animador' },
      { anios: '2018', lugar: 'Part Design', rol: 'Diseñador web · Editor de video · Animador' },
      { anios: '2017', lugar: 'Fábrica 108 Estudio', rol: 'Diseñador · Editor de video · Animador' },
      { anios: '2016', lugar: 'DopicVicel FA Studios', rol: 'Diseñador gráfico · Cortometraje S.A.I.A., EcoFilm Festival 2016' },
      { anios: '2016', lugar: 'Ciudad y Poder · Reporte Querétaro', rol: 'Diseñador de redes sociales' },
    ],
    casosT: 'Trabajo destacado',
    casos: [
      ['Al-Arabi SC', 'Sistema de matchday · Catar', '/casos/al-arabi-sc/'],
      ['Hugo González', 'Branding de jugador · Mazatlán FC', '/casos/hugo-gonzalez/'],
      ['Fútbol femenil', 'Liga MX Femenil · Queens League', '/casos/futbol-femenil/'],
      ['El logo de NotMan', 'Lettering personal', '/casos/notman/'],
    ],
    herrT: 'Herramientas',
    hacerT: 'Qué hago',
    hacer: ['Motion graphics 2D/3D', 'Edición de video', 'Sistemas de plantillas', 'Branding de jugadores', 'Diseño web UI/UX', 'Lettering'],
    eduT: 'Formación',
    edu: [
      ['2011 – 2016', 'Lic. en Diseño Gráfico', 'Universidad Autónoma de Querétaro · Bellas Artes'],
      ['2017', 'Diplomado en Cine', 'UAQ · Ciencias Políticas y Sociales'],
    ],
    idiT: 'Idiomas',
    idi: [['Español', 'Nativo'], ['Inglés', 'Profesional']],
    qr: 'Portafolio completo',
    base: 'Querétaro, México · Remoto',
  },
};

// Nivel de dominio, el mismo que publica el sitio en Perfil.
const HERRAMIENTAS = [['Photoshop', 100], ['Illustrator', 100], ['After Effects', 94], ['Premiere Pro', 90], ['Figma', 88], ['Lightroom', 82]];

const CSS = `
@font-face{font-family:"Kenyan Coffee";src:url("${a('kenyan-coffee.woff2')}") format("woff2")}
@font-face{font-family:"Monument Extended";src:url("${a('monument-black.woff2')}") format("woff2");font-weight:900}
@font-face{font-family:"Monument Extended";src:url("${a('monument-light.woff2')}") format("woff2");font-weight:300}
:root{--violet:#8B3FFF;--violet-hi:#A96BFF;--violet-deep:#4A1391;--rojo:#E50012;--muted:#A99CC4;--line:#33204f;
  --disp:"Kenyan Coffee",Impact,sans-serif;--ui:"Monument Extended","Arial Black",sans-serif;--body:"Inter",sans-serif}
@page{size:A4;margin:0}
.pt{font-family:var(--body);font-weight:700;color:var(--violet-hi);margin:0 2px}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#000;color:#fff;font-family:var(--body);-webkit-print-color-adjust:exact;print-color-adjust:exact}
a{color:inherit;text-decoration:none}
.hoja{width:210mm;height:297mm;position:relative;overflow:hidden;background:#000;padding:15mm 13mm 11mm}
.hoja>*{position:relative;z-index:1}
.fondo{position:absolute!important;inset:0;z-index:0!important;
  background:radial-gradient(ellipse 70% 38% at 88% 6%,rgba(139,63,255,.42),transparent 70%),
    radial-gradient(ellipse 60% 40% at -5% 100%,rgba(74,19,145,.45),transparent 70%),
    linear-gradient(118deg,transparent 0 64%,rgba(43,10,82,.35) 64% 100%),
    radial-gradient(rgba(169,107,255,.09) 1px,transparent 1.2px) 0 0/6px 6px}
.filo{position:absolute!important;top:0;left:0;right:0;height:5px;background:var(--rojo)}
.cab{display:grid;grid-template-columns:1fr auto;gap:8mm;align-items:end;padding-bottom:6mm;border-bottom:1px solid var(--line)}
.logo{height:58px;margin-bottom:4mm;display:block}
.nombre{font-family:var(--disp);font-weight:400;font-size:66px;line-height:.86;text-transform:uppercase;letter-spacing:.01em}
.nombre .hueco{color:transparent;-webkit-text-stroke:1.4px #fff}
.rol{font-family:var(--ui);font-weight:900;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;margin-top:4mm;border-left:3px solid var(--rojo);padding-left:8px}
.linea{font-family:var(--ui);font-weight:300;font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-top:2mm;padding-left:11px}
.contacto{list-style:none;text-align:right;font-size:10.5px;line-height:1.75;color:#e6e1ee}
.contacto b{color:#fff}
.contacto .v{color:var(--violet-hi);font-weight:700}
.perfil{font-size:11.3px;line-height:1.6;color:#e6e1ee;margin:5mm 0 5.5mm;max-width:178mm}
.perfil b{color:#fff}
.cols{display:grid;grid-template-columns:1.62fr 1fr;gap:8mm}
h2{font-family:var(--ui);font-weight:900;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--violet-hi);margin-bottom:3.2mm;display:flex;align-items:center;gap:8px}
h2::after{content:"";flex:1;height:1px;background:var(--line)}
.bloque+.bloque{margin-top:5.5mm}
.trab{display:grid;grid-template-columns:22mm 1fr;gap:3mm;padding:0 0 2.6mm 0;position:relative}
.trab .an{white-space:nowrap;font-family:var(--ui);font-weight:300;font-size:7px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding-top:2px}
.trab .lu{font-family:var(--disp);font-size:19px;line-height:1;text-transform:uppercase;letter-spacing:.02em}
.trab .lu small{font-family:var(--ui);font-weight:300;font-size:7.5px;letter-spacing:.14em;color:var(--muted);vertical-align:2px;margin-left:5px}
.trab .ro{font-size:9.6px;color:#d9d2e8;margin-top:1px}
.trab ul{list-style:none;margin-top:1.6mm}
.trab li{font-size:9.6px;line-height:1.45;color:#e6e1ee;padding-left:11px;position:relative;margin-bottom:.9mm}
.trab li::before{content:"";position:absolute;left:0;top:5px;width:5px;height:5px;background:var(--violet);transform:rotate(45deg)}
.trab.chico{padding-bottom:1.8mm}
.trab.chico .lu{font-size:16px}
.casos{list-style:none;display:grid;gap:2mm}
.casos a{display:block;border:1px solid var(--line);background:rgba(20,17,26,.7);padding:2.2mm 3mm;position:relative}
.casos a::after{content:"↗";position:absolute;right:3mm;top:2.2mm;color:var(--violet-hi);font-size:11px}
.casos .t{font-family:var(--disp);font-size:16px;line-height:1;text-transform:uppercase}
.casos .d{font-size:9px;color:var(--muted);margin-top:.6mm}
.herr{list-style:none}
.herr li{display:grid;grid-template-columns:24mm 1fr;align-items:center;gap:3mm;font-size:9.6px;margin-bottom:1.7mm;color:#e6e1ee}
.herr .barra{height:4px;background:#221b2e;position:relative}
.herr .barra i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,var(--violet-deep),var(--violet-hi))}
.tags{display:flex;flex-wrap:wrap;gap:1.6mm}
.tags span{font-size:8.8px;border:1px solid #4a3a66;padding:1mm 2mm;color:#e6e1ee}
.edu{list-style:none}
.edu li{margin-bottom:2.2mm}
.edu.dos{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.edu .an{font-family:var(--ui);font-weight:300;font-size:7.6px;letter-spacing:.1em;color:var(--muted)}
.edu .t{font-size:10.4px;font-weight:700;margin-top:.4mm}
.edu .d{font-size:9px;color:#d9d2e8}
.idi{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:2mm}
.idi li{font-size:10px}
.idi span{display:block;font-size:8.6px;color:var(--muted)}
.pie{position:absolute!important;left:13mm;right:13mm;bottom:9mm;display:flex;align-items:center;gap:4mm;border-top:1px solid var(--line);padding-top:3.5mm}
.pie img{width:17mm;height:17mm;background:#fff;padding:1mm}
.pie .q{font-family:var(--ui);font-weight:900;font-size:8.5px;letter-spacing:.18em;text-transform:uppercase}
.pie .q span{display:block;font-family:var(--body);font-weight:700;letter-spacing:0;text-transform:none;font-size:11px;color:var(--violet-hi);margin-top:1mm}
.pie .marca{margin-left:auto;font-family:var(--ui);font-weight:300;font-size:7.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);text-align:right;border-top:3px solid var(--rojo);padding-top:1.5mm}
`;

function pagina(t, idioma, qr) {
  const trabajos = t.trabajos.map((x) => `
    <div class="trab${x.puntos ? '' : ' chico'}">
      <div class="an">${esc(x.anios)}</div>
      <div><div class="lu">${esc(x.lugar.split(' · ')[0])}${x.lugar.includes(' · ') ? `<small>${esc(x.lugar.split(' · ')[1])}</small>` : ''}</div><div class="ro">${esc(x.rol)}</div>
      ${x.puntos ? `<ul>${x.puntos.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}</div>
    </div>`).join('');
  const casos = t.casos.map(([tit, d, ruta]) => `<li><a href="${utm(ruta, idioma)}"><div class="t">${esc(tit)}</div><div class="d">${esc(d)}</div></a></li>`).join('');
  const herr = HERRAMIENTAS.map(([n, v]) => `<li>${n}<span class="barra"><i style="width:${v}%"></i></span></li>`).join('');
  return `<section class="hoja">
    <div class="fondo"></div><div class="filo"></div>
    <header class="cab">
      <div>
        <img class="logo" src="${a('logo-lg.webp', 400)}" alt="The NotMan">
        <h1 class="nombre">Rubén <span class="hueco">Núñez</span> Rivera</h1>
        <div class="rol">${esc(t.rol)}</div>
        <div class="linea">${esc(t.linea).replace(' · ', ' <b class="pt">·</b> ')}</div>
      </div>
      <ul class="contacto">
        <li><a class="v" href="${utm('/' + (idioma === 'en' ? 'en/' : ''), idioma)}">notmanrivera.com</a></li>
        <li><a href="mailto:hola@notmanrivera.com"><b>hola@notmanrivera.com</b></a></li>
        <li><a href="https://wa.me/524421411230">+52 442 141 1230</a></li>
        <li>${esc(t.base)}</li>
        <li><a href="https://www.linkedin.com/in/rub%C3%A9n-n%C3%BA%C3%B1ez-rivera-485bb1142/">LinkedIn</a> · <a href="https://www.instagram.com/notman.rivera">Instagram</a> · <a href="https://www.behance.net/notmanrivera">Behance</a></li>
      </ul>
    </header>
    <p class="perfil">${t.perfil}</p>
    <div class="cols">
      <div><div class="bloque"><h2>${esc(t.exp)}</h2>${trabajos}</div>
        <div class="bloque"><h2>${esc(t.eduT)}</h2><ul class="edu dos">${t.edu.map(([an, ti, d]) => `<li><div class="an">${esc(an)}</div><div class="t">${esc(ti)}</div><div class="d">${esc(d)}</div></li>`).join('')}</ul></div></div>
      <div>
        <div class="bloque"><h2>${esc(t.casosT)}</h2><ul class="casos">${casos}</ul></div>
        <div class="bloque"><h2>${esc(t.herrT)}</h2><ul class="herr">${herr}</ul></div>
        <div class="bloque"><h2>${esc(t.hacerT)}</h2><div class="tags">${t.hacer.map((h) => `<span>${esc(h)}</span>`).join('')}</div></div>
        <div class="bloque"><h2>${esc(t.idiT)}</h2><ul class="idi">${t.idi.map(([l, n]) => `<li>${esc(l)}<span>${esc(n)}</span></li>`).join('')}</ul></div>
      </div>
    </div>
    <footer class="pie">
      <a href="${utm('/portfolio', idioma)}"><img src="${qr}" alt=""></a>
      <div class="q">${esc(t.qr)}<span><a href="${utm('/portfolio', idioma)}">notmanrivera.com/portfolio</a></span></div>
      <div class="marca">The NotMan <b class="pt">·</b> Rubén Núñez Rivera</div>
    </footer>
  </section>`;
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const nav = await chromium.launch();
  for (const idioma of ['en', 'es']) {
    const t = TEXTOS[idioma];
    const qr = await QRCode.toDataURL(utm('/portfolio', idioma), { margin: 0, width: 300, color: { dark: '#000000', light: '#ffffff' } });
    const html = `<!doctype html><html lang="${idioma}"><head><meta charset="utf-8"><title>${esc(t.titulo)}</title><style>${CSS}</style></head><body>${pagina(t, idioma, qr)}</body></html>`;
    const archivoHtml = path.join(SALIDA, t.archivo + '.html');
    fs.writeFileSync(archivoHtml, html);
    const p = await nav.newPage({ viewport: { width: 794, height: 1123 } });
    await p.goto('file://' + archivoHtml, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    const sobra = await p.evaluate(() => {
      const h = document.querySelector('.hoja'), pie = document.querySelector('.pie').getBoundingClientRect().top;
      const cols = document.querySelector('.cols').getBoundingClientRect().bottom;
      return { cols, pie, alto: h.scrollHeight };
    });
    console.log(idioma, sobra);
    await p.screenshot({ path: path.join(SALIDA, t.archivo + '.png'), fullPage: false });
    await p.pdf({ path: path.join(SALIDA, t.archivo + '.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
    await p.close();
    if (!conHtml) fs.unlinkSync(archivoHtml);
  }
  await nav.close();
})();
