/**
 * PROSPECCIÓN — envío desde Gmail
 * Google Apps Script · lee la hoja "Prospectos" y envía (o deja en borradores)
 * los primeros correos a prospectos. Las filas las agrega la rutina diaria de
 * Claude (7:45 am); Rubén las aprueba; este script las manda a las 9 am.
 *
 * ⚠️ Fuente oficial: scripts/apps-script/ en el repo notmanrivera-site. Se sube
 * con `clasp push` (ver README.md de esa carpeta). Lo que se edite a mano en
 * el editor de Apps Script se pierde en el siguiente push.
 *
 * ⚠️ Todo lo que se corra A MANO (editor o menú Prospección) manda y lee como
 * la cuenta con la que esté abierta la sesión. El 29/9 una corrida manual con
 * rnrivera93@gmail.com mandó 8 correos desde la cuenta personal. Abrir la hoja
 * y el editor solo con hola@notmanrivera.com.
 */

// ══════════════════════════════════════════════════════════════
//  CONFIGURACIÓN
// ══════════════════════════════════════════════════════════════
const CONFIG = {
  HOJA: 'Prospectos',

  // 'borrador' → deja todo en Borradores de Gmail para que revises y mandes.
  // 'enviar'   → envía directo, sin que nadie lo lea antes.
  MODO: 'enviar',

  // En modo 'enviar', solo salen las filas con "sí" en la columna Aprobado.
  EXIGIR_APROBACION: true,

  MAX_POR_DIA: 10,       // escalón del dominio nuevo; súbelo a 20 en un par de semanas
  PAUSA_MIN_SEG: 5,
  PAUSA_MAX_SEG: 15,

  CAMPANA_UTM: 'prospeccion-2026',

  FIRMA: [
    '',
    '—',
    'Rubén Rivera · Diseño y animación deportiva',
    'Querétaro, México',
    'Si prefieres que no te vuelva a escribir, respóndeme "baja" y no insisto.'
  ].join('\n'),

  ETIQUETA: 'Prospección'
};

const COL = {
  EMPRESA:  1,
  EMAIL:    2,
  ASUNTO:   3,
  CUERPO:   4,
  APROBADO: 5,
  ESTADO:   6,
  FECHA:    7,
  NOTAS:    8,
  IDIOMA:   9,
  VERIFICACION: 16
};

const TOTAL_COLUMNAS = 16;

