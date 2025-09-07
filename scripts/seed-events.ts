// Script pour créer des événements de test dans Supabase
// Exécuter avec: npx tsx scripts/seed-events.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedEvents() {
  console.log('🌱 Création des événements de test...')

  // D'abord, récupérons quelques établissements existants
  const { data: establishments, error: estError } = await supabase
    .from('establishments')
    .select('id, name, plan')
    .in('plan', ['pro', 'expert'])
    .limit(5)

  if (estError) {
    console.error('Erreur lors de la récupération des établissements:', estError)
    // Créons des établissements de test
    const testEstablishments = [
      {
        name: 'Restaurant Le Gourmet (Expert)',
        plan: 'expert',
        address: '15 Rue de la République, Lyon',
        city: 'Lyon',
        postal_code: '69001',
        sector: 'restaurant-food',
        phone: '0478123456',
        description: 'Restaurant gastronomique lyonnais',
        website: 'https://legourmet.fr'
      },
      {
        name: 'Boutique Mode & Style (Pro)',
        plan: 'pro',
        address: '25 Rue Victor Hugo, Lyon',
        city: 'Lyon',
        postal_code: '69002',
        sector: 'shopping-mode',
        phone: '0478234567',
        description: 'Boutique de prêt-à-porter haut de gamme',
        website: 'https://modestyle.fr'
      },
      {
        name: 'Spa Bien-être Zen (Expert)',
        plan: 'expert',
        address: '10 Quai Saint-Antoine, Lyon',
        city: 'Lyon',
        postal_code: '69002',
        sector: 'beaute-bienetre',
        phone: '0478345678',
        description: 'Centre de spa et bien-être',
        website: 'https://spazen.fr'
      }
    ]

    const { data: newEst, error: createError } = await supabase
      .from('establishments')
      .insert(testEstablishments)
      .select()

    if (createError) {
      console.error('Erreur création établissements:', createError)
      return
    }

    console.log('✅ Établissements de test créés')
  }

  // Récupérons à nouveau les établissements
  const { data: finalEstablishments } = await supabase
    .from('establishments')
    .select('id, name, plan, sector')
    .in('plan', ['pro', 'expert'])
    .limit(5)

  if (!finalEstablishments || finalEstablishments.length === 0) {
    console.error('Aucun établissement trouvé')
    return
  }

  // Créons des événements pour ces établissements
  const today = new Date()
  const events = []

  finalEstablishments.forEach((establishment, index) => {
    // Créer 2-3 événements par établissement
    for (let i = 0; i < 2; i++) {
      const eventDate = new Date(today)
      eventDate.setDate(today.getDate() + index * 3 + i * 7) // Répartir sur le mois

      const eventTitles = {
        'restaurant-food': ['Soirée dégustation', 'Menu spécial', 'Brunch dominical', 'Atelier cuisine'],
        'shopping-mode': ['Vente privée', 'Nouvelle collection', 'Fashion week', 'Défilé de mode'],
        'beaute-bienetre': ['Journée portes ouvertes', 'Atelier massage', 'Soins découverte', 'Formation bien-être'],
        'culture-loisirs': ['Exposition', 'Concert live', 'Vernissage', 'Spectacle'],
        'bar-nightlife': ['Soirée DJ', 'Happy hour', 'Concert acoustique', 'Karaoké'],
        'sport-fitness': ['Cours d\'essai gratuit', 'Marathon urbain', 'Tournoi', 'Stage intensif']
      }

      const sector = establishment.sector || 'autre'
      const titles = eventTitles[sector] || ['Événement spécial', 'Portes ouvertes', 'Promotion', 'Nouveauté']
      const title = titles[i % titles.length]

      events.push({
        establishment_id: establishment.id,
        title: `${title} - ${establishment.name}`,
        description: `Venez découvrir notre ${title.toLowerCase()}. ${establishment.plan === 'expert' ? 'Événement premium avec avantages exclusifs.' : 'Places limitées, réservez vite !'}`,
        date: eventDate.toISOString().split('T')[0],
        time: `${19 + i}:00`,
        location: `${establishment.name}, Lyon`,
        max_participants: establishment.plan === 'expert' ? 100 : 50,
        current_participants: Math.floor(Math.random() * 30),
        category: sector,
        is_featured: establishment.plan === 'expert',
        status: 'published',
        visibility_level: establishment.plan === 'expert' ? 'premium' : 'standard'
      })
    }
  })

  // Ajouter quelques événements pour aujourd'hui et demain
  const todayEvent = {
    establishment_id: finalEstablishments[0].id,
    title: `🎉 Événement du jour - ${finalEstablishments[0].name}`,
    description: 'Ne manquez pas cet événement exceptionnel aujourd\'hui !',
    date: today.toISOString().split('T')[0],
    time: '18:00',
    location: 'Place Bellecour, Lyon',
    max_participants: 200,
    current_participants: 45,
    category: finalEstablishments[0].sector || 'autre',
    is_featured: true,
    status: 'published',
    visibility_level: 'premium'
  }

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const tomorrowEvent = {
    establishment_id: finalEstablishments[1]?.id || finalEstablishments[0].id,
    title: `🌟 Demain: ${finalEstablishments[1]?.name || finalEstablishments[0].name}`,
    description: 'Événement spécial demain, places limitées !',
    date: tomorrow.toISOString().split('T')[0],
    time: '19:30',
    location: 'Vieux Lyon',
    max_participants: 150,
    current_participants: 67,
    category: finalEstablishments[1]?.sector || 'culture-loisirs',
    is_featured: true,
    status: 'published',
    visibility_level: 'premium'
  }

  events.unshift(todayEvent, tomorrowEvent)

  // Insérer les événements
  const { data: insertedEvents, error: eventsError } = await supabase
    .from('events')
    .insert(events)
    .select()

  if (eventsError) {
    console.error('Erreur lors de l\'insertion des événements:', eventsError)
    return
  }

  console.log(`✅ ${insertedEvents.length} événements créés avec succès !`)
  console.log('📅 Événements créés pour:')
  insertedEvents.forEach(event => {
    console.log(`   - ${event.title} le ${event.date} à ${event.time}`)
  })
}

seedEvents()
  .then(() => {
    console.log('✨ Seed terminé avec succès')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })