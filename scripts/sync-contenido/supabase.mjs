// Trae los posteos de Instagram de JAB ya sincronizados por jab-crm -- ese
// proyecto los mantiene al día solo, cada 30 min, vía pg_cron. Este script
// no vuelve a hablarle a Meta: lee lo que jab-crm ya guardó.
//
// Requiere las mismas dos variables que jab-crm usa para su propia base
// (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY), como secrets de
// este repo -- son de solo lectura acá, nunca se escribe en esa base.

const TENANT_JAB_MARKETING = '4f834180-b722-4c31-9f5d-42d124f564eb';

export async function traerPostsInstagramDeJab() {
  const url = new URL(`${process.env.SUPABASE_URL}/rest/v1/social_posts`);
  url.searchParams.set('tenant_id', `eq.${TENANT_JAB_MARKETING}`);
  url.searchParams.set('plataforma', 'eq.instagram');
  url.searchParams.set('select', 'external_id,titulo,url,imagen_url,publicado_en');
  url.searchParams.set('order', 'publicado_en.asc');

  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`No se pudo leer social_posts de jab-crm: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
