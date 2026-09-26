import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const CARPETA_BLOG = fileURLToPath(new URL('../../src/content/blog/', import.meta.url));
const CARPETA_PORTADAS = fileURLToPath(new URL('../../public/assets/img/blog/', import.meta.url));

function slugificar(titulo) {
  return titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // saca acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * La imagen de Instagram viene de una URL firmada de Meta que expira -- hay
 * que bajarla ahora, no guardar el link. Se guarda con el mismo slug que el
 * post para que quede claro de dónde salió si hay que revisar algo.
 */
async function descargarPortada(imagenUrl, slug) {
  const res = await fetch(imagenUrl);
  if (!res.ok) return null;
  await mkdir(CARPETA_PORTADAS, { recursive: true });
  const archivo = `${slug}.jpg`;
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(`${CARPETA_PORTADAS}${archivo}`, buffer);
  return `/assets/img/blog/${archivo}`;
}

function escaparYaml(texto) {
  return texto.replace(/"/g, '\\"');
}

export async function publicarBlog({ titulo, bajada, categoria, lectura, cuerpo, imagenUrl, portadaAlt }) {
  const slug = slugificar(titulo);
  const portada = imagenUrl ? await descargarPortada(imagenUrl, slug) : null;
  const fecha = new Date().toISOString().slice(0, 10);

  const lineas = [
    `titulo: "${escaparYaml(titulo)}"`,
    `bajada: "${escaparYaml(bajada)}"`,
    `categoria: ${categoria}`,
    `fecha: ${fecha}`,
    `lectura: ${lectura}`,
    portada ? `portada: ${portada}` : null,
    portada ? `portadaAlt: "${escaparYaml(portadaAlt ?? titulo)}"` : null,
    'borrador: false',
  ].filter((l) => l !== null);

  const frontmatter = `---\n${lineas.join('\n')}\n---\n\n`;

  await mkdir(CARPETA_BLOG, { recursive: true });
  const ruta = `${CARPETA_BLOG}${slug}.md`;
  await writeFile(ruta, frontmatter + cuerpo.trim() + '\n', 'utf8');
  return { slug, ruta };
}
