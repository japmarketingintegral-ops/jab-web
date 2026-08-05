// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// De acá salen el sitemap, el RSS y las etiquetas canónicas.
export default defineConfig({
  site: 'https://jabmarketing.site',
  integrations: [
    sitemap({
      // Las páginas con noindex no van en el sitemap: pedirle a Google que
      // indexe una lista donde algunas dicen "no me indexes" es una señal
      // contradictoria. Hoy es sólo la de pruebas del hero.
      filter: (pagina) => !pagina.includes('/pruebas-hero'),
    }),
  ],
  build: { format: 'directory' },
});
