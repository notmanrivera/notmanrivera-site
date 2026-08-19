#!/usr/bin/env node
// Genera public/en/index.html a partir de public/index.html.
//
// El sitio es un solo archivo estatico sin build step, y eso no cambia --
// este script es la UNICA pieza de "build" del repo, corre una vez antes
// de cada deploy (ver .github/workflows/deploy.yml) y no toca nada mas.
//
// Por que hace falta: el toggle de idioma del sitio es 100% client-side --
// un boton reescribe el DOM con `el.innerHTML = data-en` en cada
// [data-es][data-en]. Google indexa lo que hay en el DOM al cargar la
// pagina, nunca lo que aparece despues de un clic que el crawler no va a
// dar -- asi que el contenido en ingles, aunque existe y funciona para
// cualquier visitante que lo pida, es invisible para busquedas en ingles.
// La solucion es generar una copia estatica en /en/ con el ingles ya
// horneado como texto por default, mas hreflang en las dos paginas (ver
// public/index.html) para que Google sepa que son la misma pagina en dos
// idiomas y no contenido duplicado compitiendo entre si.
//
// El truco: en vez de reimplementar la logica de traduccion aparte (con el
// riesgo de que las dos copias se desincronicen con el tiempo), este script
// hace EXACTAMENTE lo mismo que ya hace el boton de idioma en el navegador
// -- mismos selectores, mismo `el.innerHTML = ...`, mismos data-alt-*/
// data-aria-* -- solo que con jsdom en vez de un click real. Si el HTML
// fuente cambia (nuevo texto, nuevo data-es/data-en), este script recoge el
// cambio automaticamente la proxima vez que corre, sin tocarlo.
//
// Lo que jsdom NO hace (y no hace falta que haga): ejecutar el <script> del
// sitio. No importa -- una vez que un visitante real carga /en/index.html
// en un navegador de verdad, ese mismo <script> (que viaja intacto en la
// copia generada) corre normal y se encarga de animaciones, splitWords(),
// la maquina de escribir, etc. Este script solo necesita dejar el texto
// INICIAL correcto en el HTML; el resto es responsabilidad del navegador
// del visitante, exactamente igual que en la pagina en espanol.

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const SRC = path.resolve(__dirname, '../public/index.html');
const OUT_DIR = path.resolve(__dirname, '../public/en');
const OUT = path.join(OUT_DIR, 'index.html');

const html = fs.readFileSync(SRC, 'utf8');
const dom = new JSDOM(html);
const { document } = dom.window;

document.documentElement.lang = 'en';

// Mismo bucle que el boton de idioma en el navegador (ver el listener de
// #langBtn en el <script> del sitio) -- texto visible.
document.querySelectorAll('[data-es][data-en]').forEach(el => {
  el.innerHTML = el.getAttribute('data-en');
});

// Mismo patron para atributos (alt de imagenes, aria-label de controles) --
// ver la nota junto a esas reglas en el <script> del sitio.
document.querySelectorAll('[data-alt-es][data-alt-en]').forEach(el => {
  el.setAttribute('alt', el.getAttribute('data-alt-en'));
});
document.querySelectorAll('[data-aria-es][data-aria-en]').forEach(el => {
  el.setAttribute('aria-label', el.getAttribute('data-aria-en'));
});
// Mismo patron para href -- los links a los casos de estudio (paginas
// aparte, no [data-es][data-en]) tienen que apuntar a su propia copia en
// ingles (public/casos/<slug>/en/) cuando esta pagina es la version /en/.
document.querySelectorAll('[data-href-es][data-href-en]').forEach(el => {
  el.setAttribute('href', el.getAttribute('data-href-en'));
});

// El rotador de servicios del hero (.rota) es el UNICO caso que el boton de
// idioma no resuelve con el mismo bucle de arriba: su texto inicial queda
// fijo hasta que el primer intervalo de rotacion dispara, 3.4s despues de
// cargar (ver ROTADOR DE SERVICIOS EN EL HERO en el <script>) -- and ese
// intervalo nunca llega a correr aqui porque no ejecutamos el <script>.
// Se pinta a mano con el primer valor de su lista en ingles.
const rota = document.querySelector('.rota');
if (rota) {
  const primero = (rota.getAttribute('data-rot-en') || '').split('|')[0];
  if (primero) rota.textContent = primero;
}

