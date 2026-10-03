/**
 * Aprobar prospectos desde el celular.
 *
 * Cada mañana (≈8:15, después de la rutina de las 7:45) correoPorAprobar()
 * manda a hola@ un correo con los prospectos que esperan su "sí" y un botón
 * a notmanrivera.com/aprobar/#t=<token>. Esa página pide la lista a esta web
 * app (?accion=pendientes) y cada botón Aprobar / Descartar hace un POST
 * (accion=aprobar) que escribe "sí" o "no" en la columna Aprobado.
 *
 * Por qué la página vive en el sitio y no aquí (HtmlService): una página de
 * HtmlService le da a cualquier visitante google.script.run, que puede llamar
 * a CUALQUIER función global del proyecto. Con la página afuera, lo único
 * público siguen siendo doGet y doPost.
 *
 * Por qué botones y no links directos de "aprobar": los filtros antispam y
 * las vistas previas abren los links de los correos. Un GET solo lee; para
 * escribir hace falta el POST que manda el botón.
 *
 * El token cambia cada día (HMAC de la fecha con un secreto guardado en las
 * propiedades del script) y vale hoy y ayer. Solo le llega a hola@.
 *
 * La decisión sigue siendo de Rubén: esto solo le ahorra abrir la hoja.
 */

const APROBAR = {
  HOJA_ID: '1240Zwpx5A8QslkJonFUdGXSTyV4wbS_PuIX_0JvoMe0',
  HOJA: 'Prospectos',
  HOJA_GID: 83143579,
  PAGINA: 'https://notmanrivera.com/aprobar/',
  AVISAR_A: 'hola@notmanrivera.com',
};

// Columnas de Prospectos (base 1), las mismas que COL en Código.gs
const PRO = {
  EMPRESA: 1, EMAIL: 2, ASUNTO: 3, CUERPO: 4, APROBADO: 5, ESTADO: 6, FECHA: 7,
  NOTAS: 8, IDIOMA: 9, PAIS: 12, SITIO: 13, TIPO: 15, VERIFICACION: 16,
};
const PRO_TOTAL = 16;

// ─────────────────────────────────────────────────────────────
//  Lo que llama la web app (doGet / doPost en Resenas.gs)
// ─────────────────────────────────────────────────────────────

function pendientesPublicos_(token) {
  if (!tokenValido_(token)) return { ok: false, error: 'token' };
  return { ok: true, hojaUrl: urlHoja_(), pendientes: pendientesDeAprobar_() };
}

/** { t, fila, empresa, email, valor: 'sí' | 'no' | '' } */
function aprobarFila_(d) {
  if (!tokenValido_(d.t)) return { ok: false, error: 'token' };
  const valor = d.valor === 'sí' || d.valor === 'no' ? d.valor : (d.valor === '' ? '' : null);
  const fila = Number(d.fila);
  if (valor === null || !(fila >= 2)) return { ok: false, error: 'formato' };

  const candado = LockService.getScriptLock();
  if (!candado.tryLock(20000)) return { ok: false, error: 'ocupado' };
  try {
    const hoja = SpreadsheetApp.openById(APROBAR.HOJA_ID).getSheetByName(APROBAR.HOJA);
    const r = hoja.getRange(fila, 1, 1, PRO_TOTAL).getValues()[0];
    // La fila tiene que seguir siendo la misma empresa: si alguien insertó o
    // borró filas desde que se abrió la página, no se escribe en otra.
    if (String(r[PRO.EMPRESA - 1]).trim() !== String(d.empresa || '').trim() ||
        String(r[PRO.EMAIL - 1]).trim().toLowerCase() !== String(d.email || '').trim().toLowerCase()) {
      return { ok: false, error: 'cambio' };
    }
    if (!/^(|pendiente de env[ií]o)$/i.test(String(r[PRO.ESTADO - 1]).trim())) {
      return { ok: false, error: 'enviada' };
    }
    hoja.getRange(fila, PRO.APROBADO).setValue(valor);
    if (valor) {
      const notas = String(r[PRO.NOTAS - 1] || '').trim();
      const hora = Utilities.formatDate(new Date(), 'America/Mexico_City', 'd/M H:mm');
      hoja.getRange(fila, PRO.NOTAS).setValue(
        (notas + ' · ' + (valor === 'sí' ? 'Aprobado' : 'Descartado') + ' desde el celular ' + hora).replace(/^ · /, ''));
    }
    return { ok: true, fila: fila, valor: valor };
  } finally {
    candado.releaseLock();
  }
}

// ─────────────────────────────────────────────────────────────
//  Correo de la mañana (disparador diario ≈8:15)
// ─────────────────────────────────────────────────────────────

