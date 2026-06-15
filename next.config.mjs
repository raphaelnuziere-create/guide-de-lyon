/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Anciennes URL .html confirmées -> nouvelles rubriques
      { source: '/restaurant-lyon/bars-a-tapas-lyon.html', destination: '/restaurants-bouchons', permanent: true },
      { source: '/visite-de-lyon/lyon-en-deux-jours-que-visiter.html', destination: '/quartiers', permanent: true },
      { source: '/visite-de-lyon/les-visites-insolites-faire-lyon.html', destination: '/sorties-culture', permanent: true },
      // Anciennes catégories WordPress -> rubriques
      { source: '/category/visite-de-lyon', destination: '/quartiers', permanent: true },
      { source: '/category/monuments-lyon', destination: '/sorties-culture', permanent: true },
      { source: '/category/divers', destination: '/', permanent: true },
      // Pagination WordPress -> accueil
      { source: '/page/:n', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