// ══════════════════════════════════════════════════════════════
//  PROCESO PRINCIPAL
// ══════════════════════════════════════════════════════════════
function procesarPendientes() {
  const INICIO = Date.now();
  const LIMITE_MS = 4.5 * 60 * 1000;
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA);
  if (!hoja) throw new Error('No existe la hoja "' + CONFIG.HOJA + '"');

  const ultimaFila = hoja.getLastRow();
  if (ultimaFila < 2) { Logger.log('Hoja vacía.'); return; }

  const datos = hoja.getRange(2, 1, ultimaFila - 1, TOTAL_COLUMNAS).getValues();

  const cuota = MailApp.getRemainingDailyQuota();
  let restantes = Math.min(CONFIG.MAX_POR_DIA, cuota);
  Logger.log('Cuota de Gmail hoy: ' + cuota + ' · tope propio: ' + CONFIG.MAX_POR_DIA);

  const yaContactados = correosYaUsados(datos);
  let hechos = 0, saltados = 0, sinLink = 0, cerradas = 0, aprobadasSinEnviar = 0, sinVerificar = 0;

  for (let i = 0; i < datos.length; i++) {
    if (Date.now() - INICIO > LIMITE_MS) { Logger.log('Corte por tiempo. Sigue en la proxima corrida.'); break; }

    const fila = i + 2;
    const [empresa, email, asunto, cuerpo, aprobado, estado] = datos[i];

    // ⚠️ NO basta con "la celda tiene algo". Spark escribía 'Pendiente de envío'
    // en esta columna, que significa exactamente lo contrario de procesada.
    // La versión anterior decía `if (String(estado).trim()) continue;` y por eso
    // 15 filas aprobadas se saltaron en silencio cada mañana durante diez días,
    // con el trigger en verde y 0% de error: el script hacía justo lo que decía
    // el código. Ver yaProcesada().
    if (yaProcesada(estado)) { cerradas++; continue; }

    const problema = validar(email, asunto, cuerpo, aprobado);
    if (problema) {
      if (problema !== 'pendiente de aprobación') {
        marcar(hoja, fila, 'Omitido', problema);
        saltados++;
      }
      continue;
    }

    // ⚠️ Solo sale lo verificado. La rutina diaria pone 'safe' en Verificación
    // cuando encontró el correo escrito en el sitio de la empresa y su dominio
    // tiene MX. Cualquier otra cosa (vacío, 'sin-verificar', 'risky') se queda
    // pendiente, sin cerrarse, para revisarla a mano: el 25/9 salieron 8 filas
    // sin verificar y rebotaron 6.
    const veredicto = String(datos[i][COL.VERIFICACION - 1] || '').trim().toLowerCase();
    if (veredicto === 'invalid') {
      marcar(hoja, fila, 'Correo inválido', 'Verificación: el buzón no existe');
      saltados++;
      continue;
    }
    if (veredicto !== 'safe') {
      Logger.log('Fila ' + fila + ' · ' + empresa + ' → no sale: verificación "' + (veredicto || 'vacía') + '"');
      sinVerificar++;
      continue;
    }

    // Aprobada, válida y verificada. Si aquí ya no queda cupo, cuéntala para el aviso final.
    if (restantes <= 0) { aprobadasSinEnviar++; continue; }

    const clave = String(email).trim().toLowerCase();
    if (yaContactados[clave] > 1 && yaContactados[clave + '__usado']) {
      marcar(hoja, fila, 'Omitido', 'duplicado en la lista');
      saltados++;
      continue;
    }
    yaContactados[clave + '__usado'] = true;

    try {
      const cuerpoUtm = cuerpoConUtm(cuerpo, empresa, CONFIG.CAMPANA_UTM);
      if (!/https:\/\/notmanrivera\.com\//.test(cuerpoUtm)) sinLink++;

      const texto = cuerpoUtm.trim() + '\n' + CONFIG.FIRMA;
      const esIngles = String(datos[i][COL.IDIOMA - 1] || '').trim().toLowerCase() === 'en';
      const opciones = { name: 'Rubén Rivera' };
      const html = htmlCorreo(cuerpoUtm, esIngles);
      if (html) opciones.htmlBody = html;

      if (CONFIG.MODO === 'borrador') {
        GmailApp.createDraft(email, asunto, texto, opciones);
        marcar(hoja, fila, 'Borrador', '');
      } else {
        GmailApp.sendEmail(email, asunto, texto, opciones);
        etiquetar(email);
        marcar(hoja, fila, 'Enviado', '');
      }

      hechos++;
      restantes--;

      // Pausa aleatoria de 5 a 15s entre envíos: rompe el patrón de ráfaga
      // sin salirse del límite de 6 minutos de Apps Script.
      if (CONFIG.MODO === 'enviar' && restantes > 0) {
        const seg = CONFIG.PAUSA_MIN_SEG +
                    Math.random() * (CONFIG.PAUSA_MAX_SEG - CONFIG.PAUSA_MIN_SEG);
        Utilities.sleep(Math.round(seg * 1000));
      }
    } catch (e) {
      marcar(hoja, fila, 'Error', e.message);
      saltados++;
    }
  }

  Logger.log('Enviados: ' + hechos + ' · omitidos: ' + saltados +
             ' · cerradas de antes: ' + cerradas +
             (sinVerificar ? ' · APROBADAS SIN VERIFICAR (no salen): ' + sinVerificar : '') +
             (aprobadasSinEnviar ? ' · aprobadas en cola para mañana: ' + aprobadasSinEnviar : '') +
             (sinLink ? ' · SIN LINK AL SITIO (no medibles en GA4): ' + sinLink : ''));

  // Un 0 silencioso es justo lo que escondió el bug de la columna Estado
  // durante diez días. Si no salió nada y sí había trabajo, dilo fuerte.
  if (hechos === 0) {
    const listas = contarListas(datos);
    if (listas > 0) {
      Logger.log('⚠️ HABÍA ' + listas + ' FILAS APROBADAS Y VERIFICADAS, Y NO SE MANDÓ NINGUNA. ' +
                 'Revisa la columna Estado y la cuota de Gmail.');
    } else {
      Logger.log('Nada que mandar: ninguna fila está aprobada, verificada y pendiente.');
    }
  }
}

