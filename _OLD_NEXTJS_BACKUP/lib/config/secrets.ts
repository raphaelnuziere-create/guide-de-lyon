/**
 * Gestionnaire centralisé des clés API et secrets
 * Toutes les variables d'environnement sont validées au démarrage
 */

// Types pour la validation TypeScript
interface AppConfig {
  // Firebase
  firebase: {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }
  
  // Supabase
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey?: string
  }
  
  // Stripe
  stripe: {
    publishableKey: string
    secretKey?: string
    webhookSecret?: string
    prices: {
      pro?: string
      boost?: string
    }
  }
  
  // Email (Brevo)
  brevo: {
    apiKey?: string
    senderEmail?: string
    senderName?: string
  }
  
  // OpenAI
  openai: {
    apiKey?: string
    organization?: string
  }
  
  // Analytics
  analytics: {
    gaId?: string
    hotjarId?: string
    clarityId?: string
  }
  
  // Maps
  maps: {
    googleMapsKey?: string
    mapboxToken?: string
  }
  
  // App
  app: {
    url: string
    apiUrl: string
    env: 'development' | 'production' | 'test'
  }
}

// Fonction helper pour récupérer une variable d'env
function getEnvVar(key: string, required = false): string {
  const value = process.env[key]
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  
  return value || ''
}

// Configuration avec validation
const config: AppConfig = {
  firebase: {
    apiKey: getEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY', true),
    authDomain: getEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', true),
    projectId: getEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID', true),
    storageBucket: getEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', true),
    messagingSenderId: getEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', true),
    appId: getEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID', true)
  },
  
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', true),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY', true),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
  },
  
  stripe: {
    publishableKey: getEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', false),
    secretKey: getEnvVar('STRIPE_SECRET_KEY'),
    webhookSecret: getEnvVar('STRIPE_WEBHOOK_SECRET'),
    prices: {
      pro: getEnvVar('STRIPE_PRICE_ID_PRO'),
      boost: getEnvVar('STRIPE_PRICE_ID_BOOST')
    }
  },
  
  brevo: {
    apiKey: getEnvVar('BREVO_API_KEY'),
    senderEmail: getEnvVar('BREVO_SENDER_EMAIL'),
    senderName: getEnvVar('BREVO_SENDER_NAME')
  },
  
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY'),
    organization: getEnvVar('OPENAI_ORGANIZATION')
  },
  
  analytics: {
    gaId: getEnvVar('NEXT_PUBLIC_GA_MEASUREMENT_ID'),
    hotjarId: getEnvVar('NEXT_PUBLIC_HOTJAR_ID'),
    clarityId: getEnvVar('NEXT_PUBLIC_CLARITY_PROJECT_ID')
  },
  
  maps: {
    googleMapsKey: getEnvVar('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'),
    mapboxToken: getEnvVar('NEXT_PUBLIC_MAPBOX_TOKEN')
  },
  
  app: {
    url: getEnvVar('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000',
    apiUrl: getEnvVar('NEXT_PUBLIC_API_URL') || 'http://localhost:3000/api',
    env: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development'
  }
}

// Validation au démarrage (uniquement côté serveur)
if (typeof window === 'undefined') {
  console.log('🔐 Configuration loaded successfully')
  console.log(`📍 Environment: ${config.app.env}`)
  console.log(`🌐 App URL: ${config.app.url}`)
  
  // Vérifier les services critiques
  if (!config.supabase.url || !config.supabase.anonKey) {
    console.warn('⚠️ Supabase not configured - database features will be limited')
  }
  
  if (!config.stripe.publishableKey) {
    console.warn('⚠️ Stripe not configured - payment features disabled')
  }
  
  if (!config.brevo.apiKey) {
    console.warn('⚠️ Brevo not configured - email features disabled')
  }
}

export default config

// Export des configs individuelles pour faciliter l'import
export const firebaseConfig = config.firebase
export const supabaseConfig = config.supabase
export const stripeConfig = config.stripe
export const brevoConfig = config.brevo
export const openaiConfig = config.openai