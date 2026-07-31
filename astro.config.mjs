// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Cambiar por el dominio real cuando esté conectado: de acá salen el sitemap,
// el RSS y las etiquetas canónicas.
export default defineConfig({
  site: 'https://japmarketingintegral-ops.github.io/jab-web',
  integrations: [sitemap()],
  build: { format: 'directory' },
});
