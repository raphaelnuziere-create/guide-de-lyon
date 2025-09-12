import { useState, useEffect } from 'react';
import { useDirectusAuth } from './useDirectusAuth';
import { useUserPlan as useSupabaseUserPlan } from '../auth/useUserPlan';

// Flag pour activer/désactiver Directus
const USE_DIRECTUS = process.env.NEXT_PUBLIC_USE_DIRECTUS === 'true';

/**
 * Hook de transition qui utilise soit Directus soit Supabase
 * selon la variable d'environnement NEXT_PUBLIC_USE_DIRECTUS
 */
export function useUserPlan() {
  const directusData = useDirectusAuth();
  const supabaseData = useSupabaseUserPlan();

  if (USE_DIRECTUS) {
    // Adapter les données de Directus pour être compatibles avec l'interface Supabase
    return {
      userId: directusData.userId,
      userEmail: directusData.userEmail,
      establishmentId: directusData.establishmentId,
      plan: directusData.plan,
      planLimits: {
        ...directusData.planLimits,
        max_photos: directusData.planLimits.maxPhotos,
        max_events_per_month: directusData.planLimits.maxEventsPerMonth,
        has_advanced_stats: directusData.planLimits.hasAdvancedStats,
        can_show_on_homepage: directusData.planLimits.canShowOnHomepage,
        requires_tva: directusData.planLimits.requiresTVA
      },
      isLoading: directusData.isLoading,
      error: directusData.error,
      hasVatNumber: directusData.hasVatNumber,
      isVerified: directusData.isVerified,
      eventsThisMonth: directusData.eventsThisMonth,
      photosCount: directusData.photosCount
    };
  } else {
    // Utiliser Supabase (comportement actuel)
    return supabaseData;
  }
}

export function usePermissions() {
  const planData = useUserPlan();
  
  if (USE_DIRECTUS) {
    const directusData = useDirectusAuth();
    return {
      ...planData,
      can: {
        uploadPhotos: (count: number) => {
          const maxPhotos = directusData.planLimits.maxPhotos;
          return maxPhotos === -1 || count < maxPhotos;
        },
        createEvents: () => {
          const maxEvents = directusData.planLimits.maxEventsPerMonth;
          return maxEvents === -1 || directusData.eventsThisMonth < maxEvents;
        },
        accessAdvancedStats: () => directusData.planLimits.hasAdvancedStats,
        showOnHomepage: () => directusData.planLimits.canShowOnHomepage,
        requireTVA: () => directusData.planLimits.requiresTVA
      }
    };
  } else {
    return {
      ...planData,
      can: {
        uploadPhotos: (count: number) => count < planData.planLimits.max_photos,
        createEvents: () => planData.eventsThisMonth < planData.planLimits.max_events_per_month,
        accessAdvancedStats: () => planData.planLimits.has_advanced_stats,
        showOnHomepage: () => planData.planLimits.can_show_on_homepage,
        requireTVA: () => planData.planLimits.requires_tva
      }
    };
  }
}