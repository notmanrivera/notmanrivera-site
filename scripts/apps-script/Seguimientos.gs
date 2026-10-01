/**
 * Seguimiento a correos ya enviados sin respuesta.
 *
 * Dos entradas:
 *   generarBorradoresSeguimiento()          -- la corrida diaria. Segun
 *                                              CONFIG_SEGUIMIENTO.MODO deja
 *                                              borrador o manda directo.
 *   enviarBorradoresSeguimientoPendientes() -- vacia los borradores que ya
 *                                              existen, uno por uno, con las
 *                                              mismas verificaciones.
 *
 * ⚠️ DEPENDE DE Código.gs: usa COL.IDIOMA, TOTAL_COLUMNAS, linkSitio() y slugEmpresa().
 *
 * ⚠️ REQUIERE el servicio avanzado de Gmail: en el editor, "Servicios" (+) >
 * Gmail API > Agregar, con el identificador "Gmail". GmailApp no sabe crear
 * un borrador DENTRO de un hilo que abriste tú: createDraft() arma un correo
 * suelto, y message.reply() sobre un correo propio se contesta a ti mismo.
 * Así salieron hasta el 28/9 todos los seguimientos -- un "Re:" que decía
 * "mi correo anterior" sin el correo anterior abajo.
 */
const CONFIG_SEGUIMIENTO = {
  DIAS_ESPERA: 5,                          // días sin respuesta antes de seguir
  MARCA_NOTAS: 'Seguimiento en borrador',  // no se renombra: las 35 filas ya la traen
  MARCA_ENVIADO: 'Seguimiento enviado',
  CAMPANA_UTM: 'seguimiento-2026',         // distinta del primer toque, para separarlos en GA4

  // Último toque: un correo corto de cierre a quien no contestó el
  // seguimiento, DIAS_ULTIMO_TOQUE días después. Es el tercero y el último:
  // después de este no se le vuelve a escribir. Lleva su propia campaña UTM
  // para medirlo aparte en GA4, y su propia marca en Notas.
  DIAS_ULTIMO_TOQUE: 10,
  MARCA_ULTIMO: 'Último toque en borrador',
  MARCA_ULTIMO_ENVIADO: 'Último toque enviado',
  CAMPANA_ULTIMO: 'ultimo-toque-2026',

  // 'borrador' → deja el seguimiento en Borradores para que lo revises.
  // 'enviar'   → lo manda solo. Menos riesgoso que automatizar el primer
  //              toque: a esta dirección YA le escribiste y no reboto, asi
  //              que el correo esta probado. Lo que se pierde es el ultimo
  //              filtro humano antes de insistirle a alguien.
  MODO: 'borrador',

  // Sábado y domingo no se genera ni se manda nada. Un "¿viste mi correo?"
  // en domingo llega a un buzón de oficina cerrado y queda enterrado bajo
  // todo lo del lunes.
  SOLO_ENTRE_SEMANA: true,

  MAX_POR_DIA: 10,       // tope propio, aparte del de Código.gs. Aplica a
                         // lo que se genera al día (seguimientos + últimos
                         // toques) y a lo que se manda al día.
  PAUSA_MIN_SEG: 5,
  PAUSA_MAX_SEG: 15,

  // Cualquiera de estas frases en Notas cancela el seguimiento para siempre.
  // Es la red debajo de tieneRespuesta(): si una respuesta llego a un buzon
  // que el script no puede ver, marcas la fila a mano y queda bloqueada.
  // ⚠️ 'bounce' y 'no reintentar' son obligatorias: Rebotes.gs escribe la nota
  // en ingles ("Bounce detectado - no reintentar") y deja Estado en 'Enviado',
  // asi que sin estas dos frases tres direcciones que YA rebotaron recibian
  // borrador de seguimiento. Verificado en la hoja: Neta Agencia Deportiva,
  // Pitch Marketing Group y MKTG MENA.
  VETO: ['no seguir', 'respondio', 'respondió', 'baja', 'rebot', 'bounce',
         'no reintentar', 'no insistir']
};

