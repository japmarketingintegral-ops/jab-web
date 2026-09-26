import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Hasta que la app de LinkedIn tenga aprobado publicar en nombre de la
// página (Community Management API, no autoservicio), el texto queda acá
// listo para pegar a mano -- ver linkedin-borradores/README.md.
const CARPETA = fileURLToPath(new URL('../../linkedin-borradores/', import.meta.url));

export async function guardarBorradorLinkedin({ slug, texto, urlBlog, urlInstagramOriginal }) {
  await mkdir(CARPETA, { recursive: true });
  const fecha = new Date().toISOString().slice(0, 10);
  const ruta = `${CARPETA}${fecha}-${slug}.md`;
  const contenido = [
    `<!-- Generado automáticamente a partir de: ${urlInstagramOriginal} -->`,
    `<!-- Blog relacionado: ${urlBlog} -->`,
    '',
    texto.trim(),
    '',
  ].join('\n');
  await writeFile(ruta, contenido, 'utf8');
  return ruta;
}
