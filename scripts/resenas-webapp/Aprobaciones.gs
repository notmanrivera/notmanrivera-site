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
 *
 * Los posts de LinkedIn pasan por el mismo camino (pestaña LinkedIn): la
 * rutina de los lunes los escribe, aquí se aprueban, y el día que toca
 * publicarlos vuelven a aparecer con el texto listo para copiar y un botón
 * "Ya lo publiqué". Publicar en LinkedIn lo hace Rubén a mano.
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

// Pestaña LinkedIn (base 1). La llena la rutina de los lunes.
const LI = { HOJA: 'LinkedIn', FECHA: 1, IDIOMA: 2, TEMA: 3, TEXTO: 4, MEDIO: 5, APROBADO: 6, ESTADO: 7, NOTAS: 8 };
const LI_TOTAL = 8;
// Un post aprobado sigue apareciendo para publicar hasta 3 días después de su fecha.
const LI_DIAS_PUBLICAR = 3;

// ─────────────────────────────────────────────────────────────
//  Lo que llama la web app (doGet / doPost en Resenas.gs)
// ─────────────────────────────────────────────────────────────

function pendientesPublicos_(token) {
  if (!tokenValido_(token)) return { ok: false, error: 'token' };
  return { ok: true, hojaUrl: urlHoja_(), pendientes: pendientesDeAprobar_().concat(postsLinkedIn_()) };
}

/**
 * { t, tipo: 'primero' | 'seguimiento', fila, empresa, email, valor: 'sí' | 'no' | '' }
 * o, para LinkedIn, { t, tipo: 'linkedin' | 'publicar', fila, empresa: tema, clave: yyyyMMdd, valor }
 */
function aprobarFila_(d) {
  if (!tokenValido_(d.t)) return { ok: false, error: 'token' };
  const valor = d.valor === 'sí' || d.valor === 'no' ? d.valor : (d.valor === '' ? '' : null);
  const fila = Number(d.fila);
  if (valor === null || !(fila >= 2)) return { ok: false, error: 'formato' };
  if (d.tipo === 'linkedin' || d.tipo === 'publicar') return decidirPost_(d, fila, valor);

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
  const pendientes = pendientesDeAprobar_().concat(postsLinkedIn_());
  if (!pendientes.length) return;

  const liga = APROBAR.PAGINA + '#t=' + tokenDe_(hoy_());
  const esc = function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  const cuenta = contar_(pendientes);
  const etiqueta = { seguimiento: 'Seguimiento · ', linkedin: 'LinkedIn · ', publicar: 'Publicar hoy en LinkedIn · ' };
  const filas = pendientes.map(function (p) {
    return '<tr><td style="padding:10px 0;border-bottom:1px solid #33204f">' +
      (etiqueta[p.tipo] ? '<span style="color:#A96BFF;font-size:11px;text-transform:uppercase;letter-spacing:.1em">' + etiqueta[p.tipo] + '</span>' : '') +
      '<b style="color:#fff">' + esc(p.empresa) + '</b>' +
      '<span style="color:#A99CC4"> · ' + esc([p.pais, p.tipoEmpresa, p.segmento].filter(Boolean).join(' · ')) + '</span><br>' +
      '<span style="color:#d8d2e6">' + esc(p.asunto) + '</span>' +
      // El día de publicar, el texto completo: se puede copiar desde el correo.
      (p.tipo === 'publicar' ? '<div style="white-space:pre-wrap;background:#1A1A1A;color:#e8e3f2;padding:12px;margin-top:8px;font-size:14px">' +
        esc(p.cuerpo) + '</div>' + (p.medio ? '<a href="' + esc(p.medio) + '" style="color:#A96BFF">Abrir el ' + (/\.mp4$/i.test(p.medio) ? 'video' : 'archivo') + ' para guardarlo</a>' : '') : '') +
      '</td></tr>';
  }).join('');
  const html =
    '<div style="background:#000;color:#fff;font-family:Arial,sans-serif;padding:24px;max-width:560px">' +
    '<div style="font-size:13px;color:#A99CC4;text-transform:uppercase;letter-spacing:.1em">Por aprobar hoy</div>' +
    '<h1 style="font-size:24px;margin:6px 0 4px">' + (resumen_(cuenta) || 'Hoy toca publicar en LinkedIn') + '</h1>' +
    '<p style="color:#d8d2e6;margin:0 0 16px">' +
    (cuenta.primero ? 'Primeros correos: si los apruebas antes de las 9 salen a las 9; antes de la 1, a la 1; más tarde, mañana. ' : '') +
    (cuenta.seguimiento ? 'Seguimientos: aprobados antes de las 11 salen hoy a las 4:47; si no decides en 3 días, sale la plantilla. ' : '') +
    (cuenta.linkedin ? 'Posts: apruébalos antes de su fecha; ese día te llegan aquí con el texto listo para copiar. ' : '') +
    (cuenta.publicar ? 'Hoy toca publicar: copia el texto, guarda el video y publícalo en LinkedIn; luego márcalo en la página.' : '') + '</p>' +
    '<table style="width:100%;border-collapse:collapse">' + filas + '</table>' +
    '<p style="margin:22px 0 6px"><a href="' + liga + '" style="display:inline-block;background:#E50012;color:#fff;' +
    'text-decoration:none;font-weight:bold;padding:14px 26px;font-size:16px">Revisar y aprobar</a></p>' +
    '<p style="color:#A99CC4;font-size:12px">La liga vale hoy y mañana. Ahí ves cada correo completo antes de decidir.</p></div>';
  const texto = 'Por aprobar hoy: ' + (resumen_(cuenta) || 'hoy toca publicar en LinkedIn') + '\n\n' +
    pendientes.map(function (p) {
      return '- ' + (etiqueta[p.tipo] ? '[' + etiqueta[p.tipo].replace(' · ', '') + '] ' : '') + p.empresa +
        (p.pais || p.tipoEmpresa ? ' (' + [p.pais, p.tipoEmpresa].filter(Boolean).join(', ') + ')' : '') + ': ' + p.asunto +
        (p.tipo === 'publicar' ? '\n\n' + p.cuerpo + (p.medio ? '\n\nArchivo: ' + p.medio : '') + '\n' : '');
    }).join('\n') +
    '\n\nRevisar y aprobar: ' + liga;

  MailApp.sendEmail({
    to: APROBAR.AVISAR_A,
    subject: 'Por aprobar hoy: ' + (resumen_(cuenta) || 'hoy toca publicar en LinkedIn') +
      (cuenta.publicar && resumen_(cuenta) ? ' · Hoy toca publicar en LinkedIn' : ''),
    body: texto,
    htmlBody: html,
    name: 'Prospección notmanrivera.com',
  });
}

