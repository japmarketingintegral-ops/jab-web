import type { ImageMetadata } from 'astro';

/**
 * La lista de clientes se arma sola con lo que haya en src/assets/clientes/.
 *
 * Para sumar un cliente: dejar el logo en esa carpeta. Nada más. Aparece en la
 * home ya optimizado y con el nombre puesto.
 *
 * Reglas del nombre de archivo:
 *   gimetal.png        ->  Gimetal
 *   cuenca-de-vida.png ->  Cuenca de Vida   (las palabras cortas quedan en minúscula)
 *   02-fiat.png        ->  FIAT             (el número sólo ordena, no se muestra)
 *
 * Los numerados van primero, en orden; el resto queda alfabético.
 */

const archivos = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/clientes/*.{png,jpg,jpeg,webp,avif,svg}',
  { eager: true },
);

/** Nombres que el archivo no puede escribir: siglas, acentos, mayúscula interna. */
const escrituras: Record<string, string> = {
  'arnations': 'ArNations',
  'bm-trading': 'BM Trading',
  'centro-medico-argutti': 'Centro Médico Argutti',
  'club-union-arroyo-seco': 'Club Unión Arroyo Seco',
  'csm': 'CSM',
  'pavon': 'Pavón',
  'fiat': 'FIAT',
  'mandalas-led': 'Mandalas LED',
  'municipalidad-de-arroyo-seco': 'Municipalidad de Arroyo Seco',
  'niche': 'Niché',
  'packgroup': 'PackGroup',
  'revolucion-humana': 'Revolución Humana',
  'tcis': 'TCIS',
};

/** En castellano estas no llevan mayúscula salvo que abran el nombre. */
const menores = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'en', 'y', 'por']);

function baseDe(ruta: string) {
  return ruta.split('/').pop()!.replace(/\.\w+$/, '');
}

function nombrar(base: string) {
  const limpio = base.replace(/^\d+[-_]/, '');
  if (escrituras[limpio]) return escrituras[limpio];
  return limpio
    .split(/[-_]+/)
    .map((palabra, i) =>
      i > 0 && menores.has(palabra)
        ? palabra
        : palabra.charAt(0).toUpperCase() + palabra.slice(1),
    )
    .join(' ');
}

export type Cliente = { nombre: string; logo: ImageMetadata };

export const clientes: Cliente[] = Object.entries(archivos)
  .sort(([a], [b]) => baseDe(a).localeCompare(baseDe(b), 'es', { numeric: true }))
  .map(([ruta, modulo]) => ({ nombre: nombrar(baseDe(ruta)), logo: modulo.default }));

/**
 * En /industrial el desfile dice "empresas que ya implementaron el sistema", así
 * que ahí van sólo las industriales. Para sumar una: escribir su nombre acá,
 * igual que aparece en la home.
 */
const industriales = new Set([
  'Gimetal',
  'Geronzi',
  'PackGroup',
  'Montenegro',
  'Termoplast',
  'Maroni Group',
  'Nuevo Horizonte',
  'Transporte Fighiera',
]);

export const clientesIndustriales: Cliente[] = clientes.filter((c) =>
  industriales.has(c.nombre),
);
