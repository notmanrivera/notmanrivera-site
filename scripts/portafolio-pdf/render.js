#!/usr/bin/env node
// Genera el portafolio en PDF (inglés) a partir de los assets del sitio.
//
// No corre en el deploy -- se ejecuta a mano:
//   npm i --no-save playwright qrcode
//   node scripts/portafolio-pdf/render.js
// Deja cuatro PDFs en scripts/portafolio-pdf/salida/ (no versionada):
//   NotMan-Portfolio-Sports.pdf          versión deportiva, interactiva
//   NotMan-Portfolio-Sports-Print.pdf    versión deportiva, para imprimir (QR)
//   NotMan-Portfolio-General.pdf         versión general, interactiva
//   NotMan-Portfolio-General-Print.pdf   versión general, para imprimir (QR)
// Con --html también deja el HTML de cada una, para revisarlo en el navegador.
//
// Interactiva: índice con ligas internas, cada video abre el clip en el sitio
// y el contacto se puede tocar. Impresa: sin ligas; cada caso lleva un QR a
// su página y la portada/contacto un QR al sitio.
//
// Los textos salen de los casos del sitio (/casos/*/en/). Si un caso cambia
// allá, hay que cambiarlo aquí también. Nada de cifras ni clientes que no
// estén en el sitio.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const QR = require('qrcode');
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

// UTM para saber en Analytics cuántas visitas llegan desde el PDF.
function liga(ruta, v, medio) {
  const sep = ruta.includes('?') ? '&' : '?';
  return SITIO + ruta + sep + 'utm_source=portfolio&utm_medium=' + medio +
    '&utm_campaign=portfolio-2026&utm_content=' + v.id;
}

// ─────────────────────────────────────────────────────────────
//  Contenido
// ─────────────────────────────────────────────────────────────

const VIDEOS = {
  alGharafa: { src: 'video/alarabi-voleibol-al-gharafa', cap: 'Al-Arabi vs Al Gharafa', sub: 'Federation Hall' },
  alRayyan: { src: 'video/alarabi-voleibol-al-rayyan', cap: 'Al-Arabi vs Al Rayyan', sub: 'Matchday piece' },
  police: { src: 'video/alarabi-voleibol-police', cap: 'Al-Arabi vs Police', sub: 'Matchday piece' },
  hugoTij: { src: 'video/hugo-tijuana-mazatlan', cap: 'Tijuana vs Mazatlán', sub: 'Matchday 10 · Estadio Caliente' },
  hugoJua: { src: 'video/hugo-mazatlan-juarez', cap: 'Mazatlán vs Juárez', sub: 'Estadio El Encanto' },
  sub19: { src: 'video/femenil-sub19-atlas-chivas', cap: 'Atlas vs Guadalajara', sub: 'Liga MX Femenil U-19' },
  tigNec: { src: 'video/femenil-tigres-necaxa', cap: 'Tigres vs Necaxa', sub: 'Liga BBVA Femenil' },
  leonTig: { src: 'video/femenil-leon-tigres', cap: 'León vs Tigres', sub: 'Liga BBVA Femenil' },
  leonJua: { src: 'video/femenil-leon-juarez', cap: 'León vs Juárez', sub: 'Estadio León' },
  gol: { src: 'video/femenil-cruz-azul-gol', cap: 'Hanna Osorio · Goal', sub: 'Cruz Azul · reusable template' },
  queens: { src: 'video/femenil-queens-cuervos-galacticas', cap: 'Club de Cuervos vs Galácticas', sub: 'Queens League Américas' },
};

const G = (f, cap) => ({ img: 'galeria/' + f + '.webp', cap });

