import { traerPostsInstagramDeJab } from './supabase.mjs';
import { esEducativo, generarContenido } from './claude.mjs';
import { publicarBlog } from './blog.mjs';
import { publicarLinkedin } from './linkedin.mjs';
import { leerProcesados, guardarProcesados } from './estado.mjs';

for (const variable of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ANTHROPIC_API_KEY']) {
  if (!process.env[variable]) {
    console.error(`Falta la variable de entorno ${variable}.`);
    process.exit(1);
  }
}

const procesados = await leerProcesados();
const posts = await traerPostsInstagramDeJab();
const nuevos = posts.filter((p) => !procesados.has(p.external_id) && p.titulo);

console.log(`${posts.length} posts en total, ${nuevos.length} sin procesar.`);

let generados = 0;

for (const post of nuevos) {
  // Se marca como procesado solo si se llegó a un resultado definitivo
  // (descartado, o publicado) -- nunca si algo falló. Bug real de la
  // primera corrida: un post que fallaba en clasificar o generar quedaba
  // marcado como procesado igual, y con eso nunca más se reintentaba, ni
  // arreglando el bug después.

  let clasificacion;
  try {
    clasificacion = await esEducativo(post.titulo);
  } catch (err) {
    console.error(`No se pudo clasificar ${post.external_id}, se reintenta la próxima corrida:`, err.message);
    continue;
  }

  if (!clasificacion.educativo) {
    console.log(`Descartado (${clasificacion.razon}): ${post.external_id}`);
    procesados.add(post.external_id);
    continue;
  }

  console.log(`Educativo (${clasificacion.razon}): ${post.external_id} -- generando...`);

  let contenido;
  try {
    contenido = await generarContenido(post.titulo);
  } catch (err) {
    console.error(`No se pudo generar contenido para ${post.external_id}, se reintenta la próxima corrida:`, err.message);
    continue;
  }

  const { slug } = await publicarBlog({
    ...contenido.blog,
    imagenUrl: post.imagen_url,
    portadaAlt: contenido.blog.titulo,
  });

  const linkedin = await publicarLinkedin({
    slug,
    texto: contenido.linkedin,
    urlBlog: `https://jabmarketing.site/blog/${slug}/`,
    urlInstagramOriginal: post.url,
  });

  console.log(
    linkedin.publicado
      ? `Publicado: ${slug} (blog + LinkedIn)`
      : `Publicado: ${slug} (blog -- LinkedIn quedó como borrador para pegar a mano)`,
  );
  procesados.add(post.external_id);
  generados++;
}

await guardarProcesados(procesados);
console.log(`Listo. ${generados} piezas nuevas generadas.`);
