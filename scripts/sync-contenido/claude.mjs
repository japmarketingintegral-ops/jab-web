import { VOZ_JAB } from './voz-jab.mjs';

const MODELO = 'claude-sonnet-5';

async function llamarClaude({ system, prompt, maxTokens }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API falló: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.content[0].text;
}

/**
 * ¿Este post enseña algo (un criterio, un error a evitar, cómo funciona
 * algo) o es promoción/novedad puntual (nuevo cliente, evento, feriado,
 * cumpleaños de la agencia)? Solo lo primero se expande a blog/LinkedIn --
 * lo segundo tiene sentido en Instagram y en ningún otro lado.
 */
export async function esEducativo(caption) {
  const texto = await llamarClaude({
    system:
      'Analizás un caption de Instagram de una agencia de marketing y decidís si contiene un aprendizaje o criterio genuino (algo que alguien podría aplicar), a diferencia de una publicación promocional, de novedad puntual o de un cliente/evento específico. Respondé solo con JSON: {"educativo": true|false, "razon": "una oración"}. Sin texto extra, sin markdown.',
    prompt: caption,
    maxTokens: 300,
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
    system: `Sos el redactor de Jab Marketing. Expandís un caption de Instagram en dos piezas nuevas para otros dos canales -- nunca repitas el caption tal cual, cada canal tiene su propio registro.

Voz de la marca:
${VOZ_JAB}

Categorías de blog ya existentes (reusar una de estas salvo que ninguna aplique de verdad): ${categoriasExistentes.join(', ')}.

Devolvé solo JSON válido con esta forma exacta, sin texto extra ni markdown alrededor:
{
  "linkedin": "texto del post de LinkedIn, en primera persona de la agencia, más desarrollado y profesional que el caption, sin hashtags al final tipo Instagram",
  "blog": {
    "titulo": "título del artículo",
    "bajada": "una oración que resume el artículo, para la vista previa",
    "categoria": "una de las categorías existentes",
    "lectura": 5,
    "cuerpo": "el artículo completo en markdown, con títulos ## y texto en negrita donde ayude, siguiendo el estilo de un blog de agencia -- párrafos cortos, ejemplos concretos, nada de relleno"
  }
}`,
    prompt: `Caption de Instagram:\n\n${caption}`,
    maxTokens: 4000,
  });
  const limpio = texto.trim().replace(/^```json\n?|```$/g, '');
  return JSON.parse(limpio);
}
