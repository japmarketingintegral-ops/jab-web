import { writeFile, mkdir, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const ejecutar = promisify(execFile);

const CARPETA_BLOG = fileURLToPath(new URL('../../src/content/blog/', import.meta.url));
const CARPETA_PORTADAS = fileURLToPath(new URL('../../public/assets/img/blog/', import.meta.url));

// Las placas de Instagram son siempre 4:5 (1080x1350) -- la tarjeta del
// blog usa ese mismo formato (.post__cover en styles.css) para que entren
// tal cual, sin recortar. Cuando una placa no es exactamente 4:5 (reels
// 9:16, cuadradas 1:1), se compone sobre una franja del navy de marca
// (--navy-900) arriba/abajo o a los costados en vez de recortar: no se
// pierde nada del contenido original y queda en la paleta oficial.
const ANCHO_PORTADA = 1080;
const ALTO_PORTADA = 1350;
const NAVY_DE_MARCA = '0x00002e';
const FFMPEG_BIN = process.env.FFMPEG_BIN || 'ffmpeg';

async function componerPortada(rutaOriginal, rutaFinal) {
  const filtro =
    `color=c=${NAVY_DE_MARCA}:s=${ANCHO_PORTADA}x${ALTO_PORTADA}[bg];` +
    `[0:v]scale=${ANCHO_PORTADA}:${ALTO_PORTADA}:force_original_aspect_ratio=decrease[fg];` +
    `[bg][fg]overlay=(W-w)/2:(H-h)/2,format=yuvj420p`;
  await ejecutar(FFMPEG_BIN, [
    '-y',
    '-i', rutaOriginal,
    '-filter_complex', filtro,
    '-frames:v', '1',
    '-update', '1',
    '-q:v', '4',
    rutaFinal,
  ]);
}

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
  const rutaOriginal = `${CARPETA_PORTADAS}${slug}.original.jpg`;
  const rutaFinal = `${CARPETA_PORTADAS}${archivo}`;
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(rutaOriginal, buffer);
  try {
    await componerPortada(rutaOriginal, rutaFinal);
  } catch (err) {
    console.error(`No se pudo componer la portada de ${slug}, se usa la imagen original sin recortar:`, err.message);
    await writeFile(rutaFinal, buffer);
  } finally {
    await unlink(rutaOriginal).catch(() => {});
  }
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
