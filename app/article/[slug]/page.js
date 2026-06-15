import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import {
  getArticles,
  getArticleBySlug,
  getRubriques,
} from '../../../lib/airtable';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.Slug }));
}

export async function generateMetadata({ params }) {
  const a = await getArticleBySlug(params.slug);
  if (!a) return {};
  return {
    title: a['Méta title'] || a.Titre,
    description: a['Méta description'] || a.Chapô || undefined,
  };
}

export default async function ArticlePage({ params }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const rubriques = await getRubriques();
  const rub = rubriques.find((r) => r.Nom === article.Rubrique);
  const html = article.Contenu ? marked.parse(article.Contenu) : '';
  const date = article['Date publication'];

  return (
    <article className="article">
      <div className="wrap">
        <Link className="back" href={rub ? `/${rub.Slug}` : '/'}>
          ← {article.Rubrique || 'Accueil'}
        </Link>
        {article.Rubrique && <p className="kicker">{article.Rubrique}</p>}
        <h1>{article.Titre}</h1>
        {article.Chapô && <p className="chapo">{article.Chapô}</p>}
        <p className="meta">
          {article.Auteur ? `Par ${article.Auteur}` : 'La rédaction'}
          {date ? ` · ${new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
        </p>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  );
}
