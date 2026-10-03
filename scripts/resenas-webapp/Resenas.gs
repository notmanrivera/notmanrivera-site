/**
 * Reseñas de clientes: web app que recibe el formulario de
 * notmanrivera.com/resena/ y entrega las aprobadas al sitio.
 *
 * ⚠️ Es un proyecto APARTE del de prospección, propiedad de hola@. El de
 * prospección vive dentro de la hoja, y la hoja es de rnrivera93@gmail.com:
 * Google solo deja publicar una web app a usuarios del dominio del dueño
 * ("Only users in the same domain as the script owner may deploy this
 * script"), así que hola@ no podía desplegarla ahí. Este proyecto abre la
 * misma hoja por ID (hola@ es editor) y solo pide dos permisos: hojas de
 * cálculo y mandar correo como hola@ (MailApp, no acceso a la bandeja).
 *
 * Flujo:
 *   1. "Nueva invitación de reseña" (menú Prospección de la hoja, en
 *      scripts/apps-script/Invitaciones.gs) crea un código en la pestaña
 *      Invitaciones y da la liga personal: /resena/?c=<código>.
 *   2. El cliente llena el formulario. doPost guarda su texto tal cual en
 *      Reseñas y avisa a hola@.
 *   3. La rutina diaria de Claude escribe en "Texto corregido" solo ajustes
 *      de estilo (ortografía, acentos, mayúsculas, puntuación).
 *   4. Rubén pone "sí" en Aprobada.
 *   5. La Action resenas.yml del repo pide ?accion=publicadas cada hora y
 *      publica lo aprobado en la portada.
 *
 * Es pública (cualquiera con la URL), así que solo acepta códigos que
 * existan en Invitaciones y nunca devuelve una reseña sin "sí" en Aprobada.
 */

const RESENAS = {
  HOJA_ID: '1240Zwpx5A8QslkJonFUdGXSTyV4wbS_PuIX_0JvoMe0', // Prospección deportiva
  HOJA_INVITACIONES: 'Invitaciones',
  HOJA_RESENAS: 'Reseñas',
  AVISAR_A: 'hola@notmanrivera.com',
  MIN: 40,
  MAX: 1500,
  MAX_CAMPO: 120,
};

// Columnas (base 1)
const INV = { CODIGO: 1, NOMBRE: 2, EMPRESA: 3, IDIOMA: 4, CREADA: 5, ESTADO: 6, NOTAS: 7 };
const RES = {
  RECIBIDA: 1, CODIGO: 2, NOMBRE: 3, CARGO: 4, EMPRESA: 5, RELACION: 6, IDIOMA: 7,
  ORIGINAL: 8, PERMISO: 9, LINKEDIN: 10, CORREGIDO: 11, APROBADA: 12, NOTAS: 13,
};
const RES_TOTAL = 13;

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    // ⚠️ "codigo", no "c": Apps Script reserva ?c= en las URL de sus web
    // apps y contesta con una página de error de Drive sin llegar a doGet.
    if (p.accion === 'invitacion') return json_(invitacionPublica_(p.codigo));
    if (p.accion === 'publicadas') return json_({ ok: true, resenas: resenasPublicadas_() });
    if (p.accion === 'pendientes') return json_(pendientesPublicos_(p.t)); // Aprobaciones.gs
    return json_({ ok: true });
  } catch (err) {
    Logger.log('doGet: ' + err.message);
    return json_({ ok: false, error: 'interno' });
  }
}

/**
 * El formulario manda JSON como text/plain: así el navegador no hace la
 * consulta previa de CORS, que Apps Script no sabe contestar.
 */
