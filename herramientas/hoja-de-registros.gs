/**
 * Guarda en una hoja de cálculo cada persona que deja sus datos en el sitio.
 *
 * Va pegado en Apps Script, adentro de la planilla donde se quieren guardar los
 * registros. Es gratis, no tiene límite de contactos y la planilla es tuya.
 *
 * Para instalarlo, una sola vez:
 *
 *   1. Creá una planilla nueva en Google Sheets. Llamala "Contactos del sitio".
 *   2. Menú Extensiones → Apps Script.
 *   3. Borrá lo que haya y pegá todo este archivo.
 *   4. Implementar → Nueva implementación → tipo "Aplicación web".
 *        Ejecutar como:        Yo
 *        Quién tiene acceso:   Cualquier usuario
 *   5. Copiá la URL que te da (termina en /exec) y pasásela a Claude.
 *
 * La primera vez Google te va a pedir permiso con una advertencia de "app no
 * verificada". Es tu propio script sobre tu propia planilla: entrá en
 * "Configuración avanzada" y continuá.
 */

var HOJA = 'Registros';

function doPost(e) {
  try {
    var datos = (e && e.parameter) ? e.parameter : {};
    var hoja = obtenerHoja();

    hoja.appendRow([
      new Date(),
      datos.nombre || '',
      datos.mail || datos.contacto || '',
      datos.empresa || '',
      datos.subject || '',        // qué recurso pidió, o de qué página vino
      datos.mensaje || '',
      datos.origen || ''          // la página exacta
    ]);

    return responder({ ok: true });
  } catch (error) {
    return responder({ ok: false, error: String(error) });
  }
}

/** Devuelve la hoja de registros, creándola con sus títulos si no existe. */
function obtenerHoja() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(HOJA);

  if (!hoja) {
    hoja = libro.insertSheet(HOJA);
    hoja.appendRow(['Fecha', 'Nombre', 'Mail', 'Empresa', 'Qué pidió', 'Mensaje', 'Página']);
    var titulos = hoja.getRange(1, 1, 1, 7);
    titulos.setFontWeight('bold');
    titulos.setBackground('#00002E');
    titulos.setFontColor('#FFFFFF');
    hoja.setFrozenRows(1);
    hoja.setColumnWidth(1, 150);
    hoja.setColumnWidth(2, 160);
    hoja.setColumnWidth(3, 220);
    hoja.setColumnWidth(5, 240);
    hoja.setColumnWidth(6, 320);
  }
  return hoja;
}

function responder(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Para probar desde el editor sin tocar el sitio: Ejecutar → prueba */
function prueba() {
  doPost({ parameter: {
    nombre: 'Prueba desde Apps Script',
    mail: 'prueba@ejemplo.com',
    subject: 'Prueba de instalación',
    origen: '/herramientas'
  }});
}
