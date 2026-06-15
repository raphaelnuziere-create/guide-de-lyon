import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="empty">
      <div className="wrap">
        <div className="box">
          <h2>Page introuvable</h2>
          <p>
            Cette page n'existe pas ou plus.{' '}
            <Link href="/" style={{ color: 'var(--brick)', textDecoration: 'underline' }}>
              Retour à l'accueil
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