// ══════════════════════════════════════════════════════════════
//  CORRIDA DIARIA
// ══════════════════════════════════════════════════════════════
function generarBorradoresSeguimiento() {
  if (esFinDeSemana()) { Logger.log('Fin de semana: no se generan seguimientos.'); return; }
  exigirServicioGmail();

  const INICIO = Date.now();
  const LIMITE_MS = 4.5 * 60 * 1000;   // Apps Script corta a los 6 min

  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA);
  if (!hoja) throw new Error('No existe la hoja "' + CONFIG.HOJA + '"');
  const ultimaFila = hoja.getLastRow();
  if (ultimaFila < 2) { Logger.log('Hoja vacía.'); return; }

  const datos = hoja.getRange(2, 1, ultimaFila - 1, TOTAL_COLUMNAS).getValues();
  const hoy = new Date();
  const enviando = CONFIG_SEGUIMIENTO.MODO === 'enviar';
  // ⚠️ Tope también en modo borrador: sin él, la primera corrida con último
  // toque habría generado ~100 borradores de golpe (todas las filas viejas
  // que ya tuvieron seguimiento), y el envío de las 4pm solo vacía 10 al día.
  let restantes = enviando
    ? Math.min(CONFIG_SEGUIMIENTO.MAX_POR_DIA, MailApp.getRemainingDailyQuota())
    : CONFIG_SEGUIMIENTO.MAX_POR_DIA;

  const cuenta = { seguimiento: 0, ultimo: 0, respondidos: 0, vetados: 0, rebotados: 0, sinHilo: 0 };
  let cortado = false;

  // Dos pasadas: primero el seguimiento (va a gente que acaba de recibir el
  // primer correo, es lo más valioso), luego el último toque con lo que sobre.
  ['seguimiento', 'ultimo'].forEach(function (etapa) {
    for (let i = 0; i < datos.length; i++) {
      if (cortado) return;
      if (Date.now() - INICIO > LIMITE_MS) { cortado = true; return; }
      if (restantes <= 0) return;

      const fila    = i + 2;
      const empresa = datos[i][COL.EMPRESA - 1];
      const email   = datos[i][COL.EMAIL - 1];
      const asunto  = datos[i][COL.ASUNTO - 1];
      const estado  = datos[i][COL.ESTADO - 1];
      const fecha   = datos[i][COL.FECHA - 1];
      const notas   = String(datos[i][COL.NOTAS - 1] || '');

      if (estado !== 'Enviado') continue;
      if (!(fecha instanceof Date)) continue;
      if (etapaPendiente(notas, fecha, hoy) !== etapa) continue;

      if (vetado(notas)) { cuenta.vetados++; continue; }

      if (tieneRespuesta(email, fecha)) {
        anotar(hoja, fila, notas, 'Respondió, no seguir');
        datos[i][COL.NOTAS - 1] = notas + ' · Respondió, no seguir';
        cuenta.respondidos++;
        continue;
      }

      // No depender de que alguien haya corrido "Revisar rebotes" antes.
      if (reboto(email)) {
        anotar(hoja, fila, notas, 'Rebotó, no seguir');
        datos[i][COL.NOTAS - 1] = notas + ' · Rebotó, no seguir';
        cuenta.rebotados++;
        continue;
      }

      // ⚠️ El seguimiento sale al destinatario del correo ORIGINAL, no al de la
      // hoja. El 28/9 la fila de MVP Group decía info@mvgroup.com.ar (sin la
      // "p") mientras el primer correo había salido bien a mvpgroup.com.ar: el
      // seguimiento rebotó contra un dominio que no existe. Si la dirección de
      // la hoja ya no coincide con nada en Enviados, no hay hilo y no se manda.
      const orig = hiloOriginal(email, asunto);
      if (!orig) {
        anotar(hoja, fila, notas, 'Sin correo original en Enviados, no seguir (revisar dirección)');
        cuenta.sinHilo++;
        continue;
      }

      try {
        const esIngles = String(datos[i][COL.IDIOMA - 1] || '').trim().toLowerCase() === 'en';
        const tipo = datos[i][COL_TIPO - 1];
        const cuerpo = etapa === 'ultimo'
          ? cuerpoUltimoToque(empresa, esIngles, tipo)
          : cuerpoSeguimiento(empresa, esIngles, tipo);
        responderEnHilo(orig, asunto, cuerpo + '\n' + CONFIG.FIRMA, htmlCorreo(cuerpo, esIngles), enviando);

        const marca = etapa === 'ultimo'
          ? (enviando ? CONFIG_SEGUIMIENTO.MARCA_ULTIMO_ENVIADO : CONFIG_SEGUIMIENTO.MARCA_ULTIMO)
          : (enviando ? CONFIG_SEGUIMIENTO.MARCA_ENVIADO : CONFIG_SEGUIMIENTO.MARCA_NOTAS);
        anotar(hoja, fila, notas, marca + ' ' + fechaCorta(hoy));
        restantes--;
        cuenta[etapa]++;
        if (enviando) pausa(restantes);
      } catch (e) {
        anotar(hoja, fila, notas, 'Error generando ' + etapa + ': ' + e.message);
      }
    }
  });

  Logger.log((enviando ? 'ENVIADOS' : 'En borrador') +
             ' · seguimientos: ' + cuenta.seguimiento +
             ' · últimos toques: ' + cuenta.ultimo +
             ' · ya habían respondido: ' + cuenta.respondidos +
             ' · rebotados: ' + cuenta.rebotados +
             ' · sin correo original: ' + cuenta.sinHilo +
             ' · vetados por Notas: ' + cuenta.vetados +
             (restantes <= 0 ? ' · TOPE DEL DÍA ALCANZADO, el resto sigue mañana' : '') +
             (cortado ? ' · CORTADO POR TIEMPO, vuelve a correrlo' : ''));
}

