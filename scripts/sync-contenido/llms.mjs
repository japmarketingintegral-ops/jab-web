import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// llms.txt le da contexto del sitio a los motores de IA (ChatGPT, Perplexity,
// Claude) de un vistazo -- pero si la lista de notas del blog se escribe a
// mano, queda vieja apenas la automatización publica una nota nueva. Esta
// función regenera esa sección entera a partir de lo que hay hoy en
// src/content/blog/, así que corre sola en cada sync y nunca se desactualiza.
const CARPETA_BLOG = fileURLToPath(new URL('../../src/content/blog/', import.meta.url));
const RUTA_LLMS = fileURLToPath(new URL('../../public/llms.txt', import.meta.url));
const SITIO = 'https://jabmarketing.site';

function leerCampo(frontmatter, campo) {
  const m = frontmatter.match(new RegExp(`^${campo}: "?(.*?)"?$`, 'm'));
  return m ? m[1].replace(/\\"/g, '"') : null;
}

async function leerNota(archivo) {
  const texto = await readFile(`${CARPETA_BLOG}${archivo}`, 'utf8');
  const bloque = texto.match(/^---\n([\s\S]*?)\n---/);
  if (!bloque) return null;
  const frontmatter = bloque[1];
  if (/^borrador: true$/m.test(frontmatter)) return null;
  return {
    titulo: leerCampo(frontmatter, 'titulo'),
    bajada: leerCampo(frontmatter, 'bajada'),
    fecha: leerCampo(frontmatter, 'fecha'),
    slug: archivo.replace(/\.md$/, ''),
  };
}

export async function actualizarNotasDelBlog() {
  const archivos = (await readdir(CARPETA_BLOG)).filter((f) => f.endsWith('.md'));
  const notas = (await Promise.all(archivos.map(leerNota)))
    .filter(Boolean)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));

  const lineas = notas.map(
    (n) => `- [${n.titulo}](${SITIO}/blog/${n.slug}/): ${n.bajada}`,
  );

  const actual = await readFile(RUTA_LLMS, 'utf8');
  const actualizado = actual.replace(
    /## Notas del blog\n\n[\s\S]*$/,
    `## Notas del blog\n\n${lineas.join('\n')}\n`,
  );
  if (actualizado === actual) return false;
  await writeFile(RUTA_LLMS, actualizado, 'utf8');
  return true;
}
