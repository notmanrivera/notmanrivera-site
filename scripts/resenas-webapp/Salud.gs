/**
 * Revisión de salud del sistema (disparador diario ≈14:30, después de los
 * envíos de las 9 y de la 1). Solo escribe a hola@ si algo está mal, más un "todo bien" los
 * lunes para que el silencio no se confunda con que esto dejó de correr.
 *
 * Revisa lo que se puede ver desde fuera de cada pieza:
 *   - GitHub Actions: ejecuciones fallidas en las últimas 26 h (incluye la
 *     revisión semanal de credenciales de clasp, salud.yml).
 *   - Analytics: que la pestaña se haya actualizado hoy.
 *   - Envíos de las 9 y la 1: filas aprobadas y verificadas que no salieron,
 *     sin haber llegado al tope de 10 (las aprobadas desde el celular después
 *     de la 1 no cuentan: salen mañana).
 *   - Reseñas: que las aprobadas estén en la portada.
 *
 * Lo del día a día del Apps Script de prospección (seguimientos fuera del
 * hilo, rebotes en bloque) lo revisa la rutina de las 7:45.
 */

const SALUD = {
  HOJA_ID: '1240Zwpx5A8QslkJonFUdGXSTyV4wbS_PuIX_0JvoMe0',
  REPO: 'notmanrivera/notmanrivera-site', // público: la API no pide token
  SITIO: 'https://notmanrivera.com/',
  AVISAR_A: 'hola@notmanrivera.com',
  TOPE_ENVIO: 10,
};

