/**
 * Adónde se guardan los contactos que dejan sus datos en el sitio.
 *
 * Web3Forms manda el mail, pero no guarda nada: en el plan gratuito los envíos
 * se borran a los 30 días y no hay panel para verlos. Sin esto, la lista de
 * contactos es la bandeja de Gmail y nada más.
 *
 * Acá va la URL de la aplicación web de Apps Script, la que termina en /exec.
 * Los pasos para obtenerla están en herramientas/hoja-de-registros.gs.
 *
 * Mientras esté vacío, el sitio funciona igual: siguen llegando los mails, sólo
 * que no se guarda la copia en la planilla.
 */
export const HOJA_DE_REGISTROS = '';
