# Jab Marketing — sitio web

Sitio institucional y blog de Jab Marketing, hecho con [Astro](https://astro.build).
Se compila a HTML estático: no hay servidor ni base de datos que mantener.

El diseño sale de `Sitio Web Jab.dc.html` del proyecto **Jab Marketing** en Claude
Design, respetando los tokens del manual de identidad visual (OVR® Studio, abril 2026).

## Estructura

```
src/
  content/blog/*.md       las notas del blog, una por archivo
  content.config.ts       qué campos tiene una nota (validado al compilar)
  layouts/Base.astro      head, nav y pie compartidos
  components/             Nav, Pie, TarjetaNota, Formulario
  pages/
    index.astro           home
    industrial.astro      embudo B2B industrial (rescatado de GoHighLevel)
    404.astro             página de error
    blog/index.astro      listado de notas
    blog/[...slug].astro  cada nota
    rss.xml.js            feed RSS
public/
  admin/                  panel de contenido (Sveltia CMS)
  assets/css|js|img/      estilos, comportamiento e imágenes
```

## Trabajar en local

```bash
npm install
npm run dev
```

Después abrí <http://localhost:4321>. Para ver cómo queda compilado: `npm run build`
y `npm run preview`.

## Marca

| Token | Valor | Uso |
|---|---|---|
| `--navy-900` | `#00002E` | fondo dominante |
| `--celeste-100` | `#E0F4FB` | texto sobre navy (nunca blanco puro) |
| `--blue-600` | `#3D6AF1` | azul de marca, sección Metodología |
| `--lime-500` | `#D5FF3C` | **exclusivo para call-to-action** |

Tipografías: **Funnel Display** (títulos) y **Funnel Sans** (texto), vía Google Fonts.
El logotipo usa Cal UI Bold, que no está disponible como webfont: por eso el logo
va siempre como imagen, nunca reproducido con Funnel.

## Publicar una nota

Hay tres caminos, y los tres terminan en lo mismo: un archivo `.md` en
`src/content/blog/`.

**Desde el panel.** Entrá a `/admin`, iniciá sesión con GitHub y cargá la nota con
el editor visual. Al guardar, el panel commitea el archivo y el sitio se
reconstruye solo. Entre "Publicar" y verlo online pasan uno o dos minutos.

**Desde GitHub.** Crear un archivo nuevo en `src/content/blog/` copiando el
formato de cualquier nota existente.

**Pidiéndoselo a Claude.** Decirle el tema y que redacte, cree el archivo y lo suba.

El campo `borrador: true` deja la nota fuera del sitio hasta que se cambie a `false`.

## Panel de contenido

El panel usa [Sveltia CMS](https://github.com/sveltia/sveltia-cms), que guarda
directamente en el repositorio. No hay base de datos: cada nota es un commit.

Para que el login funcione hace falta un intermediario de autenticación, porque
GitHub no permite iniciar sesión desde un sitio estático. Es una vez sola:

1. **Crear una GitHub OAuth App** en
   <https://github.com/settings/developers> → *New OAuth App*.
   En *Authorization callback URL* va la URL del worker del paso 2, con `/callback`
   al final.
2. **Desplegar `sveltia-cms-auth`** siguiendo
   <https://github.com/sveltia/sveltia-cms-auth>. Es un worker gratuito de
   Cloudflare. Ahí se cargan el Client ID y el Client Secret de la OAuth App.
3. **Pegar la URL del worker** en `public/admin/config.yml`, en `base_url`
   (hoy dice `https://PENDIENTE.workers.dev`).

Quien vaya a cargar notas necesita permiso de escritura en el repositorio.

## Pendientes

- [ ] **Panel de contenido.** Falta el paso de autenticación descrito arriba.
- [x] ~~**Dominio propio.**~~ `jabmarketing.site`, configurado en `site` de
      `astro.config.mjs`.
- [x] ~~**Logos de clientes.**~~ Se cargan solos desde `src/assets/clientes`.
      Ver *Logos de clientes* más abajo.
- [x] ~~**Portadas del blog.**~~ Cada nota tiene portada e imagen interna.
- [x] ~~**Datos de contacto.**~~ Teléfono confirmado: `+54 9 3402 41-5366`.
      Vive en cinco archivos (Nav, Base, 404, industrial, index y main.js). Si
      vuelve a cambiar, buscar `5493402415366` en todo el proyecto.
- [x] ~~**Imagen para redes.**~~ `public/assets/img/og.jpg`.
- [ ] **Ficha de Google Business Profile.** Es lo que más mueve la aguja para un
      negocio regional, y no depende del sitio. Los datos tienen que coincidir
      exactamente con los del pie: Jab Marketing, Arroyo Seco (Santa Fe),
      +54 9 3402 41-5366.
- [x] ~~**Páginas por servicio.**~~ Ocho, en `src/content/servicios`. Ver
      *Páginas de servicio* más abajo.

## La página industrial

`/industrial` es el embudo que antes vivía en GoHighLevel, rehecho con el sistema
de diseño del sitio. El calendario de GoHighLevel se reemplazó por WhatsApp como
acción principal más el formulario que manda mails.

El video sigue en YouTube y **se carga recién al hacer clic**: incrustarlo de
entrada traería medio megabyte de scripts que la mayoría no usa. Hasta el clic
solo hay una imagen.

Antes de dar de baja GoHighLevel ya se rescató todo lo que estaba alojado ahí
(los cinco logos de clientes). No queda nada dependiendo de esa cuenta.

## Páginas de servicio

Cada servicio es un archivo `.md` en `src/content/servicios/` y se convierte en
una página propia. Hoy hay ocho, uno por cada tarjeta de la home.

**La barra de solapas se ve como un selector de pestañas, pero cada solapa es un
enlace a otra página.** Es a propósito, y es la diferencia que hace que esto
sirva para SEO: si las nueve vivieran en una sola dirección, sería una página
hablando de nueve temas y no rankearía por ninguno. Con una página por servicio,
cada una compite por su búsqueda —"diseño web Rosario", "community manager
Rosario"— con su propio título, su descripción y sus datos estructurados.

Para sumar un servicio: copiar cualquier archivo de esa carpeta y cambiarle el
contenido. El nombre del archivo es la dirección. Aparece solo en la barra de
solapas y en el índice, ordenado por el campo `orden`.

Cada página genera tres fichas de datos estructurados: `Service` atada al negocio
local, `BreadcrumbList` y `FAQPage`. Esta última es la que puede hacer que las
preguntas aparezcan desplegadas en Google.

El noveno servicio, el sistema B2B industrial, no está en esta colección porque
ya tiene su propia página en `/industrial`. Igual aparece en la barra de solapas
y en el índice, para que las nueve tarjetas de la home se vean y funcionen igual.

**Ojo con los dos puntos en el frontmatter.** Un valor sin comillas que contenga
`: ` rompe el YAML. Por eso los textos van entrecomillados.

## Logos de clientes

**Para sumar un cliente alcanza con dejar el logo en `src/assets/clientes/`.** No
hay que tocar código: aparece solo en la home y en `/industrial`, comprimido y
con el nombre puesto. Los cinco actuales bajaron de 256 kB a 49 kB en total sin
que se note la diferencia.

El nombre del archivo es el nombre que se muestra:

| Archivo | Se muestra |
|---|---|
| `gimetal.png` | Gimetal |
| `pack-group.png` | Pack Group |
| `03-termoplast.png` | Termoplast |

El número adelante sirve **solo para ordenar**: los numerados van primero, en
orden; el resto queda alfabético. Es la forma de poner los clientes más fuertes
al principio.

Sirven `png`, `jpg`, `webp` y `svg`. Lo ideal es un png con fondo transparente
de unos 600 px de ancho; más grande no hace falta porque se reduce igual.

Si un nombre necesita una escritura que el archivo no puede tener —mayúscula en
el medio como PackGroup, un acento, un `&`— se agrega en `escrituras`, dentro de
[`src/datos/clientes.ts`](src/datos/clientes.ts).

El desfile de `/industrial` ajusta su velocidad según cuántos logos haya, así
que puede crecer sin quedar acelerado.

## Imágenes del blog

Las fotos vienen de [Unsplash](https://unsplash.com), bajo su licencia: uso
comercial permitido, sin obligación de atribuir. Están recortadas a 1200×675 las
portadas y 1000×560 las internas, con la saturación bajada un punto y una tinta
navy al 16% para que convivan con el resto del sitio.

Para cambiar una: dejar el archivo en `public/assets/img/blog/` con el mismo
nombre que el slug de la nota, y actualizar `portadaAlt` en el frontmatter.

## SEO

El objetivo es aparecer en búsquedas locales de **Arroyo Seco y Rosario** para
servicios de marketing generales. Arroyo Seco es alcanzable en poco tiempo;
Rosario es una plaza competitiva y lleva más.

Lo que ya está resuelto en el sitio:

- `robots.txt` con permiso explícito a los rastreadores de IA (GPTBot,
  ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended)
- `llms.txt`, la convención que están adoptando los modelos para entender de qué
  trata un sitio y poder citarlo
- Ficha `ProfessionalService` con `PostalAddress` y `areaServed`, que es lo que
  Google necesita para asociar el sitio a búsquedas locales
- Dirección y teléfono visibles en el pie, para que coincidan con la ficha
- Un solo `h1` por página, títulos con ubicación y descripciones dentro del
  largo que muestra Google
- Sitemap y RSS

Lo que **no** depende del sitio y pesa más: la ficha de Google Business Profile
y los enlaces desde otros sitios. Sin eso, el trabajo técnico rinde la mitad.

## Formulario de contacto

Los mensajes se envían con [Web3Forms](https://web3forms.com) y llegan por mail a
**jabmarketingintegral@gmail.com**. Plan gratuito: 250 mensajes por mes.

La `access_key` está en el HTML, en un campo oculto del formulario. **No es un
secreto**: viaja en el código y cualquiera puede leerla. Lo único que habilita es
mandar mensajes por este formulario. Si algún día entra spam, se da de baja la
clave en web3forms.com y se genera otra.

Si el servicio no responde, el JavaScript abre WhatsApp con el mensaje ya armado,
así la consulta no se pierde. El campo `empresa-web` es una trampa anti-spam
invisible: si un bot lo completa, el mensaje se descarta en silencio.

## Publicar el sitio

Alojado en **Cloudflare Workers** (proyecto `jab-web`), que reconstruye y publica
con cada push a `main`. La configuración de despliegue vive en `wrangler.jsonc`:
Cloudflare no ejecuta código, solo sirve lo que Astro dejó en `dist/`.

| Ajuste | Valor |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

El dominio `jabmarketing.site` está conectado desde *Workers & Pages → jab-web →
Domains*. El certificado HTTPS se emite solo.

**El DNS está en Cloudflare y el dominio tiene correo activo en Hostinger.** Los
registros MX, SPF, DMARC, DKIM y los CNAME de autoconfiguración tienen que quedar
siempre en *DNS only* (nube gris): si se ponen en *Proxied*, Cloudflare responde
tráfico web en lugar del registro real y el correo se rompe. Hay un respaldo del
estado previo en `DNS-RESPALDO.txt`.

## Sobre el package-lock.json

Está generado con **npm 10**, que es la versión que usa Cloudflare para compilar.

Si se regenera con npm 11 o superior, el despliegue falla: las dos versiones
anotan distinto las dependencias que varían según el sistema operativo, y
Cloudflare corta con `Missing: @emnapi/... from lock file`.

Si hace falta rehacerlo:

```bash
rm -rf node_modules package-lock.json
npx npm@10 install
```