/**
 * ¿Esta fila ya se trabajó?
 *
 * Vacía = nunca se tocó. 'Pendiente de envío' = espera su turno; NO está
 * procesada. Cualquier otra cosa ('Enviado', 'Rebotado', 'Omitido', 'Error',
 * 'Borrador', 'Dominio invalido', 'Correo inválido') sí cierra la fila.
 */
function yaProcesada(estado) {
  const e = String(estado || '').trim().toLowerCase();
  if (!e) return false;
  return e !== 'pendiente de envío' && e !== 'pendiente de envio';
}

/** Cuántas filas están aprobadas, válidas, verificadas y esperando turno. */
function contarListas(datos) {
  let n = 0;
  for (let i = 0; i < datos.length; i++) {
    const [empresa, email, asunto, cuerpo, aprobado, estado] = datos[i];
    if (yaProcesada(estado)) continue;
    if (validar(email, asunto, cuerpo, aprobado)) continue;
    if (String(datos[i][COL.VERIFICACION - 1] || '').trim().toLowerCase() !== 'safe') continue;
    n++;
  }
  return n;
}

// ══════════════════════════════════════════════════════════════
//  UTM — atar el correo enviado a la visita en GA4
// ══════════════════════════════════════════════════════════════
function slugEmpresa(empresa) {
  return encodeURIComponent(
    String(empresa).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  );
}

/** Link al sitio ya etiquetado. Lo usa Seguimientos.gs; no lo borres. */
function linkSitio(empresa, esIngles, campana) {
  const base = esIngles ? 'https://notmanrivera.com/en/' : 'https://notmanrivera.com/';
  return base + '?utm_source=email&utm_medium=outreach'
       + '&utm_campaign=' + encodeURIComponent(campana)
       + '&utm_content=' + slugEmpresa(empresa);
}

