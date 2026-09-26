# Sync Instagram -> blog + LinkedIn

Corre una vez al día por GitHub Actions (`.github/workflows/sync-contenido.yml`).
Revisa los posteos de Instagram de JAB que ya sincroniza jab-crm, descarta los
que no enseñan nada (promoción, novedades, eventos puntuales) y a los que sí
tienen valor educativo les genera:

- Un artículo de blog, publicado directo en `src/content/blog/` (sin
  revisión previa -- decisión tomada así a propósito).
- Un borrador de post de LinkedIn en `linkedin-borradores/`, para pegar a
  mano. LinkedIn no deja publicar en nombre de la página sin un producto de
  API que todavía no está aprobado (Community Management API) -- hasta que
  se consiga, este paso queda manual.

## Secrets que necesita (Settings -> Secrets and variables -> Actions)

- `JAB_CRM_SUPABASE_URL`: la misma URL de Supabase que usa jab-crm
  (`NEXT_PUBLIC_SUPABASE_URL` en ese proyecto).
- `JAB_CRM_SUPABASE_SERVICE_ROLE_KEY`: la service role key de esa misma
  base. Solo lee `social_posts` del tenant de Jab Marketing -- nunca escribe
  ahí.
- `ANTHROPIC_API_KEY`: para clasificar y generar el contenido.

## Correrlo a mano

```
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... ANTHROPIC_API_KEY=... \
  node scripts/sync-contenido/index.mjs
```

## Nota sobre `linkedin-borradores/`

Este repo es público -- los borradores quedan visibles ahí antes de
publicarse (nunca son datos sensibles, es copy de marketing propio, pero
vale saberlo). Si en algún momento se prefiere que no sean públicos, la
solución es un repo aparte privado solo para esa carpeta.
