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
    /**
     * Recurso descargable a cambio del mail. Si está, se agrega el bloque de
     * descarga al final de la nota.
     */
    recurso: z.object({
      titulo: z.string(),
      texto: z.string(),
      /** Ruta del archivo dentro de public/ */
      archivo: z.string(),
      /** Asunto del mail, para saber qué recurso pidieron */
      asunto: z.string(),
      incluye: z.array(z.string()).default([]),
    }).optional(),
    borrador: z.boolean().default(false),
  }),
});

// Cada servicio es un archivo .md en src/content/servicios y se convierte en una
// página propia. Son páginas separadas y no solapas de una sola: es lo que
// permite competir por búsquedas como "diseño web Rosario", que apuntan a un
// servicio concreto y no a la agencia entera.
const servicios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/servicios' }),
  schema: z.object({
    titulo: z.string(),
    /** El que va en la solapa: más corto que el título de la página. */
    solapa: z.string(),
    /** Manda el orden de las solapas. */
    orden: z.number().int(),
    bajada: z.string(),
    metaTitulo: z.string(),
    metaDescripcion: z.string(),
    /** Qué incluye el servicio, en viñetas. */
    incluye: z.array(z.string()).min(1),
    /** Preguntas frecuentes: alimentan el bloque visible y el schema FAQPage. */
    faq: z.array(z.object({ p: z.string(), r: z.string() })).default([]),
    borrador: z.boolean().default(false),
  }),
});

export const collections = { blog, servicios };
