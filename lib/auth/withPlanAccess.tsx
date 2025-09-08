import React from 'react';
import { usePermissions } from './useUserPlan';
import { UserPlan } from './roles';
import { Zap, Crown, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';

interface WithPlanAccessProps {
  children: React.ReactNode;
  requiredPlan?: UserPlan;
  feature?: string;
  fallback?: React.ReactNode;
}

export function WithPlanAccess({ 
  children, 
  requiredPlan, 
  feature, 
  fallback 
}: WithPlanAccessProps) {
  const { plan, planLimits, isLoading, error } = usePermissions();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-4 min-h-[100px]">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center text-red-600">
          <Lock className="h-5 w-5 mr-2" />
          <span>Erreur de chargement des permissions</span>
        </div>
      </div>
    );
  }

  // Check if user has required plan
  const hasAccess = requiredPlan ? checkPlanAccess(plan, requiredPlan) : true;

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <PlanUpgradePrompt 
        currentPlan={plan}
        requiredPlan={requiredPlan!}
        feature={feature}
      />
    );
  }

  return <>{children}</>;
}

function checkPlanAccess(currentPlan: UserPlan, requiredPlan: UserPlan): boolean {
  const planHierarchy = { basic: 0, pro: 1, expert: 2 };
  return planHierarchy[currentPlan] >= planHierarchy[requiredPlan];
}

interface PlanUpgradePromptProps {
  currentPlan: UserPlan;
  requiredPlan: UserPlan;
  feature?: string;
}

function PlanUpgradePrompt({ currentPlan, requiredPlan, feature }: PlanUpgradePromptProps) {
  const planInfo = {
    pro: { 
      name: 'Pro', 
      price: 29, 
      color: 'blue', 
      icon: Zap,
      features: ['6 photos', 'Événements sur page d\'accueil', 'Badge vérifié', 'Statistiques']
    },
    expert: { 
      name: 'Expert', 
      price: 79, 
      color: 'purple', 
      icon: Crown,
      features: ['Photos illimitées', '10 événements/mois', 'Newsletter', 'Stats avancées', 'Support prioritaire']
    }
  };

  const targetPlan = planInfo[requiredPlan as keyof typeof planInfo];
  if (!targetPlan) return null;

  const IconComponent = targetPlan.icon;

  return (
    <div className={`bg-gradient-to-r from-${targetPlan.color}-50 to-${targetPlan.color}-100 border border-${targetPlan.color}-200 rounded-lg p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className={`p-2 bg-${targetPlan.color}-100 rounded-lg mr-3`}>
              <IconComponent className={`h-6 w-6 text-${targetPlan.color}-600`} />
            </div>
            <div>
              <h3 className={`font-semibold text-${targetPlan.color}-900`}>
                {feature ? `${feature} nécessite le plan ${targetPlan.name}` : `Plan ${targetPlan.name} requis`}
              </h3>
              <p className={`text-sm text-${targetPlan.color}-700`}>
                Passez au plan {targetPlan.name} pour débloquer cette fonctionnalité
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Fonctionnalités incluses :</p>
            <div className="grid grid-cols-2 gap-2">
              {targetPlan.features.map((feat, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <div className={`w-1.5 h-1.5 bg-${targetPlan.color}-500 rounded-full mr-2`}></div>
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-gray-900">
            {targetPlan.price}€<span className="text-sm font-normal text-gray-600">/mois</span>
          </div>
          <Link 
            href="/pro/upgrade"
            className={`inline-flex items-center mt-3 px-4 py-2 bg-${targetPlan.color}-600 text-white text-sm font-medium rounded-lg hover:bg-${targetPlan.color}-700 transition-colors`}
          >
            Passer au plan {targetPlan.name}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// HOC version for class components
export function withPlanAccess<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPlan: UserPlan,
  feature?: string
) {
  return function WithPlanAccessComponent(props: P) {
    return (
      <WithPlanAccess requiredPlan={requiredPlan} feature={feature}>
        <WrappedComponent {...props} />
      </WithPlanAccess>
    );
  };
}

// Plan badge component
export function PlanBadge({ plan, className = '' }: { plan: UserPlan; className?: string }) {
  const planConfig = {
    basic: { label: 'Basic', color: 'bg-gray-100 text-gray-800', icon: null },
    pro: { label: 'Pro', color: 'bg-blue-100 text-blue-800', icon: Zap },
    expert: { label: 'Expert', color: 'bg-purple-100 text-purple-800', icon: Crown }
  };

  const config = planConfig[plan];
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${className}`}>
      {IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
      {config.label}
    </span>
  );
}