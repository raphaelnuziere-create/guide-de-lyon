'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  Shield,
  TrendingUp
} from 'lucide-react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase-client'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  merchantId: string
  merchantName: string
  title: string
  description: string
  category: string
  startDate: Date
  endDate?: Date
  location: string
  address: string
  price?: number
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  promoted: boolean
  onHomepage: boolean
  viewCount: number
  createdAt: Date
  rejectionReason?: string
}

export default function AdminEventsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    // Vérifier que l'utilisateur est admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Charger les événements
    const q = query(
      collection(firebaseDb, 'events'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData: Event[] = []
      let pending = 0, approved = 0, rejected = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        const event = {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate(),
          endDate: data.endDate?.toDate(),
          createdAt: data.createdAt?.toDate()
        } as Event

        eventsData.push(event)
        
        // Compter les statuts
        if (event.status === 'pending') pending++
        else if (event.status === 'approved') approved++
        else if (event.status === 'rejected') rejected++
      })

      setEvents(eventsData)
      setStats({
        total: eventsData.length,
        pending,
        approved,
        rejected
      })
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, router])

  const handleApprove = async (eventId: string) => {
    if (!confirm('Approuver cet événement ?')) return

    try {
      await updateDoc(doc(firebaseDb, 'events', eventId), {
        status: 'approved',
        approvedAt: Timestamp.now(),
        approvedBy: user?.uid
      })
      alert('Événement approuvé avec succès')
    } catch (error) {
      console.error('Error approving event:', error)
      alert('Erreur lors de l\'approbation')
    }
  }

  const handleReject = async () => {
    if (!selectedEvent || !rejectionReason) {
      alert('Veuillez indiquer une raison')
      return
    }

    try {
      await updateDoc(doc(firebaseDb, 'events', selectedEvent.id), {
        status: 'rejected',
        rejectionReason,
        rejectedAt: Timestamp.now(),
        rejectedBy: user?.uid
      })
      
      setShowRejectModal(false)
      setRejectionReason('')
      setSelectedEvent(null)
      alert('Événement rejeté')
    } catch (error) {
      console.error('Error rejecting event:', error)
      alert('Erreur lors du rejet')
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Supprimer définitivement cet événement ?')) return

    try {
      await deleteDoc(doc(firebaseDb, 'events', eventId))
      alert('Événement supprimé')
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const filteredEvents = events
    .filter(e => filter === 'all' || e.status === filter)
    .filter(e => 
      searchTerm === '' || 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.merchantName.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getStatusBadge = (status: Event['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approuvé
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            En attente
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Rejeté
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Modération des événements
              </h1>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejetés</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Filtres par statut */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'pending' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En attente ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'approved' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approuvés
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'rejected' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejetés
              </button>
            </div>

            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Liste des événements */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun événement trouvé</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Image */}
                        {event.images[0] && (
                          <img
                            src={event.images[0]}
                            alt={event.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        
                        {/* Contenu */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {event.title}
                            </h3>
                            {getStatusBadge(event.status)}
                            {event.promoted && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Promu
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(event.startDate)}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.location}
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {event.viewCount} vues
                            </div>
                            <div>
                              Par: <span className="font-medium">{event.merchantName}</span>
                            </div>
                          </div>

                          {event.rejectionReason && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm text-red-700">
                                <strong>Raison du rejet:</strong> {event.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex flex-col gap-2">
                      {event.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(event.id)}
                            className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </button>
                          <button
                            onClick={() => {
                              setSelectedEvent(event)
                              setShowRejectModal(true)
                            }}
                            className="flex items-center px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </button>
                        </>
                      )}
                      
                      <Link
                        href={`/evenements/${event.id}`}
                        className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="flex items-center px-3 py-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de rejet */}
      {showRejectModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">
              Rejeter l'événement
            </h3>
            <p className="text-gray-600 mb-4">
              Événement : <strong>{selectedEvent.title}</strong>
            </p>
            <textarea
              placeholder="Indiquez la raison du rejet..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={!rejectionReason}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirmer le rejet
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectionReason('')
                  setSelectedEvent(null)
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}