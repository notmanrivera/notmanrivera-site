#!/usr/bin/env node
// Genera el manual de identidad de NotMan (inglés) en PDF.
//
//   npm i --no-save playwright
//   node scripts/portafolio-pdf/manual.js [--html] [--publicar]
// Deja salida/NotMan-Identity-Guidelines.pdf. Con --publicar lo copia a
// public/portfolio/identity.pdf.
//
// La historia y las inspiraciones las contó Rubén (oct. 2026): el nombre viene
// de la mascota de Anthrax, el "The" y todo lo visual de los cómics (la curva
// de los logos retro de Silver Surfer, el cromo del Surfer, el degradado de
// Thanos). No hay archivos originales del proceso, así que no se muestran
// bocetos. No se reproduce arte de Marvel ni de Anthrax: solo se mencionan.
//
// La construcción (arco de la base, área de respeto) se calcula en el navegador
// sobre las rutas reales de fuente/logo-vector.svg, no se dibuja a ojo.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { DIR, PUB, SALIDA, a, esc, marco, svgsDelLogo, aPdf } = require('./comun');

const NOMBRE = 'NotMan-Identity-Guidelines';
const archivo = (p) => 'file://' + path.join(DIR, 'aplicaciones', p);
const LOGO = svgsDelLogo();
const CAJA = 'viewBox="0 0 945 520" xmlns="http://www.w3.org/2000/svg"';
const LETRAS = ['T', 'H', 'E', 'N', 'O', 'T1', 'M', 'A', 'N1']; // orden de lectura