/**
 * Qué le toca a una fila ya enviada: 'seguimiento', 'ultimo' o null.
 *
 * ⚠️ La marca de "ya se le dio seguimiento" es cualquiera de las dos
 * ('Seguimiento en borrador' o 'Seguimiento enviado'). Antes solo se revisaba
 * la de borrador, así que con MODO:'enviar' la misma fila habría recibido
 * seguimiento todos los días.
 */
function etapaPendiente(notas, fechaPrimerCorreo, hoy) {
  const n = String(notas || '');
  if (n.indexOf('Último toque') !== -1) return null;   // ya tuvo los tres

  const conSeguimiento = n.indexOf(CONFIG_SEGUIMIENTO.MARCA_NOTAS) !== -1 ||
                         n.indexOf(CONFIG_SEGUIMIENTO.MARCA_ENVIADO) !== -1;
  if (!conSeguimiento) {
    return (hoy - fechaPrimerCorreo) / 86400000 >= CONFIG_SEGUIMIENTO.DIAS_ESPERA ? 'seguimiento' : null;
  }
  // Se cuenta desde que el seguimiento SALIÓ, no desde que se generó el
  // borrador: uno que se quedó días en Borradores no adelanta el cierre.
  const enviado = fechaUltimaMarca(n, CONFIG_SEGUIMIENTO.MARCA_ENVIADO);
  if (!enviado) return null;
  return (hoy - enviado) / 86400000 >= CONFIG_SEGUIMIENTO.DIAS_ULTIMO_TOQUE ? 'ultimo' : null;
}

/** La fecha (d/M/yyyy) que sigue a la última aparición de `marca` en Notas. */
function fechaUltimaMarca(notas, marca) {
  const re = new RegExp(marca + ' (\\d{1,2})/(\\d{1,2})/(\\d{4})', 'g');
  let m, ultima = null;
  while ((m = re.exec(notas)) !== null) ultima = new Date(+m[3], +m[2] - 1, +m[1]);
  return ultima;
}

// ══════════════════════════════════════════════════════════════
//  VACIAR LOS BORRADORES QUE YA EXISTEN
// ══════════════════════════════════════════════════════════════
/**
 * Manda los borradores de seguimiento que ya estan en Gmail.
 *
 * ⚠️ NO manda "todos los borradores". Solo los que llevan el UTM de
 * seguimiento en el cuerpo -- una huella que unicamente pone este script.
 * Sin ese filtro se irian tambien los borradores viejos de agosto (links a
 * Drive, firma anterior) y cualquier correo personal a medio escribir.
 *
 * Y antes de mandar cada uno vuelve a verificar: que la fila exista en la
 * hoja, que no este vetada en Notas, que no haya rebotado, que el borrador
 * vaya dentro del hilo original, y que no haya llegado una respuesta DESPUES
 * de que el borrador se genero. Un borrador de hace tres dias puede haber
 * quedado obsoleto.
 */
