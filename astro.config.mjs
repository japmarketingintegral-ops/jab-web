// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// De acá salen el sitemap, el RSS y las etiquetas canónicas.
export default defineConfig({
  site: 'https://jabmarketing.site',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
