const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('📦 EXPORT SUPABASE - Guide Lyon v3');
console.log('=====================================');

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function exportData() {
  try {
    // Créer le dossier export
    const exportDir = path.join(__dirname, '../export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    console.log('\n🔍 Scanning tables...');
    
    // 1. Export des établissements/businesses
    console.log('\n📋 Exporting businesses...');
    try {
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (businessError) throw businessError;
      
      fs.writeFileSync(
        path.join(exportDir, 'businesses.json'), 
        JSON.stringify(businesses, null, 2)
      );
      console.log(`✅ ${businesses?.length || 0} établissements exportés`);
      
      // Sauvegarder aussi un CSV pour analyse
      if (businesses && businesses.length > 0) {
        const csvContent = convertToCSV(businesses);
        fs.writeFileSync(path.join(exportDir, 'businesses.csv'), csvContent);
      }
    } catch (error) {
      console.log('⚠️  Table businesses non trouvée ou erreur:', error.message);
    }
    
    // 2. Export des articles de blog
    console.log('\n📝 Exporting articles...');
    try {
      const { data: articles, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (articleError) throw articleError;
      
      fs.writeFileSync(
        path.join(exportDir, 'articles.json'), 
        JSON.stringify(articles, null, 2)
      );
      console.log(`✅ ${articles?.length || 0} articles exportés`);
    } catch (error) {
      console.log('⚠️  Table articles non trouvée ou erreur:', error.message);
    }
    
    // 3. Export des événements
    console.log('\n🎉 Exporting events...');
    try {
      const { data: events, error: eventError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (eventError) throw eventError;
      
      fs.writeFileSync(
        path.join(exportDir, 'events.json'), 
        JSON.stringify(events, null, 2)
      );
      console.log(`✅ ${events?.length || 0} événements exportés`);
    } catch (error) {
      console.log('⚠️  Table events non trouvée ou erreur:', error.message);
    }
    
    // 4. Export des utilisateurs/profils
    console.log('\n👥 Exporting profiles...');
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profileError) throw profileError;
      
      // Anonymiser les emails pour la sécurité
      const anonymizedProfiles = profiles?.map(profile => ({
        ...profile,
        email: profile.email ? `${profile.email.split('@')[0]}@*****.***` : null
      }));
      
      fs.writeFileSync(
        path.join(exportDir, 'profiles.json'), 
        JSON.stringify(anonymizedProfiles, null, 2)
      );
      console.log(`✅ ${profiles?.length || 0} profils exportés (anonymisés)`);
    } catch (error) {
      console.log('⚠️  Table profiles non trouvée ou erreur:', error.message);
    }
    
    // 5. Export des abonnements si ils existent
    console.log('\n💳 Exporting subscriptions...');
    try {
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (subError) throw subError;
      
      fs.writeFileSync(
        path.join(exportDir, 'subscriptions.json'), 
        JSON.stringify(subscriptions, null, 2)
      );
      console.log(`✅ ${subscriptions?.length || 0} abonnements exportés`);
    } catch (error) {
      console.log('⚠️  Table subscriptions non trouvée ou erreur:', error.message);
    }
    
    // 6. Créer un rapport de migration
    const report = {
      export_date: new Date().toISOString(),
      source: 'Supabase',
      target: 'Directus Cloud',
      tables_exported: [],
      notes: [
        'Données exportées pour migration vers Guide-Lyon v3',
        'Structure des données adaptée pour Directus',
        'Plans tarifaires mis à jour: Basic (0€), Pro (19€), Expert (49€)'
      ]
    };
    
    // Lister les fichiers exportés
    const exportedFiles = fs.readdirSync(exportDir).filter(f => f.endsWith('.json'));
    report.tables_exported = exportedFiles;
    
    fs.writeFileSync(
      path.join(exportDir, '_migration_report.json'), 
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n✅ EXPORT TERMINÉ !');
    console.log('=====================================');
    console.log(`📁 Fichiers exportés dans: ${exportDir}`);
    console.log('📄 Fichiers créés:');
    exportedFiles.forEach(file => {
      const stats = fs.statSync(path.join(exportDir, file));
      console.log(`   - ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
    });
    console.log('\n🎯 Prochaines étapes:');
    console.log('   1. Configurer Directus Cloud');
    console.log('   2. Exécuter scripts/migrate-to-directus.js');
    console.log('   3. Tester la nouvelle version');
    
  } catch (error) {
    console.error('❌ Erreur durante l\'export:', error);
    process.exit(1);
  }
}

// Utilitaire pour convertir en CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Échapper les guillemets et virgules
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

// Lancer l'export
exportData();