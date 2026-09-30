#!/usr/bin/env node
// Genera el PDF de un contrato con el mismo diseño que las cotizaciones.
//
//   npm i --no-save playwright
//   node scripts/cotizacion/contrato.js CTR-2026-001
// Lee contratos/CTR-2026-001.json y la cotización que cita (para la tabla de
// entregables y los montos) y deja el PDF en salida/.
//
// En los textos: **así** sale en negritas, {{total}}, {{anticipo}}, etc. se
// llenan con los montos calculados de la cotización, y ___ deja una línea
// para llenar a mano.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname;
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const ORDINALES = ['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta', 'Sexta',
  'Séptima', 'Octava', 'Novena', 'Décima', 'Décima primera', 'Décima segunda',
  'Décima tercera', 'Décima cuarta', 'Décima quinta'];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const dinero = n => (n < 0 ? '−' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const capital = s => s[0].toUpperCase() + s.slice(1);

// Montos en letra, como se acostumbra en los contratos en México.
function letra(n) {
  const U = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
    'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
    'veinte', 'veintiún', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis',
    'veintisiete', 'veintiocho', 'veintinueve'];
  const D = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const C = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos',
    'setecientos', 'ochocientos', 'novecientos'];
  const menorMil = x => {
    if (x === 100) return 'cien';
    const c = Math.floor(x / 100), r = x % 100;
    const dec = r < 30 ? U[r] : D[Math.floor(r / 10)] + (r % 10 ? ' y ' + U[r % 10] : '');
    return [C[c], dec].filter(Boolean).join(' ');
  };
  const entero = Math.floor(n), centavos = Math.round((n - entero) * 100);
  if (entero >= 1e6) throw new Error('Monto demasiado grande para pasarlo a letra');
  const miles = Math.floor(entero / 1000), resto = entero % 1000;
  const partes = [];
  if (miles) partes.push(miles === 1 ? 'mil' : menorMil(miles) + ' mil');
  if (resto) partes.push(menorMil(resto));
  const palabras = partes.join(' ') || 'cero';
  return `${palabras} pesos ${String(centavos).padStart(2, '0')}/100 M.N.`;
}

// ⚠️ Los datos bancarios NO se versionan: van en privado.json (en .gitignore),
// por folio, porque quien recibe el pago y factura puede cambiar por cliente:
//   { "contratos": { "CTR-2026-001": { "banco": "BBVA", "clabe": "...", "titular": "..." } } }
// Los textos los usan con {{banco}}, {{clabe}} y {{titular}}. Solo la CLABE:
// el número de tarjeta nunca va en un documento.
function deposito(folio) {
  const archivo = path.join(DIR, 'privado.json');
  const p = fs.existsSync(archivo) ? JSON.parse(fs.readFileSync(archivo, 'utf8')) : {};
  const d = (p.contratos || {})[folio];
  return d ? { banco: d.banco, clabe: d.clabe, titular: d.titular } : {};
}