const AL_ARABI_FOTOS = [
  G('al-arabi-grupo', 'Group stage'), G('al-arabi-lineup', 'Line-up'),
  G('al-arabi-matchday', 'Next match'), G('alarabi-match-schedule', 'Full schedule'),
  G('alarabi-matchday1', 'Matchday 1 · vs Alsalam Club'), G('alarabi-matchday2', 'Matchday 2 · vs Qadsia SC'),
  G('alarabi-matchday3', 'Matchday 3 · vs Al Rayyan SC'), G('alarabi-matchday5', 'Matchday 5 · vs Alahli Club'),
];
const HUGO_FOTOS = [
  G('hugo-gonzalez-tijuana', 'Tijuana vs Mazatlán'), G('hugo-gonzalez-puebla', 'Mazatlán vs Puebla'),
  G('hugo-gonzalez-monterrey', 'Monterrey vs Mazatlán'), G('hugo-gonzalez-leagues-cup', 'Leagues Cup'),
  G('hugo-j2', 'Matchday 2 · El Encanto'), G('hugo-pachuca', 'Mazatlán vs Pachuca'),
  G('hugo-necaxa', 'Mazatlán vs Necaxa'), G('hugo-juarez', 'Juárez vs Mazatlán'),
  G('hugo-leagues-cup-2024', 'Leagues Cup 2024'),
];
const FEMENIL_FOTOS = [
  G('sub17-nayrobi-garcia', 'Nayrobi García · Signing'), G('nayrobi-garcia-debut', 'Nayrobi García · Top-flight debut'),
  G('andrea-velarde-firma', 'Andrea Velarde · First pro contract'), G('sub17-andrea-velarde', 'Andrea Velarde · Cruz Azul → Necaxa'),
  G('andrea-velarde-presentacion', 'Andrea Velarde · Presentation'), G('hanna-osorio', 'Hanna Osorio · Presentation'),
  G('devanny-carmona', 'Devanny Carmona · Presentation'), G('juana-schipper-argentina', 'Juana Schipper · Argentina'),
  G('carolyn-oreilly-transferencia', "Carolyn O'Reilly · Wellington → Fencibles"), G('karla-padilla-queens-league', 'Karla Padilla · Queens League'),
];
const JUGADORES_FOTOS = [
  G('juan-cuellar-leon', 'Juan Cuellar · Club León'), G('santiago-ulloa-firma', 'Santiago Ulloa · Signing'),
  G('christian-amparan', 'Christian Amparán · Presentation'), G('emiliano-montano', 'Emiliano Montaño · Presentation'),
];
const EXHIBICION_FOTOS = [
  G('promo-euro', 'UEFA Euro'), G('promo-cr7', 'Cristiano Ronaldo'), G('promo-champions', 'UEFA Champions League'),
];
const WEB = [
  { img: 'portafolio-web/moser-cafe-kultur.webp', t: 'Moser Café Kultur', y: '2019 · Jazz café', d: 'Website and social media kit for a café that doubles as a live jazz venue: coffee shop by day, venue by night.' },
  { img: 'portafolio-web/cafe-amadeus.webp', t: 'Café Amadeus', y: '2019 · Restaurant', d: 'Responsive website where the menu and location read fast on any screen.' },
  { img: 'portafolio-web/grupo-uno22.webp', t: 'Grupo Uno22', y: '2020 · Brand holding', d: 'Corporate site that makes clear what the group is and what each of its brands is.' },
  { img: 'portafolio-web/saxodia.webp', t: 'Saxodia', y: '2020 · Saxophone quartet', d: 'Website and app to book dates and showcase repertoire.' },
  { img: 'portafolio-web/v-dental.webp', t: 'V-Dental', y: '2021 · Dental supplies', d: 'Ecommerce and app: catalog, cart and checkout for B2B buyers.' },
  { img: 'portafolio-web/viterbo-68.webp', t: 'Viterbo 68', y: '2023 · Real estate', d: 'Website and app where every property’s photos and floor plans look good and load fast.' },
  { img: 'portafolio-web/incomodo.webp', t: 'Incómodo', y: '2023 · Creative studio', d: 'Web portfolio where the site itself is the piece on display.' },
];

const VARIANTES = [
  {
    id: 'sports', archivo: 'NotMan-Portfolio-Sports',
    titulo: 'Sports design & motion',
    bajada: 'Matchday graphics, athlete branding and motion for clubs, agencies and players.',
    paginas: ['portada', 'intro', 'alArabiA', 'alArabiB', 'hugoA', 'hugoB', 'femenilA', 'femenilB', 'femenilC', 'jugadores', 'letteringA', 'webCorta', 'perfil', 'contacto'],
  },
  {
    id: 'general', archivo: 'NotMan-Portfolio-General',
    titulo: 'Design × Animation × Web',
    bajada: 'Identity, lettering, motion graphics and web design, end to end.',
    paginas: ['portada', 'intro', 'letteringA', 'letteringB', 'hugoA', 'hugoB', 'webA', 'webB', 'alArabiA', 'alArabiB', 'femenilA', 'femenilB', 'jugadores', 'perfil', 'contacto'],
  },
];

// ─────────────────────────────────────────────────────────────
//  Piezas
// ─────────────────────────────────────────────────────────────

// Póster del video. Interactivo: liga al mp4 del sitio (abre y se reproduce en
// cualquier navegador). Impreso: sin liga, el QR del caso hace ese trabajo.
function video(v, ctx, alto) {
  const ancho = Math.round(alto * 9 / 16);
  const inner = `<div class="vid" style="width:${ancho}px;height:${alto}px">
      <img src="${a(v.src + '.webp', 700)}" alt="">
      <span class="play">${ctx.print ? '' : '<i></i>'}</span>
    </div>
    <div class="cap"><b>${esc(v.cap)}</b>${esc(v.sub)}</div>`;
  return ctx.print
    ? `<figure class="pieza" style="width:${ancho}px">${inner}</figure>`
    : `<a class="pieza" style="width:${ancho}px" href="${SITIO}/assets/${v.src}.mp4">${inner}</a>`;
}

function galeria(fotos, alto, extra = '') {
  return `<div class="gal ${extra}">${fotos.map((f) => `
    <figure class="foto"><img src="${a(f.img, 700)}" style="height:${alto}px" alt=""><figcaption>${esc(f.cap)}</figcaption></figure>`).join('')}
  </div>`;
}

