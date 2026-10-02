/**
 * Invitaciones de reseña (menú Prospección → Nueva invitación de reseña).
 *
 * Solo crea la fila en la pestaña Invitaciones y da la liga personal. El
 * formulario lo recibe otro proyecto, propiedad de hola@ (ver
 * scripts/resenas-webapp/Resenas.gs y su comentario de por qué está aparte).
 */

const INVITACIONES = {
  HOJA: 'Invitaciones',
  SITIO: 'https://notmanrivera.com/resena/',
};

/** Menú: crea una invitación y muestra la liga para mandarla. */
function nuevaInvitacionResena() {
  const ui = SpreadsheetApp.getUi();
  const pedir = function (pregunta) {
    const resp = ui.prompt('Nueva invitación de reseña', pregunta, ui.ButtonSet.OK_CANCEL);
    return resp.getSelectedButton() === ui.Button.OK ? resp.getResponseText().trim() : null;
  };
  const nombre = pedir('Nombre de la persona (como lo saludará el formulario):');
  if (!nombre) return;
  const empresa = pedir('Empresa:');
  if (empresa === null) return;
  const idioma = /^en/i.test(pedir('Idioma del formulario: es o en') || '') ? 'en' : 'es';

  const codigo = codigoInvitacion_(nombre);
  const liga = INVITACIONES.SITIO + (idioma === 'en' ? '?lang=en&c=' : '?c=') + codigo;
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(INVITACIONES.HOJA)
    .appendRow([codigo, nombre, empresa, idioma, fechaCorta(new Date()), 'Pendiente', 'Liga: ' + liga]);
  ui.alert('Liga para ' + nombre, liga, ui.ButtonSet.OK);
}

/** nombre-xxxxxxxx: legible, pero imposible de adivinar. */
function codigoInvitacion_(nombre) {
  const base = String(nombre).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').split('-')[0] || 'invitado';
  const letras = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid());
  let sufijo = '';
  for (let i = 0; i < 8; i++) sufijo += letras[(bytes[i] + 256) % letras.length];
  return base + '-' + sufijo;
}
