# Jab Marketing — sitio web

Sitio institucional de Jab Marketing. HTML, CSS y JavaScript puros: no hay build,
no hay dependencias, no hay backend. Se sube tal cual a cualquier hosting estático.

Generado a partir del diseño `Sitio Web Jab.dc.html` del proyecto **Jab Marketing**
en Claude Design, respetando los tokens del manual de identidad visual
(OVR® Studio, abril 2026).

## Estructura

```
index.html                          página completa
assets/css/styles.css               estilos y tokens de marca
assets/js/main.js                   animaciones de scroll + formulario
assets/img/                         logos e imágenes
.claude/launch.json                 servidor local para previsualizar
```

## Ver el sitio en local

```bash
python3 -m http.server 4321
```

Después abrí <http://localhost:4321>.

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

## Pendientes antes de publicar

- [ ] **Render 3D del hero.** `assets/img/isotipo-3d.png` no se pudo bajar entero
      (supera el límite de 256 KB de la herramienta). Descargalo de Claude Design
      (`assets/slides/isotipo-3d-crop.png`), guardalo con ese nombre y en
      `index.html` cambiá el `src` del bloque `.hero__art` y sacale la clase
      `hero__art--vector`.
- [ ] **Logos de clientes.** 18 celdas con placeholder en la sección Clientes.
      Reemplazar cada `<div class="slot">` por `<img src="assets/img/clientes/….png" alt="…">`.
- [ ] **Portadas del blog.** 3 placeholders, mismo procedimiento.
- [x] ~~**Formulario.**~~ Conectado a Web3Forms.
- [ ] **Datos de contacto.** El teléfono `+54 9 3402 50000` viene del diseño y
      parece un número de ejemplo. Verificar antes de publicar (aparece en el nav,
      el hero, la sección de contacto y todos los enlaces de WhatsApp).
- [ ] **Imagen para redes.** Crear `assets/img/og.jpg` (1200×630) para que el link
      se vea bien al compartirlo por WhatsApp o redes.
- [ ] **Dominio.** Actualizar `<link rel="canonical">` y las etiquetas `og:` en
      `index.html` con el dominio real.

## Formulario de contacto

Los mensajes se envían con [Web3Forms](https://web3forms.com) y llegan por mail a
**jabmarketingintegral@gmail.com**. Plan gratuito: 250 mensajes por mes.

La `access_key` está en el `index.html`, en un campo oculto del formulario. **No es
un secreto**: viaja en el HTML y cualquiera puede leerla. Lo único que habilita es
mandar mensajes por este formulario. Si algún día entra spam, se da de baja la clave
en web3forms.com y se genera otra.

Si el servicio no responde, el JavaScript abre WhatsApp con el mensaje ya armado,
así la consulta no se pierde.

El campo `empresa-web` es una trampa anti-spam invisible: si un bot lo completa, el
mensaje se descarta en silencio y nunca sale del navegador.

### Cambiar de servicio

**Formspree** — reemplazar el `action` por `https://formspree.io/f/TU_ID` y borrar
los tres `<input type="hidden">`.

**Netlify Forms** — solo si el sitio se muda a Netlify. Borrar el `action` y agregar
al `<form>`: `data-netlify="true" netlify-honeypot="empresa-web"`.

## Publicar en GitHub Pages

1. En el repo: **Settings → Pages → Source: Deploy from a branch → `main` / `root`**.
2. Para el dominio propio, en esa misma pantalla cargalo en **Custom domain**.
   GitHub crea un archivo `CNAME` en el repo y emite el certificado HTTPS solo.
3. En el panel DNS del dominio:

   | Tipo | Nombre | Valor |
   |---|---|---|
   | `A` | `@` | `185.199.108.153` |
   | `A` | `@` | `185.199.109.153` |
   | `A` | `@` | `185.199.110.153` |
   | `A` | `@` | `185.199.111.153` |
   | `CNAME` | `www` | `TU-USUARIO.github.io.` |

4. Cuando propaguen los DNS (de minutos a unas horas), activá **Enforce HTTPS**.
