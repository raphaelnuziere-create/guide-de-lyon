// Script complet pour créer des établissements et événements de test
// Exécuter avec: npx tsx scripts/seed-complete.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedComplete() {
  console.log('🌱 Initialisation des données de test...\n')

  // 1. Créer des utilisateurs de test (si nécessaire)
  console.log('👥 Création des utilisateurs de test...')
  
  const testUsers = [
    { email: 'expert@test.com', name: 'Expert User' },
    { email: 'pro@test.com', name: 'Pro User' },
    { email: 'basic@test.com', name: 'Basic User' }
  ]

  const userIds = []
  for (const testUser of testUsers) {
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', testUser.email)
      .single()

    if (existingUser) {
      userIds.push(existingUser.id)
      console.log(`   ✓ Utilisateur ${testUser.email} existe déjà`)
    } else {
      // Créer l'utilisateur
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: testUser.email,
          name: testUser.name,
          role: 'business_owner'
        })
        .select()
        .single()

      if (error) {
        console.log(`   ⚠️ Création utilisateur ${testUser.email}: ${error.message}`)
        // Utiliser un ID générique si la création échoue
        userIds.push(`user_${Math.random().toString(36).substr(2, 9)}`)
      } else {
        userIds.push(newUser.id)
        console.log(`   ✅ Utilisateur ${testUser.email} créé`)
      }
    }
  }

  // 2. Créer des établissements de test
  console.log('\n🏢 Création des établissements de test...')
  
  const testEstablishments = [
    {
      owner_id: userIds[0],
      name: 'Le Bouchon Lyonnais Premium',
      plan: 'expert',
      address: '15 Rue de la République',
      city: 'Lyon',
      postal_code: '69001',
      sector: 'restaurant-food',
      phone: '0478123456',
      description: 'Restaurant gastronomique traditionnel lyonnais avec 3 étoiles Michelin',
      website: 'https://bouchon-premium.fr',
      email: 'contact@bouchon-premium.fr',
      is_verified: true,
      status: 'active'
    },
    {
      owner_id: userIds[0],
      name: 'Spa Luxe & Détente',
      plan: 'expert',
      address: '25 Quai Saint-Antoine',
      city: 'Lyon',
      postal_code: '69002',
      sector: 'beaute-bienetre',
      phone: '0478234567',
      description: 'Centre de bien-être haut de gamme avec espace thermal',
      website: 'https://spaluxe.fr',
      email: 'info@spaluxe.fr',
      is_verified: true,
      status: 'active'
    },
    {
      owner_id: userIds[1],
      name: 'Mode & Tendances Lyon',
      plan: 'pro',
      address: '45 Rue Victor Hugo',
      city: 'Lyon',
      postal_code: '69002',
      sector: 'shopping-mode',
      phone: '0478345678',
      description: 'Boutique de prêt-à-porter et accessoires de créateurs',
      website: 'https://modetendances.fr',
      email: 'boutique@modetendances.fr',
      is_verified: true,
      status: 'active'
    },
    {
      owner_id: userIds[1],
      name: 'FitClub Lyon',
      plan: 'pro',
      address: '10 Rue de la Part-Dieu',
      city: 'Lyon',
      postal_code: '69003',
      sector: 'sport-fitness',
      phone: '0478456789',
      description: 'Salle de sport moderne avec cours collectifs',
      website: 'https://fitclub-lyon.fr',
      email: 'contact@fitclub-lyon.fr',
      is_verified: false,
      status: 'active'
    },
    {
      owner_id: userIds[1],
      name: 'Bar Le Noctambule',
      plan: 'pro',
      address: '5 Place des Terreaux',
      city: 'Lyon',
      postal_code: '69001',
      sector: 'bar-nightlife',
      phone: '0478567890',
      description: 'Bar cocktails et ambiance musicale',
      website: 'https://lenoctambule.fr',
      email: 'info@lenoctambule.fr',
      is_verified: true,
      status: 'active'
    },
    {
      owner_id: userIds[2],
      name: 'Boulangerie du Coin',
      plan: 'basic',
      address: '30 Rue de la Croix-Rousse',
      city: 'Lyon',
      postal_code: '69004',
      sector: 'restaurant-food',
      phone: '0478678901',
      description: 'Boulangerie artisanale traditionnelle',
      website: '',
      email: 'boulangerie@gmail.com',
      is_verified: false,
      status: 'active'
    }
  ]

  // Insérer les établissements
  const { data: establishments, error: estError } = await supabase
    .from('establishments')
    .insert(testEstablishments)
    .select()

  if (estError) {
    console.error('   ❌ Erreur création établissements:', estError.message)
    return
  }

  console.log(`   ✅ ${establishments.length} établissements créés`)

  // 3. Créer des événements pour ces établissements
  console.log('\n📅 Création des événements...')
  
  const today = new Date()
  const events = []

  // Événements pour aujourd'hui
  events.push({
    establishment_id: establishments[0].id, // Expert
    title: '🍷 Soirée Dégustation Grands Crus',
    description: 'Découvrez notre sélection exclusive de grands vins avec notre sommelier. Menu accord mets-vins 5 services.',
    date: today.toISOString().split('T')[0],
    time: '19:00',
    location: establishments[0].name + ', ' + establishments[0].address,
    max_participants: 30,
    current_participants: 18,
    category: 'restaurant-food',
    is_featured: true,
    status: 'published',
    visibility_level: 'premium',
    price: 120
  })

  events.push({
    establishment_id: establishments[2].id, // Pro
    title: '👗 Vente Privée Collection Hiver',
    description: 'Jusqu\'à -50% sur la collection automne-hiver. Champagne offert !',
    date: today.toISOString().split('T')[0],
    time: '18:00',
    location: establishments[2].name + ', ' + establishments[2].address,
    max_participants: 100,
    current_participants: 42,
    category: 'shopping-mode',
    is_featured: false,
    status: 'published',
    visibility_level: 'standard',
    price: 0
  })

  // Événements pour demain
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  events.push({
    establishment_id: establishments[1].id, // Expert
    title: '🧘 Journée Bien-être & Relaxation',
    description: 'Accès illimité au spa, massage 30min inclus, déjeuner healthy. Une journée pour se ressourcer.',
    date: tomorrow.toISOString().split('T')[0],
    time: '10:00',
    location: establishments[1].name + ', ' + establishments[1].address,
    max_participants: 20,
    current_participants: 15,
    category: 'beaute-bienetre',
    is_featured: true,
    status: 'published',
    visibility_level: 'premium',
    price: 180
  })

  events.push({
    establishment_id: establishments[3].id, // Pro
    title: '💪 Cours d\'Essai Gratuit CrossFit',
    description: 'Découvrez le CrossFit avec nos coachs certifiés. Tous niveaux bienvenus !',
    date: tomorrow.toISOString().split('T')[0],
    time: '18:30',
    location: establishments[3].name + ', ' + establishments[3].address,
    max_participants: 15,
    current_participants: 8,
    category: 'sport-fitness',
    is_featured: false,
    status: 'published',
    visibility_level: 'standard',
    price: 0
  })

  // Événements pour la semaine
  for (let i = 2; i < 30; i++) {
    const eventDate = new Date(today)
    eventDate.setDate(today.getDate() + i)
    
    // Alterner entre les établissements Pro et Expert
    const establishment = establishments[i % 5] // Exclure le basic (index 5)
    if (establishment.plan === 'basic') continue

    const eventTemplates = {
      'restaurant-food': [
        { title: '🍴 Menu Découverte du Chef', desc: 'Menu 3 services avec accord mets-vins', price: 65 },
        { title: '🥘 Atelier Cuisine Lyonnaise', desc: 'Apprenez à cuisiner les spécialités lyonnaises', price: 80 },
        { title: '🍾 Soirée Jazz & Tapas', desc: 'Concert live avec dégustation de tapas', price: 35 }
      ],
      'beaute-bienetre': [
        { title: '💆 Atelier Auto-Massage', desc: 'Techniques de relaxation à reproduire chez soi', price: 45 },
        { title: '🧖 Soirée Spa Privatisée', desc: 'Accès exclusif au spa de 20h à 23h', price: 90 },
        { title: '🌸 Formation Aromathérapie', desc: 'Découvrez les bienfaits des huiles essentielles', price: 60 }
      ],
      'shopping-mode': [
        { title: '👔 Personal Shopping', desc: 'Conseil personnalisé avec notre styliste', price: 150 },
        { title: '🛍️ Nocturne Shopping', desc: 'Boutique ouverte jusqu\'à 22h avec -20%', price: 0 },
        { title: '👠 Défilé Nouvelle Collection', desc: 'Présentation des tendances printemps-été', price: 0 }
      ],
      'sport-fitness': [
        { title: '🏃 Running Club Matinal', desc: 'Footing collectif dans le Parc de la Tête d\'Or', price: 0 },
        { title: '🥊 Stage Boxe Intensive', desc: 'Weekend intensif avec champion de France', price: 120 },
        { title: '🧘 Yoga au Lever du Soleil', desc: 'Session yoga en plein air', price: 25 }
      ],
      'bar-nightlife': [
        { title: '🎵 Concert Live Rock', desc: 'Groupe local + DJ set jusqu\'à 2h', price: 10 },
        { title: '🍹 Masterclass Cocktails', desc: 'Apprenez à créer 5 cocktails signatures', price: 55 },
        { title: '🎤 Soirée Karaoké', desc: 'Ambiance garantie, happy hour jusqu\'à 21h', price: 0 }
      ]
    }

    const templates = eventTemplates[establishment.sector] || eventTemplates['restaurant-food']
    const template = templates[i % templates.length]

    events.push({
      establishment_id: establishment.id,
      title: template.title,
      description: `${template.desc} ${establishment.plan === 'expert' ? '✨ Événement Premium avec avantages exclusifs.' : ''}`,
      date: eventDate.toISOString().split('T')[0],
      time: ['18:00', '19:00', '19:30', '20:00'][i % 4],
      location: establishment.name + ', ' + establishment.address,
      max_participants: establishment.plan === 'expert' ? 40 : 60,
      current_participants: Math.floor(Math.random() * 30),
      category: establishment.sector,
      is_featured: establishment.plan === 'expert' && i % 3 === 0,
      status: 'published',
      visibility_level: establishment.plan === 'expert' ? 'premium' : 'standard',
      price: template.price
    })
  }

  // Insérer tous les événements
  const { data: insertedEvents, error: eventsError } = await supabase
    .from('events')
    .insert(events)
    .select()

  if (eventsError) {
    console.error('   ❌ Erreur création événements:', eventsError.message)
    return
  }

  console.log(`   ✅ ${insertedEvents.length} événements créés`)
  
  // 4. Afficher un résumé
  console.log('\n📊 Résumé:')
  console.log('   - Établissements Expert:', establishments.filter(e => e.plan === 'expert').length)
  console.log('   - Établissements Pro:', establishments.filter(e => e.plan === 'pro').length)
  console.log('   - Établissements Basic:', establishments.filter(e => e.plan === 'basic').length)
  console.log('   - Total événements:', insertedEvents.length)
  console.log('   - Événements aujourd\'hui:', insertedEvents.filter(e => e.date === today.toISOString().split('T')[0]).length)
  console.log('   - Événements premium:', insertedEvents.filter(e => e.visibility_level === 'premium').length)
  
  console.log('\n✨ Données de test créées avec succès !')
  console.log('📌 Vous pouvez maintenant voir les événements sur la homepage')
}

seedComplete()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur globale:', error)
    process.exit(1)
  })