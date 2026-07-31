import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const notas = (await getCollection('blog', ({ data }) => !data.borrador))
    .sort((a, b) => b.data.fecha.valueOf() - a.data.fecha.valueOf());

  return rss({
    title: 'Blog de Jab Marketing',
    description:
      'Estrategias, análisis y aprendizajes de cuentas reales para vendedores, community managers, emprendedores y dueños de negocios.',
    site: context.site,
    language: 'es-AR',
    items: notas.map((nota) => ({
      title: nota.data.titulo,
      description: nota.data.bajada,
      pubDate: nota.data.fecha,
      categories: [nota.data.categoria],
      link: `/blog/${nota.id}/`,
    })),
  });
}
