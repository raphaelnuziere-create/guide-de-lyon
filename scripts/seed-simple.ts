// Script simplifié pour créer des événements de test
// Exécuter avec: npx tsx scripts/seed-simple.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestData() {
  console.log('🌱 Création des données de test...\n')

  // 1. Récupérer les établissements existants Pro/Expert
  console.log('📋 Recherche des établissements Pro/Expert...')
  const { data: establishments, error: estError } = await supabase
    .from('establishments')
    .select('*')
    .in('plan', ['pro', 'expert'])

  if (estError) {
    console.error('Erreur:', estError)
    return
  }

  console.log(`Trouvé ${establishments?.length || 0} établissements Pro/Expert`)

  if (!establishments || establishments.length === 0) {
    console.log('\n⚠️  Aucun établissement Pro/Expert trouvé.')
    console.log('💡 Créez d\'abord des établissements via /pro/inscription')
    return
  }

  // 2. Créer des événements pour ces établissements
  console.log('\n📅 Création des événements...')
  
  const today = new Date()
  const events = []

  // Pour chaque établissement, créer 2-3 événements
  establishments.forEach((establishment, index) => {
    // Événement aujourd'hui pour les premiers établissements
    if (index < 2) {
      const todayEvent = new Date()
      todayEvent.setHours(19, 0, 0, 0)
      
      events.push({
        establishment_id: establishment.id,
        title: `🎉 ${index === 0 ? 'Soirée Spéciale' : 'Happy Hour'} - ${establishment.name}`,
        description: `${establishment.plan === 'expert' ? '✨ Événement Premium ! ' : ''}Venez découvrir notre événement exclusif. Places limitées !`,
        start_date: todayEvent.toISOString(),
        end_date: new Date(todayEvent.getTime() + 3 * 60 * 60 * 1000).toISOString(), // +3h
        location: establishment.address || 'Lyon',
        status: 'published',
        show_on_establishment_page: true,
        show_on_homepage: establishment.plan === 'pro' || establishment.plan === 'expert',
        show_in_newsletter: establishment.plan === 'pro' || establishment.plan === 'expert',
        show_on_social: establishment.plan === 'expert',
        published_at: new Date().toISOString()
      })
    }

    // Événement demain
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(18, 30, 0, 0)
    
    events.push({
      establishment_id: establishment.id,
      title: `${establishment.sector === 'restaurant-food' ? '🍽️ Menu Découverte' : '🌟 Portes Ouvertes'} - ${establishment.name}`,
      description: `Découvrez ${establishment.name} lors de cet événement exceptionnel. ${establishment.plan === 'expert' ? 'Avantages VIP inclus !' : 'Entrée gratuite sur réservation.'}`,
      start_date: tomorrow.toISOString(),
      end_date: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2h
      location: establishment.address || 'Lyon',
      status: 'published',
      show_on_establishment_page: true,
      show_on_homepage: establishment.plan === 'pro' || establishment.plan === 'expert',
      show_in_newsletter: establishment.plan === 'pro' || establishment.plan === 'expert',
      show_on_social: establishment.plan === 'expert',
      published_at: new Date().toISOString()
    })

    // Événements sur les 30 prochains jours
    for (let day = 3; day <= 28; day += 7) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + day)
      futureDate.setHours(19, 0, 0, 0)
      
      const eventTypes = [
        { icon: '🎵', title: 'Soirée Live Music' },
        { icon: '🍷', title: 'Dégustation' },
        { icon: '🎨', title: 'Atelier Créatif' },
        { icon: '💼', title: 'Networking Pro' },
        { icon: '🌟', title: 'Événement Spécial' }
      ]
      
      const eventType = eventTypes[index % eventTypes.length]
      
      events.push({
        establishment_id: establishment.id,
        title: `${eventType.icon} ${eventType.title} - ${establishment.name}`,
        description: `${establishment.short_description || 'Un événement unique à ne pas manquer !'} ${establishment.plan === 'expert' ? '✨ Réservé aux membres Premium.' : ''}`,
        start_date: futureDate.toISOString(),
        end_date: new Date(futureDate.getTime() + 2.5 * 60 * 60 * 1000).toISOString(),
        location: establishment.address || 'Lyon',
        status: 'published',
        show_on_establishment_page: true,
        show_on_homepage: establishment.plan === 'pro' || establishment.plan === 'expert',
        show_in_newsletter: establishment.plan === 'pro' || establishment.plan === 'expert',
        show_on_social: establishment.plan === 'expert',
        published_at: new Date().toISOString()
      })
    }
  })

  // Supprimer les anciens événements de test
  console.log('🗑️  Suppression des anciens événements de test...')
  const { error: deleteError } = await supabase
    .from('events')
    .delete()
    .ilike('title', '%test%')

  // Insérer les nouveaux événements
  const { data: insertedEvents, error: insertError } = await supabase
    .from('events')
    .insert(events)
    .select()

  if (insertError) {
    console.error('❌ Erreur lors de la création des événements:', insertError)
    return
  }

  console.log(`\n✅ ${insertedEvents?.length || 0} événements créés avec succès !`)
  
  // Afficher un résumé
  const todayEvents = insertedEvents?.filter(e => {
    const eventDate = new Date(e.start_date).toDateString()
    return eventDate === today.toDateString()
  })
  
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowEvents = insertedEvents?.filter(e => {
    const eventDate = new Date(e.start_date).toDateString()
    return eventDate === tomorrowDate.toDateString()
  })

  console.log('\n📊 Résumé:')
  console.log(`   - Événements aujourd'hui: ${todayEvents?.length || 0}`)
  console.log(`   - Événements demain: ${tomorrowEvents?.length || 0}`)
  console.log(`   - Total événements: ${insertedEvents?.length || 0}`)
  console.log(`   - Visibles sur homepage: ${insertedEvents?.filter(e => e.show_on_homepage).length || 0}`)
  
  console.log('\n✨ Les événements sont maintenant visibles sur la homepage !')
}

createTestData()
  .then(() => {
    console.log('\n🎉 Terminé !')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error)
    process.exit(1)
  })