function revisarSalud() {
  const problemas = [];
  const avisos = [];
  const libro = SpreadsheetApp.openById(SALUD.HOJA_ID);
  const hoyCorto = Utilities.formatDate(new Date(), 'America/Mexico_City', 'd/M/yyyy');

  // 1. GitHub Actions
  try {
    const desde = new Date(Date.now() - 26 * 3600e3).toISOString();
    const res = UrlFetchApp.fetch('https://api.github.com/repos/' + SALUD.REPO + '/actions/runs?per_page=50',
      { muteHttpExceptions: true, headers: { Accept: 'application/vnd.github+json' } });
    if (res.getResponseCode() === 200) {
      const fallidas = {};
      (JSON.parse(res.getContentText()).workflow_runs || []).forEach(function (r) {
        if (r.created_at >= desde && r.conclusion === 'failure' && !fallidas[r.name]) fallidas[r.name] = r.html_url;
      });
      Object.keys(fallidas).forEach(function (n) {
        problemas.push('GitHub: falló "' + n + '". ' + pistaGithub_(n) + '\n  ' + fallidas[n]);
      });
    } else {
      avisos.push('No pude consultar GitHub (HTTP ' + res.getResponseCode() + '); lo intento mañana.');
    }
  } catch (e) {
    avisos.push('No pude consultar GitHub: ' + e.message);
  }

  // 2. Analytics
  const analytics = libro.getSheetByName('Analytics');
  const cabecera = analytics ? String(analytics.getRange(1, 1).getValue()) : '';
  if (!analytics) problemas.push('Analytics: no existe la pestaña. Corre "instalar" en el proyecto Analytics notmanrivera.com.');
  else if (cabecera.indexOf('Actualizado ' + hoyCorto) !== 0) {
    problemas.push('Analytics: la pestaña no se actualizó hoy (dice "' + cabecera.slice(0, 40) + '"). Revisa las ejecuciones del proyecto Analytics notmanrivera.com.');
  }

  // 3. Envío de las 9
  const pros = libro.getSheetByName('Prospectos');
  const datos = pros.getRange(2, 1, Math.max(pros.getLastRow() - 1, 1), 16).getValues();
  let enviadosHoy = 0;
  const atoradas = [];
  const hoyDM = Utilities.formatDate(new Date(), 'America/Mexico_City', 'd/M');
  const tarde = new RegExp('desde el celular ' + hoyDM.replace('/', '\\/') + ' (\\d{1,2}):');
  datos.forEach(function (r, i) {
    const estado = String(r[5]).trim();
    const fecha = r[6] instanceof Date ? Utilities.formatDate(r[6], 'America/Mexico_City', 'd/M/yyyy') : String(r[6]).trim();
    if (/^enviado/i.test(estado) && fecha === hoyCorto) enviadosHoy++;
    const aprobadaTarde = (String(r[7]).match(tarde) || [])[1] >= 13; // salen mañana a las 9
    if (/^s[ií]$/i.test(String(r[4]).trim()) && /^(|pendiente de env[ií]o)$/i.test(estado) &&
        String(r[15]).trim().toLowerCase() === 'safe' && !aprobadaTarde) atoradas.push((i + 2) + ' ' + String(r[0]).trim());
  });
  if (atoradas.length && enviadosHoy < SALUD.TOPE_ENVIO) {
    problemas.push('Envíos de las 9 y la 1: ' + atoradas.length + ' fila(s) aprobada(s) y verificada(s) no salieron y hoy solo salieron ' +
      enviadosHoy + '. Si las aprobaste en la hoja después de la 1 pm, ignóralo: salen mañana. Si no, revisa que siga instalado el envío ' +
      '(menú Prospección → Instalar envío diario, con hola@).\n  Filas: ' + atoradas.slice(0, 8).join(', '));
  }

  // 4. Reseñas aprobadas que no están en la portada
  try {
    const resenas = libro.getSheetByName('Reseñas');
    if (resenas && resenas.getLastRow() > 1) {
      const portada = UrlFetchApp.fetch(SALUD.SITIO + '?salud=' + Date.now(), { muteHttpExceptions: true }).getContentText();
      resenas.getRange(2, 1, resenas.getLastRow() - 1, 13).getValues().forEach(function (r) {
        const nombre = String(r[2]).trim();
        if (nombre && /^s[ií]$/i.test(String(r[11]).trim()) && portada.indexOf(nombre) === -1) {
          problemas.push('Reseñas: la de ' + nombre + ' está aprobada pero no aparece en la portada. Si la aprobaste hace menos de 2 horas, ignóralo; si no, revisa la Action "Publicar reseñas aprobadas".');
        }
      });
    }
  } catch (e) {
    avisos.push('No pude revisar las reseñas en la portada: ' + e.message);
  }

  const lunes = Utilities.formatDate(new Date(), 'America/Mexico_City', 'u') === '1';
  if (!problemas.length && !lunes) return;

  const cuerpo = problemas.length
    ? 'Esto necesita atención:\n\n' + problemas.map(function (p) { return '• ' + p; }).join('\n\n')
    : 'Todo en orden: GitHub, Analytics, el envío de las 9 y las reseñas publicadas.';
  MailApp.sendEmail(SALUD.AVISAR_A,
    problemas.length ? 'Sistema: ' + problemas.length + ' cosa' + (problemas.length === 1 ? '' : 's') + ' que revisar' : 'Sistema: todo en orden',
    cuerpo + (avisos.length ? '\n\nNotas:\n' + avisos.join('\n') : '') +
    '\n\nQué es cada pieza y cómo se arregla: https://github.com/' + SALUD.REPO + '/blob/main/docs/sistema.md',
    { name: 'Sistema notmanrivera.com' });
}

function pistaGithub_(nombre) {
  if (/salud|apps script|reseñas|analytics/i.test(nombre)) {
    return 'Si el log dice invalid_grant o invalid_rapt, caducó la credencial de clasp: en la MacBook, "clasp login" con hola@ y actualiza el secreto CLASPRC_JSON (docs/sistema.md).';
  }
  if (/deploy|cloudflare/i.test(nombre)) return 'El sitio no se publicó; lo que esté en main no llegó a notmanrivera.com.';
  return 'Abre la ejecución para ver el error.';
}
