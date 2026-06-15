import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRubriques, getRubriqueBySlug, getArticlesByRubrique } from '../../lib/airtable';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const rubriques = await getRubriques();
  return rubriques.map((r) => ({ rubrique: r.Slug }));
}

export async function generateMetadata({ params }) {
  const r = await getRubriqueBySlug(params.rubrique);
  if (!r) return {};
  return {
    title: r.Nom,
    description: r['Méta description'] || r.Description || undefined,
  };
}

export default async function RubriquePage({ params }) {
  const rubrique = await getRubriqueBySlug(params.rubrique);
  if (!rubrique) notFound();
  const articles = await getArticlesByRubrique(rubrique.Nom);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">Rubrique</p>
          <h1>{rubrique.Nom}</h1>
          {rubrique.Description && <p>{rubrique.Description}</p>}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          {articles.length > 0 ? (
            <div className="grid">
              {articles.map((a) => (
                <Link className="card" key={a.id} href={`/article/${a.Slug}`}>
                  <h3>{a.Titre}</h3>
                  <p>{a.Chapô}</p>
                  <span className="more">Lire →</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="box">
                <h2>Bientôt des articles</h2>
                <p>Cette rubrique se remplit. Revenez très vite.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