// ─────────────────────────────────────────────────────────────
//  Internas
// ─────────────────────────────────────────────────────────────

function contar_(pendientes) {
  const c = { primero: 0, seguimiento: 0, linkedin: 0, publicar: 0 };
  pendientes.forEach(function (p) { c[p.tipo]++; });
  return c;
}

/** "4 prospectos, 2 seguimientos y 2 posts de LinkedIn" (lo de publicar va aparte). */
function resumen_(c) {
  const partes = [];
  if (c.primero) partes.push(c.primero + ' prospecto' + (c.primero === 1 ? '' : 's'));
  if (c.seguimiento) partes.push(c.seguimiento + ' seguimiento' + (c.seguimiento === 1 ? '' : 's'));
  if (c.linkedin) partes.push(c.linkedin + ' post' + (c.linkedin === 1 ? '' : 's') + ' de LinkedIn');
  return partes.length > 1 ? partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1] : (partes[0] || '');
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

/**
 * Posts de la pestaña LinkedIn que esperan algo de Rubén:
 *   - 'linkedin': con texto, sin decisión en Aprobado y con fecha de hoy en adelante;
 *   - 'publicar': aprobados, sin Estado y con fecha de hoy o de los últimos días.
 */
function postsLinkedIn_() {
  const hoja = SpreadsheetApp.openById(APROBAR.HOJA_ID).getSheetByName(LI.HOJA);
  if (!hoja || hoja.getLastRow() < 2) return [];
  const datos = hoja.getRange(2, 1, hoja.getLastRow() - 1, LI_TOTAL).getValues();
  const hoy = hoy_();
  const limite = hoy_(-LI_DIAS_PUBLICAR);
  const salida = [];
  datos.forEach(function (r, i) {
    const texto = String(r[LI.TEXTO - 1] || '').trim();
    const clave = claveFecha_(r[LI.FECHA - 1]);
    if (!texto || !clave) return;
    const aprobado = String(r[LI.APROBADO - 1]).trim().toLowerCase();
    const estado = String(r[LI.ESTADO - 1]).trim();
    let tipo = '';
    if (!aprobado && !estado && clave >= hoy) tipo = 'linkedin';
    else if (/^s[ií]$/.test(aprobado) && !estado && clave <= hoy && clave >= limite) tipo = 'publicar';
    if (!tipo) return;
    const idioma = String(r[LI.IDIOMA - 1]).trim().toLowerCase() === 'en' ? 'en' : 'es';
    const fecha = Utilities.parseDate(clave, 'America/Mexico_City', 'yyyyMMdd');
    const dia = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][Number(Utilities.formatDate(fecha, 'America/Mexico_City', 'u')) % 7] +
      ' ' + Utilities.formatDate(fecha, 'America/Mexico_City', 'd/M');
    salida.push({
      tipo: tipo,
      fila: i + 2,
      clave: clave,
      empresa: String(r[LI.TEMA - 1]).trim() || 'Post de LinkedIn',
      email: '',
      asunto: (tipo === 'publicar' ? 'Publicar ' + (clave === hoy ? 'hoy' : 'pendiente del ' + dia) : 'Post para el ' + dia) +
        ' · ' + (idioma === 'en' ? 'inglés' : 'español'),
      cuerpo: texto,
      idioma: idioma,
      dia: dia,
      medio: String(r[LI.MEDIO - 1] || '').trim(),
      notas: String(r[LI.NOTAS - 1] || ''),
    });
  });
  return salida;
}

