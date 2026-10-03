/**
 * Una sola vez, desde el editor y con hola@: instalarAutomatizaciones.
 * Pide los permisos nuevos y deja instalado:
 *   - correoPorAprobar, todos los días ≈8:15 (Aprobaciones.gs)
 *   - revisarSalud, todos los días ≈10:30 (Salud.gs)
 *   - los filtros de Gmail que sacan lo automático de la bandeja
 * Se puede volver a correr: no duplica nada.
 */
function instalarAutomatizaciones() {
  const quiero = { correoPorAprobar: [8, 15], revisarSalud: [10, 30] };
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (quiero[t.getHandlerFunction()]) ScriptApp.deleteTrigger(t);
  });
  Object.keys(quiero).forEach(function (fn) {
    ScriptApp.newTrigger(fn).timeBased().everyDays(1).atHour(quiero[fn][0]).nearMinute(quiero[fn][1])
      .inTimezone('America/Mexico_City').create();
  });
  Logger.log('Disparadores: correoPorAprobar ≈8:15 y revisarSalud ≈10:30.');
  Logger.log(instalarFiltros_());
}

/**
 * Filtros de Gmail de hola@:
 *   - Reportes DMARC → etiqueta Sistema/DMARC, fuera de la bandeja y leídos.
 *   - Avisos automáticos (por aprobar, lead caliente, reseña, salud) →
 *     etiqueta Sistema; se quedan en la bandeja porque piden algo.
 *   - Rebotes → etiqueta Sistema/Rebotes; se quedan en la bandeja porque la
 *     rutina los lee de ahí para marcarlos en la hoja.
 */
function instalarFiltros_() {
  const etiquetas = {};
  const existentes = Gmail.Users.Labels.list('me').labels || [];
  ['Sistema', 'Sistema/DMARC', 'Sistema/Rebotes'].forEach(function (nombre) {
    const ya = existentes.filter(function (l) { return l.name === nombre; })[0];
    etiquetas[nombre] = ya ? ya.id : Gmail.Users.Labels.create(
      { name: nombre, labelListVisibility: 'labelShow', messageListVisibility: 'show' }, 'me').id;
  });

  const filtros = [
    {
      criteria: { query: '{from:dmarcreport from:dmarcreports from:noreply-dmarc-support from:mimecastreport subject:"Report domain"}' },
      action: { addLabelIds: [etiquetas['Sistema/DMARC']], removeLabelIds: ['INBOX', 'UNREAD'] },
    },
    {
      criteria: { from: 'hola@notmanrivera.com', to: 'hola@notmanrivera.com',
        query: 'subject:("Por aprobar" OR "Lead caliente" OR "Nueva reseña" OR "Sistema:")' },
      action: { addLabelIds: [etiquetas['Sistema']] },
    },
    {
      criteria: { query: 'from:(mailer-daemon OR postmaster)' },
      action: { addLabelIds: [etiquetas['Sistema/Rebotes']] },
    },
  ];

  const actuales = Gmail.Users.Settings.Filters.list('me').filter || [];
  const firma = function (f) { return JSON.stringify([f.criteria.from || '', f.criteria.to || '', f.criteria.query || '']); };
  const yaHay = actuales.map(firma);
  let creados = 0;
  filtros.forEach(function (f) {
    if (yaHay.indexOf(firma(f)) !== -1) return;
    Gmail.Users.Settings.Filters.create(f, 'me');
    creados++;
  });
  return 'Filtros de Gmail: ' + creados + ' nuevos, ' + (filtros.length - creados) + ' ya estaban.';
}