function enviarBorradoresSeguimientoPendientes() {
  if (esFinDeSemana()) { Logger.log('Fin de semana: no se mandan seguimientos.'); return; }

  const INICIO = Date.now();
  const LIMITE_MS = 4.5 * 60 * 1000;

  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA);
  const ultimaFila = hoja.getLastRow();
  if (ultimaFila < 2) { Logger.log('Hoja vacía.'); return; }
  const datos = hoja.getRange(2, 1, ultimaFila - 1, TOTAL_COLUMNAS).getValues();

  // email → {fila, notas, fecha}
  const porEmail = {};
  for (let i = 0; i < datos.length; i++) {
    const e = String(datos[i][COL.EMAIL - 1] || '').trim().toLowerCase();
    if (e) porEmail[e] = { fila: i + 2, notas: datos[i][COL.NOTAS - 1], fecha: datos[i][COL.FECHA - 1] };
  }

  const borradores = GmailApp.getDrafts();
  let restantes = Math.min(CONFIG_SEGUIMIENTO.MAX_POR_DIA, MailApp.getRemainingDailyQuota());
  let enviados = 0, saltados = 0, ajenos = 0;

  for (let d = 0; d < borradores.length; d++) {
    if (Date.now() - INICIO > LIMITE_MS) { Logger.log('Corte por tiempo, vuelve a correrlo.'); break; }
    if (restantes <= 0) { Logger.log('Tope diario alcanzado.'); break; }

    const msg = borradores[d].getMessage();
    const tipoBorrador = huellaDe(msg);
    if (!tipoBorrador) { ajenos++; continue; }

    const para = String(msg.getTo()).toLowerCase().replace(/.*</, '').replace(/>.*/, '').trim();
    const reg = porEmail[para];

    const motivo = motivoParaNoMandar(msg, para, reg);
    if (motivo) {
      Logger.log('SALTADO (' + motivo + '): ' + para);
      if (reg && motivo === 'respondió después de generarse el borrador') {
        anotar(hoja, reg.fila, reg.notas, 'Respondió, no seguir');
      } else if (reg && motivo === 'rebotó') {
        anotar(hoja, reg.fila, reg.notas, 'Rebotó, no seguir');
      }
      saltados++;
      continue;
    }

    borradores[d].send();
    anotar(hoja, reg.fila, reg.notas,
           (tipoBorrador === 'ultimo' ? CONFIG_SEGUIMIENTO.MARCA_ULTIMO_ENVIADO : CONFIG_SEGUIMIENTO.MARCA_ENVIADO) +
           ' ' + fechaCorta(new Date()));
    enviados++;
    restantes--;
    pausa(restantes);
  }

  Logger.log('Borradores de seguimiento enviados: ' + enviados +
             ' · saltados por verificación: ' + saltados +
             ' · borradores ajenos ignorados: ' + ajenos);
}

/** Lista qué haría enviarBorradoresSeguimientoPendientes(), sin mandar nada. */
function ensayoEnvioBorradores() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA);
  const ultimaFila = hoja.getLastRow();
  const datos = hoja.getRange(2, 1, ultimaFila - 1, TOTAL_COLUMNAS).getValues();
  const porEmail = {};
  for (let i = 0; i < datos.length; i++) {
    const e = String(datos[i][COL.EMAIL - 1] || '').trim().toLowerCase();
    if (e) porEmail[e] = { fila: i + 2, notas: datos[i][COL.NOTAS - 1], fecha: datos[i][COL.FECHA - 1] };
  }

  const borradores = GmailApp.getDrafts();
  let irian = 0, ajenos = 0;

  for (let d = 0; d < borradores.length; d++) {
    const msg = borradores[d].getMessage();
    const tipoBorrador = huellaDe(msg);
    if (!tipoBorrador) { ajenos++; continue; }
    const para = String(msg.getTo()).toLowerCase().replace(/.*</, '').replace(/>.*/, '').trim();
    const reg = porEmail[para];
    const motivo = motivoParaNoMandar(msg, para, reg);
    if (motivo) { Logger.log('NO IRÍA (' + motivo + '): ' + para); continue; }
    Logger.log('IRÍA → ' + para + '  (fila ' + reg.fila + ', ' + tipoBorrador + ')');
    irian++;
  }
  Logger.log('Se mandarían ' + irian + ' · borradores ajenos que ni se tocan: ' + ajenos +
             (esFinDeSemana() ? ' · OJO: hoy es fin de semana, la corrida real no manda nada' : ''));
}

/**
 * 'seguimiento', 'ultimo' o null según la campaña UTM del borrador. La
 * campaña es la huella que solo pone este script: un borrador sin ella es de
 * Rubén y no se toca.
 */
function huellaDe(msg) {
  const cuerpo = msg.getBody() + '\n' + msg.getPlainBody();
  if (cuerpo.indexOf('utm_campaign=' + CONFIG_SEGUIMIENTO.CAMPANA_ULTIMO) !== -1) return 'ultimo';
  if (cuerpo.indexOf('utm_campaign=' + CONFIG_SEGUIMIENTO.CAMPANA_UTM) !== -1) return 'seguimiento';
  return null;
}