function cuerpoConUtm(cuerpo, empresa, campana) {
  const qs = 'utm_source=email&utm_medium=outreach'
           + '&utm_campaign=' + encodeURIComponent(campana)
           + '&utm_content=' + slugEmpresa(empresa);

  // Los utm_* SIEMPRE se reescriben. Antes, si el enlace ya traía "?", se
  // dejaba intacto -- y un UTM cortado que venía de Spark salía así al
  // correo: en GA4 apareció una visita con campaña "prospeccion-" sin
  // contenido, imposible de atribuir. Otros parámetros que no sean utm_ se
  // conservan.
  return String(cuerpo).replace(
    /https:\/\/notmanrivera\.com\/[^\s<>()"']*/g,
    function (url) {
      let cola = '';
      const m = url.match(/[.,;:!?]+$/);
      if (m) { cola = m[0]; url = url.slice(0, -cola.length); }
      let hash = '';
      const h = url.indexOf('#');
      if (h !== -1) { hash = url.slice(h); url = url.slice(0, h); }
      const q = url.indexOf('?');
      const base = q === -1 ? url : url.slice(0, q);
      const otros = q === -1 ? [] : url.slice(q + 1).split('&')
        .filter(function (p) { return p && !/^utm_/i.test(p); });
      return base + '?' + qs + (otros.length ? '&' + otros.join('&') : '') + hash + cola;
    }
  );
}

// ══════════════════════════════════════════════════════════════
//  FIRMA DE GMAIL EN LOS CORREOS AUTOMÁTICOS
// ══════════════════════════════════════════════════════════════
/**
 * La firma que Rubén tiene configurada en Gmail, como HTML, o '' si no hay.
 *
 * ⚠️ Gmail solo pega la firma cuando se escribe desde su ventana. GmailApp y
 * la API mandan el correo tal cual lo arma el script, así que hasta el 1/10
 * todos los correos automáticos salían con la firma de texto de CONFIG.FIRMA
 * y nunca con la del sitio. Se lee de la configuración de Gmail (no se copia
 * aquí) para que un cambio de firma en Gmail llegue solo a los automáticos.
 * Usa el servicio avanzado de Gmail, igual que Seguimientos.gs.
 */
let FIRMA_HTML_CACHE = null;
function firmaGmail() {
  if (FIRMA_HTML_CACHE !== null) return FIRMA_HTML_CACHE;
  FIRMA_HTML_CACHE = '';
  try {
    const yo = Session.getEffectiveUser().getEmail();
    FIRMA_HTML_CACHE = Gmail.Users.Settings.SendAs.get('me', yo).signature || '';
  } catch (e) {
    Logger.log('No se pudo leer la firma de Gmail (sale solo texto): ' + e.message);
  }
  return FIRMA_HTML_CACHE;
}

/**
 * La firma en el idioma del prospecto, tomada de las páginas publicadas en el
 * sitio (public/firma.html y public/firma-en.html en el repo). Si el sitio no
 * responde, cae a la firma configurada en Gmail.
 *
 * ⚠️ La firma de Gmail es UNA sola, y la que está puesta es la de inglés: sin
 * esto, los prospectos en español recibían banner, "Mexico" y el mensaje de
 * WhatsApp en inglés. Cloudflare sirve las páginas sin ".html" (/firma.html
 * responde 308 a /firma).
 */
const FIRMA_SITIO_CACHE = {};
function firmaPara(esIngles) {
  const clave = esIngles ? 'en' : 'es';
  if (clave in FIRMA_SITIO_CACHE) return FIRMA_SITIO_CACHE[clave];
  let firma = '';
  try {
    const url = 'https://notmanrivera.com/' + (esIngles ? 'firma-en' : 'firma');
    const r = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
    if (r.getResponseCode() === 200) {
      const html = r.getContentText('UTF-8');
      const a = html.indexOf('<table'), b = html.lastIndexOf('</table>');
      if (a !== -1 && b > a) firma = html.slice(a, b + '</table>'.length);
    }
  } catch (e) {
    Logger.log('No se pudo leer la firma del sitio (' + clave + '): ' + e.message);
  }
  if (!firma) firma = firmaGmail();
  FIRMA_SITIO_CACHE[clave] = firma;
  return firma;
}

/**
 * Versión HTML de un correo: el cuerpo tal cual (párrafos y links), la firma
 * en su idioma y la línea para darse de baja. Devuelve '' si no hay firma: en ese
 * caso el correo sale solo en texto, como antes, en vez de salir sin firma.
 *
 * El cuerpo NO se diseña: sigue viéndose escrito a mano. Un correo en frío con
 * maquetación de boletín cae en Promociones y se lee como envío masivo.
 */
function htmlCorreo(cuerpo, esIngles) {
  const firma = firmaPara(esIngles);
  if (!firma) return '';
  const esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  const parrafos = String(cuerpo).trim().split(/\n{2,}/).map(function (p) {
    const conLinks = esc(p).replace(/https?:\/\/[^\s<]+/g, function (url) {
      let cola = '';
      const m = url.match(/[.,;:!?)]+$/);
      if (m) { cola = m[0]; url = url.slice(0, -cola.length); }
      // Se muestra la dirección sin los UTM; el href los conserva para GA4.
      const visible = url.replace(/^https?:\/\//, '').replace(/\?.*$/, '').replace(/\/$/, '');
      return '<a href="' + url + '">' + visible + '</a>' + cola;
    });
    return '<p style="margin:0 0 12px 0">' + conLinks.replace(/\n/g, '<br>') + '</p>';
  }).join('');
  const baja = esIngles
    ? 'If you\'d rather not hear from me again, reply "unsubscribe" and I won\'t follow up.'
    : 'Si prefieres que no te vuelva a escribir, respóndeme "baja" y no insisto.';
  return '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#222">' +
         parrafos + '</div>' +
         '<div style="margin-top:16px">' + firma + '</div>' +
         '<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#888;margin-top:12px">' +
         esc(baja) + '</p>';
}

/**
 * Deja en Borradores un correo de prueba dirigido a ti mismo, con la firma,
 * para ver cómo llega. No escribe en la hoja ni le manda nada a nadie.
 * Córrela una vez después de cada `clasp push` que toque la firma: también
 * sirve para autorizar el permiso de leer la configuración de Gmail.
 */
function ensayoFirma() {
  const yo = Session.getEffectiveUser().getEmail();
  const cuerpo = 'Hola, equipo de Prueba: este es un borrador de ensayo para ver la firma.\n\n' +
                 'Portafolio: https://notmanrivera.com/?utm_source=email&utm_medium=outreach&utm_campaign=ensayo';
  [false, true].forEach(function (esIngles) {
    const html = htmlCorreo(cuerpo, esIngles);
    if (!html) { aviso('No se pudo leer la firma: revisa el registro.'); return; }
    GmailApp.createDraft(yo, 'Ensayo de firma ' + (esIngles ? 'EN' : 'ES') + ' (borrar)',
                         cuerpo + '\n' + CONFIG.FIRMA, { htmlBody: html, name: 'Rubén Rivera' });
  });
  aviso('Listo: en Borradores están "Ensayo de firma ES" y "EN". Ábrelos, revisa y bórralos.');
}

// ══════════════════════════════════════════════════════════════
//  APOYO
// ══════════════════════════════════════════════════════════════
function validar(email, asunto, cuerpo, aprobado) {
  const e = String(email || '').trim();
  if (!e) return 'sin correo';
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(e)) return 'correo inválido';
  if (!String(asunto || '').trim()) return 'sin asunto';

  const c = String(cuerpo || '').trim();
  if (!c) return 'sin cuerpo';
  if (/\{\{|\[\[|\bXXXX?\b|\[nombre\]|\[empresa\]/i.test(c)) return 'texto con marcadores sin llenar';

  if (CONFIG.MODO === 'enviar' && CONFIG.EXIGIR_APROBACION) {
    if (!/^(s[ií]|yes|ok|x|1|true)$/i.test(String(aprobado || '').trim())) {
      return 'pendiente de aprobación';
    }
  }
  return null;
}

function correosYaUsados(datos) {
  const cuenta = {};
  datos.forEach(function (f) {
    const e = String(f[COL.EMAIL - 1] || '').trim().toLowerCase();
    if (e) cuenta[e] = (cuenta[e] || 0) + 1;
  });
  return cuenta;
}

function marcar(hoja, fila, estado, nota) {
  hoja.getRange(fila, COL.ESTADO).setValue(estado);
  hoja.getRange(fila, COL.FECHA).setValue(new Date());
  if (nota) hoja.getRange(fila, COL.NOTAS).setValue(nota);
}

function etiquetar(email) {
  try {
    const etq = GmailApp.getUserLabelByName(CONFIG.ETIQUETA) ||
                GmailApp.createLabel(CONFIG.ETIQUETA);
    const hilos = GmailApp.search('to:' + email + ' newer_than:1d', 0, 1);
    if (hilos.length) hilos[0].addLabel(etq);
  } catch (e) { /* la etiqueta es cosmética; no vale la pena fallar por ella */ }
}

// ══════════════════════════════════════════════════════════════
//  UTILIDADES
// ══════════════════════════════════════════════════════════════
function prepararHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = ss.getSheetByName(CONFIG.HOJA) || ss.insertSheet(CONFIG.HOJA);
  const enc = ['Empresa', 'Email', 'Asunto', 'Cuerpo', 'Aprobado', 'Estado',
               'Fecha', 'Notas', 'Idioma', 'Destino_link', 'Revisar_idioma',
               'País', 'Sitio_web', 'Confianza_email', 'Tipo', 'Verificación'];
  hoja.getRange(1, 1, 1, enc.length).setValues([enc])
      .setFontWeight('bold').setBackground('#1c1c1e').setFontColor('#ffffff');
  hoja.setFrozenRows(1);
  hoja.setColumnWidth(COL.CUERPO, 420);
  aviso('Hoja "' + CONFIG.HOJA + '" lista.');
}

function instalarTrigger() {
  quitarTrigger();
  ScriptApp.newTrigger('procesarPendientes')
    .timeBased().everyDays(1).atHour(9).create();
  aviso('Trigger diario instalado (9am).');
}

function quitarTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'procesarPendientes') ScriptApp.deleteTrigger(t);
  });
}

