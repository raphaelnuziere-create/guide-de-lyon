'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Image as ImageIcon,
  Euro,
  Users,
  Tag,
  AlertCircle,
  Check,
  X,
  Sparkles,
  Share2,
  FileText
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { quotaManager } from '@/lib/quotas/quota-manager'
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore'
import { firebaseDb } from '@/lib/firebase-client'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage'
import { firebaseStorage } from '@/lib/firebase-client'

interface EventFormData {
  title: string
  description: string
  category: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  location: string
  address: string
  price: string
  maxAttendees: string
  tags: string[]
  images: File[]
  promoted: boolean
}

const eventCategories = [
  'Concert',
  'Soirée spéciale',
  'Happy Hour',
  'Dégustation',
  'Vernissage',
  'Workshop',
  'Promotion',
  'Animation',
  'Rencontre',
  'Autre'
]

const popularTags = [
  'Musique live',
  'DJ',
  'Afterwork',
  'Networking',
  'Art',
  'Gastronomie',
  'Vin',
  'Bière',
  'Cocktails',
  'Gratuit',
  'Famille',
  'Outdoor'
]

export default function CreateEventPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null)
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    address: '',
    price: '',
    maxAttendees: '',
    tags: [],
    images: [],
    promoted: false
  })

  // Vérifier les quotas au chargement
  useEffect(() => {
    checkQuotas()
  }, [])

  const checkQuotas = async () => {
    if (!user) return

    try {
      const canCreate = await quotaManager.canPerformAction(
        user.uid,
        user.plan || 'free',
        'create_event'
      )

      if (!canCreate.allowed) {
        setQuotaWarning(canCreate.reason || 'Limite d\'événements atteinte')
      }

      // Vérifier si peut promouvoir
      if (user.plan !== 'free') {
        const canPromote = await quotaManager.canPromoteEvent(
          user.uid,
          user.plan || 'free'
        )
        
        if (!canPromote.allowed && formData.promoted) {
          setFormData({ ...formData, promoted: false })
          setQuotaWarning(canPromote.reason || 'Limite de promotion atteinte')
        }
      }
    } catch (error) {
      console.error('Error checking quotas:', error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const plan = user?.plan || 'free'
      const maxPhotos = plan === 'free' ? 3 : plan === 'pro_visibility' ? 10 : 50
      
      if (files.length > maxPhotos) {
        setError(`Maximum ${maxPhotos} photos avec votre plan`)
        return
      }

      setFormData({ ...formData, images: files })
    }
  }

  const handleTagToggle = (tag: string) => {
    if (formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: formData.tags.filter(t => t !== tag)
      })
    } else {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      })
    }
  }

  const uploadImages = async (eventId: string): Promise<string[]> => {
    const urls: string[] = []
    
    for (let i = 0; i < formData.images.length; i++) {
      const image = formData.images[i]
      const storageRef = ref(firebaseStorage, `events/${eventId}/image_${i}_${Date.now()}`)
      const snapshot = await uploadBytes(storageRef, image)
      const url = await getDownloadURL(snapshot.ref)
      urls.push(url)
      
      // Mettre à jour le quota de stockage
      const sizeMB = image.size / (1024 * 1024)
      await quotaManager.incrementUsage(user!.uid, 'storage', sizeMB)
    }
    
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('Vous devez être connecté')
      return
    }

    // Vérifier les quotas une dernière fois
    const canCreate = await quotaManager.canPerformAction(
      user.uid,
      user.plan || 'free',
      'create_event'
    )

    if (!canCreate.allowed) {
      setError(canCreate.reason || 'Limite d\'événements atteinte')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Récupérer l'établissement du merchant
      const merchantDoc = await getDoc(doc(firebaseDb, 'merchant_settings', user.uid))
      const merchantData = merchantDoc.data()

      // Créer l'événement dans Firestore
      const eventData = {
        merchantId: user.uid,
        merchantName: merchantData?.companyName || user.displayName,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startDate: new Date(`${formData.startDate}T${formData.startTime}`),
        endDate: formData.endDate && formData.endTime 
          ? new Date(`${formData.endDate}T${formData.endTime}`)
          : new Date(`${formData.startDate}T${formData.startTime}`),
        location: formData.location,
        address: formData.address,
        price: formData.price ? parseFloat(formData.price) : 0,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        tags: formData.tags,
        images: [], // Sera mis à jour après l'upload
        promoted: formData.promoted && user.plan !== 'free',
        status: 'pending', // En attente de modération
        viewCount: 0,
        interestedCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Métadonnées pour les fonctionnalités premium
        onHomepage: user.plan !== 'free', // Visible sur page d'accueil si Pro
        socialMediaPush: user.plan === 'pro_boost', // Push réseaux sociaux si Pro Boost
        includedInBlog: false // Sera marqué true quand inclus dans article mensuel
      }

      // Créer l'événement
      const docRef = await addDoc(collection(firebaseDb, 'events'), eventData)

      // Upload des images
      if (formData.images.length > 0) {
        const imageUrls = await uploadImages(docRef.id)
        await updateDoc(docRef, { images: imageUrls })
      }

      // Incrémenter les quotas
      await quotaManager.incrementUsage(user.uid, 'event', 1)
      
      if (formData.promoted && user.plan !== 'free') {
        await quotaManager.incrementUsage(user.uid, 'event_promoted', 1)
      }

      // Si Pro Boost, créer une tâche de publication sur les réseaux sociaux
      if (user.plan === 'pro_boost') {
        const eventDoc = await getDoc(docRef)
        const eventImages = eventDoc.data()?.images || []
        
        await addDoc(collection(firebaseDb, 'social_media_queue'), {
          eventId: docRef.id,
          merchantId: user.uid,
          type: 'event_announcement',
          scheduledFor: eventData.createdAt,
          status: 'pending',
          platforms: ['facebook', 'instagram'],
          content: {
            title: formData.title,
            description: formData.description.substring(0, 200) + '...',
            image: eventImages[0] || null,
            link: `https://guide-de-lyon.fr/events/${docRef.id}`
          }
        })
      }

      // Rediriger vers la page de succès
      router.push('/pro/events?created=true')
      
    } catch (error: any) {
      console.error('Error creating event:', error)
      setError(error.message || 'Erreur lors de la création de l\'événement')
    } finally {
      setLoading(false)
    }
  }

  const plan = user?.plan || 'free'
  const planLimits = quotaManager.getPlanLimits(plan as any)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/pro/events" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour aux événements
            </Link>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Plan {plan === 'free' ? 'Gratuit' : plan === 'pro_visibility' ? 'Pro Visibilité' : 'Pro Boost'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Créer un nouvel événement
          </h1>
          <p className="text-gray-600 mt-2">
            Attirez de nouveaux clients avec vos événements spéciaux
          </p>
        </div>

        {/* Alerte quota */}
        {quotaWarning && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-700">{quotaWarning}</p>
                {plan !== 'pro_boost' && (
                  <Link 
                    href="/pro/upgrade"
                    className="inline-flex items-center text-sm text-yellow-700 hover:text-yellow-800 font-medium mt-2"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Passer au plan supérieur
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features du plan */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">
            Fonctionnalités de votre plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center">
              {planLimits.eventsOnHomepage ? (
                <>
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-700">Visible sur page d'accueil</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-500">Page établissement uniquement</span>
                </>
              )}
            </div>
            
            <div className="flex items-center">
              {planLimits.socialMediaPush ? (
                <>
                  <Share2 className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-700">Publication réseaux sociaux</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-500">Pas de push social</span>
                </>
              )}
            </div>
            
            <div className="flex items-center">
              {planLimits.monthlyBlogPost ? (
                <>
                  <FileText className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-gray-700">Article SEO mensuel</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-500">Pas d'article SEO</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* Informations principales */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations principales</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de l'événement *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Soirée Jazz avec buffet gratuit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Décrivez votre événement en détail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {eventCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date et horaires */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Date et horaires</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de début *
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heure de fin
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lieu */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Lieu</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du lieu *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Restaurant Le Gourmet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 10 rue de la République, 69001 Lyon"
                />
              </div>
            </div>
          </div>

          {/* Détails */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Détails</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Euro className="inline h-4 w-4 mr-1" />
                  Prix (laisser vide si gratuit)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="inline h-4 w-4 mr-1" />
                  Nombre max de participants
                </label>
                <input
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Illimité"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              <Tag className="inline h-4 w-4 mr-1" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              <ImageIcon className="inline h-4 w-4 mr-1" />
              Photos
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  Cliquez pour ajouter des photos
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum {plan === 'free' ? '3' : plan === 'pro_visibility' ? '10' : '50'} photos
                </p>
              </label>
              {formData.images.length > 0 && (
                <p className="text-sm text-green-600 mt-3">
                  {formData.images.length} photo(s) sélectionnée(s)
                </p>
              )}
            </div>
          </div>

          {/* Promotion */}
          {plan !== 'free' && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.promoted}
                  onChange={(e) => setFormData({ ...formData, promoted: e.target.checked })}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <span className="font-medium text-gray-900">
                    Mettre en avant cet événement
                  </span>
                  <p className="text-sm text-gray-600">
                    L'événement sera mis en avant sur la page d'accueil
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push('/pro/events')}
              className="px-6 py-2 text-gray-600 hover:text-gray-900"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading || !!quotaWarning}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Création...
                </span>
              ) : (
                'Créer l\'événement'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}