// Botón al caso completo (interactivo) o QR al caso (impreso).
function alCaso(ruta, ctx, texto = 'Full case study') {
  if (ctx.print) {
    return `<div class="qr-caso">${ctx.qr[ruta]}<span>Scan for the full case<br>and the videos in motion<br><b>${esc((SITIO + ruta).replace('https://', ''))}</b></span></div>`;
  }
  return `<a class="boton" href="${liga(ruta, ctx.v, 'pdf')}">${esc(texto)} →</a>`;
}

function marco(ctx, num, seccion, cuerpo, clase = '') {
  return `<section class="pg ${clase}" id="p-${num}">
    <div class="fondo"></div>
    <header class="top"><img class="mini" src="${a('logo-lg.webp', 200)}" alt=""><span class="firma">Rubén Rivera</span><span class="sec">${esc(seccion)}</span></header>
    ${cuerpo}
    <footer class="pie"><span>NotMan · Rubén Rivera · Querétaro, Mexico</span><span>notmanrivera.com</span><span class="n">${String(num).padStart(2, '0')}</span></footer>
  </section>`;
}

function caso(ctx, { kicker, titulo, sub, parrafos, videos, ruta, altoVideo = 470 }) {
  return `<div class="caso">
    <div class="texto">
      <p class="kicker">${kicker}</p>
      <h1>${titulo}</h1>
      <p class="sub">${sub}</p>
      ${parrafos.map((p) => `<p>${p}</p>`).join('')}
      ${alCaso(ruta, ctx)}
    </div>
    <div class="videos">${videos.map((v) => video(VIDEOS[v], ctx, altoVideo)).join('')}</div>
  </div>`;
}

const ROL_VICTOREM = '<b>My role:</b> design, compositing and animation, end to end. Every piece was produced by me; the work shipped under the name of Victorem Sports Marketing, the agency I was with at the time.';

// ─────────────────────────────────────────────────────────────
//  Páginas
// ─────────────────────────────────────────────────────────────

