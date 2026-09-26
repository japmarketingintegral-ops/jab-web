import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Publica directo en el perfil personal de Santiago cuando LINKEDIN_ACCESS_TOKEN
// puede identificar al miembro -- eso requiere el producto "Sign In with
// LinkedIn using OpenID Connect" en la app de LinkedIn, pedido pero
// pendiente de aprobación al momento de escribir esto (Community Management
// API, para postear como la página de la empresa, no es autoservicio y no
// se pidió). Mientras no esté aprobado -- o si falla por lo que sea --, cae
// solo a guardar el borrador en linkedin-borradores/ para pegar a mano, sin
// cortar el resto de la corrida. El día que LinkedIn apruebe el permiso,
// empieza a publicar solo, sin tocar este código de nuevo.
const CARPETA_BORRADORES = fileURLToPath(new URL('../../linkedin-borradores/', import.meta.url));
const CARPETA_PUBLICADOS = fileURLToPath(new URL('../../linkedin-publicados/', import.meta.url));

let urnDeMiembroCacheado = null;

async function obtenerUrnDeMiembro(token) {
  if (urnDeMiembroCacheado) return urnDeMiembroCacheado;
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`no se pudo identificar al miembro (${res.status}): ${await res.text()}`);
  const data = await res.json();
  urnDeMiembroCacheado = `urn:li:person:${data.sub}`;
  return urnDeMiembroCacheado;
}

async function crearPostLinkedin(token, autor, texto) {
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: autor,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: texto },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    }),
  });
  if (!res.ok) throw new Error(`LinkedIn rechazó el post (${res.status}): ${await res.text()}`);
  return res.headers.get('x-restli-id');
}

async function guardarRegistro(carpeta, { slug, texto, urlBlog, urlInstagramOriginal, postId }) {
  await mkdir(carpeta, { recursive: true });
  const fecha = new Date().toISOString().slice(0, 10);
  const ruta = `${carpeta}${fecha}-${slug}.md`;
  const lineas = [
    `<!-- Generado automáticamente a partir de: ${urlInstagramOriginal} -->`,
    `<!-- Blog relacionado: ${urlBlog} -->`,
  ];
  if (postId) lineas.push(`<!-- Publicado en LinkedIn: ${postId} -->`);
  lineas.push('', texto.trim(), '');
  await writeFile(ruta, lineas.join('\n'), 'utf8');
  return ruta;
}

export async function publicarLinkedin({ slug, texto, urlBlog, urlInstagramOriginal }) {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!token) {
    const ruta = await guardarRegistro(CARPETA_BORRADORES, { slug, texto, urlBlog, urlInstagramOriginal });
    return { publicado: false, ruta };
  }
  try {
    const autor = await obtenerUrnDeMiembro(token);
    const postId = await crearPostLinkedin(token, autor, texto);
    const ruta = await guardarRegistro(CARPETA_PUBLICADOS, { slug, texto, urlBlog, urlInstagramOriginal, postId });
    return { publicado: true, ruta, postId };
  } catch (err) {
    console.error(`No se pudo publicar en LinkedIn, se guarda como borrador para pegar a mano: ${err.message}`);
    const ruta = await guardarRegistro(CARPETA_BORRADORES, { slug, texto, urlBlog, urlInstagramOriginal });
    return { publicado: false, ruta };
  }
}