function decidirPost_(d, fila, valor) {
  const candado = LockService.getScriptLock();
  if (!candado.tryLock(20000)) return { ok: false, error: 'ocupado' };
  try {
    const hoja = SpreadsheetApp.openById(APROBAR.HOJA_ID).getSheetByName(LI.HOJA);
    if (!hoja || fila > hoja.getLastRow()) return { ok: false, error: 'cambio' };
    const r = hoja.getRange(fila, 1, 1, LI_TOTAL).getValues()[0];
    // Misma idea que con los prospectos: si se movieron filas, no se escribe en otra.
    if ((String(r[LI.TEMA - 1]).trim() || 'Post de LinkedIn') !== String(d.empresa || '').trim() ||
        claveFecha_(r[LI.FECHA - 1]) !== String(d.clave || '')) {
      return { ok: false, error: 'cambio' };
    }
    const aprobado = String(r[LI.APROBADO - 1]).trim().toLowerCase();
    const estado = String(r[LI.ESTADO - 1]).trim();
    let que;
    if (d.tipo === 'linkedin') {
      if (estado) return { ok: false, error: 'enviada' };
      hoja.getRange(fila, LI.APROBADO).setValue(valor);
      que = valor === 'sí' ? 'Aprobado' : 'Descartado';
    } else {
      if (!/^s[ií]$/.test(aprobado)) return { ok: false, error: 'enviada' };
      hoja.getRange(fila, LI.ESTADO).setValue(valor === 'sí' ? 'Publicado' : (valor === 'no' ? 'No se publicó' : ''));
      que = valor === 'sí' ? 'Publicado' : 'No se publicó';
    }
    if (valor) {
      const notas = String(r[LI.NOTAS - 1] || '').trim();
      const hora = Utilities.formatDate(new Date(), 'America/Mexico_City', 'd/M H:mm');
      hoja.getRange(fila, LI.NOTAS).setValue((notas + ' · ' + que + ' desde el celular ' + hora).replace(/^ · /, ''));
    }
    return { ok: true, fila: fila, valor: valor };
  } finally {
    candado.releaseLock();
  }
}

/** Fecha de la hoja (Date o "d/M/yyyy") → "yyyyMMdd"; '' si no se entiende. */
function claveFecha_(v) {
  if (v instanceof Date && !isNaN(v)) return Utilities.formatDate(v, 'America/Mexico_City', 'yyyyMMdd');
  const m = String(v || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? m[3] + ('0' + m[2]).slice(-2) + ('0' + m[1]).slice(-2) : '';
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
