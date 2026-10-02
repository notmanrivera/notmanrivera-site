// Pinta las reseñas aprobadas en public/index.html, dentro de #experiencia,
// entre las marcas <!-- resenas:inicio --> y <!-- resenas:fin -->.
//
//   node scripts/resenas.js <resenas.json>
//
// El JSON es lo que devuelve la web app de reseñas con ?accion=publicadas
// ({ ok, resenas: [{ nombre, cargo, empresa, idioma, texto, linkedin, fecha }] }).
// Lo corre .github/workflows/resenas.yml cada hora; si el bloque no cambia,
// el archivo queda idéntico y no hay commit.
//
// Va escrito en el HTML (no se carga con JS al abrir la página) para que lo
// lean Google y la versión /en/ que genera build-en.js. Sin reseñas
// aprobadas no se pinta nada: ni siquiera el título.

const fs = require('fs');
const path = require('path');

const INDEX = path.join(__dirname, '..', 'public', 'index.html');
const INICIO = '<!-- resenas:inicio -->';
const FIN = '<!-- resenas:fin -->';
// Giros de escritorio, alternados como los de .creds.
const GIROS = ['-1.8deg', '1.4deg', '-1.1deg', '2deg'];

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function tarjeta(r, i) {
  const parrafos = String(r.texto).trim().split(/\n{2,}/)
    .map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
  const nombre = /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/\S+$/i.test(r.linkedin || '')
    ? `<a class="resena-nombre" href="${esc(r.linkedin)}" target="_blank" rel="noopener">${esc(r.nombre)}</a>`
    : `<span class="resena-nombre">${esc(r.nombre)}</span>`;
  const puesto = [r.cargo, r.empresa].filter(Boolean).map(esc).join(' · ');
  // La reseña se publica tal como la escribieron (solo con ajustes de
  // estilo), no se traduce: en la otra versión del sitio se avisa.
  const idioma = r.idioma === 'en'
    ? ' data-es="Original en inglés" data-en=""'
    : ' data-es="" data-en="Original in Spanish"';
  const textoIdioma = r.idioma === 'en' ? 'Original en inglés' : '';
  return `
      <figure class="resena rv" style="--giro-d:${GIROS[i % GIROS.length]}">
        <blockquote>${parrafos}</blockquote>
        <figcaption>${nombre}<span class="resena-puesto">${puesto}</span><span class="resena-idioma"${idioma}>${textoIdioma}</span></figcaption>
      </figure>`;
}

function bloque(resenas) {
  if (!resenas.length) return `${INICIO}${FIN}`;
  return `${INICIO}
    <div class="resenas">
      <h3 class="resenas-titulo rv" data-es="Lo que <em>dicen</em>" data-en="What they <em>say</em>">Lo que <em>dicen</em></h3>
      <div class="resenas-lista">${resenas.map(tarjeta).join('')}
      </div>
    </div>
    ${FIN}`;
}

const archivo = process.argv[2];
if (!archivo) {
  console.error('Uso: node scripts/resenas.js <resenas.json>');
  process.exit(1);
}
const datos = JSON.parse(fs.readFileSync(archivo, 'utf8'));
if (!datos.ok || !Array.isArray(datos.resenas)) {
  // Mejor no tocar nada que borrar las publicadas por un error pasajero.
  console.error('Respuesta inválida de la web app:', JSON.stringify(datos).slice(0, 300));
  process.exit(1);
}
const validas = datos.resenas.filter(r => r && r.nombre && r.texto);

const html = fs.readFileSync(INDEX, 'utf8');
const a = html.indexOf(INICIO);
const b = html.indexOf(FIN);
if (a === -1 || b === -1 || b < a) {
  console.error('No encontré las marcas de reseñas en public/index.html');
  process.exit(1);
}
const nuevo = html.slice(0, a) + bloque(validas) + html.slice(b + FIN.length);
if (nuevo !== html) fs.writeFileSync(INDEX, nuevo);
console.log(`Reseñas publicadas: ${validas.length}${nuevo === html ? ' (sin cambios)' : ''}`);
