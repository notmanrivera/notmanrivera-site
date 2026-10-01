/**
 * Busca rebotes en Gmail y los marca en la hoja.
 * Córrela a mano desde el menú Prospección.
 *
 * ⚠️ Solo ve el buzón de la cuenta con la que se corre. Con la sesión de
 * rnrivera93@ no encuentra los rebotes de hola@ (y viceversa).
 */
function revisarRebotes() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.HOJA);
  if (!hoja) throw new Error('No existe la hoja "' + CONFIG.HOJA + '"');
  const ultimaFila = hoja.getLastRow();
  if (ultimaFila < 2) { Logger.log('Hoja vacía.'); return; }
  const datos = hoja.getRange(2, 1, ultimaFila - 1, 8).getValues();
  const miCorreo = Session.getActiveUser().getEmail().toLowerCase();

  const rebotados = {};
  const hilos = GmailApp.search('from:mailer-daemon OR from:postmaster newer_than:30d');
  for (let h = 0; h < hilos.length; h++) {
    const msgs = hilos[h].getMessages();
    for (let m = 0; m < msgs.length; m++) {
      const hallados = msgs[m].getPlainBody().match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [];
      for (let e = 0; e < hallados.length; e++) {
        const dir = hallados[e].toLowerCase();
        if (dir !== miCorreo) rebotados[dir] = true;
      }
    }
  }

  let marcados = 0;
  for (let i = 0; i < datos.length; i++) {
    const email = String(datos[i][COL.EMAIL - 1] || '').trim().toLowerCase();
    if (email && rebotados[email]) {
      hoja.getRange(i + 2, COL.ESTADO).setValue('Rebotado');
      hoja.getRange(i + 2, COL.NOTAS).setValue('Bounce detectado - no reintentar');
      marcados++;
    }
  }
  Logger.log('Rebotes marcados: ' + marcados);
}
