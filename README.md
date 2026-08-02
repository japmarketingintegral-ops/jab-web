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
- [x] ~~**Logos de clientes.**~~ Rescatados del embudo antes de dar de baja
      GoHighLevel. Para sumar uno: dejar el png en `public/assets/img/clientes`
      y agregarlo al array `clientes` de `index.astro` e `industrial.astro`.
- [ ] **Portadas del blog.** Las tres notas no tienen imagen; se muestra la
      categoría en su lugar. Se cargan desde el panel.
- [x] ~~**Datos de contacto.**~~ Teléfono confirmado: `+54 9 3402 41-5366`.
      Vive en cinco archivos (Nav, Base, 404, industrial, index y main.js). Si
      vuelve a cambiar, buscar `5493402415366` en todo el proyecto.
- [ ] **Imagen para redes.** Crear `public/assets/img/og.jpg` (1200×630) para que
      el link se vea bien al compartirlo por WhatsApp o redes.

## La página industrial

`/industrial` es el embudo que antes vivía en GoHighLevel, rehecho con el sistema
de diseño del sitio. El calendario de GoHighLevel se reemplazó por WhatsApp como
acción principal más el formulario que manda mails.

El video sigue en YouTube y **se carga recién al hacer clic**: incrustarlo de
entrada traería medio megabyte de scripts que la mayoría no usa. Hasta el clic
solo hay una imagen.

Antes de dar de baja GoHighLevel ya se rescató todo lo que estaba alojado ahí
(los cinco logos de clientes). No queda nada dependiendo de esa cuenta.

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
