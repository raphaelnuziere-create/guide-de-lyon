// Script pour vérifier l'URL du déploiement
console.log('🔍 Vérification du déploiement\n');
console.log('='.repeat(60));

// URLs possibles
const urls = [
  'https://guide-de-lyon.vercel.app',
  'https://guide-lyon.vercel.app',
  'https://guide-lyon-v2.vercel.app',
  'https://www.guide-de-lyon.fr',
  'https://guide-de-lyon.fr'
];

console.log('📡 Test des URLs possibles:\n');

async function checkUrl(url: string) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    return { url, status: response.status, ok: response.ok };
  } catch (error) {
    return { url, status: 0, ok: false };
  }
}

async function findCorrectUrl() {
  for (const url of urls) {
    const result = await checkUrl(url);
    const emoji = result.ok ? '✅' : '❌';
    console.log(`${emoji} ${url}: ${result.status || 'Non accessible'}`);
    
    if (result.ok) {
      console.log('\n✅ URL TROUVÉE:', url);
      return url;
    }
  }
  
  console.log('\n💡 Configuration requise:');
  console.log('1. Vérifiez le nom du projet sur Vercel Dashboard');
  console.log('2. Ou configurez un domaine personnalisé');
  console.log('\nPour le moment, utilisez l\'URL du dashboard Vercel');
  
  return null;
}

findCorrectUrl().then((url) => {
  if (url) {
    console.log('\n📰 Pages actualités:');
    console.log(`   ${url}/actualites`);
    console.log(`   ${url}/actualites/lyon`);
  }
  process.exit(0);
});