function verCuota() {
  aviso('Te quedan ' + MailApp.getRemainingDailyQuota() + ' envíos hoy.');
}

/** Revisa qué se mandaría en la próxima corrida SIN mandar nada. */
function ensayoUtm() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA);
  const ultimaFila = hoja.getLastRow();
  if (ultimaFila < 2) { Logger.log('Hoja vacía.'); return; }
  const datos = hoja.getRange(2, 1, ultimaFila - 1, TOTAL_COLUMNAS).getValues();

  let n = 0, sinAprobar = 0, cerradas = 0, sinVerificar = 0;
  for (let i = 0; i < datos.length; i++) {
    const [empresa, email, asunto, cuerpo, aprobado, estado] = datos[i];
    if (yaProcesada(estado)) { cerradas++; continue; }
    const prob = validar(email, asunto, cuerpo, aprobado);
    if (prob) {
      if (prob === 'pendiente de aprobación') sinAprobar++;
      else Logger.log('Fila ' + (i + 2) + ' · ' + empresa + ' → OMITIDA: ' + prob);
      continue;
    }
    const veredicto = String(datos[i][COL.VERIFICACION - 1] || '').trim().toLowerCase();
    if (veredicto !== 'safe') {
      Logger.log('Fila ' + (i + 2) + ' · ' + empresa + ' → NO SALE: verificación "' + (veredicto || 'vacía') + '"');
      sinVerificar++;
      continue;
    }
    const nuevo = cuerpoConUtm(cuerpo, empresa, CONFIG.CAMPANA_UTM);
    const links = nuevo.match(/https:\/\/notmanrivera\.com\/[^\s<>()"']*/g) || [];
    Logger.log('Fila ' + (i + 2) + ' · ' + empresa + ' → ' +
               (links.length ? links.join(' | ') : '⚠️ SIN LINK AL SITIO'));
    n++;
  }
  Logger.log('LISTAS PARA MANDAR: ' + n + ' · sin aprobar: ' + sinAprobar +
             ' · aprobadas sin verificar: ' + sinVerificar +
             ' · cerradas de antes: ' + cerradas +
             ' · el tope diario deja salir ' + CONFIG.MAX_POR_DIA);
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Prospección')
    .addItem('Preparar hoja', 'prepararHoja')
    .addItem('Procesar pendientes', 'procesarPendientes')
    .addSeparator()
    .addItem('Ensayo UTM (no manda nada)', 'ensayoUtm')
    .addItem('Ensayo: qué borradores se mandarían', 'ensayoEnvioBorradores')
    .addItem('Ensayo de firma (borrador a ti mismo)', 'ensayoFirma')
    .addItem('Enviar borradores de seguimiento', 'enviarBorradoresSeguimientoPendientes')
    .addSeparator()
    .addItem('Instalar envío diario', 'instalarTrigger')
    .addItem('Quitar envío diario', 'quitarTrigger')
    .addItem('Ver cuota de hoy', 'verCuota')
    .addItem('Revisar rebotes', 'revisarRebotes')
    .addItem('Verificar dominios', 'verificarDominios')
    .addToUi();
}
