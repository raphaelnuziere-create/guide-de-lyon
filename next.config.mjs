/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Anciennes URL .html confirmées -> nouvelles rubriques
      { source: '/restaurant-lyon/bars-a-tapas-lyon.html', destination: '/restaurants-bouchons', permanent: true },
      { source: '/visite-de-lyon/lyon-en-deux-jours-que-visiter.html', destination: '/quartiers', permanent: true },
      { source: '/visite-de-lyon/les-visites-insolites-faire-lyon.html', destination: '/sorties-culture', permanent: true },
      // Redirections des anciennes sections avec wildcards
      { source: '/visite-de-lyon/:p*', destination: '/sorties-culture', permanent: true },
      { source: '/monuments-lyon/:p*', destination: '/sorties-culture', permanent: true },
      { source: '/restaurant-lyon/:p*', destination: '/restaurants-bouchons', permanent: true },
      { source: '/les-bars/:p*', destination: '/restaurants-bouchons', permanent: true },
      { source: '/hebergement-lyon/:p*', destination: '/hebergement', permanent: true },
      { source: '/divers/:p*', destination: '/sorties-culture', permanent: true },
      { source: '/blog/:p*', destination: '/sorties-culture', permanent: true },
      // Anciennes catégories WordPress -> rubriques
      { source: '/category/visite-de-lyon', destination: '/quartiers', permanent: true },
      { source: '/category/restaurant-lyon', destination: '/restaurants-bouchons', permanent: true },
      { source: '/category/monuments-lyon', destination: '/sorties-culture', permanent: true },
      { source: '/category/hebergement-lyon', destination: '/hebergement', permanent: true },
      { source: '/category/les-bars', destination: '/restaurants-bouchons', permanent: true },
      { source: '/category/:p*', destination: '/', permanent: true },
      { source: '/category/divers', destination: '/', permanent: true },
      // Pagination WordPress -> accueil
      { source: '/page/:n', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
