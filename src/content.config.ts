import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Cada nota del blog es un archivo .md en src/content/blog.
// Este esquema es también el que respeta el panel de administración: si acá se
// agrega un campo, hay que agregarlo en public/admin/config.yml.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    titulo: z.string(),
    bajada: z.string(),
    categoria: z.string(),
    fecha: z.coerce.date(),
    lectura: z.number().int().positive(),
    portada: z.string().optional(),
    portadaAlt: z.string().optional(),
    borrador: z.boolean().default(false),
  }),
});

export const collections = { blog };
