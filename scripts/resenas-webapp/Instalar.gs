/**
 * Una sola vez, desde el editor y con hola@: instalarAutomatizaciones.
 * Pide los permisos nuevos y deja instalado:
 *   - correoPorAprobar, todos los días ≈8:15 (Aprobaciones.gs)
 *   - revisarSalud, todos los días ≈14:30 (Salud.gs), después de los envíos de 9 y 1
 *   - los filtros de Gmail que sacan lo automático de la bandeja
 * Se puede volver a correr: no duplica nada.
 */
function instalarAutomatizaciones() {
  const quiero = { correoPorAprobar: [8, 15], revisarSalud: [14, 30] };
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (quiero[t.getHandlerFunction()]) ScriptApp.deleteTrigger(t);
  });
  Object.keys(quiero).forEach(function (fn) {
    ScriptApp.newTrigger(fn).timeBased().everyDays(1).atHour(quiero[fn][0]).nearMinute(quiero[fn][1])
      .inTimezone('America/Mexico_City').create();
  });
  Logger.log('Disparadores: correoPorAprobar ≈8:15 y revisarSalud ≈14:30.');
  Logger.log(instalarFiltros_());
}

/**
 * Filtros de Gmail de hola@. La bandeja queda solo para correos de
 * prospección y avisos que piden algo:
 *   - Reportes DMARC → etiqueta Sistema/DMARC, fuera de la bandeja y leídos.
 *   - Avisos automáticos (por aprobar, lead caliente, reseña, salud) →
 *     etiqueta Sistema; se quedan en la bandeja porque piden algo.
 *   - Rebotes → etiqueta Sistema/Rebotes, fuera de la bandeja (12/10/2026).
 *     La rutina los busca por la etiqueta, no en la bandeja.
 *   - Publicidad de no2bounce y avisos de Google Ads, Search Console,
 *     facturas de Workspace y similares → Sistema/Avisos, fuera de la
 *     bandeja y leídos. Las alertas de seguridad de Google sí llegan.
 * Si un filtro ya existe con otra acción, se reemplaza.
 */
function instalarFiltros_() {
  const etiquetas = {};
  // Sin etiquetas o filtros propios, Gmail devuelve null y no una lista vacía.
  const existentes = (Gmail.Users.Labels.list('me') || {}).labels || [];
  ['Sistema', 'Sistema/DMARC', 'Sistema/Rebotes', 'Sistema/Avisos'].forEach(function (nombre) {
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
      action: { addLabelIds: [etiquetas['Sistema/Rebotes']], removeLabelIds: ['INBOX'] },
    },
    {
      criteria: { query: 'from:(no2bounce.com OR ads-noreply@google.com OR sc-noreply@google.com OR payments-noreply@google.com OR notify-noreply@google.com OR drive-shares-dm-noreply@google.com)' },
      action: { addLabelIds: [etiquetas['Sistema/Avisos']], removeLabelIds: ['INBOX', 'UNREAD'] },
    },
  ];

  const actuales = (Gmail.Users.Settings.Filters.list('me') || {}).filter || [];
  const firma = function (f) { return JSON.stringify([f.criteria.from || '', f.criteria.to || '', f.criteria.query || '']); };
  const accion = function (f) {
    const a = f.action || {};
    return JSON.stringify([(a.addLabelIds || []).slice().sort(), (a.removeLabelIds || []).slice().sort()]);
  };
  let creados = 0, cambiados = 0;
  filtros.forEach(function (f) {
    const previo = actuales.filter(function (a) { return firma(a) === firma(f); })[0];
    if (previo && accion(previo) === accion(f)) return;
    if (previo) { Gmail.Users.Settings.Filters.remove('me', previo.id); cambiados++; } else { creados++; }
    Gmail.Users.Settings.Filters.create(f, 'me');
  });
  return 'Filtros de Gmail: ' + creados + ' nuevos, ' + cambiados + ' actualizados, ' + (filtros.length - creados - cambiados) + ' sin cambios.';
}
