'use client';

import { useState } from 'react';

export default function EmailDashboard() {
  const [emailType, setEmailType] = useState('welcome');
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  
  const sendTestEmail = async () => {
    setSending(true);
    setResult(null);
    
    try {
      // Données de test selon le type
      const testData: any = {
        name: 'Test User',
        reference: 'TEST-' + Date.now(),
        amount: 99.99,
        resetLink: 'https://www.guide-de-lyon.fr/reset-password?token=test123',
        articles: [
          {
            title: 'Les meilleurs restaurants de Lyon',
            slug: 'meilleurs-restaurants-lyon',
            excerpt: 'Découvrez notre sélection des meilleurs restaurants...'
          },
          {
            title: 'Événements à ne pas manquer',
            slug: 'evenements-lyon',
            excerpt: 'Ce mois-ci à Lyon, ne manquez pas...'
          }
        ],
        notification: {
          type: 'new_review',
          data: {
            author: 'Jean Dupont',
            rating: 5,
            comment: 'Excellent établissement, je recommande !'
          }
        }
      };
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          email: testEmail,
          data: testData
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult({
          type: 'success',
          message: `Email envoyé avec succès ! ID: ${data.messageId || 'N/A'}`
        });
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Erreur lors de l\'envoi'
        });
      }
    } catch (error: any) {
      setResult({
        type: 'error',
        message: 'Erreur réseau: ' + error.message
      });
    } finally {
      setSending(false);
    }
  };
  
  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/send-email');
      const data = await response.json();
      console.log('Configuration API Email:', data);
      alert('API Email configurée ! Voir la console pour les détails.');
    } catch (error) {
      alert('Erreur: API Email non accessible');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">📧 Gestion des Emails - Guide de Lyon</h1>
        
        {/* Test d'envoi */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Tester l'envoi d'email</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type d'email</label>
              <select 
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="welcome">✉️ Bienvenue (après inscription)</option>
                <option value="order">💳 Confirmation de commande</option>
                <option value="newsletter">📰 Newsletter</option>
                <option value="password-reset">🔐 Réinitialisation mot de passe</option>
                <option value="pro-notification">🏢 Notification Pro</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email destinataire</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="test@example.com"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={sendTestEmail}
                disabled={sending || !testEmail}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sending ? '⏳ Envoi...' : '📤 Envoyer email test'}
              </button>
              
              <button
                onClick={checkConfiguration}
                className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition"
              >
                🔧 Vérifier configuration
              </button>
            </div>
            
            {/* Résultat */}
            {result && (
              <div className={`p-4 rounded-md ${
                result.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <p className="font-medium">
                  {result.type === 'success' ? '✅' : '❌'} {result.message}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Informations */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Informations</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Service email</span>
              <span className="font-medium">Brevo (ex-SendinBlue)</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Limite gratuite</span>
              <span className="font-medium">300 emails/jour</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Email expéditeur</span>
              <span className="font-medium">{process.env.NEXT_PUBLIC_BREVO_SENDER_EMAIL || 'contact@guide-de-lyon.fr'}</span>
            </div>
          </div>
        </div>
        
        {/* Liens utiles */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-3">🔗 Liens utiles</h3>
          <div className="space-y-2">
            <a 
              href="https://app.brevo.com" 
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Dashboard Brevo (statistiques, templates, logs)
            </a>
            <a 
              href="https://dashboard.stripe.com/webhooks" 
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Configuration Webhook Stripe
            </a>
            <a 
              href="https://developers.brevo.com/docs" 
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              → Documentation API Brevo
            </a>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-6 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h3 className="font-semibold mb-3">⚠️ Configuration requise</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Assurez-vous que <code className="bg-gray-100 px-2 py-1 rounded">BREVO_API_KEY</code> est configurée dans .env.local</li>
            <li>Vérifiez que l'email expéditeur est vérifié dans Brevo</li>
            <li>Pour Stripe, créez le webhook et copiez la clé <code className="bg-gray-100 px-2 py-1 rounded">whsec_xxx</code></li>
            <li>Testez avec votre propre email pour vérifier la réception</li>
          </ol>
        </div>
      </div>
    </div>
  );
}