function doPost(e) {
  let datos;
  try {
    datos = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'formato' });
  }
  // Aprobar o descartar un prospecto desde notmanrivera.com/aprobar/
  // (Aprobaciones.gs). Va antes que todo lo de reseñas.
  if (datos.accion === 'aprobar') {
    try {
      return json_(aprobarFila_(datos));
    } catch (err) {
      Logger.log('aprobar: ' + err.message);
      return json_({ ok: false, error: 'interno' });
    }
  }

  // Campo trampa: invisible para personas, los bots lo llenan.
  if (String(datos.web || '').trim()) return json_({ ok: true });

  const r = {
    codigo: limpiar_(datos.c, 40).toLowerCase(),
    nombre: limpiar_(datos.nombre, RESENAS.MAX_CAMPO),
    cargo: limpiar_(datos.cargo, RESENAS.MAX_CAMPO),
    empresa: limpiar_(datos.empresa, RESENAS.MAX_CAMPO),
    relacion: limpiar_(datos.relacion, RESENAS.MAX_CAMPO),
    resena: limpiarTexto_(datos.resena, RESENAS.MAX + 200),
    linkedin: limpiar_(datos.linkedin, 200),
    idioma: datos.idioma === 'en' ? 'en' : 'es',
    permiso: datos.permiso === true,
  };
  if (!r.nombre || !r.cargo || !r.empresa) return json_({ ok: false, error: 'faltan' });
  if (r.resena.length < RESENAS.MIN) return json_({ ok: false, error: 'corta' });
  if (r.resena.length > RESENAS.MAX) return json_({ ok: false, error: 'larga' });
  if (!r.permiso) return json_({ ok: false, error: 'permiso' });
  if (r.linkedin && !/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/\S+$/i.test(r.linkedin)) r.linkedin = '';

  const candado = LockService.getScriptLock();
  if (!candado.tryLock(20000)) return json_({ ok: false, error: 'ocupado' });
  try {
    const ss = libro_();
    const inv = buscarInvitacion_(ss, r.codigo);
    if (!inv) return json_({ ok: false, error: 'codigo' });
    if (/^cerrada$/i.test(inv.estado)) return json_({ ok: false, error: 'cerrada' });

    const hoja = ss.getSheetByName(RESENAS.HOJA_RESENAS);
    const fila = [
      new Date(), r.codigo, r.nombre, r.cargo, r.empresa, r.relacion, r.idioma,
      r.resena, 'sí', r.linkedin, '', '', '',
    ].map(sinFormula_);

    // Si ya mandó una y aún no está aprobada, la sustituye (corrigió algo).
    // Si ya está aprobada, la nueva entra como fila aparte para revisarla.
    const previa = buscarResena_(hoja, r.codigo);
    let numFila;
    if (previa && !/^s[ií]$/i.test(previa.aprobada)) {
      numFila = previa.fila;
      fila[RES.NOTAS - 1] = 'Reenvío: sustituye la versión anterior';
    } else {
      numFila = hoja.getLastRow() + 1;
      if (previa) fila[RES.NOTAS - 1] = 'Segunda reseña con el mismo código (la anterior ya estaba aprobada)';
    }
    hoja.getRange(numFila, 1, 1, RES_TOTAL).setValues([fila]);
    ss.getSheetByName(RESENAS.HOJA_INVITACIONES).getRange(inv.fila, INV.ESTADO).setValue('Recibida');
    SpreadsheetApp.flush();

    avisarResena_(r, ss.getUrl() + '#gid=' + hoja.getSheetId());
    return json_({ ok: true });
  } catch (err) {
    Logger.log('doPost: ' + err.message);
    return json_({ ok: false, error: 'interno' });
  } finally {
    candado.releaseLock();
  }
}

/** Lo mínimo para saludar por nombre: nada que no haya escrito Rubén. */
function invitacionPublica_(codigo) {
  const inv = buscarInvitacion_(libro_(), limpiar_(codigo, 40).toLowerCase());
  if (!inv) return { ok: false, error: 'codigo' };
  if (/^cerrada$/i.test(inv.estado)) return { ok: false, error: 'cerrada' };
  return {
    ok: true,
    nombre: inv.nombre,
    empresa: inv.empresa,
    idioma: inv.idioma === 'en' ? 'en' : 'es',
    recibida: /^recibida$/i.test(inv.estado),
  };
}