/** null si el borrador puede salir; si no, la razón. */
function motivoParaNoMandar(msg, para, reg) {
  if (!reg) return 'no está en la hoja';
  if (vetado(reg.notas)) return 'vetado en Notas';
  // Un borrador suelto (de antes del arreglo, o hecho a mano) llega como
  // "Re:" sin el correo original abajo. Dentro del hilo hay al menos dos
  // mensajes: el original y el propio borrador.
  if (msg.getThread().getMessageCount() < 2) return 'borrador suelto, fuera del hilo original';
  if (reboto(para)) return 'rebotó';
  if (reg.fecha instanceof Date && tieneRespuesta(para, reg.fecha)) {
    return 'respondió después de generarse el borrador';
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
//  RESPONDER DENTRO DEL HILO
// ══════════════════════════════════════════════════════════════
/**
 * El hilo del primer correo a esa dirección con ese asunto, o null.
 * Busca en Enviados y compara el asunto del PRIMER mensaje de cada hilo.
 */
function hiloOriginal(email, asunto) {
  const dir = String(email || '').trim().toLowerCase();
  const buscado = normalizarAsunto(asunto);
  if (!dir || !buscado) return null;
  const hilos = GmailApp.search('in:sent to:' + dir + ' newer_than:120d');
  for (let h = 0; h < hilos.length; h++) {
    const primero = hilos[h].getMessages()[0];
    if (normalizarAsunto(primero.getSubject()) === buscado) return { hilo: hilos[h], msg: primero };
  }
  return null;
}

function normalizarAsunto(s) {
  return String(s || '').replace(/^\s*(re|fw|fwd)\s*:\s*/i, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Deja el seguimiento como borrador dentro del hilo original, o lo manda.
 *
 * threadId lo agrupa en TU bandeja; In-Reply-To y References son los que lo
 * agrupan en la bandeja del prospecto. Hacen falta los dos.
 *
 * Con `html` (ver htmlCorreo() en Código.gs) sale como multipart/alternative:
 * texto plano para los clientes que no muestran HTML y la versión con la
 * firma de Gmail para todos los demás. Sin `html`, solo texto, como antes.
 */
function responderEnHilo(orig, asunto, texto, html, enviar) {
  const idMensaje = orig.msg.getHeader('Message-ID');
  const cabeceras = [
    'From: ' + mimeUtf8('Rubén Rivera') + ' <' + Session.getEffectiveUser().getEmail() + '>',
    'To: ' + orig.msg.getTo(),
    'Subject: ' + mimeUtf8('Re: ' + normalizarAsuntoOriginal(asunto)),
  ];
  if (idMensaje) cabeceras.push('In-Reply-To: ' + idMensaje, 'References: ' + idMensaje);
  const b64 = function (s) {
    // Líneas de 76: lo que pide MIME para base64.
    return Utilities.base64Encode(s, Utilities.Charset.UTF_8).replace(/.{76}/g, '$&\r\n');
  };
  let partes;
  if (html) {
    const limite = 'n' + Utilities.getUuid().replace(/-/g, '');
    partes = [
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="' + limite + '"',
      '',
      '--' + limite,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      b64(texto),
      '--' + limite,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      b64(html),
      '--' + limite + '--'
    ];
  } else {
    partes = [
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      b64(texto)
    ];
  }
  const mime = cabeceras.concat(partes).join('\r\n');

  const recurso = { raw: Utilities.base64EncodeWebSafe(mime, Utilities.Charset.UTF_8),
                    threadId: orig.hilo.getId() };
  if (enviar) Gmail.Users.Messages.send(recurso, 'me');
  else Gmail.Users.Drafts.create({ message: recurso }, 'me');
}

/** El asunto tal como salió, sin un "Re:" que ya trajera. */
function normalizarAsuntoOriginal(s) {
  return String(s || '').replace(/^\s*re\s*:\s*/i, '').trim();
}

function mimeUtf8(s) {
  return '=?UTF-8?B?' + Utilities.base64Encode(s, Utilities.Charset.UTF_8) + '?=';
}

function exigirServicioGmail() {
  if (typeof Gmail === 'undefined') {
    throw new Error('Falta activar el servicio avanzado de Gmail: en el editor, ' +
                    'Servicios (+) > Gmail API > Agregar. Sin él no hay forma de ' +
                    'responder dentro del hilo original.');
  }
}

// ══════════════════════════════════════════════════════════════
//  APOYO
// ══════════════════════════════════════════════════════════════
// Columna O de la hoja. No vive en COL (Código.gs) para no tocar ese archivo.
const COL_TIPO = 15;

/**
 * El seguimiento lleva el caso que más se parece a lo que hace el prospecto,
 * en vez de un "¿viste mi correo?" genérico: Hugo González a quien representa
 * jugadores, Al-Arabi a las agencias. El link conserva utm_campaign de
 * seguimiento -- es la huella con la que enviarBorradoresSeguimientoPendientes()
 * reconoce sus borradores.
 */
/** Solo el cuerpo: la firma (texto y HTML) la pone quien arma el correo. */
function cuerpoSeguimiento(empresa, esIngles, tipo) {
  const representante = String(tipo || '').toLowerCase().indexOf('represent') !== -1;
  const club = String(tipo || '').toLowerCase().indexOf('club') !== -1;
  const caso = representante ? 'hugo-gonzalez' : 'al-arabi-sc';
  const link = 'https://notmanrivera.com/casos/' + caso + '/' + (esIngles ? 'en/' : '') +
    '?utm_source=email&utm_medium=outreach' +
    '&utm_campaign=' + encodeURIComponent(CONFIG_SEGUIMIENTO.CAMPANA_UTM) +
    '&utm_content=' + slugEmpresa(empresa);

  let cuerpo;
  if (club) {
    // A un equipo se le habla de SU temporada, no de "sus campañas": el caso
    // Al-Arabi es justo un club, partido a partido.
    cuerpo = esIngles
      ? 'Hi again — I wrote a few days ago about a matchday graphics kit for your season.\n\n'
        + 'This is what it looks like over a full season for a club: Al-Arabi SC in Qatar — lineups, '
        + 'next-opponent announcements, results and one animated piece per match.\n\n'
        + link + '\n\n'
        + 'Happy to walk you through it in a 15-minute call before the season starts. '
        + 'If the timing isn\'t right, we can leave it for later.'
      : 'Hola de nuevo — te escribí hace unos días sobre un kit de gráficos de partido para su temporada.\n\n'
        + 'Así se ve a lo largo de una temporada completa para un club: Al-Arabi SC en Qatar — alineaciones, '
        + 'anuncio del próximo rival, resultados y una pieza animada por partido.\n\n'
        + link + '\n\n'
        + 'Si les late, lo platicamos en 15 minutos antes de que arranque la temporada. '
        + 'Si no es el momento, lo dejamos para más adelante.';
  } else if (esIngles && representante) {
    cuerpo = 'Hi again — I wrote a few days ago about content for the players you represent.\n\n'
      + 'The closest case to your work: the digital image of Hugo González, a Liga MX goalkeeper, '
      + 'match by match across a full season (Liga MX and Leagues Cup).\n\n'
      + link + '\n\n'
      + 'If any of your players needs pieces for a signing, a renewal or their socials, happy to show you options. '
      + 'If the timing isn\'t right, we can leave it for later.';
  } else if (esIngles) {
    cuerpo = 'Hi again — I wrote a few days ago about motion graphics and video support for your campaigns.\n\n'
      + 'The case that best shows how I work with agencies: a full season of matchday graphics for '
      + 'Al-Arabi SC\'s volleyball team in Qatar — lineups, next-opponent announcements, the schedule '
      + 'and one animated piece per match.\n\n'
      + link + '\n\n'
      + 'If you have a campaign or activation coming up where extra capacity would help, tell me about it '
      + 'and I\'ll send the pieces closest to that brief. If the timing isn\'t right, we can leave it for later.';
  } else if (representante) {
    cuerpo = 'Hola de nuevo — te escribí hace unos días sobre contenido para los jugadores que representan.\n\n'
      + 'El caso más cercano a lo que hacen: la imagen digital de Hugo González, arquero de Liga MX, '
      + 'partido a partido durante una temporada completa (Liga MX y Leagues Cup).\n\n'
      + link + '\n\n'
      + 'Si alguno de sus jugadores necesita piezas para un fichaje, una renovación o sus redes, con gusto te muestro opciones. '
      + 'Si no es el momento, lo dejamos para más adelante.';
  } else {
    cuerpo = 'Hola de nuevo — te escribí hace unos días sobre soporte de motion graphics y video para sus campañas.\n\n'
      + 'El caso que mejor muestra cómo trabajo con agencias: una temporada completa de gráficos para el '
      + 'equipo de vóleibol de Al-Arabi SC en Qatar — alineaciones, anuncios del próximo rival, calendario '
      + 'y una pieza animada por partido.\n\n'
      + link + '\n\n'
      + 'Si tienen una campaña o activación en puerta donde les sirva capacidad extra, cuéntame y te mando '
      + 'las piezas más cercanas a ese brief. Si no es el momento, lo dejamos para más adelante.';
  }
  return cuerpo;
}

/**
 * El tercer y último correo: corto, sin pedir nada, y deja la puerta abierta.
 * Va dentro del hilo, debajo del primero y del seguimiento.
 */
function cuerpoUltimoToque(empresa, esIngles, tipo) {
  const representante = String(tipo || '').toLowerCase().indexOf('represent') !== -1;
  const club = String(tipo || '').toLowerCase().indexOf('club') !== -1;
  const link = (esIngles ? 'https://notmanrivera.com/en/' : 'https://notmanrivera.com/') +
    '?utm_source=email&utm_medium=outreach' +
    '&utm_campaign=' + encodeURIComponent(CONFIG_SEGUIMIENTO.CAMPANA_ULTIMO) +
    '&utm_content=' + slugEmpresa(empresa);
  if (esIngles) {
    return 'Hi again — I\'ve written a couple of times and don\'t want to crowd your inbox, so I\'ll close the loop here.\n\n'
      + (club
          ? 'If you ever want to give your matchday graphics a lift for a new season, my portfolio is here: '
          : representante
          ? 'If any of your players ever needs pieces for a signing, a renewal or their socials, my portfolio is here: '
          : 'If you ever need extra hands for motion graphics, editing or vertical cuts on a campaign, my portfolio is here: ')
      + link + '\n\n'
      + 'All the best with what\'s ahead.';
  }
  return 'Hola de nuevo. Te escribí un par de veces y no quiero llenarte la bandeja, así que cierro el tema por aquí.\n\n'
    + (club
        ? 'Si para una próxima temporada quieren subir el nivel de sus gráficos de partido, mi portafolio sigue aquí: '
        : representante
        ? 'Si más adelante alguno de sus jugadores necesita piezas para un fichaje, una renovación o sus redes, mi portafolio sigue aquí: '
        : 'Si más adelante les hace falta apoyo con motion graphics, edición o piezas verticales para alguna campaña, mi portafolio sigue aquí: ')
    + link + '\n\n'
    + 'Mucho éxito con lo que viene.';
}

function esFinDeSemana() {
  if (!CONFIG_SEGUIMIENTO.SOLO_ENTRE_SEMANA) return false;
  // 'u' = día de la semana, 1 lunes ... 7 domingo, en la zona del proyecto
  const dia = Number(Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'u'));
  return dia >= 6;
}

/**
 * ¿Ya hay un rebote para esa dirección? Busca el aviso del servidor en vez
 * de fiarse de la hoja: Rebotes.gs solo marca cuando alguien lo corre a mano.
 */
function reboto(email) {
  const dir = String(email || '').trim().toLowerCase();
  if (!dir) return false;
  return GmailApp.search(
    '{from:mailer-daemon from:postmaster} "' + dir + '" newer_than:120d', 0, 1).length > 0;
}

/**
 * Aviso que funciona desde donde sea.
 *
 * ⚠️ SpreadsheetApp.getUi() truena con "Cannot call ... from this context"
 * cuando el script corre sin la hoja abierta: desde el editor suelto, o desde
 * un trigger. Un instalador de triggers es justo lo que se corre asi, y sin
 * este envoltorio la funcion muere DESPUES de crear el trigger -- deja el
 * trabajo hecho pero reporta un error, que es la peor combinacion posible.
 */
function aviso(texto) {
  Logger.log(texto);
  try { SpreadsheetApp.getUi().alert(texto); } catch (e) { /* sin interfaz: basta el Log */ }
}

function vetado(notas) {
  const n = String(notas || '').toLowerCase();
  return CONFIG_SEGUIMIENTO.VETO.some(function (frase) { return n.indexOf(frase) !== -1; });
}

function anotar(hoja, fila, notas, texto) {
  hoja.getRange(fila, COL.NOTAS).setValue((String(notas || '').trim() + ' · ' + texto).trim());
}

function fechaCorta(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'd/M/yyyy');
}

function pausa(restantes) {
  if (restantes <= 0) return;
  const seg = CONFIG_SEGUIMIENTO.PAUSA_MIN_SEG +
              Math.random() * (CONFIG_SEGUIMIENTO.PAUSA_MAX_SEG - CONFIG_SEGUIMIENTO.PAUSA_MIN_SEG);
  Utilities.sleep(Math.round(seg * 1000));
}

/**
 * ¿Alguien de ese lado respondió?
 *
 * Busca por DOMINIO, no por la direccion exacta: si le escribiste al buzon
 * generico y te contesta una persona desde su correo propio, el hilo viene de
 * otra direccion del mismo dominio.
 *
 * ⚠️ Un autorespondedor ("gracias por contactarnos") cuenta como respuesta y
 * cancela el seguimiento. Es un falso positivo a proposito: perder un
 * seguimiento es mas barato que insistirle a alguien que ya te contesto.
 *
 * ⚠️ Solo ve el buzon donde corre el script. Una respuesta que llego a otra
 * cuenta tuya es invisible aqui -- para eso esta CONFIG_SEGUIMIENTO.VETO.
 */
// Dominios que NO identifican a una empresa: buscar 'from:gmail.com' trae
// TODO el correo personal del buzon.
const DOMINIOS_COMPARTIDOS = [
  'gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.es', 'outlook.com',
  'outlook.es', 'yahoo.com', 'yahoo.es', 'icloud.com', 'me.com', 'live.com',
  'live.com.mx', 'aol.com', 'protonmail.com', 'proton.me', 'gmx.com', 'zoho.com'
];

function tieneRespuesta(email, fechaEnvio) {
  const dir = String(email).trim().toLowerCase();
  const dominio = dir.split('@').pop();
  if (!dominio) return false;

  // ⚠️ Buscar por dominio solo sirve cuando el dominio es de la empresa. Con
  // un correo de proveedor gratuito (nonstopscq@gmail.com) 'from:gmail.com'
  // caza cualquier correo personal del buzon, el script cree que respondieron
  // y jamas le da seguimiento a ese prospecto. Ahi se busca la direccion exacta
  // -- se pierde la respuesta que venga desde otra cuenta de la misma persona,
  // que es un precio mucho menor.
  const porDominio = DOMINIOS_COMPARTIDOS.indexOf(dominio) === -1;
  const hilos = GmailApp.search(
    'in:inbox from:' + (porDominio ? dominio : dir) + ' newer_than:120d');
  for (let h = 0; h < hilos.length; h++) {
    const msgs = hilos[h].getMessages();
    for (let m = 0; m < msgs.length; m++) {
      if (msgs[m].getDate() <= fechaEnvio) continue;
      const de = String(msgs[m].getFrom()).toLowerCase();
      if (de.indexOf('mailer-daemon') !== -1 || de.indexOf('postmaster') !== -1) continue;
      return true;
    }
  }
  return false;
}

// ══════════════════════════════════════════════════════════════
//  TRIGGERS
// ══════════════════════════════════════════════════════════════
function instalarTriggerSeguimiento() {
  quitarTriggerSeguimiento();
  ScriptApp.newTrigger('generarBorradoresSeguimiento')
    .timeBased().everyDays(1).atHour(11).create();
  aviso(
    'Trigger de seguimiento instalado (11am). Modo actual: ' + CONFIG_SEGUIMIENTO.MODO);
}

/**
 * Programa el ENVIO diario de los borradores de seguimiento (4pm).
 *
 * Se instala aparte del de las 11am a proposito. Generar a las 11 y mandar a
 * las 4 deja cinco horas de colchon: si el prospecto contesta en esa ventana,
 * enviarBorradoresSeguimientoPendientes() lo detecta al revisar de nuevo y
 * cancela el envio. Con MODO:'enviar' ese hueco no existe -- se genera y se
 * manda en el mismo instante.
 *
 * Como manda de a 10 por corrida, tambien vacia solo los 33 atrasados en
 * cuatro dias, sin rafagas que le hagan daño a la reputacion del dominio.
 */
function instalarTriggerEnvioSeguimiento() {
  quitarTriggerEnvioSeguimiento();
  ScriptApp.newTrigger('enviarBorradoresSeguimientoPendientes')
    .timeBased().everyDays(1).atHour(16).create();
  aviso(
    'Envío diario de seguimientos instalado (4pm, hasta ' +
    CONFIG_SEGUIMIENTO.MAX_POR_DIA + ' por día).');
}

function quitarTriggerEnvioSeguimiento() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'enviarBorradoresSeguimientoPendientes') ScriptApp.deleteTrigger(t);
  });
}

function quitarTriggerSeguimiento() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'generarBorradoresSeguimiento') ScriptApp.deleteTrigger(t);
  });
}
