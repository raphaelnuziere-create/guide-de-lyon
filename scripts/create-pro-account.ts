// Script pour créer le compte PRO de test
// Usage: npx tsx scripts/create-pro-account.ts

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function createProAccount() {
  console.log('🔨 Création du compte PRO');
  
  // 1. Supprimer l'ancien établissement pro s'il existe
  const { error: deleteError } = await supabase
    .from('establishments')
    .delete()
    .eq('email', 'pro@test.com');
    
  if (deleteError && !deleteError.message.includes('0 rows')) {
    console.log('Warning:', deleteError.message);
  }
  
  // 2. Vérifier les utilisateurs existants dans establishments
  const { data: existingUsers } = await supabase
    .from('establishments')
    .select('user_id, email')
    .limit(5);
    
  console.log('👥 Utilisateurs existants:', existingUsers?.length || 0);
  
  // 3. Utiliser l'ID utilisateur de l'expert existant comme modèle
  const { data: expertData } = await supabase
    .from('establishments')
    .select('user_id')
    .eq('email', 'expert@test.com')
    .single();
    
  if (!expertData) {
    console.log('❌ Impossible de trouver l\'utilisateur expert pour référence');
    return;
  }
  
  console.log('✅ Référence utilisateur trouvée');
  
  // 4. Créer l'établissement PRO (en utilisant un user_id temporaire - à corriger manuellement)
  const { data, error } = await supabase
    .from('establishments')
    .insert({
      user_id: expertData.user_id, // Temporaire - sera corrigé manuellement
      name: 'Restaurant Le Gourmet Pro',
      slug: 'restaurant-le-gourmet-pro',
      email: 'pro@test.com',
      phone: '0478567890',
      address: '25 Rue de la République',
      city: 'Lyon',
      postal_code: '69001',
      address_district: '1er arrondissement',
      description: 'Établissement Professionnel avec avantages Pro. Présence renforcée sur le Guide de Lyon.',
      short_description: 'Restaurant gastronomique - Plan Pro',
      website: 'https://restaurant-gourmet-pro.fr',
      category: 'restaurant-food',
      subcategory: 'restaurant-gastronomique',
      plan: 'pro',
      max_events: 3,
      max_photos: 6,
      events_this_month: 0,
      photos_this_month: 0,
      featured: false,
      priority_support: false, 
      is_verified: true,
      status: 'active',
      specialties: ['Cuisine française', 'Gastronomie', 'Menu dégustation'],
      services: ['Réservation', 'Privatisation', 'Menu groupe'],
      features: ['Terrasse', 'Parking', 'Accès handicapé'],
      price_range: '€€€',
      cuisine_types: ['Française', 'Gastronomique'],
      dietary_options: ['Végétarien', 'Sans gluten'],
      opening_hours: {
        tuesday: '12:00-14:00, 19:00-22:00',
        wednesday: '12:00-14:00, 19:00-22:00',
        thursday: '12:00-14:00, 19:00-22:00',
        friday: '12:00-14:00, 19:00-22:30',
        saturday: '19:00-22:30',
        sunday: 'Fermé',
        monday: 'Fermé'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.log('❌ Erreur création:', error.message);
  } else {
    console.log('✅ Établissement PRO créé:', data.name);
    console.log('📊 Plan:', data.plan);
    console.log('📅 Max événements:', data.max_events);
    console.log('📷 Max photos:', data.max_photos);
    console.log('✅ Vérifié:', data.is_verified);
    console.log('\n⚠️ IMPORTANT: Corrigez le user_id manuellement dans Supabase');
    console.log('1. Allez dans Supabase Dashboard > Auth > Users');
    console.log('2. Créez l\'utilisateur pro@test.com / ProTest123!');
    console.log('3. Copiez son ID et mettez à jour la table establishments');
  }
}

createProAccount()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });