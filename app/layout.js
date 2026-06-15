import './globals.css';
import Link from 'next/link';
import { getRubriques } from '../lib/airtable';

export const metadata = {
  metadataBase: new URL('https://www.guide-de-lyon.fr'),
  title: {
    default: 'Guide de Lyon — Que faire, voir et manger à Lyon',
    template: '%s · Guide de Lyon',
  },
  description:
    "Le guide indépendant de Lyon : bonnes adresses, sorties, quartiers et conseils pratiques pour visiter ou vivre la ville.",
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Guide de Lyon',
  },
};

export default async function RootLayout({ children }) {
  const rubriques = await getRubriques();
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="masthead">
          <div className="masthead-inner">
            <Link href="/">
              <p className="nameplate">
                Guide de <span className="lyon">Lyon</span>
              </p>
            </Link>
            <span className="tagline">Le guide indépendant de la ville</span>
          </div>
        </header>
        {rubriques.length > 0 && (
          <nav className="rubnav">
            <ul>
              {rubriques.map((r) => (
                <li key={r.id}>
                  <Link href={`/${r.Slug}`}>{r.Nom}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <main>{children}</main>
        <footer className="site">
          <div className="inner">
            <span className="brand">Guide de Lyon</span>
            <span>© {new Date().getFullYear()} — Guide indépendant de Lyon</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
