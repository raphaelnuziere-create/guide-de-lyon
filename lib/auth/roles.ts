// Role-based access control system
export type UserPlan = 'basic' | 'pro' | 'expert';

export interface PlanLimits {
  // Photos
  maxPhotos: number;
  canUploadGallery: boolean;
  
  // Events
  maxEventsPerMonth: number;
  canShowOnHomepage: boolean;
  canShowInNewsletter: boolean;
  canPostToSocial: boolean;
  
  // Analytics
  hasBasicStats: boolean;
  hasAdvancedStats: boolean;
  hasAPIAccess: boolean;
  
  // Features
  hasPrioritySupport: boolean;
  hasVerifiedBadge: boolean;
  canBePrioritized: boolean;
  
  // Billing
  requiresTVA: boolean;
  monthlyPrice: number;
}

export const PLAN_LIMITS: Record<UserPlan, PlanLimits> = {
  basic: {
    maxPhotos: 1,
    canUploadGallery: false,
    maxEventsPerMonth: 3,
    canShowOnHomepage: false,
    canShowInNewsletter: false,
    canPostToSocial: false,
    hasBasicStats: false,
    hasAdvancedStats: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
    hasVerifiedBadge: false,
    canBePrioritized: false,
    requiresTVA: false,
    monthlyPrice: 0
  },
  pro: {
    maxPhotos: 6,
    canUploadGallery: true,
    maxEventsPerMonth: 3,
    canShowOnHomepage: true,
    canShowInNewsletter: false,
    canPostToSocial: true,
    hasBasicStats: true,
    hasAdvancedStats: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
    hasVerifiedBadge: true,
    canBePrioritized: false,
    requiresTVA: true,
    monthlyPrice: 29
  },
  expert: {
    maxPhotos: 999,
    canUploadGallery: true,
    maxEventsPerMonth: 10,
    canShowOnHomepage: true,
    canShowInNewsletter: true,
    canPostToSocial: true,
    hasBasicStats: true,
    hasAdvancedStats: true,
    hasAPIAccess: true,
    hasPrioritySupport: true,
    hasVerifiedBadge: true,
    canBePrioritized: true,
    requiresTVA: true,
    monthlyPrice: 79
  }
};

export function getPlanLimits(plan: UserPlan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function canPerformAction(plan: UserPlan, action: keyof PlanLimits): boolean {
  const limits = getPlanLimits(plan);
  return limits[action] as boolean;
}

export function getMaxCount(plan: UserPlan, resource: 'photos' | 'events'): number {
  const limits = getPlanLimits(plan);
  return resource === 'photos' ? limits.maxPhotos : limits.maxEventsPerMonth;
}

// Plan upgrade suggestions
export function getUpgradeReasons(currentPlan: UserPlan, desiredAction: string): string[] {
  const reasons: string[] = [];
  
  if (currentPlan === 'basic') {
    reasons.push('Galerie photos (jusqu\'à 6 photos)');
    reasons.push('Événements visibles sur page d\'accueil');
    reasons.push('Badge "Établissement vérifié"');
    reasons.push('Statistiques de base');
    reasons.push('Partage sur réseaux sociaux');
  }
  
  if (currentPlan !== 'expert') {
    reasons.push('Photos illimitées');
    reasons.push('10 événements par mois');
    reasons.push('Inclusion dans newsletter');
    reasons.push('Statistiques avancées');
    reasons.push('Support prioritaire');
    reasons.push('Accès API');
  }
  
  return reasons;
}

// Test account credentials for development
export const TEST_ACCOUNTS = {
  basic: {
    email: 'basic@test.com',
    password: 'TestBasic123!',
    plan: 'basic' as UserPlan
  },
  pro: {
    email: 'pro@test.com', 
    password: 'TestPro123!',
    plan: 'pro' as UserPlan
  },
  expert: {
    email: 'expert@test.com',
    password: 'TestExpert123!', 
    plan: 'expert' as UserPlan
  }
} as const;