import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase/client';
import { UserPlan, getPlanLimits, PlanLimits } from './roles';

interface UserPlanData {
  userId: string | null;
  userEmail: string | null;
  establishmentId: string | null;
  plan: UserPlan;
  planLimits: PlanLimits;
  isLoading: boolean;
  error: string | null;
  hasVatNumber: boolean;
  isVerified: boolean;
  eventsThisMonth: number;
  photosCount: number;
}

export function useUserPlan(): UserPlanData {
  const [data, setData] = useState<UserPlanData>({
    userId: null,
    userEmail: null,
    establishmentId: null,
    plan: 'basic',
    planLimits: getPlanLimits('basic'),
    isLoading: true,
    error: null,
    hasVatNumber: false,
    isVerified: false,
    eventsThisMonth: 0,
    photosCount: 0
  });

  const loadUserPlan = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setData(prev => ({ 
          ...prev, 
          isLoading: false,
          userId: null,
          userEmail: null
        }));
        return;
      }

      // Get establishment data
      const { data: establishment, error } = await supabase
        .from('establishments')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        throw new Error(`Failed to load establishment: ${error.message}`);
      }

      if (!establishment) {
        throw new Error('No establishment found for this user');
      }

      const plan = (establishment.plan || 'basic') as UserPlan;
      const planLimits = getPlanLimits(plan);

      console.log('[useUserPlan] Establishment loaded:', {
        id: establishment.id,
        name: establishment.name,
        user_id: establishment.user_id,
        session_user_id: session.user.id
      });

      setData(prev => ({
        ...prev,
        userId: session.user.id,
        userEmail: session.user.email || null,
        establishmentId: establishment.id,
        plan,
        planLimits,
        hasVatNumber: !!establishment.vat_number,
        isVerified: !!establishment.verified,
        eventsThisMonth: establishment.events_this_month || 0,
        photosCount: establishment.photos_count || 0,
        isLoading: false,
        error: null
      }));

    } catch (error) {
      console.error('Error loading user plan:', error);
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };

  useEffect(() => {
    loadUserPlan();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserPlan();
    });

    return () => subscription.unsubscribe();
  }, []);

  return data;
}

// Helper hook for specific permission checks
export function usePermissions() {
  const planData = useUserPlan();
  
  return {
    ...planData,
    can: {
      uploadPhotos: (count: number) => count < planData.planLimits.maxPhotos,
      createEvents: () => planData.eventsThisMonth < planData.planLimits.maxEventsPerMonth,
      accessAdvancedStats: () => planData.planLimits.hasAdvancedStats,
      showOnHomepage: () => planData.planLimits.canShowOnHomepage,
      requireTVA: () => planData.planLimits.requiresTVA
    }
  };
}