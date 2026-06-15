const BASE = process.env.AIRTABLE_BASE_ID;
const TOKEN = process.env.AIRTABLE_TOKEN;

export const hasAirtable = Boolean(BASE && TOKEN);

async function table(name, search) {
  if (!hasAirtable) return [];
  let url = `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(name)}`;
  if (search) url += `?${search}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.records || []).map((r) => ({ id: r.id, ...r.fields }));
  } catch {
    return [];
  }
}

export async function getRubriques() {
  return table('Rubriques');
}

export async function getArticles() {
  const qs = new URLSearchParams();
  qs.set('filterByFormula', "{Statut}='Publié'");
  qs.append('sort[0][field]', 'Date publication');
  qs.append('sort[0][direction]', 'desc');
  return table('Articles', qs.toString());
}

export async function getRubriqueBySlug(slug) {
  const all = await getRubriques();
  return all.find((r) => r.Slug === slug) || null;
}

export async function getArticleBySlug(slug) {
  const all = await getArticles();
  return all.find((a) => a.Slug === slug) || null;
}

export async function getArticlesByRubrique(nom) {
  const all = await getArticles();
  return all.filter((a) => a.Rubrique === nom);
}
