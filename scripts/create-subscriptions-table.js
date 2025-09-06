#!/usr/bin/env node

// Script pour créer la table subscriptions si elle n'existe pas
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSubscriptionsTable() {
  console.log('📦 Vérification de la table subscriptions...\n');

  try {
    // Tester si la table existe
    const { data: testData, error: testError } = await supabase
      .from('subscriptions')
      .select('id')
      .limit(1);
    
    if (testError && testError.message.includes('Could not find the table')) {
      console.log('⚠️  Table subscriptions manquante');
      console.log('\n📝 Instructions pour créer la table :');
      console.log('====================================');
      console.log('Allez dans Supabase Dashboard > SQL Editor');
      console.log('Et exécutez le fichier : supabase/migrations/001_tables_only.sql');
      console.log('====================================\n');
      
      // Alternative : créer une version simplifiée
      console.log('OU utilisons une version simplifiée pour le test...\n');
      
      // Créer l'abonnement directement dans establishments
      const { data: establishment } = await supabase
        .from('establishments')
        .select('*')
        .eq('email', 'merchant@guide-de-lyon.fr')
        .single();
      
      if (establishment) {
        // Mettre à jour l'établissement avec les infos d'abonnement
        const { error: updateError } = await supabase
          .from('establishments')
          .update({
            subscription_plan: 'basic',
            subscription_status: 'active'
          })
          .eq('id', establishment.id);
        
        if (updateError) {
          console.log('Note: Colonnes subscription manquantes dans establishments');
        } else {
          console.log('✅ Infos abonnement ajoutées à l\'établissement');
        }
      }
    } else {
      console.log('✅ Table subscriptions existe déjà');
      
      // Créer l'abonnement pour le merchant test
      const { data: establishment } = await supabase
        .from('establishments')
        .select('*')
        .eq('email', 'merchant@guide-de-lyon.fr')
        .single();
      
      if (establishment) {
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('slug', 'basic')
          .single();
        
        if (plan) {
          // Supprimer l'ancien abonnement s'il existe
          await supabase
            .from('subscriptions')
            .delete()
            .eq('establishment_id', establishment.id);
          
          // Créer le nouvel abonnement
          const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
              establishment_id: establishment.id,
              plan_id: plan.id,
              status: 'active',
              events_used_this_month: 0,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
          
          if (subError) {
            console.error('❌ Erreur création abonnement:', subError);
          } else {
            console.log('✅ Abonnement créé pour le merchant test');
          }
        }
      }
    }
    
    console.log('\n✨ Configuration terminée !');
    console.log('\n📝 Pour tester la connexion :');
    console.log('================================');
    console.log('URL: http://localhost:3000/connexion/pro');
    console.log('Email: merchant@guide-de-lyon.fr');
    console.log('Mot de passe: Merchant2025!');
    console.log('================================\n');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter
createSubscriptionsTable();