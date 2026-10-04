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
  SEG_PERSONAL: 17, SEG_APROBADO: 18, // seguimiento personalizado (Seguimientos.gs)
};
const PRO_TOTAL = 18;
// Lo mismo que veta un seguimiento en Seguimientos.gs (CONFIG_SEGUIMIENTO.VETO)
// más las marcas de que ya salió.
const SEG_YA_NO = /no seguir|respondi|baja|rebot|bounce|no reintentar|no insistir|seguimiento (enviado|en borrador)/i;

// ─────────────────────────────────────────────────────────────
//  Lo que llama la web app (doGet / doPost en Resenas.gs)
// ─────────────────────────────────────────────────────────────

function pendientesPublicos_(token) {
  if (!tokenValido_(token)) return { ok: false, error: 'token' };
  return { ok: true, hojaUrl: urlHoja_(), pendientes: pendientesDeAprobar_() };
}

/** { t, tipo: 'primero' | 'seguimiento', fila, empresa, email, valor: 'sí' | 'no' | '' } */
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
    const esSeguimiento = d.tipo === 'seguimiento';
    if (esSeguimiento) {
      // El seguimiento solo se decide mientras no haya salido.
      if (String(r[PRO.ESTADO - 1]).trim() !== 'Enviado' || SEG_YA_NO.test(String(r[PRO.NOTAS - 1]))) {
        return { ok: false, error: 'enviada' };
      }
    } else if (!/^(|pendiente de env[ií]o)$/i.test(String(r[PRO.ESTADO - 1]).trim())) {
      return { ok: false, error: 'enviada' };
    }
    hoja.getRange(fila, esSeguimiento ? PRO.SEG_APROBADO : PRO.APROBADO).setValue(valor);
    if (valor) {
      const notas = String(r[PRO.NOTAS - 1] || '').trim();
      const hora = Utilities.formatDate(new Date(), 'America/Mexico_City', 'd/M H:mm');
      const que = esSeguimiento
        ? (valor === 'sí' ? 'Seguimiento personalizado aprobado' : 'Seguimiento personalizado descartado (sale la plantilla)')
        : (valor === 'sí' ? 'Aprobado' : 'Descartado');
      hoja.getRange(fila, PRO.NOTAS).setValue((notas + ' · ' + que + ' desde el celular ' + hora).replace(/^ · /, ''));
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
  const primeros = pendientes.filter(function (p) { return p.tipo === 'primero'; }).length;
  const seguimientos = pendientes.length - primeros;
  const filas = pendientes.map(function (p) {
    return '<tr><td style="padding:10px 0;border-bottom:1px solid #33204f">' +
      (p.tipo === 'seguimiento' ? '<span style="color:#A96BFF;font-size:11px;text-transform:uppercase;letter-spacing:.1em">Seguimiento · </span>' : '') +
      '<b style="color:#fff">' + esc(p.empresa) + '</b>' +
      '<span style="color:#A99CC4"> · ' + esc([p.pais, p.tipoEmpresa, p.segmento].filter(Boolean).join(' · ')) + '</span><br>' +
      '<span style="color:#d8d2e6">' + esc(p.asunto) + '</span></td></tr>';
  }).join('');
  const html =
    '<div style="background:#000;color:#fff;font-family:Arial,sans-serif;padding:24px;max-width:560px">' +
    '<div style="font-size:13px;color:#A99CC4;text-transform:uppercase;letter-spacing:.1em">Por aprobar hoy</div>' +
    '<h1 style="font-size:24px;margin:6px 0 4px">' + resumen_(primeros, seguimientos) + '</h1>' +
    '<p style="color:#d8d2e6;margin:0 0 16px">' +
    (primeros ? 'Primeros correos: lo que apruebes antes de las 9 sale hoy. ' : '') +
    (seguimientos ? 'Seguimientos: aprobados antes de las 11 salen hoy a las 4:47; si no decides en 3 días, sale la plantilla.' : '') + '</p>' +
    '<table style="width:100%;border-collapse:collapse">' + filas + '</table>' +
    '<p style="margin:22px 0 6px"><a href="' + liga + '" style="display:inline-block;background:#E50012;color:#fff;' +
    'text-decoration:none;font-weight:bold;padding:14px 26px;font-size:16px">Revisar y aprobar</a></p>' +
    '<p style="color:#A99CC4;font-size:12px">La liga vale hoy y mañana. Ahí ves cada correo completo antes de decidir.</p></div>';
  const texto = 'Por aprobar hoy: ' + resumen_(primeros, seguimientos) + '\n\n' +
    pendientes.map(function (p) { return '- ' + (p.tipo === 'seguimiento' ? '[Seguimiento] ' : '') + p.empresa + ' (' + [p.pais, p.tipoEmpresa].filter(Boolean).join(', ') + '): ' + p.asunto; }).join('\n') +
    '\n\nRevisar y aprobar: ' + liga;

  MailApp.sendEmail({
    to: APROBAR.AVISAR_A,
    subject: 'Por aprobar hoy: ' + resumen_(primeros, seguimientos),
    body: texto,
    htmlBody: html,
    name: 'Prospección notmanrivera.com',
  });
}

// ─────────────────────────────────────────────────────────────
//  Internas
// ─────────────────────────────────────────────────────────────

function resumen_(primeros, seguimientos) {
  const partes = [];
  if (primeros) partes.push(primeros + ' prospecto' + (primeros === 1 ? '' : 's'));
  if (seguimientos) partes.push(seguimientos + ' seguimiento' + (seguimientos === 1 ? '' : 's'));
  return partes.join(' y ');
}

/**
 * Lo que espera decisión:
 *   - primeros correos: sin "sí"/"no" en Aprobado, pendientes de envío y verificados;
 *   - seguimientos personalizados: con texto en la columna Q, sin decisión en
 *     R, ya enviados y sin seguimiento todavía.
 */
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
    const notas = String(r[PRO.NOTAS - 1] || '');
    const estado = String(r[PRO.ESTADO - 1]).trim();
    const personal = String(r[PRO.SEG_PERSONAL - 1] || '').trim();
    const esSeguimiento = estado === 'Enviado' && personal && !String(r[PRO.SEG_APROBADO - 1]).trim() && !SEG_YA_NO.test(notas);
    if (!esSeguimiento) {
      if (String(r[PRO.APROBADO - 1]).trim()) continue;
      if (!/^(|pendiente de env[ií]o)$/i.test(estado)) continue;
      if (String(r[PRO.VERIFICACION - 1]).trim().toLowerCase() !== 'safe') continue;
    }
    const seg = notas.match(/Segmento:\s*([^·]+)/);
    const ab = notas.match(/Prueba A\/B:\s*(caso|portada)/i);
    const fuente = notas.match(/Correo publicado en (\S+)/);
    salida.push({
      tipo: esSeguimiento ? 'seguimiento' : 'primero',
      fila: i + 2,
      empresa: empresa,
      email: email,
      asunto: (esSeguimiento ? 'Re: ' : '') + String(r[PRO.ASUNTO - 1]),
      cuerpo: esSeguimiento ? personal : String(r[PRO.CUERPO - 1]),
      idioma: String(r[PRO.IDIOMA - 1]).trim(),
      pais: String(r[PRO.PAIS - 1]).trim(),
      tipoEmpresa: String(r[PRO.TIPO - 1]).trim(),
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