// La ruta de cada letra por su id (T, H, E, N, O, T1, M, A, N1).
const RUTA = Object.fromEntries(LOGO.rutas.map((r) => [r.match(/id="([^"]+)"/)[1], r]));

function svgLogo({ relleno = 'none', trazo = 'none', grosor = 0, extra = '', clase = '' } = {}) {
  return `<svg class="${clase}" ${CAJA}><g fill="${relleno}" stroke="${trazo}" stroke-width="${grosor}">${LOGO.rutas.join('')}</g>${extra}</svg>`;
}

// ─────────────────────────────────────────────────────────────
//  Color
// ─────────────────────────────────────────────────────────────

function rgb(hex) { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
// CMYK aproximado (sin perfil de color): sirve de punto de partida; para
// imprimir hay que pedir prueba de color.
function cmyk(hex) {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return '0 · 0 · 0 · 100';
  return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map((v) => Math.round(v * 100)).join(' · ');
}

const PRIMARIOS = [
  { n: 'Ink', hex: '#000000', uso: 'Base background. NotMan lives on black.', texto: '#fff' },
  { n: 'NotMan Violet', hex: '#8B3FFF', uso: 'Signature accent: lines, highlights, links.', texto: '#fff' },
  { n: 'Signal Red', hex: '#E50012', uso: 'Action and emphasis: tags, buttons, numbers.', texto: '#fff' },
  { n: 'Paper', hex: '#FFFFFF', uso: 'Text on dark, outlined tags.', texto: '#000' },
];
const SECUNDARIOS = [
  { n: 'Violet Light', hex: '#A96BFF' }, { n: 'Violet Deep', hex: '#4A1391' },
  { n: 'Red Deep', hex: '#8E000B' }, { n: 'Haze', hex: '#A99CC4' }, { n: 'Night Line', hex: '#33204F' },
];
// Muestreados del logo (public/assets/logo-lg.webp y logo-morado.webp).
const CROMO = ['#9FA3B9', '#D5D9F4', '#E1E5FC', '#ACAFC6', '#9FA3B9'];
const THANOS = ['#4E88EA', '#596BEA', '#936AF1', '#DD95F7', '#F5A0F9'];
const grad = (cs, dir = '180deg') => `linear-gradient(${dir},${cs.join(',')})`;

// ─────────────────────────────────────────────────────────────
//  Páginas
// ─────────────────────────────────────────────────────────────

const P = [];
const pagina = (seccion, cuerpo, clase) => P.push((n) => marco(n, seccion, cuerpo, clase));

// 1. Portada
P.push(() => `<section class="pg portada-m" id="p-1"><div class="fondo"></div>
  <p class="kicker arriba-m">Identity guidelines · v1.0 · 2026</p>
  <img class="logo-m" src="${a('logo-lg.webp')}" alt="The NotMan">
  <div class="tag-m"><span>Brand book</span></div>
  <p class="pie-m">The NotMan · personal brand of Rubén Rivera · Querétaro, Mexico</p>
</section>`);

// 2. Índice
const INDICE = [
  ['01', 'The story', 3], ['02', 'Built from comics', 4], ['03', 'The mark', 5], ['04', 'Anatomy', 6],
  ['05', 'Construction', 7], ['06', 'Versions', 8], ['07', 'Clear space & size', 9], ['08', 'Color', 10],
  ['09', 'Typography', 11], ['10', 'Graphic elements', 12], ['11', 'Motion', 13], ['12', 'Misuse', 14],
  ['13', 'Applications', 15],
];
pagina('Contents', `<div class="indice-m">
  <div><p class="kicker">Contents</p><h1>One mark,<br>one world</h1>
  <p class="lead">How the NotMan identity is built and how to use it, so every piece, from a matchday graphic to an email signature, looks like it came from the same place.</p></div>
  <ol>${INDICE.map(([n, t, p]) => `<li><a href="#p-${p}"><i>${n}</i>${t}<b>${String(p).padStart(2, '0')}</b></a></li>`).join('')}</ol>
</div>`);

// 3. Historia
pagina('01 · The story', `<div class="historia">
  <div class="texto">
    <p class="kicker">01 · Where the name comes from</p>
    <h1>The name came<br>before the logo</h1>
    <p class="lead">In high school I was obsessed with Anthrax, and the band’s mascot is called the Not Man. One day I set “NotMan” as my last name on Facebook, and people started calling me that. So I started signing my work that way.</p>
    <p>Around 2020, when I sat down to design my own mark, I added “The”, the way comic book characters are named. I’m a huge comics fan, and from that point on everything visual in the brand came from comics, not from the band.</p>
  </div>
  <div class="linea-tiempo">
    ${[
      ['High school', 'Anthrax’s mascot, the Not Man, becomes a favorite.'],
      ['Facebook', '“NotMan” as a last name. People start using it.'],
      ['Signature', 'I start signing my work as NotMan.'],
      ['≈ 2020', '“The” is added, comic-book style, and the logo is drawn.'],
    ].map(([t, d], i) => `<div class="hito"><span>0${i + 1}</span><b>${t}</b><p>${d}</p></div>`).join('')}
  </div>
</div>`);

// 4. Inspiración
pagina('02 · Built from comics', `<div class="comics">
  <div class="texto"><p class="kicker">02 · Inspiration</p><h1>Built from<br>comics</h1>
    <p class="lead">Every visual decision in the mark points back to comic books.</p>
    <p class="nota">Inspiration only: no comic artwork is reproduced in the brand.</p></div>
  <div class="tarjetas">
    <div class="tarjeta"><div class="muestra curva">${svgLogo({ trazo: '#A96BFF', grosor: 3 })}<svg class="arco-demo" viewBox="0 0 300 120"><path d="M10 110 Q150 10 290 110" fill="none" stroke="#E50012" stroke-width="3" stroke-dasharray="8 6"/></svg></div>
      <h3>The shape</h3><p>Sketched in pencil on paper. I wanted a word that sits on a curve, like the retro <b>Silver Surfer</b> mastheads.</p></div>
    <div class="tarjeta"><div class="muestra" style="background:${grad(CROMO)}"></div>
      <h3>The chrome</h3><p>The primary finish comes straight from the <b>Silver Surfer</b>: cold, metallic, lit from the middle.</p></div>
    <div class="tarjeta"><div class="muestra" style="background:${grad(THANOS)}"></div>
      <h3>The gradient</h3><p>The secondary version is based on <b>Thanos</b> and on my favorite color, that exact shade of purple.</p></div>
  </div>
</div>`);

// 5. La marca
pagina('03 · The mark', `<div class="marca-hero">
  <img src="${a('logo-lg.webp')}" alt="">
  <div class="pie-marca"><p class="kicker">03 · Primary logo</p><p><b>THE NOTMAN</b> · custom lettering · chrome on black. This is the version to use whenever possible.</p></div>
</div>`, 'pg-glow');

// 6. Anatomía: cada letra con su tono
const TONOS = ['#E50012', '#FF5A66', '#FF9AA2', '#8B3FFF', '#A96BFF', '#C9A2FF', '#6D2BD9', '#B57CFF', '#4A1391'];
pagina('04 · Anatomy', `<div class="anatomia">
  <div class="logo-letras"><svg ${CAJA}>${LETRAS.map((id, i) => RUTA[id].replace('<path', `<path fill="${TONOS[i]}" stroke="#000" stroke-width="2"`)).join('')}</svg></div>
  <div class="texto">
    <p class="kicker">04 · Anatomy</p><h2>Nine letters,<br>one block</h2>
    <div class="leyenda">${LETRAS.map((id, i) => `<span><i style="background:${TONOS[i]}"></i>${id[0]}</span>`).join('')}</div>
    <p><b>THE</b> is stacked on the left, inside the space of the big T. <b>NOTMAN</b> runs underneath and to the right.</p>
    <p><b>The T’s crossbar</b> sweeps over the entire word: it is the roof of the mark and its most recognizable gesture.</p>
    <p><b>The letters interlock.</b> Each is its own shape, but the gaps between them are narrow and even, so the word reads as a single block.</p>
    <p><b>Everything sits on an arch,</b> getting taller towards the ends, like a comic book masthead.</p>
  </div>
</div>`);

// 7. Construcción (el arco se calcula en el navegador, ver SCRIPT)
pagina('05 · Construction', `<div class="construccion-m">
  <div class="lienzo">${svgLogo({ trazo: '#fff', grosor: 2, clase: 'calc', extra: '<g class="guias"></g>' })}</div>
  <div class="texto">
    <p class="kicker">05 · Construction</p><h2>An arch,<br>a roof, a block</h2>
    <p><b>Proportion:</b> the mark is 1.82 times as wide as it is tall (945 × 520 in the master vector).</p>
    <p><b>Base arch</b> <span class="chip rojo"></span> the bottoms of N-O-T-M-A-N follow an arch (best-fit circle, calculated on the vector).</p>
    <p><b>Roof</b> <span class="chip violeta"></span> the T’s crossbar closes the top edge.</p>
    <p><b>Bounding box</b> <span class="chip gris"></span> every measurement in this guide is relative to it.</p>
    <p class="nota">Master file: fuente/logo-vector.svg · 9 paths, one per letter.</p>
  </div>
</div>`);

// 8. Versiones
pagina('06 · Versions', `<div class="versiones">
  ${[
    ['negro', `<img src="${a('logo-lg.webp', 700)}">`, 'Primary · chrome', 'On black or very dark backgrounds. The default.'],
    ['oscuro', `<img src="${a('logo-morado.webp', 700)}">`, 'Secondary · Thanos gradient', 'For a louder, more playful context: social, merch, covers.'],
    ['violeta', svgLogo({ relleno: '#fff' }), 'One color · white', 'On violet, red or photos with a dark overlay.'],
    ['blanco', svgLogo({ relleno: '#000' }), 'One color · black', 'On white or light paper, single-ink printing, stamps.'],
    ['negro', svgLogo({ trazo: '#A96BFF', grosor: 2.4 }), 'Outline', 'Motion only: the stroke that draws the logo before the chrome appears.'],
  ].map(([f, img, t, d]) => `<div class="version"><div class="caja ${f}">${img}</div><h3>${t}</h3><p>${d}</p></div>`).join('')}
</div>`);

// 9. Área de respeto y tamaño mínimo (la caja se calcula en el navegador)
pagina('07 · Clear space & minimum size', `<div class="respeto">
  <div class="lienzo-respeto">${svgLogo({ relleno: '#fff', clase: 'respeto-svg', extra: '<g class="guias-respeto"></g>' })}</div>
  <div class="texto">
    <p class="kicker">07 · Clear space</p><h2>Let it breathe</h2>
    <p><b>x</b> = the height of the letter O. Keep at least <b>x</b> of empty space on every side of the mark: no text, edges or other logos inside the dashed line.</p>
    <p class="kicker mt">Minimum size</p>
    <div class="minimos">
      <div><img src="${a('logo-lg.webp', 400)}" style="width:140px"><span>Chrome · 140 px · 35 mm</span></div>
      <div>${svgLogo({ relleno: '#fff' }).replace('<svg ', '<svg style="width:90px" ')}<span>One color · 90 px · 22 mm</span></div>
    </div>
    <p class="nota">Below these sizes the interlocking letters close up. A compact mark for avatars and favicons is in progress.</p>
  </div>
</div>`);

// 10. Color
pagina('08 · Color', `<div class="color">
  <div class="primarios">${PRIMARIOS.map((c) => `<div class="swatch" style="background:${c.hex};color:${c.texto}">
    <b>${c.n}</b><span>${c.hex} · RGB ${rgb(c.hex).join(' ')} · CMYK ${cmyk(c.hex)}</span><em>${c.uso}</em></div>`).join('')}</div>
  <div class="fila-color">
    <div class="secundarios">${SECUNDARIOS.map((c) => `<div class="chico" ><i style="background:${c.hex}"></i><b>${c.n}</b><span>${c.hex}</span></div>`).join('')}</div>
    <div class="degradados">
      <div><i style="background:${grad(CROMO, '90deg')}"></i><b>Chrome</b><span>${CROMO.slice(0, 3).join(' → ')} → back</span></div>
      <div><i style="background:${grad(THANOS, '90deg')}"></i><b>Thanos</b><span>${THANOS[0]} → ${THANOS[2]} → ${THANOS[4]}</span></div>
    </div>
    <div class="proporcion"><p class="kicker">Balance</p><div class="barra-prop"><i style="flex:70;background:#000;border:1px solid #33204F"></i><i style="flex:15;background:#8B3FFF"></i><i style="flex:10;background:#E50012"></i><i style="flex:5;background:#fff"></i></div><span>Mostly black, violet as the signature, red as the punch, white for reading.</span></div>
  </div>
  <p class="nota abajo">CMYK values are direct conversions; request a color proof before printing.</p>
</div>`);

// 11. Tipografía
pagina('09 · Typography', `<div class="tipos">
  <div class="tipo"><p class="kicker">Display · headlines</p><div class="muestra-tipo kenyan">Kenyan Coffee</div><p class="abc kenyan">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</p><p>Condensed, italic and always uppercase. Big titles, names on matchday graphics, buttons. Tight leading (0.9).</p></div>
  <div class="tipo"><p class="kicker">Labels · UI</p><div class="muestra-tipo monument">Monument<br>Extended</div><p class="abc monument">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p><p>Wide, heavy, uppercase and widely tracked (0.2 em). Kickers, labels, numbers, navigation. Always small.</p></div>
  <div class="tipo"><p class="kicker">Body · reading</p><div class="muestra-tipo inter">Inter</div><p class="abc inter">Aa Bb Cc 0123456789 · regular, medium, bold</p><p>Everything people actually read: paragraphs, captions, emails. Sentence case, comfortable leading (1.5).</p></div>
</div>`);

// 12. Elementos gráficos
pagina('10 · Graphic elements', `<div class="elementos">
  <div class="el"><div class="demo"><span class="tag-demo rojo">Let’s work together</span><span class="tag-demo linea">See my work</span></div><h3>Tilted tags</h3><p>Rotated −2° to −4°. Red fill for the main action, white outline for the secondary one.</p></div>
  <div class="el"><div class="demo"><span class="cruz-demo">Design <b>×</b> Animation <b>×</b> Web</span></div><h3>The × separator</h3><p>Red multiplication sign between disciplines or items, never a bullet or a slash.</p></div>
  <div class="el"><div class="demo puntos"></div><h3>Dot texture</h3><p>A fine violet dot grid (7 px) over black. It gives depth without competing with the work.</p></div>
  <div class="el"><div class="demo diagonal"></div><h3>Diagonal panel</h3><p>A deep violet panel cut at ~118°, as on the website. It sets the stage behind the content.</p></div>
  <div class="el"><div class="demo barras"><i></i><b>07</b></div><h3>Red bars & numbers</h3><p>A short red bar above numbers and section markers; numbers set in Monument.</p></div>
  <div class="el"><div class="demo glow"><img src="${a('logo-lg.webp', 400)}"></div><h3>Violet glow</h3><p>A soft violet light behind the chrome logo, never a hard drop shadow.</p></div>
</div>`);

// 13. Movimiento: el trazo dibujándose
const FRAMES = [0.25, 0.55, 0.85, 1];
pagina('11 · Motion', `<div class="movimiento">
  <div class="texto"><p class="kicker">11 · Motion</p><h2>The logo<br>draws itself</h2>
    <p>On the website, the nine letters are drawn one stroke at a time in violet, with a white spark leading each line. It takes 1.2 seconds. Then the chrome appears and a shine sweeps across it.</p>
    <p>Plays once per visit, never in a loop. Viewers who ask for reduced motion see the finished logo directly.</p></div>
  <div class="frames">${FRAMES.map((f) => `<div class="frame"><svg ${CAJA}><g fill="none" stroke="#A96BFF" stroke-width="3" stroke-linecap="round">${LOGO.rutas.map((r) => r.replace('<path', `<path pathLength="1" stroke-dasharray="${f} 1"`)).join('')}</g></svg><span>${Math.round(f * 1200)} ms</span></div>`).join('')}
    <div class="frame final"><img src="${a('logo-lg.webp', 600)}"><span>Chrome + shine</span></div></div>
</div>`);

// 14. Usos incorrectos
const MAL = [
  ['transform:scaleX(1.45)', 'Don’t stretch or squash it'],
  ['transform:rotate(-14deg)', 'Don’t rotate it'],
  ['filter:hue-rotate(110deg) saturate(2)', 'Don’t recolor the chrome'],
  ['filter:drop-shadow(10px 12px 0 #E50012)', 'Don’t add hard shadows or effects'],
  ['', 'Don’t place it on light, low-contrast backgrounds', 'claro'],
  ['clip-path:inset(0 52% 0 0)', 'Don’t crop it or split the letters'],
];
pagina('12 · Misuse', `<div class="mal">${MAL.map(([estilo, t, fondo = '']) => `
  <div class="caso-mal"><div class="caja ${fondo}"><img src="${a('logo-lg.webp', 500)}" style="${estilo}"><b class="x">✕</b></div><p>${t}</p></div>`).join('')}
</div>`);

// 15. Aplicaciones
pagina('13 · Applications', `<div class="aplicaciones">
  <figure class="ap grande"><img src="${archivo('sitio.jpg')}"><figcaption><b>Website</b>notmanrivera.com · hero with the self-drawing logo</figcaption></figure>
  <figure class="ap"><img src="${a('firma/banner-en-v1.gif', 900)}"><figcaption><b>Email signature</b>Animated banner, English and Spanish</figcaption></figure>
  <figure class="ap"><img src="${archivo('portafolio.jpg')}"><figcaption><b>Portfolio PDF</b>Same palette, type and tags</figcaption></figure>
  <figure class="ap redondo"><img src="${archivo('perfil.png')}"><figcaption><b>Profile picture</b>Google, LinkedIn, social</figcaption></figure>
</div>`);

// 16. Contraportada
P.push((n) => `<section class="pg portada-m" id="p-${n}"><div class="fondo"></div>
  <img class="logo-m chico" src="${a('logo-lg.webp')}" alt="">
  <p class="lead centro">Questions about the brand, or need the master files?</p>
  <p class="contacto-m"><a href="mailto:hola@notmanrivera.com">hola@notmanrivera.com</a> · <a href="https://notmanrivera.com/en/">notmanrivera.com</a></p>
  <p class="pie-m">The NotMan identity guidelines · v1.0 · 2026</p>
</section>`);

// Calcula en el navegador el arco de la base (círculo que mejor pasa por el
// punto más bajo de N-O-T-M-A-N), la caja del logo y el área de respeto
// (x = alto de la O). Así las guías salen del vector real.
const SCRIPT = `
(function(){
  const NS='http://www.w3.org/2000/svg';
  const el=(t,at)=>{const e=document.createElementNS(NS,t);for(const k in at)e.setAttribute(k,at[k]);return e};
  function fondos(svg){
    const ids=['N','O','T1','M','A','N1'];
    return ids.map(id=>{const p=svg.querySelector('#'+id);const len=p.getTotalLength();let best=null;
      for(let i=0;i<=400;i++){const q=p.getPointAtLength(len*i/400);if(!best||q.y>best.y)best=q}return [best.x,best.y]});
  }
  // Círculo por mínimos cuadrados (método de Kåsa)
  function circulo(pts){
    let sx=0,sy=0,sxx=0,syy=0,sxy=0,sxz=0,syz=0,sz=0,n=pts.length;
    for(const [x,y] of pts){const z=x*x+y*y;sx+=x;sy+=y;sxx+=x*x;syy+=y*y;sxy+=x*y;sxz+=x*z;syz+=y*z;sz+=z}
    const A=[[sxx,sxy,sx],[sxy,syy,sy],[sx,sy,n]],B=[sxz,syz,sz];
    const det=m=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
    const D=det(A),r=[0,1,2].map(i=>det(A.map((f,j)=>f.map((v,k)=>k===i?B[j]:v)))/D);
    const cx=r[0]/2,cy=r[1]/2;return {cx,cy,r:Math.sqrt(r[2]+cx*cx+cy*cy)};
  }
  const svg=document.querySelector('svg.calc');
  if(svg){
    const g=svg.querySelector('.guias');svg.setAttribute('overflow','visible');
    const c=circulo(fondos(svg));
    g.appendChild(el('circle',{cx:c.cx,cy:c.cy,r:c.r,fill:'none',stroke:'#E50012','stroke-width':3,'stroke-dasharray':'10 8'}));
    for(const [x,y] of fondos(svg))g.appendChild(el('circle',{cx:x,cy:y,r:7,fill:'#E50012'}));
    const bb=svg.querySelector('g').getBBox();
    g.appendChild(el('rect',{x:bb.x,y:bb.y,width:bb.width,height:bb.height,fill:'none',stroke:'#A99CC4','stroke-width':1.5,'stroke-dasharray':'4 6'}));
    const t=svg.querySelector('#T').getBBox();
    g.appendChild(el('line',{x1:t.x,y1:t.y+2,x2:t.x+t.width,y2:t.y+2,stroke:'#8B3FFF','stroke-width':5}));
    // Recorta el círculo a la zona del logo
    const clip=el('clipPath',{id:'clip-arco'});clip.appendChild(el('rect',{x:-40,y:-40,width:1025,height:620}));svg.appendChild(clip);g.setAttribute('clip-path','url(#clip-arco)');
  }
  const s2=document.querySelector('svg.respeto-svg');
  if(s2){
    const g=s2.querySelector('.guias-respeto');s2.setAttribute('overflow','visible');
    const o=s2.querySelector('#O').getBBox(),bb=s2.querySelector('g').getBBox(),x=o.height;
    g.appendChild(el('rect',{x:bb.x-x,y:bb.y-x,width:bb.width+2*x,height:bb.height+2*x,fill:'none',stroke:'#E50012','stroke-width':3,'stroke-dasharray':'12 9'}));
    g.appendChild(el('rect',{x:bb.x,y:bb.y,width:bb.width,height:bb.height,fill:'none',stroke:'#A99CC4','stroke-width':1.5}));
    g.appendChild(el('rect',{x:o.x,y:o.y,width:o.width,height:o.height,fill:'rgba(229,0,18,.35)'}));
    const caja=(X,Y)=>{g.appendChild(el('rect',{x:X,y:Y,width:x,height:x,fill:'rgba(139,63,255,.35)',stroke:'#8B3FFF','stroke-width':2}));const t=el('text',{x:X+x/2,y:Y+x/2+14,'text-anchor':'middle',fill:'#fff','font-size':40,'font-family':'Inter','font-weight':700});t.textContent='x';g.appendChild(t)};
    caja(bb.x-x,bb.y-x);caja(bb.x+bb.width,bb.y+bb.height);
    s2.setAttribute('viewBox',(bb.x-x-6)+' '+(bb.y-x-6)+' '+(bb.width+2*x+12)+' '+(bb.height+2*x+12));
  }
})();`;

// ─────────────────────────────────────────────────────────────
//  Estilos propios del manual
// ─────────────────────────────────────────────────────────────

const CSS = `
.portada-m{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px}
.portada-m::after{content:'';position:absolute;left:50%;top:46%;width:820px;height:460px;margin:-230px 0 0 -410px;background:radial-gradient(ellipse at center,rgba(139,63,255,.4),transparent 65%);z-index:0}
.arriba-m{position:absolute!important;top:44px;border:2px solid #fff;padding:7px 14px 6px;transform:rotate(-2deg);color:#fff}
.logo-m{width:640px}.logo-m.chico{width:420px;margin-bottom:26px}
.tag-m{background:var(--rojo);transform:rotate(-3deg);padding:8px 34px 4px;margin-top:-30px}
.tag-m span{font-family:var(--disp);font-size:54px;text-transform:uppercase}
.pie-m{position:absolute!important;bottom:36px;font-family:var(--ui);font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.centro{text-align:center}.contacto-m{font-family:var(--ui);font-weight:900;font-size:16px;letter-spacing:.06em;color:#fff}
.contacto-m a{border-bottom:2px solid var(--rojo)}
.nota{font-size:11px;color:var(--muted)}
.indice-m{display:grid;grid-template-columns:1fr 1fr;gap:64px;height:100%;align-items:center}
.indice-m ol{list-style:none;columns:1}
.indice-m li a{display:flex;align-items:baseline;gap:14px;padding:7px 0;border-bottom:1px solid var(--line);font-family:var(--ui);font-weight:900;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
.indice-m i{font-style:normal;color:var(--rojo);width:26px}.indice-m li b{margin-left:auto;color:var(--muted);font-weight:300}
.historia{display:grid;grid-template-columns:1.1fr 1fr;gap:56px;height:100%;align-items:center}
.linea-tiempo{display:flex;flex-direction:column;gap:14px;border-left:2px solid var(--violet);padding-left:26px}
.hito{position:relative}
.hito::before{content:'';position:absolute;left:-33px;top:4px;width:12px;height:12px;background:var(--rojo);transform:rotate(45deg)}
.hito span{font-family:var(--disp);font-size:22px;color:var(--rojo);margin-right:10px}.hito b{font-family:var(--ui);font-size:12px;letter-spacing:.1em;text-transform:uppercase}
.hito p{margin:4px 0 0}
.comics{display:grid;grid-template-columns:330px 1fr;gap:44px;height:100%;align-items:center}
.tarjetas{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.tarjeta{border:1px solid var(--line);background:rgba(10,4,20,.7);padding:16px}
.tarjeta .muestra{height:170px;margin-bottom:14px;position:relative;border:1px solid var(--line)}
.muestra.curva{background:#000;display:flex;align-items:center;justify-content:center;padding:14px}
.muestra.curva svg:first-child{width:100%}
.arco-demo{position:absolute;left:14px;right:14px;bottom:8px;width:calc(100% - 28px)}
.tarjeta p{font-size:12.5px}
.marca-hero{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center}
.marca-hero img{width:820px}
.pie-marca{display:flex;gap:18px;align-items:baseline;margin-top:18px}.pie-marca p{margin:0}
.pg-glow .fondo{background:radial-gradient(ellipse 45% 50% at 50% 46%,rgba(139,63,255,.45),transparent 70%),radial-gradient(rgba(169,107,255,.09) 1px,transparent 1.2px) 0 0/7px 7px}
.anatomia{display:grid;grid-template-columns:1.45fr 1fr;gap:44px;height:100%;align-items:center}
.logo-letras svg{width:100%}
.leyenda{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
.leyenda span{font-family:var(--ui);font-weight:900;font-size:11px;display:flex;align-items:center;gap:5px}
.leyenda i{width:14px;height:14px;display:inline-block}
.construccion-m{display:grid;grid-template-columns:1.45fr 1fr;gap:44px;height:100%;align-items:center}
.lienzo svg{width:100%;overflow:visible}
.chip{display:inline-block;width:22px;height:6px;vertical-align:middle;margin:0 4px}
.chip.rojo{background:var(--rojo)}.chip.violeta{background:var(--violet)}.chip.gris{border-top:2px dashed var(--muted);height:0}
.versiones{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;height:100%;align-content:center}
.version .caja{height:150px;display:flex;align-items:center;justify-content:center;padding:16px;border:1px solid var(--line);margin-bottom:12px}
.version .caja img,.version .caja svg{width:100%;height:auto}
.caja.negro{background:#000}.caja.oscuro{background:#0b0416}.caja.violeta{background:var(--violet-deep)}.caja.blanco{background:#fff}
.version p{font-size:12px}
.respeto{display:grid;grid-template-columns:1.3fr 1fr;gap:44px;height:100%;align-items:center}
.lienzo-respeto svg{width:100%;overflow:visible}
.minimos{display:flex;gap:28px;align-items:flex-end;margin:6px 0 14px}
.minimos div{display:flex;flex-direction:column;gap:8px}
.minimos span{font-family:var(--ui);font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.color{height:100%;display:flex;flex-direction:column;justify-content:center;gap:22px}
.primarios{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.swatch{height:230px;padding:18px;display:flex;flex-direction:column;border:1px solid var(--line)}
.swatch b{font-family:var(--disp);font-size:34px;font-weight:400;text-transform:uppercase}
.swatch span{font-family:var(--ui);font-size:8.5px;letter-spacing:.06em;margin-top:6px;line-height:1.7}
.swatch em{font-style:normal;font-size:12px;margin-top:auto;line-height:1.4}
.fila-color{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:28px}
.secundarios{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.secundarios .chico i{display:block;height:64px;border:1px solid var(--line);margin-bottom:6px}
.secundarios b,.degradados b{display:block;font-family:var(--ui);font-size:8.5px;letter-spacing:.1em;text-transform:uppercase}
.secundarios span,.degradados span{font-size:10px;color:var(--muted)}
.degradados{display:flex;flex-direction:column;gap:10px}.degradados i{display:block;height:26px;margin-bottom:4px}
.barra-prop{display:flex;height:26px;margin-bottom:6px}.barra-prop i{display:block}
.proporcion span{font-size:11px;color:var(--muted)}
.nota.abajo{margin:0}
.tipos{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;height:100%;align-content:center}
.tipo{border-top:3px solid var(--rojo);padding-top:16px}
.muestra-tipo{font-size:64px;line-height:.95;margin-bottom:12px;min-height:130px;display:flex;align-items:flex-end}
.kenyan{font-family:var(--disp);text-transform:uppercase}.monument{font-family:var(--ui);font-weight:900;text-transform:uppercase}
.muestra-tipo.monument{font-size:34px;letter-spacing:.02em}.inter{font-family:var(--body);font-weight:600}
.abc{font-size:13px;color:#fff;letter-spacing:.04em}.abc.monument{font-size:10px;letter-spacing:.2em}
.elementos{display:grid;grid-template-columns:repeat(3,1fr);gap:22px 28px;height:100%;align-content:center}
.el .demo{height:150px;border:1px solid var(--line);background:#000;display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:10px;position:relative;overflow:hidden}
.el p{font-size:12px}
.tag-demo{font-family:var(--disp);font-size:24px;text-transform:uppercase;padding:8px 16px 5px;transform:rotate(-3deg)}
.tag-demo.rojo{background:var(--rojo)}.tag-demo.linea{border:2px solid #fff;transform:rotate(-2deg)}
.cruz-demo{font-family:var(--ui);font-weight:900;font-size:13px;letter-spacing:.14em;text-transform:uppercase}.cruz-demo b{color:var(--rojo);margin:0 6px}
.demo.puntos{background:radial-gradient(rgba(169,107,255,.35) 1px,transparent 1.3px) 0 0/7px 7px,#000}
.demo.diagonal{background:linear-gradient(118deg,#000 0 52%,#2b0a52 52% 100%)}
.demo.barras{flex-direction:column;gap:6px}.demo.barras i{display:block;width:44px;height:5px;background:var(--rojo)}.demo.barras b{font-family:var(--ui);font-size:28px}
.demo.glow{background:radial-gradient(ellipse 55% 55% at 50% 50%,rgba(139,63,255,.55),transparent 70%),#000}.demo.glow img{width:70%}
.movimiento{display:grid;grid-template-columns:330px 1fr;gap:40px;height:100%;align-items:center}
.frames{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}
.frame{border:1px solid var(--line);background:#000;padding:12px 10px;display:flex;flex-direction:column;align-items:center;gap:10px}
.frame svg,.frame img{width:100%;height:auto}
.frame span{font-family:var(--ui);font-size:8.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.mal{display:grid;grid-template-columns:repeat(3,1fr);gap:22px 28px;height:100%;align-content:center}
.caso-mal .caja{height:180px;background:#000;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.caso-mal .caja img{width:62%}
.caso-mal .caja.claro{background:#eceaf2}
.caso-mal .x{position:absolute;top:10px;right:12px;width:34px;height:34px;border-radius:50%;background:var(--rojo);color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center}
.caso-mal p{font-family:var(--ui);font-weight:900;font-size:10px;letter-spacing:.1em;text-transform:uppercase;margin-top:10px;color:#fff}
.aplicaciones{display:grid;grid-template-columns:1.5fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:18px;height:100%}
.ap{border:1px solid var(--line);background:#0b0416;display:flex;flex-direction:column;overflow:hidden}
.ap img{width:100%;flex:1;min-height:0;object-fit:cover}
.ap.grande{grid-row:span 2}
.ap.redondo img{object-fit:contain;padding:14px}
.ap figcaption{padding:10px 12px;font-size:11px;color:var(--muted)}
.ap figcaption b{display:block;font-family:var(--ui);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:#fff;margin-bottom:2px}
`;

async function main() {
  const conHtml = process.argv.includes('--html');
  const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const paginas = P.map((f, i) => f(i + 1));
  paginas.push(`<script>${SCRIPT}</script>`);
  await aPdf(navegador, NOMBRE, paginas, CSS, { conHtml, titulo: 'The NotMan · Identity guidelines' });
  await navegador.close();
  console.log('Listo: ' + NOMBRE + '.pdf (' + P.length + ' páginas)');
  if (process.argv.includes('--publicar')) {
    fs.mkdirSync(path.join(PUB, 'portfolio'), { recursive: true });
    fs.copyFileSync(path.join(SALIDA, NOMBRE + '.pdf'), path.join(PUB, 'portfolio', 'identity.pdf'));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
