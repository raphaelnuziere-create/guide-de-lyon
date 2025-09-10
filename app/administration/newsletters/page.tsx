'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Shield, Mail, Clock, Send, Eye, CheckCircle, XCircle, 
  Calendar, Users, AlertTriangle, RefreshCw, LogOut, Edit3 
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'

interface NewsletterDraft {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  status: 'draft' | 'pending' | 'approved' | 'sent';
  subject: string;
  scheduledFor: string;
  subscribersCount: number;
  createdAt: string;
  contentPreview: string;
  weather?: {
    temperature: number;
    condition: string;
    comment: string;
  };
  eventsCount: number;
  newsCount: number;
}

export default function NewslettersAdminPage() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [newsletters, setNewsletters] = useState<NewsletterDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'scheduled'>('all')
  const [selectedNewsletter, setSelectedNewsletter] = useState<NewsletterDraft | null>(null)

  useEffect(() => {
    if (!user) {
      window.location.href = '/administration/connexion'
      return
    }
    
    loadNewsletters()
  }, [user])

  const loadNewsletters = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/newsletters')
      const data = await response.json()
      setNewsletters(data.newsletters || [])
    } catch (error) {
      console.error('Erreur chargement newsletters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateNewsletter = async (type: 'daily' | 'weekly') => {
    try {
      const response = await fetch('/api/admin/newsletters/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      
      if (response.ok) {
        loadNewsletters()
      }
    } catch (error) {
      console.error('Erreur génération newsletter:', error)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/newsletters/${id}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        loadNewsletters()
      }
    } catch (error) {
      console.error('Erreur approbation:', error)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/newsletters/${id}/reject`, {
        method: 'POST'
      })
      
      if (response.ok) {
        loadNewsletters()
      }
    } catch (error) {
      console.error('Erreur rejet:', error)
    }
  }

  const handleSendNow = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir envoyer cette newsletter maintenant ?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/newsletters/${id}/send`, {
        method: 'POST'
      })
      
      if (response.ok) {
        loadNewsletters()
      }
    } catch (error) {
      console.error('Erreur envoi:', error)
    }
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/administration/connexion'
  }

  const filteredNewsletters = newsletters.filter(newsletter => {
    if (filter === 'pending') return newsletter.status === 'pending'
    if (filter === 'scheduled') return newsletter.status === 'approved'
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Clock className="h-4 w-4" />
      case 'weekly': return <Calendar className="h-4 w-4" />
      case 'monthly': return <Users className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-500 mr-3" />
              <span className="text-xl font-bold">Administration</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-12 items-center">
            <Link href="/administration/dashboard" className="text-gray-300 hover:text-white">
              Dashboard
            </Link>
            <Link href="/admin/events" className="text-gray-300 hover:text-white">
              Événements
            </Link>
            <Link href="/admin/users" className="text-gray-300 hover:text-white">
              Utilisateurs
            </Link>
            <Link href="/admin/merchants" className="text-gray-300 hover:text-white">
              Merchants
            </Link>
            <Link href="/admin/newsletters" className="text-white font-medium border-b-2 border-red-500">
              Newsletters
            </Link>
            <Link href="/admin/settings" className="text-gray-300 hover:text-white">
              Paramètres
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Newsletters</h1>
            <p className="text-gray-600">Validez et planifiez les envois de newsletters</p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => handleGenerateNewsletter('daily')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Générer Quotidienne
            </button>
            <button
              onClick={() => handleGenerateNewsletter('weekly')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Générer Hebdomadaire
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'pending' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              En attente ({newsletters.filter(n => n.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('scheduled')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'scheduled' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Programmées ({newsletters.filter(n => n.status === 'approved').length})
            </button>
          </div>
        </div>

        {/* Liste des newsletters */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Chargement des newsletters...</p>
            </div>
          ) : filteredNewsletters.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune newsletter</h3>
              <p className="text-gray-600">Générez une nouvelle newsletter pour commencer</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Newsletter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Programmée pour
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contenu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Abonnés
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNewsletters.map((newsletter) => (
                    <tr key={newsletter.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              {getTypeIcon(newsletter.type)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {newsletter.subject}
                            </div>
                            <div className="text-sm text-gray-500">
                              {newsletter.type === 'daily' ? 'Quotidienne' : 
                               newsletter.type === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(newsletter.status)}`}>
                          {newsletter.status === 'draft' && 'Brouillon'}
                          {newsletter.status === 'pending' && 'En attente'}
                          {newsletter.status === 'approved' && 'Approuvée'}
                          {newsletter.status === 'sent' && 'Envoyée'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(newsletter.scheduledFor).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {newsletter.eventsCount} événements, {newsletter.newsCount} actualités
                        </div>
                        {newsletter.weather && (
                          <div className="text-sm text-gray-500">
                            🌤️ {newsletter.weather.temperature}°C - {newsletter.weather.condition}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-1" />
                          {newsletter.subscribersCount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedNewsletter(newsletter)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-100 rounded"
                            title="Prévisualiser"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {newsletter.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(newsletter.id)}
                                className="text-green-600 hover:text-green-900 p-2 hover:bg-green-100 rounded"
                                title="Approuver"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(newsletter.id)}
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-100 rounded"
                                title="Rejeter"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {newsletter.status === 'approved' && (
                            <button
                              onClick={() => handleSendNow(newsletter.id)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-100 rounded"
                              title="Envoyer maintenant"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de prévisualisation */}
        {selectedNewsletter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Prévisualisation Newsletter
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedNewsletter.subject}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedNewsletter(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Informations</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium">
                        {selectedNewsletter.type === 'daily' ? 'Quotidienne' : 
                         selectedNewsletter.type === 'weekly' ? 'Hebdomadaire' : 'Mensuelle'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Abonnés:</span>
                      <span className="ml-2 font-medium">{selectedNewsletter.subscribersCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Événements:</span>
                      <span className="ml-2 font-medium">{selectedNewsletter.eventsCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Actualités:</span>
                      <span className="ml-2 font-medium">{selectedNewsletter.newsCount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="font-medium text-gray-900">Aperçu du contenu</h4>
                  </div>
                  <div className="p-4">
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: selectedNewsletter.contentPreview }} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end gap-4">
                  {selectedNewsletter.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleReject(selectedNewsletter.id)
                          setSelectedNewsletter(null)
                        }}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                      >
                        Rejeter
                      </button>
                      <button
                        onClick={() => {
                          handleApprove(selectedNewsletter.id)
                          setSelectedNewsletter(null)
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approuver
                      </button>
                    </>
                  )}
                  {selectedNewsletter.status === 'approved' && (
                    <button
                      onClick={() => {
                        handleSendNow(selectedNewsletter.id)
                        setSelectedNewsletter(null)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Envoyer maintenant
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}