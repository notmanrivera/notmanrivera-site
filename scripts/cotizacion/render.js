#!/usr/bin/env node
// Genera el PDF de una cotización con el formato de siempre.
//
// No corre en el deploy -- se ejecuta a mano:
//   npm i --no-save playwright
//   node scripts/cotizacion/render.js COT-2026-001
// Lee cotizaciones/COT-2026-001.json y deja el PDF en salida/ (no versionada).
// Si el Chromium de Playwright no está instalado, apuntar a otro con
// CHROMIUM=/ruta/al/chrome.
//
// Para una cotización nueva: copiar el JSON más reciente, subir el folio y
// cambiar los datos. Los totales se calculan aquí, no se escriben a mano.
// En los textos, **así** sale en negritas.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname;
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
  'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Términos que van en todas las cotizaciones, después de las notas propias
// del proyecto.
const NOTAS_FIJAS = [
  'Incluye dos rondas de ajustes por pieza. Cambios adicionales o de alcance se cotizan por separado.',
  'Los pagos se realizarán de manera que se cubra el **50% al aprobar la cotización y 50% contra entrega final.**',
  'Precios en pesos mexicanos. Se emite factura (CFDI) por cada pago.',
];

// ⚠️ Los datos bancarios NO se versionan: van en privado.json (en .gitignore)
// junto a este script, o en las variables COT_BANCO / COT_CLABE / COT_TITULAR.
//   { "banco": "BBVA", "clabe": "012 ...", "titular": "Rubén Núñez Rivera" }
// Solo la CLABE: el número de tarjeta nunca va en un documento.
function notaDeposito() {
  const archivo = path.join(DIR, 'privado.json');
  const p = fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, 'utf8')) : {};
  const banco = process.env.COT_BANCO || p.banco;
  const clabe = process.env.COT_CLABE || p.clabe;
  const titular = process.env.COT_TITULAR || p.titular;
  if (!banco || !clabe || !titular) {
    throw new Error('Faltan los datos de depósito: crear scripts/cotizacion/privado.json (ver render.js)');
  }
  return `Depósitos a **${banco} · CLABE ${clabe}** · a nombre de ${titular}.`;
}

// Lo más abajo que puede llegar la tabla antes de chocar con totales y opciones.
const LIMITE_TABLA = 585;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const texto = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const dinero = n => (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const lista = (clase, xs) => xs && xs.length ? `<ul${clase ? ` class="${clase}"` : ''}>${xs.map(x => `<li>${texto(x)}</li>`).join('')}</ul>` : '';

function fechaLarga(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} / ${MESES[m - 1]} / ${a}`;
}

function armar(c) {
  const filas = c.items.map((it, i) => `      <tr class="item">
        <td class="desc"><b>${i + 1}. ${texto(it.titulo)}</b>${it.etiqueta ? ` <em>${texto(it.etiqueta)}</em>` : ''}
          ${lista('', it.puntos)}
          ${it.incluye && it.incluye.length ? `<div class="incl">Incluye:</div>${lista('sub2', it.incluye)}` : ''}
        </td>
        <td class="c-u">${it.unidades}</td><td class="c-p">${dinero(it.precio)}</td><td class="c-i">${dinero(it.unidades * it.precio)}</td>
      </tr>`);
  if (c.descuento) {
    filas.push(`      <tr class="desc-row">
        <td class="desc">${texto(c.descuento.concepto || 'Descuento por paquete')}</td>
        <td class="c-u">-</td><td class="c-p"></td><td class="c-i">${dinero(-c.descuento.monto)}</td>
      </tr>`);
  }

  const subtotal = c.items.reduce((s, it) => s + it.unidades * it.precio, 0) - (c.descuento ? c.descuento.monto : 0);
  const tasa = c.iva === undefined ? 0.16 : c.iva;
  const iva = Math.round(subtotal * tasa * 100) / 100;
  const fila = (k, v, extra = '') => `    <div class="fila${extra}"><span>${k}</span><span>${dinero(v)}</span></div>`;
  const totales = [fila('Subtotal:', subtotal)];
  if (tasa) totales.push(fila(`IVA ${Math.round(tasa * 100)}%:`, iva));
  totales.push(fila('Total:', subtotal + iva, ' total'));

  const opciones = c.opciones && c.opciones.length
    ? `  <div class="opciones">\n    <b>También disponible</b>${tasa ? ' (precios más IVA)' : ''}:<br>\n    ${c.opciones.map(texto).join('<br>\n    ')}\n  </div>`
    : '';

  const notas = [...(c.notas || []), ...NOTAS_FIJAS, notaDeposito()].map(n => `    <li>${texto(n)}</li>`).join('\n');

  const valores = {
    cliente: esc(c.cliente), proyecto: esc(c.proyecto), folio: esc(c.folio),
    atencion: esc(c.atencion), vigencia: esc(c.vigencia || '15 días'),
    fecha: fechaLarga(c.fecha || new Date().toISOString().slice(0, 10)),
    filas: filas.join('\n'), totales: totales.join('\n'), opciones, notas,
  };
  const html = fs.readFileSync(path.join(DIR, 'plantilla.html'), 'utf8')
    .replace(/\{\{(\w+)\}\}/g, (_, k) => {
      if (!(k in valores)) throw new Error(`La plantilla pide {{${k}}} y no hay dato`);
      return valores[k];
    });
  return { html, subtotal, iva, total: subtotal + iva };
}

(async () => {
  const folio = process.argv[2];
  if (!folio) { console.error('Uso: node scripts/cotizacion/render.js <folio>'); process.exit(1); }
  const c = JSON.parse(fs.readFileSync(path.join(DIR, 'cotizaciones', `${folio}.json`), 'utf8'));
  const { html, subtotal, iva, total } = armar(c);

  // El HTML armado se escribe junto a la plantilla para que las imágenes
  // relativas resuelvan; se borra al terminar.
  const tmp = path.join(DIR, `.${folio}.html`);
  fs.writeFileSync(tmp, html);
  const salida = path.join(DIR, 'salida');
  fs.mkdirSync(salida, { recursive: true });
  const slug = c.cliente.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const pdf = path.join(salida, `Cotizacion-${slug}-${folio}.pdf`);

  const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  try {
    const pagina = await navegador.newPage();
    await pagina.goto('file://' + tmp, { waitUntil: 'networkidle' });
    await pagina.evaluate(() => document.fonts.ready);
    // La hoja es de posiciones fijas: si la tabla crece de más se encima con
    // totales y notas sin que nada truene. Mejor fallar que mandar eso.
    const fondo = await pagina.evaluate(() => document.querySelector('.tabla').getBoundingClientRect().bottom * 0.75);
    if (fondo > LIMITE_TABLA) {
      throw new Error(`La tabla llega a ${fondo.toFixed(0)}pt y el límite es ${LIMITE_TABLA}pt: recortar texto de los conceptos`);
    }
    await pagina.pdf({ path: pdf, width: '8.5in', height: '11in', printBackground: true, preferCSSPageSize: true });
  } finally {
    await navegador.close();
    fs.rmSync(tmp, { force: true });
  }
  console.log(`OK  ${path.relative(process.cwd(), pdf)}`);
  console.log(`    Subtotal ${dinero(subtotal)}  IVA ${dinero(iva)}  Total ${dinero(total)}`);
})().catch(e => { console.error(e.message || e); process.exit(1); });
