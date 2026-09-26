import { VOZ_JAB } from './voz-jab.mjs';

// Clasificar es una decisión binaria simple -- no hace falta el modelo caro
// para eso, y es la llamada que corre en TODOS los posts, no solo en los
// que después se expanden. Generar sí usa el modelo bueno: ese contenido
// se publica directo, sin revisión de nadie.
const MODELO_CLASIFICAR = 'claude-haiku-4-5-20251001';
const MODELO_GENERAR = 'claude-sonnet-5';

async function llamarClaude({ modelo, system, prompt, maxTokens }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelo,
      max_tokens: maxTokens,
      // El prompt del sistema es el mismo en cada llamada de esta corrida
      // (se procesan varios posts seguidos) -- con cache_control se cobra
      // una sola vez cada 5 minutos en vez de una vez por post.
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API falló: ${res.status} ${await res.text()}`);
  const data = await res.json();
  // El primer bloque de content no siempre es el de texto -- el modelo
  // puede devolver un bloque de razonamiento antes. Bug real: esto rompía
  // el 100% de las llamadas de generación en la primera corrida real.
  const bloqueDeTexto = data.content.find((b) => b.type === 'text');
  if (!bloqueDeTexto) throw new Error(`Respuesta sin bloque de texto: ${JSON.stringify(data)}`);
  return bloqueDeTexto.text;
}

/**
 * ¿Este post enseña algo (un criterio, un error a evitar, cómo funciona
 * algo) o es promoción/novedad puntual (nuevo cliente, evento, feriado,
 * cumpleaños de la agencia)? Solo lo primero se expande a blog/LinkedIn --
 * lo segundo tiene sentido en Instagram y en ningún otro lado.
 */
export async function esEducativo(caption) {
  const texto = await llamarClaude({
    modelo: MODELO_CLASIFICAR,
    system:
      'Analizás un caption de Instagram de una agencia de marketing y decidís si contiene un aprendizaje o criterio genuino (algo que alguien podría aplicar), a diferencia de una publicación promocional, de novedad puntual o de un cliente/evento específico. Respondé solo con JSON: {"educativo": true|false, "razon": "menos de 10 palabras"}. Sin texto extra, sin markdown.',
    prompt: caption,
    maxTokens: 100,
  });
  const limpio = texto.trim().replace(/^```json\n?|```$/g, '');
  return JSON.parse(limpio);
}

/**
 * Devuelve { linkedin, blog: { titulo, bajada, categoria, lectura, cuerpo } }.
 * `cuerpo` es el markdown completo del artículo, sin el frontmatter -- eso
 * lo arma blog.mjs con datos que no dependen del modelo (fecha, portada).
 */
export async function generarContenido(caption) {
  const categoriasExistentes = ['Ventas', 'Paid media', 'Contenido', 'Estrategia'];

  const texto = await llamarClaude({
    modelo: MODELO_GENERAR,
    system: `Sos el redactor de Jab Marketing. Expandís un caption de Instagram en dos piezas nuevas para otros dos canales -- nunca repitas el caption tal cual, cada canal tiene su propio registro.

Voz de la marca:
${VOZ_JAB}

Categorías de blog ya existentes (reusar una de estas salvo que ninguna aplique de verdad): ${categoriasExistentes.join(', ')}.

El artículo de blog va de 400 a 600 palabras -- ni un resumen de 3 líneas ni un ensayo. Párrafos cortos, ejemplos concretos, nada de relleno.

Devolvé solo JSON válido con esta forma exacta, sin texto extra ni markdown alrededor:
{
  "linkedin": "texto del post de LinkedIn, en primera persona de la agencia, más desarrollado y profesional que el caption, sin hashtags al final tipo Instagram",
  "blog": {
    "titulo": "título del artículo",
    "bajada": "una oración que resume el artículo, para la vista previa",
    "categoria": "una de las categorías existentes",
    "lectura": 4,
    "cuerpo": "el artículo completo en markdown, 400 a 600 palabras, con títulos ## y texto en negrita donde ayude"
  }
}`,
    prompt: `Caption de Instagram:\n\n${caption}`,
    maxTokens: 1800,
  });
  const limpio = texto.trim().replace(/^```json\n?|```$/g, '');
  return JSON.parse(limpio);
}
