/**
 * HOOKS DIRECTUS - GUIDE LYON V3
 * Validation des quotas selon les plans tarifaires
 * 
 * PLANS:
 * - Basic (0€): 1 photo, 3 événements/mois
 * - Pro (19€): 6 photos, 3 événements/mois  
 * - Expert (49€): 10 photos, 5 événements/mois
 */

module.exports = function registerHook({ filter, action }, { services, database, getSchema }) {
  const { ItemsService, FilesService } = services;

  // PLAN QUOTAS - Source de vérité
  const PLAN_QUOTAS = {
    basic: {
      photos: 1,
      events: 3,
      priority: 3,
      badge: null,
      homepage: false,
      newsletter: false,
      social: false
    },
    pro: {
      photos: 6,
      events: 3,
      priority: 2,
      badge: 'verified',
      homepage: true,
      newsletter: true,
      social: false
    },
    expert: {
      photos: 10,
      events: 5,
      priority: 1,
      badge: 'expert',
      homepage: true,
      newsletter: true,
      social: true
    }
  };

  // =================================
  // 1. HOOK: Auto-configuration du plan
  // =================================
  filter('businesses.items.create', async (input, meta, context) => {
    const plan = input.plan || 'basic';
    const quotas = PLAN_QUOTAS[plan];

    console.log(`[HOOK] Création business avec plan: ${plan}`);

    // Auto-configuration selon le plan
    input.photos_quota = quotas.photos;
    input.events_quota = quotas.events;
    input.display_priority = quotas.priority;
    input.badge_type = quotas.badge;
    input.events_used_this_month = 0;

    return input;
  });

  filter('businesses.items.update', async (input, meta, context) => {
    // Si le plan change, reconfigurer automatiquement
    if (input.plan) {
      const quotas = PLAN_QUOTAS[input.plan];
      
      console.log(`[HOOK] Changement de plan vers: ${input.plan}`);
      
      input.photos_quota = quotas.photos;
      input.events_quota = quotas.events;
      input.display_priority = quotas.priority;
      input.badge_type = quotas.badge;

      // Si on réduit le nombre de photos autorisées, alerter
      if (input.gallery && Array.isArray(input.gallery) && input.gallery.length > quotas.photos) {
        throw new Error(`⚠️ Plan ${input.plan} : maximum ${quotas.photos} photos. Vous en avez ${input.gallery.length}. Supprimez ${input.gallery.length - quotas.photos} photos.`);
      }
    }

    return input;
  });

  // =================================
  // 2. HOOK: Validation upload photos
  // =================================
  filter('files.items.create', async (input, meta, context) => {
    // Vérifier si c'est pour une galerie business
    if (input.folder && input.folder.includes('business-galleries')) {
      console.log('[HOOK] Upload photo pour galerie business');
    }
    return input;
  });

  // =================================
  // 3. HOOK: Validation des événements
  // =================================
  filter('events.items.create', async (input, meta, context) => {
    if (!input.business_id) {
      throw new Error('❌ Un événement doit être lié à un établissement');
    }

    const schema = await getSchema();
    const businessService = new ItemsService('businesses', { schema, accountability: context.accountability });
    
    // Récupérer l'établissement
    const business = await businessService.readOne(input.business_id);
    if (!business) {
      throw new Error('❌ Établissement non trouvé');
    }

    const plan = business.plan || 'basic';
    const quotas = PLAN_QUOTAS[plan];
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: 2024-03

    console.log(`[HOOK] Création événement pour business ${business.name} (plan: ${plan})`);

    // Compter les événements du mois en cours
    const eventsService = new ItemsService('events', { schema, accountability: context.accountability });
    const eventsThisMonth = await eventsService.readByQuery({
      filter: {
        business_id: { _eq: input.business_id },
        event_date: { _between: [`${currentMonth}-01`, `${currentMonth}-31`] }
      }
    });

    const eventsCount = eventsThisMonth.length;

    // Vérifier le quota
    if (eventsCount >= quotas.events) {
      throw new Error(`🚫 QUOTA ATTEINT - Plan ${plan.toUpperCase()}: ${quotas.events} événements max par mois. Vous avez déjà ${eventsCount} événements ce mois-ci.`);
    }

    // Auto-configuration des visibilités selon le plan
    input.visible_homepage = quotas.homepage;
    input.visible_newsletter = quotas.newsletter;
    input.visible_social = quotas.social;

    console.log(`[HOOK] ✅ Événement validé (${eventsCount + 1}/${quotas.events})`);
    
    return input;
  });

  // =================================
  // 4. HOOK: Validation update événements  
  // =================================
  filter('events.items.update', async (input, meta, context) => {
    // Récupérer l'événement existant pour connaître le business
    if (meta.keys && meta.keys.length > 0) {
      const schema = await getSchema();
      const eventsService = new ItemsService('events', { schema, accountability: context.accountability });
      const event = await eventsService.readOne(meta.keys[0], { fields: ['business_id'] });
      
      if (event && event.business_id) {
        const businessService = new ItemsService('businesses', { schema, accountability: context.accountability });
        const business = await businessService.readOne(event.business_id, { fields: ['plan'] });
        
        if (business) {
          const quotas = PLAN_QUOTAS[business.plan];
          
          // Forcer les visibilités selon le plan (empêcher les contournements)
          if (input.visible_homepage !== undefined) {
            input.visible_homepage = quotas.homepage;
          }
          if (input.visible_newsletter !== undefined) {
            input.visible_newsletter = quotas.newsletter;
          }
          if (input.visible_social !== undefined) {
            input.visible_social = quotas.social;
          }
        }
      }
    }

    return input;
  });

  // =================================
  // 5. HOOK: Reset quotas mensuels
  // =================================
  action('server.start', async () => {
    console.log('[HOOK] 🚀 Guide Lyon v3 - Hooks activés');
    console.log('[HOOK] Plans configurés:', Object.keys(PLAN_QUOTAS));
    
    // Programmer le reset mensuel des quotas (si pas déjà fait)
    // Note: En production, utiliser un vrai cron job
    scheduleMonthlyReset();
  });

  // Fonction utilitaire pour le reset mensuel
  async function scheduleMonthlyReset() {
    // Note: Cette approche simple fonctionne pour le développement
    // En production, utiliser un vrai système de cron jobs
    const now = new Date();
    const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const timeUntilReset = firstDayNextMonth.getTime() - now.getTime();

    setTimeout(async () => {
      try {
        console.log('[HOOK] 🔄 Reset mensuel des quotas événements...');
        
        const schema = await getSchema();
        const businessService = new ItemsService('businesses', { schema });
        
        await businessService.updateByQuery(
          {}, // Tous les établissements  
          { events_used_this_month: 0 }
        );
        
        console.log('[HOOK] ✅ Reset mensuel terminé');
        
        // Reprogrammer pour le mois suivant
        scheduleMonthlyReset();
        
      } catch (error) {
        console.error('[HOOK] ❌ Erreur reset mensuel:', error);
      }
    }, timeUntilReset);

    console.log(`[HOOK] ⏰ Reset mensuel programmé dans ${Math.round(timeUntilReset / (1000 * 60 * 60 * 24))} jours`);
  }

  // =================================
  // 6. HOOK: Validation permissions selon plan
  // =================================
  filter('businesses.items.read', async (input, meta, context) => {
    // Pour l'affichage public, trier par priorité
    if (!context.accountability || !context.accountability.user) {
      // Vue publique - trier par priorité (Expert d'abord)
      if (!meta.sort || meta.sort.length === 0) {
        meta.sort = ['display_priority', '-date_created'];
      }
    }
    return input;
  });

  // Log des actions importantes
  action('businesses.items.create', async (meta) => {
    console.log(`[HOOK] ✅ Nouvel établissement créé: ${meta.payload.name} (${meta.payload.plan})`);
  });

  action('events.items.create', async (meta) => {
    console.log(`[HOOK] ✅ Nouvel événement créé: ${meta.payload.title}`);
  });

  console.log('🔧 [HOOKS] Guide Lyon v3 - Configuration chargée');
};