function correoPorAprobar() {
  const pendientes = pendientesDeAprobar_();
  if (!pendientes.length) return;

  const liga = APROBAR.PAGINA + '#t=' + tokenDe_(hoy_());
  const esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  const filas = pendientes.map(function (p) {
    return '<tr><td style="padding:10px 0;border-bottom:1px solid #33204f">' +
      '<b style="color:#fff">' + esc(p.empresa) + '</b>' +
      '<span style="color:#A99CC4"> · ' + esc([p.pais, p.tipo, p.segmento].filter(Boolean).join(' · ')) + '</span><br>' +
      '<span style="color:#d8d2e6">' + esc(p.asunto) + '</span></td></tr>';
  }).join('');
  const html =
    '<div style="background:#000;color:#fff;font-family:Arial,sans-serif;padding:24px;max-width:560px">' +
    '<div style="font-size:13px;color:#A99CC4;text-transform:uppercase;letter-spacing:.1em">Por aprobar hoy</div>' +
    '<h1 style="font-size:24px;margin:6px 0 4px">' + pendientes.length + ' prospecto' + (pendientes.length === 1 ? '' : 's') + '</h1>' +
    '<p style="color:#d8d2e6;margin:0 0 16px">Lo que apruebes antes de las 9 sale hoy; después, mañana a las 9.</p>' +
    '<table style="width:100%;border-collapse:collapse">' + filas + '</table>' +
    '<p style="margin:22px 0 6px"><a href="' + liga + '" style="display:inline-block;background:#E50012;color:#fff;' +
    'text-decoration:none;font-weight:bold;padding:14px 26px;font-size:16px">Revisar y aprobar</a></p>' +
    '<p style="color:#A99CC4;font-size:12px">La liga vale hoy y mañana. Ahí ves cada correo completo antes de decidir.</p></div>';
  const texto = 'Por aprobar hoy: ' + pendientes.length + '\n\n' +
    pendientes.map(function (p) { return '- ' + p.empresa + ' (' + [p.pais, p.tipo].filter(Boolean).join(', ') + '): ' + p.asunto; }).join('\n') +
    '\n\nRevisar y aprobar: ' + liga;

  MailApp.sendEmail({
    to: APROBAR.AVISAR_A,
    subject: 'Por aprobar hoy: ' + pendientes.length + ' prospecto' + (pendientes.length === 1 ? '' : 's') + ' (salen a las 9)',
    body: texto,
    htmlBody: html,
    name: 'Prospección notmanrivera.com',
  });
}

// ─────────────────────────────────────────────────────────────
//  Internas
// ─────────────────────────────────────────────────────────────

/** Filas listas para aprobar: sin decisión, pendientes de envío y verificadas. */
function pendientesDeAprobar_() {
  const hoja = SpreadsheetApp.openById(APROBAR.HOJA_ID).getSheetByName(APROBAR.HOJA);
  const n = hoja.getLastRow();
  if (n < 2) return [];
  const datos = hoja.getRange(2, 1, n - 1, PRO_TOTAL).getValues();
  const salida = [];
  for (let i = 0; i < datos.length; i++) {
    const r = datos[i];
    const empresa = String(r[PRO.EMPRESA - 1]).trim();
    const email = String(r[PRO.EMAIL - 1]).trim();
    if (!empresa || !email) continue;
    if (String(r[PRO.APROBADO - 1]).trim()) continue;
    if (!/^(|pendiente de env[ií]o)$/i.test(String(r[PRO.ESTADO - 1]).trim())) continue;
    if (String(r[PRO.VERIFICACION - 1]).trim().toLowerCase() !== 'safe') continue;
    const notas = String(r[PRO.NOTAS - 1] || '');
    const seg = notas.match(/Segmento:\s*([^·]+)/);
    const ab = notas.match(/Prueba A\/B:\s*(caso|portada)/i);
    const fuente = notas.match(/Correo publicado en (\S+)/);
    salida.push({
      fila: i + 2,
      empresa: empresa,
      email: email,
      asunto: String(r[PRO.ASUNTO - 1]),
      cuerpo: String(r[PRO.CUERPO - 1]),
      idioma: String(r[PRO.IDIOMA - 1]).trim(),
      pais: String(r[PRO.PAIS - 1]).trim(),
      tipo: String(r[PRO.TIPO - 1]).trim(),
      segmento: seg ? seg[1].trim() : '',
      prueba: ab ? ab[1].toLowerCase() : '',
      fuente: fuente ? fuente[1] : String(r[PRO.SITIO - 1]).trim(),
      notas: notas,
    });
  }
  return salida;
}

function hoy_(desfaseDias) {
  return Utilities.formatDate(new Date(Date.now() + (desfaseDias || 0) * 864e5), 'America/Mexico_City', 'yyyyMMdd');
}

function tokenDe_(fecha) {
  const props = PropertiesService.getScriptProperties();
  let secreto = props.getProperty('SECRETO_APROBAR');
  if (!secreto) {
    secreto = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty('SECRETO_APROBAR', secreto);
  }
  const firma = Utilities.computeHmacSha256Signature('aprobar|' + fecha, secreto);
  return firma.slice(0, 16).map(function (b) { return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('');
}

function tokenValido_(t) {
  t = String(t || '');
  return t.length === 32 && (t === tokenDe_(hoy_()) || t === tokenDe_(hoy_(-1)));
}

function urlHoja_() {
  return 'https://docs.google.com/spreadsheets/d/' + APROBAR.HOJA_ID + '/edit#gid=' + APROBAR.HOJA_GID;
}
