import Link from 'next/link';
import { getRubriques, getArticles, hasAirtable } from '../lib/airtable';

export const revalidate = 3600;

export default async function Home() {
  const [rubriques, articles] = await Promise.all([getRubriques(), getArticles()]);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">Lyon, sans détour</p>
          <h1>Les bonnes adresses et les vrais conseils pour vivre Lyon.</h1>
          <p>
            Restaurants, sorties, quartiers, hébergement : une sélection tenue à
            jour par des passionnés de la ville — pas un annuaire de plus.
          </p>
        </div>
      </section>

      {rubriques.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <h2>Explorer par rubrique</h2>
              <span className="rule" />
            </div>
            <div className="grid">
              {rubriques.map((r) => (
                <Link className="card" key={r.id} href={`/${r.Slug}`}>
                  <h3>{r.Nom}</h3>
                  <p>{r.Description}</p>
                  <span className="more">Découvrir →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <h2>Derniers articles</h2>
              <span className="rule" />
            </div>
            <div className="grid">
              {articles.slice(0, 6).map((a) => (
                <Link className="card" key={a.id} href={`/article/${a.Slug}`}>
                  <p className="kicker">{a.Rubrique}</p>
                  <h3>{a.Titre}</h3>
                  <p>{a.Chapô}</p>
                  <span className="more">Lire →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {!hasAirtable && (
        <section className="empty">
          <div className="wrap">
            <div className="box">
              <h2>Le contenu arrive</h2>
              <p>
                Le site est en ligne. Dès que la connexion à la base de contenu
                est activée, les rubriques et les articles s'afficheront ici
                automatiquement.
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
