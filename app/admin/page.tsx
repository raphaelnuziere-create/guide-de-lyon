import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Administration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Email */}
        <Link href="/admin/emails">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">📧</span>
              <h2 className="text-xl font-semibold">Gestion Emails</h2>
            </div>
            <p className="text-gray-600">
              Tester l'envoi d'emails, voir les templates et gérer les campagnes.
            </p>
            <div className="mt-4 text-blue-600 font-medium">
              Accéder →
            </div>
          </div>
        </Link>
        
        {/* Card Stats */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">📊</span>
            <h2 className="text-xl font-semibold">Statistiques</h2>
          </div>
          <p className="text-gray-600">
            Voir les statistiques du site et les analytics.
          </p>
          <div className="mt-4 text-gray-400">
            Bientôt disponible
          </div>
        </div>
        
        {/* Card Users */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">👥</span>
            <h2 className="text-xl font-semibold">Utilisateurs</h2>
          </div>
          <p className="text-gray-600">
            Gérer les utilisateurs et les comptes professionnels.
          </p>
          <div className="mt-4 text-gray-400">
            Bientôt disponible
          </div>
        </div>
        
        {/* Card Blog */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">📝</span>
            <h2 className="text-xl font-semibold">Articles Blog</h2>
          </div>
          <p className="text-gray-600">
            Gérer les articles du blog et les catégories.
          </p>
          <div className="mt-4 text-gray-400">
            Bientôt disponible
          </div>
        </div>
        
        {/* Card Settings */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">⚙️</span>
            <h2 className="text-xl font-semibold">Paramètres</h2>
          </div>
          <p className="text-gray-600">
            Configuration générale du site.
          </p>
          <div className="mt-4 text-gray-400">
            Bientôt disponible
          </div>
        </div>
        
        {/* Card Webhooks */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">🔗</span>
            <h2 className="text-xl font-semibold">Webhooks</h2>
          </div>
          <p className="text-gray-600">
            Status des webhooks Stripe et Brevo.
          </p>
          <div className="mt-4">
            <div className="text-sm">
              <a href="/api/webhooks/stripe" target="_blank" className="text-blue-600 hover:underline block">
                → Stripe Webhook
              </a>
              <a href="/api/webhooks/brevo" target="_blank" className="text-blue-600 hover:underline block mt-1">
                → Brevo Webhook
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section Liens Rapides */}
      <div className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🔗 Liens externes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a 
            href="https://app.brevo.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Brevo Dashboard ↗
          </a>
          <a 
            href="https://dashboard.stripe.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Stripe Dashboard ↗
          </a>
          <a 
            href="https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Supabase Dashboard ↗
          </a>
          <a 
            href="https://vercel.com/dashboard" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Vercel Dashboard ↗
          </a>
        </div>
      </div>
    </div>
  );
}