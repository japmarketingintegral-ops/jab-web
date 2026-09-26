import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Qué posts de Instagram ya se revisaron, para no volver a mandarlos a
// Claude ni duplicar un blog/LinkedIn ya generado. Es un archivo committeado
// -- así el historial de qué se procesó queda versionado, no en una base
// aparte que nadie audita.
const RUTA_ESTADO = fileURLToPath(new URL('./procesados.json', import.meta.url));

export async function leerProcesados() {
  try {
    const texto = await readFile(RUTA_ESTADO, 'utf8');
    return new Set(JSON.parse(texto));
  } catch (err) {
    if (err.code === 'ENOENT') return new Set();
    throw err;
  }
}

export async function guardarProcesados(idsProcesados) {
  const lista = Array.from(idsProcesados).sort();
  await writeFile(RUTA_ESTADO, JSON.stringify(lista, null, 2) + '\n', 'utf8');
}
