'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Lock, 
  Bell, 
  CreditCard,
  Shield,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Save,
  Trash2,
  LogOut
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';

interface UserSettings {
  email: string;
  notifications_email: boolean;
  notifications_sms: boolean;
  newsletter: boolean;
  marketing: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'security' | 'billing'>('account');
  const [settings, setSettings] = useState<UserSettings>({
    email: '',
    notifications_email: true,
    notifications_sms: false,
    newsletter: true,
    marketing: false
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/pro/connexion');
        return;
      }

      // Charger les paramètres utilisateur
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (userSettings) {
        setSettings({
          email: session.user.email || '',
          notifications_email: userSettings.notifications_email ?? true,
          notifications_sms: userSettings.notifications_sms ?? false,
          newsletter: userSettings.newsletter ?? true,
          marketing: userSettings.marketing ?? false
        });
      } else {
        setSettings({
          ...settings,
          email: session.user.email || ''
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Sauvegarder les paramètres
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: session.user.id,
          notifications_email: settings.notifications_email,
          notifications_sms: settings.notifications_sms,
          newsletter: settings.newsletter,
          marketing: settings.marketing,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès!' });
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (passwordData.new.length < 8) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès!' });
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: error.message || 'Erreur lors du changement de mot de passe' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.')) {
      return;
    }

    try {
      // TODO: Implémenter la suppression complète du compte
      alert('Fonctionnalité en cours de développement. Contactez le support pour supprimer votre compte.');
    } catch (error) {
      console.error('Erreur:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/pro/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600 mt-2">
            Gérez votre compte et vos préférences
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'account' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <User className="h-5 w-5" />
                Compte
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Bell className="h-5 w-5" />
                Notifications
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'security' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Lock className="h-5 w-5" />
                Sécurité
              </button>
              
              <button
                onClick={() => setActiveTab('billing')}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === 'billing' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                Facturation
              </button>
            </nav>

            <div className="mt-8 pt-8 border-t">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Déconnexion
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {/* Message */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{message.text}</span>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-6">Informations du compte</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse email
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      L'email ne peut pas être modifié
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-medium text-red-600 mb-4">Zone dangereuse</h3>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer mon compte
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Cette action est irréversible et supprimera toutes vos données
                  </p>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-6">Préférences de notifications</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium">Notifications par email</p>
                      <p className="text-sm text-gray-600">Recevez des mises à jour importantes par email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications_email}
                      onChange={(e) => setSettings({ ...settings, notifications_email: e.target.checked })}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium">Notifications SMS</p>
                      <p className="text-sm text-gray-600">Recevez des alertes urgentes par SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications_sms}
                      onChange={(e) => setSettings({ ...settings, notifications_sms: e.target.checked })}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium">Newsletter</p>
                      <p className="text-sm text-gray-600">Recevez notre newsletter mensuelle</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.newsletter}
                      onChange={(e) => setSettings({ ...settings, newsletter: e.target.checked })}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div>
                      <p className="font-medium">Communications marketing</p>
                      <p className="text-sm text-gray-600">Recevez des offres et promotions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.marketing}
                      onChange={(e) => setSettings({ ...settings, marketing: e.target.checked })}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
                      saving 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Sauvegarder
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-6">Sécurité</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Changer le mot de passe</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mot de passe actuel
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.current ? 'text' : 'password'}
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nouveau mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.new ? 'text' : 'password'}
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmer le nouveau mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.confirm ? 'text' : 'password'}
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={saving || !passwordData.current || !passwordData.new || !passwordData.confirm}
                      className={`mt-4 px-6 py-2 rounded-lg font-medium ${
                        saving || !passwordData.current || !passwordData.new || !passwordData.confirm
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Changer le mot de passe
                    </button>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="font-medium mb-4">Authentification à deux facteurs</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-700">Non activée</p>
                          <p className="text-sm text-gray-500">Protégez votre compte avec la 2FA</p>
                        </div>
                      </div>
                      <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Activer la 2FA →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-6">Facturation et abonnement</h2>
                
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Plan actuel</p>
                      <p className="text-2xl font-bold text-blue-900">Plan Basic</p>
                      <p className="text-sm text-blue-700 mt-1">0€/mois</p>
                    </div>
                    <Link
                      href="/pro/upgrade"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Changer de plan
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Historique des factures</h3>
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>Aucune facture disponible</p>
                    <p className="text-sm mt-1">Les factures apparaîtront ici après votre premier paiement</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}