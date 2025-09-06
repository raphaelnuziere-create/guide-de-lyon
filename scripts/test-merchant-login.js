#!/usr/bin/env node

// Script pour tester la connexion merchant
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMerchantLogin() {
  console.log('🔍 Test connexion merchant@guide-de-lyon.fr\n');

  try {
    // 1. Tenter la connexion
    console.log('1. Tentative de connexion...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'merchant@guide-de-lyon.fr',
      password: 'Merchant2025!'
    });
    
    if (authError) {
      console.error('❌ Erreur connexion:', authError);
      return;
    }
    
    console.log('✅ Connexion réussie');
    console.log('User ID:', authData.user.id);
    
    // 2. Vérifier l'établissement
    console.log('\n2. Recherche de l\'établissement...');
    const { data: establishment, error: estError } = await supabase
      .from('establishments')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (estError) {
      console.error('❌ Erreur recherche établissement:', estError);
      console.log('\n⚠️ PROBLÈME: Pas d\'établissement trouvé');
      console.log('C\'est pourquoi vous êtes redirigé vers /pro/inscription');
      return;
    }
    
    console.log('✅ Établissement trouvé:');
    console.log('  - ID:', establishment.id);
    console.log('  - Nom:', establishment.name);
    console.log('  - Status:', establishment.status);
    console.log('  - Catégorie:', establishment.category);
    
    console.log('\n✨ Tout est OK ! La connexion devrait fonctionner.');
    console.log('Si vous êtes toujours redirigé vers inscription:');
    console.log('1. Videz le cache du navigateur');
    console.log('2. Utilisez une fenêtre privée');
    console.log('3. Vérifiez la console du navigateur pour les erreurs');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter
testMerchantLogin();