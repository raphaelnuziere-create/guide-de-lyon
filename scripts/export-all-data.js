const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Variables d'environnement directes (du .env.local)
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://ikefyhxelzydaogrnwxi.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5Njc1NCwiZXhwIjoyMDcxMjcyNzU0fQ.Ink48F4a18sn-nbcKBbxwBCRA9Yur1z1_vmrR_Ku47Y';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function exportAllData() {
  console.log('📦 Export des données Supabase...');
  
  // Créer dossier export
  const exportDir = path.join(__dirname, '../data-export');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  try {
    // 1. Export des articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!articlesError && articles) {
      fs.writeFileSync(
        path.join(exportDir, 'articles.json'),
        JSON.stringify(articles, null, 2)
      );
      console.log(`✅ ${articles.length} articles exportés`);
    } else {
      console.log('⚠️ Table articles non trouvée ou vide');
    }
    
    // 2. Export des businesses
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('*');
    
    if (!businessesError && businesses) {
      fs.writeFileSync(
        path.join(exportDir, 'businesses.json'),
        JSON.stringify(businesses, null, 2)
      );
      console.log(`✅ ${businesses.length} établissements exportés`);
    } else {
      console.log('⚠️ Table businesses non trouvée ou vide');
    }
    
    // 3. Export des events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*');
    
    if (!eventsError && events) {
      fs.writeFileSync(
        path.join(exportDir, 'events.json'),
        JSON.stringify(events, null, 2)
      );
      console.log(`✅ ${events?.length || 0} événements exportés`);
    } else {
      console.log('⚠️ Table events non trouvée ou vide');
    }
    
    // 4. Export des merchants (si existe)
    const { data: merchants, error: merchantsError } = await supabase
      .from('merchants')
      .select('*');
    
    if (!merchantsError && merchants) {
      fs.writeFileSync(
        path.join(exportDir, 'merchants.json'),
        JSON.stringify(merchants, null, 2)
      );
      console.log(`✅ ${merchants.length} marchands exportés`);
    } else {
      console.log('⚠️ Table merchants non trouvée ou vide');
    }
    
    console.log('📦 Export terminé dans /data-export');
    console.log(`📁 Répertoire: ${exportDir}`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

exportAllData();