function fechaLarga(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}
function fechaCorta(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} / ${capital(MESES[m - 1])} / ${a}`;
}

function armar(k) {
  const cot = JSON.parse(fs.readFileSync(path.join(DIR, 'cotizaciones', `${k.cotizacion}.json`), 'utf8'));
  const dto = cot.descuento ? cot.descuento.monto : 0;
  const subtotal = cot.items.reduce((s, it) => s + it.unidades * it.precio, 0) - dto;
  const tasa = cot.iva === undefined ? 0.16 : cot.iva;
  const iva = Math.round(subtotal * tasa * 100) / 100;
  const total = subtotal + iva;
  const anticipo = Math.round(total * 50) / 100;
  const montos = {
    cotizacion: k.cotizacion, fechaCotizacion: fechaLarga(cot.fecha),
    subtotal: dinero(subtotal), subtotalLetra: letra(subtotal), iva: dinero(iva),
    total: dinero(total), totalLetra: letra(total),
    anticipo: dinero(anticipo), finiquito: dinero(total - anticipo),
    ...deposito(k.folio),
  };

  const texto = s => esc(s)
    .replace(/\{\{(\w+)\}\}/g, (_, v) => {
      if (!(v in montos)) throw new Error(`El texto pide {{${v}}} y no hay dato`);
      return montos[v];
    })
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/_{3,}/g, '<span class="linea"></span>');

  const tabla = () => {
    const filas = cot.items.map(it => `<tr><td><b>${texto(it.titulo)}</b>${it.puntos ? `<small>${it.puntos.map(texto).join(' ')}</small>` : ''}</td>` +
      `<td class="c-u">${it.unidades}</td><td class="c-p">${dinero(it.precio)}</td><td class="c-i">${dinero(it.unidades * it.precio)}</td></tr>`);
    if (dto) filas.push(`<tr class="dto"><td>${texto(cot.descuento.concepto)}</td><td class="c-u">-</td><td></td><td class="c-i">${dinero(-dto)}</td></tr>`);
    filas.push(`<tr class="sep"><td></td><td></td><td>Subtotal:</td><td>${dinero(subtotal)}</td></tr>`);
    filas.push(`<tr><td></td><td></td><td>IVA ${Math.round(tasa * 100)}%:</td><td>${dinero(iva)}</td></tr>`);
    filas.push(`<tr class="tot"><td></td><td></td><td colspan="2"><div class="caja"><span>Total:</span><span>${dinero(total)}</span></div></td></tr>`);
    return `<table class="tabla"><thead><tr><th>Entregable</th><th class="c-u">Unidades</th><th class="c-p">Precio</th><th class="c-i">Importe</th></tr></thead><tbody>${filas.join('')}</tbody></table>`;
  };

  const P = k.prestador, Cl = k.cliente;
  const out = [];
  out.push(`<p>Contrato de prestación de servicios que celebran, por una parte, <b>${esc(P.nombre)}</b>${P.comercial ? ` (${esc(P.comercial)})` : ""}, a quien en lo sucesivo se denominará <b>“EL PRESTADOR”</b>, y por la otra, <b>${esc(Cl.comercial)}</b>, representada en este acto por <b>${esc(Cl.firma)}</b>, a quien en lo sucesivo se denominará <b>“EL CLIENTE”</b>, al tenor de las siguientes declaraciones y cláusulas.</p>`);

  out.push('<h2>Declaraciones</h2>');
  const decl = (quien, xs, extra) => `<h3>${quien} declara:</h3><ul class="decl">${xs.map((x, i) =>
    `<li><span>${'abcdefg'[i]})</span>${texto(x)}${i === 0 && extra ? extra : ''}</li>`).join('')}</ul>`;
  out.push(decl('I. EL PRESTADOR', k.declaraciones.prestador));
  const campo = (etq, v = '') => `<div class="f"><span>${etq}</span><div>${esc(v)}</div></div>`;
  const datos = `<div class="datos">${campo('Razón social')}${campo('Nombre comercial', Cl.comercial)}${campo('RFC')}` +
    `${campo('Domicilio fiscal')}${campo('')}${campo('Representante', Cl.firma)}${campo('Cargo')}${campo('Correo electrónico')}</div>`;
  out.push(decl('II. EL CLIENTE', k.declaraciones.cliente, datos));
  out.push('<p>Expuesto lo anterior, las partes se sujetan a las siguientes:</p>');

  out.push('<h2>Cláusulas</h2>');
  k.clausulas.forEach((c, i) => {
    const ps = c.parrafos.map(p => `<p${/^[a-z]\) /.test(p) ? ' class="inciso"' : ''}>${texto(p)}</p>`).join('');
    out.push(`<div class="clausula"><h3><span>${ORDINALES[i]}.</span>${esc(c.titulo)}</h3>${ps}${c.tabla ? tabla() : ''}</div>`);
  });

  out.push(`<div class="firmas"><p>Leído que fue el presente contrato y enteradas las partes de su contenido y alcance, lo firman por duplicado en ${esc(k.lugar)}, el ${fechaLarga(k.fecha)}.</p>
    <div class="cols">
      <div class="col"><div class="raya"></div><em>EL CLIENTE</em><br><b>${esc(Cl.firma)}</b><br>En representación de ${esc(Cl.comercial)}</div>
      <div class="col"><div class="raya"></div><em>EL PRESTADOR</em><br><b>${esc(P.nombre)}</b><br>${P.comercial ? esc(P.comercial) : "Por su propio derecho"}</div>
    </div>
  </div>`);

  const valores = {
    cliente: esc(Cl.comercial), folio: esc(k.folio), cotizacion: esc(k.cotizacion),
    fechaCorta: fechaCorta(k.fecha), cuerpo: out.join('\n'),
  };
  const html = fs.readFileSync(path.join(DIR, 'contrato.html'), 'utf8')
    .replace(/\{\{(\w+)\}\}/g, (_, v) => {
      if (!(v in valores)) throw new Error(`La plantilla pide {{${v}}} y no hay dato`);
      return valores[v];
    });
  return { html, total, anticipo, fechaC: fechaCorta(k.fecha) };
}

(async () => {
  const folio = process.argv[2];
  if (!folio) { console.error('Uso: node scripts/cotizacion/contrato.js <folio>'); process.exit(1); }
  const k = JSON.parse(fs.readFileSync(path.join(DIR, 'contratos', `${folio}.json`), 'utf8'));
  const { html, total, anticipo, fechaC } = armar(k);

  const tmp = path.join(DIR, `.${folio}.html`);
  fs.writeFileSync(tmp, html);
  const salida = path.join(DIR, 'salida');
  fs.mkdirSync(salida, { recursive: true });
  const slug = k.cliente.comercial.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const pdf = path.join(salida, `Contrato-${slug}-${folio}.pdf`);

  // Pie en el margen inferior, con número de página para poder rubricar.
  const pie = `<div style="width:100%;padding:0 30pt;font-size:7pt;color:#8b8b8b;font-family:FreeSans,Helvetica,Arial,sans-serif;display:flex;justify-content:space-between">
    <span style="flex:1">Contrato ${esc(k.folio)}</span><span style="flex:1;text-align:center">${fechaC}</span>
    <span style="flex:1;text-align:right">Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>`;

  const navegador = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  try {
    const pagina = await navegador.newPage();
    await pagina.goto('file://' + tmp, { waitUntil: 'networkidle' });
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.pdf({
      path: pdf, width: '8.5in', height: '11in', printBackground: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: pie,
      margin: { top: '0', right: '0', bottom: '32px', left: '0' },
    });
  } finally {
    await navegador.close();
    fs.rmSync(tmp, { force: true });
  }
  console.log(`OK  ${path.relative(process.cwd(), pdf)}`);
  console.log(`    Total ${dinero(total)}  Anticipo ${dinero(anticipo)}`);
})().catch(e => { console.error(e.message || e); process.exit(1); });
