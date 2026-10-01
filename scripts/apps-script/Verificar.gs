/**
 * Revisa que el dominio de cada fila pendiente exista y acepte correo.
 * Marca las malas para que procesarPendientes ni las intente.
 * Córrela desde el menú Prospección antes de un envío si agregaste filas a mano;
 * las que agrega la rutina diaria ya vienen revisadas.
 */
function verificarDominios() {
  const INICIO = Date.now();
  const LIMITE_MS = 4.5 * 60 * 1000;
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA);
  if (!hoja) throw new Error('No existe la hoja');
  const ultimaFila = hoja.getLastRow();
  if (ultimaFila < 2) { Logger.log('Hoja vacía.'); return; }
  const datos = hoja.getRange(2, 1, ultimaFila - 1, 8).getValues();

  const cache = {};
  let malos = 0, buenos = 0, saltados = 0, cortado = false;
  for (let i = 0; i < datos.length; i++) {
    if (Date.now() - INICIO > LIMITE_MS) { cortado = true; break; }
    // ⚠️ yaProcesada(), no "la celda tiene algo": 'Pendiente de envío' es
    // justo lo que hay que revisar. Con el filtro anterior esta función se
    // saltaba las 149 filas y reportaba "Dominios OK: 0" sin revisar nada.
    if (yaProcesada(datos[i][COL.ESTADO - 1])) { saltados++; continue; }
    const email = String(datos[i][COL.EMAIL - 1] || '').trim().toLowerCase();
    const at = email.lastIndexOf('@');
    if (at < 1) continue;
    const dom = email.slice(at + 1);
    if (!(dom in cache)) cache[dom] = revisarDominio_(dom);
    const veredicto = cache[dom];
    if (veredicto === 'ok') { buenos++; continue; }
    const nota = veredicto === 'inexistente'
      ? 'Dominio inexistente - direccion probablemente inventada'
      : 'El dominio existe pero no tiene servidor de correo';
    hoja.getRange(i + 2, COL.ESTADO).setValue('Dominio invalido');
    hoja.getRange(i + 2, COL.NOTAS).setValue(nota);
    malos++;
  }

  aviso('Dominios OK: ' + buenos + ' | con problema: ' + malos +
        ' | ya procesados antes: ' + saltados +
        (cortado ? ' | CORTADO POR TIEMPO, vuelve a correrlo' : ''));
}

/** Consulta DNS sobre HTTPS. Devuelve ok, sin-correo o inexistente. */
function revisarDominio_(dom) {
  const base = 'https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(dom) + '&type=';
  const opt = { muteHttpExceptions: true, headers: { accept: 'application/dns-json' } };
  try {
    const mx = JSON.parse(UrlFetchApp.fetch(base + 'MX', opt).getContentText());
    if (mx.Answer) {
      for (let i = 0; i < mx.Answer.length; i++) {
        if (mx.Answer[i].type === 15) return 'ok';
      }
    }
    const a = JSON.parse(UrlFetchApp.fetch(base + 'A', opt).getContentText());
    if (a.Answer) {
      for (let j = 0; j < a.Answer.length; j++) {
        if (a.Answer[j].type === 1) return 'sin-correo';
      }
    }
    return 'inexistente';
  } catch (e) {
    Logger.log('No se pudo consultar ' + dom + ': ' + e.message);
    return 'ok';
  }
}

/** Diagnóstico: prueba la consulta DNS contra dominios conocidos. */
function probarDNS() {
  const casos = ['gmail.com', 'onzesports.com.mx', 'qsports.qa', 'saudisportsmarketing.com', 'netaagenciadeportiva.com'];
  for (let i = 0; i < casos.length; i++) {
    Logger.log(casos[i] + ' => ' + revisarDominio_(casos[i]));
  }
}