const PAGINAS = {
  portada(ctx) {
    const v = ctx.v;
    return `<section class="pg portada" id="p-1">
      <div class="fondo"></div>
      <p class="kicker arriba">Portfolio 2026 · Rubén Rivera · Querétaro, Mexico</p>
      <img class="logo-portada" src="${a('logo-lg.webp')}" alt="NotMan">
      <div class="tag-rojo"><span>${esc(v.titulo)}</span></div>
      <p class="bajada">${esc(v.bajada)}</p>
      <div class="datos">
        <div class="dato rojo"><b>9+</b><span>years in agencies</span></div>
        <div class="dato rojo"><b>2D / 3D</b><span>motion graphics</span></div>
        <div class="dato"><b>MX · ES · MENA</b><span>markets</span></div>
      </div>
      <div class="contacto-portada">
        ${ctx.print ? `<div class="qr-mini">${ctx.qr['/en/']}</div>` : ''}
        <div>${enlace(ctx, 'mailto:hola@notmanrivera.com', 'hola@notmanrivera.com')}<br>${enlace(ctx, liga('/en/', v, ctx.print ? 'print' : 'pdf'), 'notmanrivera.com')} · ${enlace(ctx, 'https://wa.me/524421411230', 'WhatsApp +52 442 141 1230')}</div>
      </div>
    </section>`;
  },

  intro(ctx) {
    const dep = ctx.v.id === 'sports';
    const servicios = dep ? [
      ['2D/3D motion graphics', 'Animated ads, player intros, broadcast graphics packages and vertical pieces for Reels and TikTok.'],
      ['Sports video editing', 'Ad reels, matchday content, athlete highlights and video case studies that turn results into a story.'],
      ['Web design UI/UX', 'Interactive landing pages and media kits, so the digital presence matches the talent you represent.'],
      ['White-label support', 'External ally for agencies: I absorb workload peaks without you raising fixed costs or over-hiring.'],
    ] : [
      ['Identity & lettering', 'Logos, custom lettering and visual systems that hold up across every touchpoint, plus art direction.'],
      ['2D/3D motion graphics', 'Animated identities, ads, intros and vertical pieces for Reels and TikTok (After Effects, Blender).'],
      ['Video editing', 'Ad reels, social content, highlights and video case studies that turn results into a story.'],
      ['Web design UI/UX', 'Sites designed and built end to end, from structure and layout to implementation.'],
    ];
    const indice = ctx.v.paginas.map((p, i) => [p, i + 1]).filter(([p]) => INDICE[p]);
    return marco(ctx, ctx.n, '01 · Profile', `
      <div class="intro">
        <div class="texto">
          <p class="kicker">${dep ? 'Sports marketing specialist' : 'Graphic designer · Motion designer · Web'}</p>
          <h1>${dep ? 'The tactical backup<br>your agency needs' : 'Design, animation<br>and web, end to end'}</h1>
          <p class="lead">${dep
            ? '9+ years designing and animating for agencies, elite players and their representatives. When your team runs out of capacity or time, I step in: motion graphics, video and web design, ready for deployment.'
            : 'I’m Rubén Rivera, a designer and animator based in Querétaro, Mexico, with 9+ years across 7 studios and agencies. I build identities, set them in motion and put them online: from my own lettered mark to season-long graphics systems and working ecommerce sites.'}</p>
          <div class="indice"><p class="kicker">Inside</p>${indice.map(([p, n]) => ctx.print
            ? `<span><i>${String(n).padStart(2, '0')}</i>${INDICE[p]}</span>`
            : `<a href="#p-${n}"><i>${String(n).padStart(2, '0')}</i>${INDICE[p]}</a>`).join('')}</div>
        </div>
        <div class="servicios">${servicios.map(([t, d], i) => `
          <div class="svc"><span class="num">0${i + 1}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}
        </div>
      </div>`);
  },

  alArabiA(ctx) {
    return marco(ctx, ctx.n, 'Case study · Motion graphics', caso(ctx, {
      kicker: '2D/3D motion graphics · while at Victorem Sports Marketing',
      titulo: 'Al-Arabi SC',
      sub: 'A matchday graphics system for a volleyball team in Qatar',
      parrafos: [
        'Al-Arabi Sports Club is a multi-sport club in Qatar; the brief was for its volleyball team at the West Asian Clubs Championship 2024. Not a one-off piece, but a reusable system the club’s content team could feed match after match without the identity drifting.',
        '<b>What it covers:</b> starting lineup, next-opponent announcement, the full group-stage schedule and matchday graphics against Alsalam Club, Qadsia SC, Al Rayyan SC and Alahli Club, plus one animated video per match.',
        ROL_VICTOREM,
        '<b>The bar:</b> not “good for volleyball”, but holding its own in the same feed as the biggest leagues in the world.',
      ],
      videos: ['alGharafa', 'alRayyan'],
      ruta: '/casos/al-arabi-sc/en/',
    }));
  },
  alArabiB(ctx) {
    return marco(ctx, ctx.n, 'Al-Arabi SC · The system', `
      <div class="galeria-pagina"><p class="kicker">Same skeleton, every matchday · opponent, venue and date change</p>
      ${galeria(AL_ARABI_FOTOS, 262, 'max4')}</div>`);
  },

  hugoA(ctx) {
    return marco(ctx, ctx.n, 'Case study · Athlete branding', caso(ctx, {
      kicker: 'Sports branding · while at Victorem Sports Marketing',
      titulo: 'Hugo González',
      sub: 'Digital image for a professional goalkeeper',
      parrafos: [
        'Personal social media branding for the Mazatlán FC goalkeeper during his time at the club: the player’s own brand, not official club content, timed to every relevant match of the season in Liga MX and Leagues Cup.',
        '<b>Match by match:</b> his presence in the game, the result, a recap. The same pattern against Tijuana, Puebla, Monterrey, Pachuca, Necaxa and Juárez, plus two editions of Leagues Cup. One animated video for every significant match.',
        ROL_VICTOREM,
        '<b>Why it matters:</b> a player’s personal brand is part of their commercial value. Sustaining it, match after match, is the work.',
      ],
      videos: ['hugoTij', 'hugoJua'],
      ruta: '/casos/hugo-gonzalez/en/',
    }));
  },
  hugoB(ctx) {
    return marco(ctx, ctx.n, 'Hugo González · Season', `
      <div class="galeria-pagina"><p class="kicker">One identity across a Liga MX season and Leagues Cup</p>
      ${galeria(HUGO_FOTOS, 262, 'apretada max5')}</div>`);
  },

  femenilA(ctx) {
    return marco(ctx, ctx.n, 'Case study · Women’s football', caso(ctx, {
      kicker: '2D/3D motion graphics · while at Victorem Sports Marketing',
      titulo: 'Women’s football',
      sub: 'Pieces that follow a career, not a campaign',
      parrafos: [
        'Signings, presentations, matchday and goal graphics for players in Liga MX Femenil, its Under-19 category and Queens League Américas. Some players were followed for years, from a first contract to a top-flight debut.',
        '<b>The four moments a club communicates:</b> the signing, the presentation with the new badge, the matchday and the goal. The goal piece is a reusable template: swap name and photo and it goes out the same night.',
        ROL_VICTOREM,
        '<b>Register:</b> Queens League called for black and gold. Knowing when not to apply your own template is part of the craft.',
      ],
      videos: ['sub19', 'gol'],
      ruta: '/casos/futbol-femenil/en/',
    }));
  },
  femenilB(ctx) {
    return marco(ctx, ctx.n, 'Women’s football · Players', `
      <div class="galeria-pagina"><p class="kicker">Liga MX Femenil · U-19 · Queens League Américas · Argentina · New Zealand</p>
      ${galeria(FEMENIL_FOTOS, 236)}</div>`);
  },
  femenilC(ctx) {
    return marco(ctx, ctx.n, 'Women’s football · In motion', `
      <div class="fila-videos">
        <div class="texto angosto">
          <p class="kicker">In motion</p>
          <h2>Five clubs, three competitions, two divisions</h2>
          <p>Complete pieces as they went out on social, with their audio and pacing.${ctx.print ? '' : ' Tap any of them to watch.'}</p>
          <p><b>One career in three chapters:</b> Nayrobi García appears at her signing, on a U-19 matchday with Guadalajara and at her top-flight debut. Each piece had to look like part of the same story, even with seasons and a change of club in between.</p>
        </div>
        <div class="videos">${['tigNec', 'leonTig', 'leonJua', 'queens'].map((k) => video(VIDEOS[k], ctx, 340)).join('')}</div>
      </div>`);
  },

  jugadores(ctx) {
    return marco(ctx, ctx.n, 'More sports work', `
      <div class="dos-bloques">
        <div><p class="kicker">Players · signings and presentations</p>${galeria(JUGADORES_FOTOS, 232)}</div>
        <div><p class="kicker">Showcase pieces · Victorem, no end client</p>${galeria(EXHIBICION_FOTOS, 232)}
          <p class="nota">Self-initiated showcase work, not commissioned by UEFA or the player.</p></div>
      </div>`);
  },

  letteringA(ctx) {
    const corta = ctx.v.id === 'sports';
    return marco(ctx, ctx.n, 'Self-initiated · Lettering', `
      <div class="lettering">
        <div class="texto">
          <p class="kicker">Personal project · Custom lettering</p>
          <h1>The NotMan mark</h1>
          <p class="sub">My own logo, built letter by letter</p>
          <p>The NotMan logo is a personal lettering project and the core of my own identity. It reads <b>THE NOTMAN</b>: nine letters drawn as individual shapes and interlocked into a single block, with the T’s crossbar sweeping over the whole word.</p>
          <p>Everything else in my brand grows from it: the chrome finish, the violet and red palette, the website, the email signature and this portfolio.</p>
          ${corta ? '<p>It’s the same skill that goes into a club’s matchday system: one strong idea, built to repeat everywhere without losing its shape.</p>' : '<p>On the next page: the construction and how the mark adapts to different backgrounds and sizes.</p>'}
        </div>
        <div class="logo-grande"><img src="${a('logo-lg.webp')}" alt="">
          ${corta ? `<div class="variantes-mini"><div class="v negro"><img src="${a('logo-lg.webp', 400)}"></div><div class="v morado"><img src="${a('logo-morado.webp', 400)}"></div><div class="v linea">${ctx.svgLinea}</div></div>` : ''}
        </div>
      </div>`, 'pg-lettering');
  },
  letteringB(ctx) {
    return marco(ctx, ctx.n, 'The NotMan mark · Construction', `
      <div class="construccion">
        <div class="trazo">${ctx.svgLinea}<p class="kicker">Vector construction · 9 shapes, one per letter</p></div>
        <div class="col">
          <div class="v negro"><img src="${a('logo-lg.webp', 500)}"><span>Chrome on black · primary</span></div>
          <div class="v morado"><img src="${a('logo-morado.webp', 500)}"><span>Gradient version</span></div>
          <div class="v blanco">${ctx.svgSolido}<span>One color</span></div>
          <div class="v chico"><img src="${a('apple-touch-icon.png', 180)}" style="width:64px"><img src="${a('apple-touch-icon.png', 180)}" style="width:32px"><span>Small sizes · app icon and favicon</span></div>
        </div>
      </div>`, 'pg-lettering');
  },

  webA(ctx) {
    const [m, u, v] = [WEB[0], WEB[2], WEB[4]];
    return marco(ctx, ctx.n, 'Case study · Web design', `
      <div class="web">
        <div class="texto">
          <p class="kicker">UI/UX web design · design and development</p>
          <h1>Six industries, one standard</h1>
          <p>Web design isn’t a template you repeat: every industry solves different problems, while the visual and usability standard stays the same.</p>
          <p><b>My role:</b> design and development end to end, working directly with each client: structure, visual identity, layout and implementation, across seven sites.</p>
          ${alCaso('/casos/diseno-web/en/', ctx)}
        </div>
        <div class="sitios tres">${[m, u, v].map(sitio).join('')}</div>
      </div>`);
  },
  webB(ctx) {
    return marco(ctx, ctx.n, 'Web design · More sites', `
      <div class="sitios cuatro">${[WEB[1], WEB[3], WEB[5], WEB[6]].map(sitio).join('')}</div>`);
  },
  webCorta(ctx) {
    return marco(ctx, ctx.n, 'Web design', `
      <div class="web">
        <div class="texto">
          <p class="kicker">UI/UX web design · design and development</p>
          <h1>Beyond matchday: the web</h1>
          <p>I also design and build sites end to end: seven projects across six industries, from an ecommerce with B2B checkout to a real estate developer and a creative studio.</p>
          <p>For sports clients that means landing pages and media kits that match the level of the talent they represent.</p>
          ${alCaso('/casos/diseno-web/en/', ctx)}
        </div>
        <div class="sitios cuatro chico">${[WEB[4], WEB[5], WEB[2], WEB[0]].map(sitio).join('')}</div>
      </div>`);
  },

  perfil(ctx) {
    const herramientas = [['Photoshop', 100], ['Illustrator', 100], ['After Effects', 94], ['Premiere Pro', 90], ['Figma', 88], ['Lightroom', 82]];
    return marco(ctx, ctx.n, 'Profile', `
      <div class="perfil">
        <div class="col">
          <p class="kicker">Track record</p>
          <h2>9 years · 7 studios and agencies</h2>
          <p>Agency experience specialized in sports at <b>Victorem Sports Marketing</b>: matchday systems for Al-Arabi SC (Qatar), the digital image of goalkeeper Hugo González (Mazatlán FC) and players across Liga MX Femenil and Queens League Américas.</p>
          <p class="kicker mt">Education</p>
          <p><b>BA in Graphic Design</b><br>Universidad Autónoma de Querétaro · Fine Arts · 2011–2016</p>
          <p><b>Diploma in Filmmaking</b><br>UAQ · Political and Social Sciences · 2017</p>
          <p class="kicker mt">Based in</p>
          <p>Querétaro, Mexico · Native Spanish · Professional English · Remote, used to working across time zones</p>
        </div>
        <div class="col">
          <p class="kicker">Toolkit</p>
          ${herramientas.map(([h, n]) => `<div class="barra"><span>${h}</span><i style="--n:${n}%"></i><b>${n}</b></div>`).join('')}
          <p class="otros">Also: Blender (3D), WordPress, Elementor, HTML/CSS</p>
          <blockquote>“Rubén is a very talented and creative designer. He masters every Adobe tool. He takes initiative and is very responsible. The results always exceeded expectations.”
            <cite>Victor Trejo · Managing Director, Victorem<em>Translated from the Spanish original</em></cite></blockquote>
        </div>
      </div>`);
  },

  contacto(ctx) {
    const v = ctx.v;
    const medio = ctx.print ? 'print' : 'pdf';
    return marco(ctx, ctx.n, 'Contact', `
      <div class="contacto">
        <div>
          <p class="kicker">${v.id === 'sports' ? 'Clubs, agencies, representatives and players' : 'Studios, agencies and brands'}</p>
          <h1 class="enorme">Let’s work<br>together</h1>
          <p class="lead">Available for projects, white-label support and remote roles.</p>
        </div>
        <div class="canales">
          <p>${enlace(ctx, 'mailto:hola@notmanrivera.com', 'hola@notmanrivera.com')}</p>
          <p>${enlace(ctx, 'https://wa.me/524421411230', 'WhatsApp +52 442 141 1230')}</p>
          <p>${enlace(ctx, liga('/en/', v, medio), 'notmanrivera.com')}</p>
          <p class="redes">${enlace(ctx, 'https://www.linkedin.com/in/rub%C3%A9n-n%C3%BA%C3%B1ez-rivera-485bb1142/', 'LinkedIn')} / ${enlace(ctx, 'https://www.behance.net/notmanrivera', 'Behance')} / ${enlace(ctx, 'https://www.instagram.com/notman.rivera', 'Instagram')}</p>
          ${ctx.print ? `<div class="qr-grande">${ctx.qr['/en/']}<span>notmanrivera.com/en</span></div>` : ''}
        </div>
      </div>`, 'pg-contacto');
  },
};

const INDICE = {
  letteringA: 'The NotMan mark', hugoA: 'Hugo González', webA: 'Web design', webCorta: 'Web design',
  alArabiA: 'Al-Arabi SC', femenilA: 'Women’s football', jugadores: 'More sports work', perfil: 'Profile', contacto: 'Contact',
};

function sitio(w) {
  return `<figure class="sitio"><img src="${a(w.img, 1000)}" alt=""><figcaption><b>${esc(w.t)}</b><em>${esc(w.y)}</em>${esc(w.d)}</figcaption></figure>`;
}

function enlace(ctx, href, texto) {
  return ctx.print ? `<span class="enl">${esc(texto)}</span>` : `<a class="enl" href="${esc(href)}">${esc(texto)}</a>`;
}

// ─────────────────────────────────────────────────────────────
//  Estilos (mismos colores y tipografías que el sitio)
// ─────────────────────────────────────────────────────────────

const CSS = `
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
.boton{display:inline-block;margin-top:10px;background:var(--rojo);color:#fff;font-family:var(--disp);font-size:22px;text-transform:uppercase;padding:8px 18px 6px;transform:rotate(-2deg)}
.qr-caso{display:flex;gap:14px;align-items:center;margin-top:10px}
.qr-caso svg{width:92px;height:92px;background:#fff;padding:4px}
.qr-caso span{font-size:11px;line-height:1.4;color:var(--muted)}
.qr-caso b{color:#fff;font-weight:600}

/* Portada */
.portada{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 64px}
.portada .arriba{position:absolute!important;top:40px;border:2px solid #fff;padding:7px 14px 6px;transform:rotate(-2deg);color:#fff}
.logo-portada{width:560px;margin-top:10px}
.portada::after{content:'';position:absolute;left:50%;top:44%;width:760px;height:420px;margin:-210px 0 0 -380px;background:radial-gradient(ellipse at center,rgba(139,63,255,.38),transparent 65%);z-index:0}
.tag-rojo{background:var(--rojo);transform:rotate(-3deg);padding:8px 28px 4px;margin-top:-26px}
.tag-rojo span{font-family:var(--disp);font-size:46px;text-transform:uppercase;letter-spacing:.01em}
.bajada{font-size:16px;color:#ddd;margin:22px 0 22px;text-align:center}
.datos{display:flex;gap:14px}
.dato{border:2px solid #fff;padding:10px 16px;min-width:170px;transform:rotate(-1deg)}
.dato.rojo{background:var(--rojo);border-color:var(--rojo)}
.dato b{display:block;font-family:var(--disp);font-size:26px;font-weight:400}
.dato span{font-family:var(--ui);font-size:8px;letter-spacing:.18em;text-transform:uppercase}
.contacto-portada{position:absolute!important;bottom:34px;display:flex;gap:16px;align-items:center;font-family:var(--ui);font-size:10px;letter-spacing:.12em;text-transform:uppercase;line-height:1.9;text-align:center}
.qr-mini svg{width:60px;height:60px;background:#fff;padding:3px}

/* Intro */
.intro{display:grid;grid-template-columns:1fr 1fr;gap:56px;height:100%;align-items:center}
.indice{margin-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:4px 24px}
.indice a,.indice span{font-family:var(--ui);font-weight:900;font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:6px 0;border-bottom:1px solid var(--line)}
.indice i{font-style:normal;color:var(--rojo);margin-right:10px}
.servicios{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.svc{border:1px solid var(--line);background:rgba(10,4,20,.7);padding:18px 18px 10px}
.svc .num{font-family:var(--disp);font-size:30px;color:var(--rojo)}
.svc p{font-size:12.5px}

/* Caso: texto + videos */
.caso,.fila-videos{display:flex;gap:40px;height:100%;align-items:center}
.caso .texto{flex:0 0 560px}
.fila-videos .texto.angosto{flex:0 0 290px}
.fila-videos .videos{gap:16px}
.videos{display:flex;gap:20px;margin-left:auto}
.pieza{display:block}
.vid{position:relative;overflow:hidden;border:1px solid var(--line);background:#111}
.vid img{width:100%;height:100%;object-fit:cover;display:block}
.play i{position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;background:rgba(229,0,18,.92);box-shadow:0 6px 24px rgba(0,0,0,.5)}
.play i::after{content:"";position:absolute;left:26px;top:20px;border-left:20px solid #fff;border-top:12px solid transparent;border-bottom:12px solid transparent}
.cap{margin-top:8px;font-size:10.5px;color:var(--muted);line-height:1.35}
.cap b{display:block;color:#fff;font-family:var(--ui);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase}

/* Galerías */
.galeria-pagina{height:100%;display:flex;flex-direction:column;justify-content:center}
.gal{display:flex;flex-wrap:wrap;gap:14px 16px;justify-content:center}
.gal.apretada{gap:10px 10px}
.gal.max4{max-width:900px;margin:0 auto}
.gal.max5{max-width:800px;margin:0 auto}
.foto img{display:block;border:1px solid var(--line)}
.foto figcaption{font-size:9.5px;color:var(--muted);margin-top:5px;max-width:200px}
.dos-bloques{display:flex;flex-direction:column;gap:22px;height:100%;justify-content:center}
.dos-bloques .gal{flex-wrap:nowrap}
.dos-bloques .gal{justify-content:flex-start}
.nota{font-size:11px;color:var(--muted);margin-top:8px}
.dos-bloques .kicker{margin-bottom:8px}

/* Lettering */
.lettering{display:flex;gap:40px;height:100%;align-items:center}
.lettering .texto{flex:0 0 430px}
.logo-grande{flex:1;display:flex;flex-direction:column;align-items:center;gap:22px}
.logo-grande{background:radial-gradient(ellipse 60% 45% at 50% 40%,rgba(139,63,255,.35),transparent 70%)}
.logo-grande>img{width:100%}
.variantes-mini{display:flex;gap:12px}
.v{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:1px solid var(--line);padding:12px}
.v img,.v svg{width:100%;height:auto}
.v span{font-family:var(--ui);font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
.v.negro{background:#000}.v.morado{background:#14062a}.v.linea{background:#000}.v.blanco{background:var(--violet-deep)}
.variantes-mini .v{width:180px;height:110px}
.construccion{display:grid;grid-template-columns:1.6fr 1fr;gap:28px;height:100%;align-items:center}
.trazo svg{width:100%;height:auto}
.trazo .kicker{margin-top:14px}
.construccion .col{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.construccion .v{height:150px}
.construccion .v img{max-height:92px;width:auto;max-width:100%}
.construccion .v svg{max-height:92px}
.v.chico{flex-direction:row;flex-wrap:wrap}
.v.chico span{flex-basis:100%;text-align:center}

/* Web */
.web{display:flex;gap:40px;height:100%;align-items:center}
.web .texto{flex:0 0 380px}
.sitios{display:grid;gap:18px;flex:1}
.sitios.tres{grid-template-columns:repeat(3,1fr)}
.sitios.cuatro{grid-template-columns:1fr 1fr;height:100%;align-content:center}
.sitios.cuatro.chico{height:auto}
.sitio img{width:100%;display:block;border:1px solid var(--line);aspect-ratio:1400/1037;object-fit:cover}
.sitio figcaption{font-size:11px;color:#cfc8dc;margin-top:8px;line-height:1.4}
.sitio b{display:block;font-family:var(--ui);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#fff}
.sitio em{display:block;font-style:normal;color:var(--violet-hi);font-size:10px;margin:2px 0 3px}
.sitios.cuatro:not(.chico) .sitio img{height:220px}
.sitios.cuatro.chico .sitio figcaption{display:none}

/* Perfil */
.perfil{display:grid;grid-template-columns:1fr 1fr;gap:64px;height:100%;align-content:center}
.barra{display:grid;grid-template-columns:120px 1fr 34px;align-items:center;gap:12px;margin-bottom:9px;font-family:var(--ui);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase}
.barra i{height:8px;background:linear-gradient(90deg,var(--rojo) var(--n),#1d1030 var(--n))}
.barra b{text-align:right;font-weight:900}
.otros{font-size:12px;color:var(--muted);margin-top:4px}
blockquote{margin-top:22px;border-left:3px solid var(--violet);padding:4px 0 4px 18px;font-size:15px;line-height:1.5;font-style:italic;color:#eee}
cite{display:block;margin-top:10px;font-style:normal;font-family:var(--ui);font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#fff}
cite em{display:block;color:var(--muted);font-family:var(--body);letter-spacing:0;text-transform:none;font-size:10px;margin-top:3px}

/* Contacto */
.contacto{display:grid;grid-template-columns:1.2fr 1fr;gap:48px;height:100%;align-items:center}
.enorme{font-size:120px}
.canales p{font-family:var(--ui);font-weight:900;font-size:18px;letter-spacing:.04em;margin-bottom:16px;color:#fff}
.canales .redes{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
a.enl{border-bottom:2px solid var(--rojo)}
.qr-grande{display:flex;align-items:center;gap:16px;margin-top:18px;font-family:var(--ui);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.qr-grande svg{width:130px;height:130px;background:#fff;padding:5px}
`;

// ─────────────────────────────────────────────────────────────
//  Armado
// ─────────────────────────────────────────────────────────────

// El logo en vector (fuente/logo-vector.svg): contorno para la página de
// construcción y relleno sólido para la versión a una tinta.
function svgsDelLogo() {
  const crudo = fs.readFileSync(path.join(RAIZ, 'fuente', 'logo-vector.svg'), 'utf8');
  const rutas = (crudo.match(/<path[^>]*\/>/g) || []).map((p) => p.replace(/\s(class|style|fill|stroke)="[^"]*"/g, ''));
  const caja = 'viewBox="0 0 945 520" xmlns="http://www.w3.org/2000/svg"';
  return {
    linea: `<svg ${caja}><g fill="none" stroke="#fff" stroke-width="2.2">${rutas.join('')}</g></svg>`,
    solido: `<svg ${caja}><g fill="#fff">${rutas.join('')}</g></svg>`,
  };
}

async function qrs(v) {
  const rutas = ['/en/', '/casos/al-arabi-sc/en/', '/casos/hugo-gonzalez/en/', '/casos/futbol-femenil/en/', '/casos/diseno-web/en/'];
  const out = {};
  for (const r of rutas) out[r] = await QR.toString(liga(r, v, 'print'), { type: 'svg', margin: 0, errorCorrectionLevel: 'M' });
  return out;
}

async function main() {
  fs.mkdirSync(SALIDA, { recursive: true });
  const conHtml = process.argv.includes('--html');
  const logo = svgsDelLogo();
  const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  for (const v of VARIANTES) {
    for (const print of [false, true]) {
      const ctx = { v, print, qr: await qrs(v), svgLinea: logo.linea, svgSolido: logo.solido };
      const paginas = v.paginas.map((p, i) => { ctx.n = i + 1; return PAGINAS[p](ctx); }).join('\n');
      const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>NotMan · Rubén Rivera · Portfolio</title><style>${CSS}</style></head><body>${paginas}</body></html>`;
      const nombre = v.archivo + (print ? '-Print' : '');
      const archivoHtml = path.join(SALIDA, nombre + '.html');
      fs.writeFileSync(archivoHtml, html);
      const pagina = await navegador.newPage({ viewport: { width: 1280, height: 720 } });
      await pagina.goto('file://' + archivoHtml, { waitUntil: 'load' });
      await pagina.evaluate(() => document.fonts.ready);
      await pagina.pdf({ path: path.join(SALIDA, nombre + '.pdf'), width: '1280px', height: '720px', printBackground: true, preferCSSPageSize: true });
      await pagina.close();
      if (!conHtml) fs.unlinkSync(archivoHtml);
      console.log('Listo: ' + nombre + '.pdf (' + v.paginas.length + ' páginas)');
    }
  }
  await navegador.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