// El boton en si: en la pagina en espanol dice "EN" (a que idioma cambiar);
// en la copia en ingles tiene que decir "ES" por el mismo motivo. La
// variable `lang` que vive en el <script> arranca en 'es' -- se corrige mas
// abajo con un reemplazo de texto, junto con el resto de metadatos que no
// pasan por [data-es][data-en] porque no son texto visible del body.
const langBtn = document.getElementById('langBtn');
if (langBtn) langBtn.textContent = 'ES';

let out = dom.serialize();

// Reemplazos puntuales: todo esto vive en el <head> o en el <script>, fuera
// del sistema [data-es][data-en] (que solo cubre texto visible del body).
// Cada from/to es una correspondencia 1:1 verificada contra el archivo
// fuente al escribir este script -- si algún día cambia el texto en
// español, hay que actualizar aquí también.
const reemplazos = [
  [
    '<title>Rubén Rivera — Motion Graphics, Video y Web para Agencias y Jugadores</title>',
    '<title>Rubén Rivera — Motion Graphics, Video Editing &amp; Web Design for Agencies and Athletes</title>',
  ],
  [
    'content="Motion graphics 2D/3D, edición de video, diseño web UI/UX y soporte de marca blanca para agencias de marketing deportivo, representantes y jugadores profesionales. 9 años de experiencia. Querétaro, México."',
    'content="2D/3D motion graphics, video editing, UI/UX web design and white-label support for sports marketing agencies, representatives and professional athletes. 9 years of experience. Querétaro, Mexico."',
  ],
  [
    'content="Rubén Rivera — Motion Graphics, Video y Web para Agencias y Jugadores"',
    'content="Rubén Rivera — Motion Graphics, Video Editing &amp; Web Design for Agencies and Athletes"',
  ],
  [
    'content="Motion graphics 2D/3D, edición de video, diseño web UI/UX y soporte de marca blanca para agencias, representantes y jugadores profesionales."',
    'content="2D/3D motion graphics, video editing, UI/UX web design and white-label support for agencies, representatives and professional athletes."',
  ],
  ['content="es_MX"', 'content="en_US"'],
  ['content="https://notmanrivera.com"', 'content="https://notmanrivera.com/en"'],
  // Solo el canonical se mueve a /en/ -- los dos hreflang (es y x-default)
  // tienen que seguir apuntando a la raiz sin importar cual copia sea esta,
  // son la lista de "estas son las alternativas", no la URL propia de la
  // pagina. Coincidencia de linea completa a proposito, no un reemplazo
  // global del href suelto: las tres lineas comparten el mismo
  // href="https://notmanrivera.com/" y solo una debe cambiar.
  [
    '<link rel="canonical" href="https://notmanrivera.com/">',
    '<link rel="canonical" href="https://notmanrivera.com/en/">',
  ],
  ['"inLanguage": "es"', '"inLanguage": "en"'],
  [
    '"description": "Motion graphics 2D/3D, edición de video, diseño web UI/UX y soporte de marca blanca para agencias de marketing deportivo, representantes y jugadores profesionales.",',
    '"description": "2D/3D motion graphics, video editing, UI/UX web design and white-label support for sports marketing agencies, representatives and professional athletes.",',
  ],
  ['"name": "Motion graphics 2D/3D" }', '"name": "2D/3D Motion Graphics" }'],
  ['"name": "Edición de video deportiva" }', '"name": "Sports Video Editing" }'],
  ['"name": "Diseño web UI/UX" }', '"name": "UI/UX Web Design" }'],
  ['"name": "Soporte de marca blanca" }', '"name": "White-Label Support" }'],
  // `lang` en el <script>: arranca en 'es' para la pagina raiz; en la copia
  // debe arrancar en 'en' para que el boton (ya en "ES") y el resto de la
  // logica de idioma se comporten simetricos desde el primer clic.
  ["let lang = 'es';", "let lang = 'en';"],
];

for (const [from, to] of reemplazos) {
  if (!out.includes(from)) {
    throw new Error(`build-en.js: no se encontro el texto esperado, revisar si cambio en index.html:\n${from}`);
  }
  out = out.split(from).join(to);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, '<!doctype html>\n' + out.replace(/^<!doctype html>\s*/i, ''));

console.log(`OK: ${path.relative(process.cwd(), OUT)} generado (${(out.length / 1024).toFixed(0)} KB)`);