function resenasPublicadas_() {
  const hoja = libro_().getSheetByName(RESENAS.HOJA_RESENAS);
  const n = hoja.getLastRow();
  if (n < 2) return [];
  const datos = hoja.getRange(2, 1, n - 1, RES_TOTAL).getValues();
  const salida = [];
  for (let i = 0; i < datos.length; i++) {
    const d = datos[i];
    if (!/^s[ií]$/i.test(String(d[RES.APROBADA - 1]).trim())) continue;
    if (!/^s[ií]$/i.test(String(d[RES.PERMISO - 1]).trim())) continue;
    const texto = String(d[RES.CORREGIDO - 1] || '').trim() || String(d[RES.ORIGINAL - 1] || '').trim();
    if (!texto) continue;
    const fecha = d[RES.RECIBIDA - 1];
    salida.push({
      nombre: String(d[RES.NOMBRE - 1]).trim(),
      cargo: String(d[RES.CARGO - 1]).trim(),
      empresa: String(d[RES.EMPRESA - 1]).trim(),
      idioma: String(d[RES.IDIOMA - 1]).trim() === 'en' ? 'en' : 'es',
      texto: texto,
      linkedin: String(d[RES.LINKEDIN - 1] || '').trim(),
      fecha: fecha instanceof Date ? Utilities.formatDate(fecha, 'America/Mexico_City', 'yyyy-MM-dd') : '',
    });
  }
  // Más recientes primero.
  salida.sort(function (a, b) { return a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0; });
  return salida;
}

function buscarInvitacion_(ss, codigo) {
  if (!codigo) return null;
  const hoja = ss.getSheetByName(RESENAS.HOJA_INVITACIONES);
  const n = hoja.getLastRow();
  if (n < 2) return null;
  const datos = hoja.getRange(2, 1, n - 1, 6).getValues();
  for (let i = 0; i < datos.length; i++) {
    if (String(datos[i][INV.CODIGO - 1]).trim().toLowerCase() !== codigo) continue;
    return {
      fila: i + 2,
      nombre: String(datos[i][INV.NOMBRE - 1]).trim(),
      empresa: String(datos[i][INV.EMPRESA - 1]).trim(),
      idioma: String(datos[i][INV.IDIOMA - 1]).trim().toLowerCase(),
      estado: String(datos[i][INV.ESTADO - 1]).trim(),
    };
  }
  return null;
}

/** La fila más reciente con ese código, o null. */
function buscarResena_(hoja, codigo) {
  const n = hoja.getLastRow();
  if (n < 2) return null;
  const datos = hoja.getRange(2, 1, n - 1, RES_TOTAL).getValues();
  for (let i = datos.length - 1; i >= 0; i--) {
    if (String(datos[i][RES.CODIGO - 1]).trim().toLowerCase() === codigo) {
      return { fila: i + 2, aprobada: String(datos[i][RES.APROBADA - 1]).trim() };
    }
  }
  return null;
}

function avisarResena_(r, urlHoja) {
  const cuerpo = [
    r.nombre + ' (' + r.cargo + ', ' + r.empresa + ') dejó una reseña.',
    r.relacion ? 'Relación: ' + r.relacion : '',
    r.linkedin ? 'LinkedIn: ' + r.linkedin : '',
    '',
    '"' + r.resena + '"',
    '',
    'La rutina de mañana propone la corrección de estilo en "Texto corregido".',
    'Para publicarla pon "sí" en Aprobada: ' + urlHoja,
  ].filter(function (l, i) { return l || i > 2; }).join('\n');
  MailApp.sendEmail(RESENAS.AVISAR_A, 'Nueva reseña: ' + r.nombre + ' (' + r.empresa + ')', cuerpo,
    { name: 'Reseñas notmanrivera.com' });
}

function libro_() {
  return SpreadsheetApp.openById(RESENAS.HOJA_ID);
}

/**
 * Córrela UNA vez desde el editor (como hola@) para aceptar los permisos.
 * Sin eso la web app contesta "Authorization is required" a todo el mundo.
 */
function autorizar() {
  const libro = libro_();
  Logger.log('Hoja: ' + libro.getName() + ' · pestañas: ' +
    [RESENAS.HOJA_INVITACIONES, RESENAS.HOJA_RESENAS].map(function (n) {
      return n + (libro.getSheetByName(n) ? ' OK' : ' NO EXISTE');
    }).join(', '));
  Logger.log('Correos que quedan hoy: ' + MailApp.getRemainingDailyQuota());
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function limpiar_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Como limpiar_, pero respeta los saltos de párrafo. */
function limpiarTexto_(v, max) {
  return String(v == null ? '' : v).replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ')
    .replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n')
    .trim().slice(0, max);
}

/** Lo que empieza con = + - @ la hoja lo tomaría como fórmula. */
function sinFormula_(v) {
  return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
}
