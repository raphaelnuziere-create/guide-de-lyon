'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Mail,
  Clock,
  Upload,
  X,
  AlertCircle,
  Plus
} from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { quotaManager } from '@/lib/quotas/quota-manager'
import { firebaseDb, firebaseStorage } from '@/lib/firebase-client'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { QuotaAlert } from '@/components/quotas/quota-display'

const categories = [
  'Restaurant',
  'Bar / Café',
  'Shopping',
  'Culture',
  'Loisirs',
  'Services',
  'Santé',
  'Sport',
  'Beauté',
  'Autre'
]

export default function NewPlacePage() {
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quotaError, setQuotaError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    postalCode: '',
    city: 'Lyon',
    phone: '',
    email: '',
    website: '',
    openingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '17:00', closed: false },
      sunday: { open: '', close: '', closed: true }
    }
  })
  
  const [images, setImages] = useState<string[]>([])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const plan = user?.plan || 'free'
    const limits = quotaManager.getPlanLimits(plan as any)
    
    if (images.length >= limits.maxPhotosPerPlace) {
      setError(`Limite atteinte : ${limits.maxPhotosPerPlace} photos maximum par établissement`)
      return
    }

    setUploadingImage(true)
    setError('')

    try {
      for (const file of Array.from(files)) {
        if (images.length >= limits.maxPhotosPerPlace) break
        
        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Les images doivent faire moins de 5MB')
          continue
        }

        // Upload vers Firebase Storage
        const timestamp = Date.now()
        const fileName = `${user?.uid}/${timestamp}_${file.name}`
        const storageRef = ref(firebaseStorage, `places/${fileName}`)
        
        const snapshot = await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(snapshot.ref)
        
        setImages(prev => [...prev, downloadURL])
        
        // Incrémenter l'usage du stockage (en MB)
        await quotaManager.incrementUsage(user!.uid, 'storage', file.size / (1024 * 1024))
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Erreur lors de l\'upload de l\'image')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setQuotaError('')

    if (!user) {
      setError('Vous devez être connecté')
      setLoading(false)
      return
    }

    // Vérifier les quotas
    const plan = user.plan || 'free'
    const canCreate = await quotaManager.canPerformAction(user.uid, plan as any, 'create_place')
    
    if (!canCreate.allowed) {
      setQuotaError(canCreate.reason || 'Limite atteinte')
      setLoading(false)
      return
    }

    try {
      // Créer le slug à partir du nom
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Créer l'établissement dans Firestore
      const placeData = {
        merchantId: user.uid,
        slug,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        address: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        openingHours: formData.openingHours,
        images,
        status: 'pending', // En attente de modération
        viewsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(firebaseDb, 'places'), placeData)
      
      // Incrémenter l'usage
      await quotaManager.incrementUsage(user.uid, 'place')
      
      // Redirection vers la liste des établissements
      router.push('/pro/places')
    } catch (error) {
      console.error('Error creating place:', error)
      setError('Erreur lors de la création de l\'établissement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/pro/places" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour aux établissements
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">
          Ajouter un établissement
        </h1>

        {/* Alerte de quota */}
        {quotaError && (
          <div className="mb-6">
            <QuotaAlert message={quotaError} type="error" />
            <div className="mt-3">
              <Link
                href="/pro/upgrade"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                Augmenter mes limites →
              </Link>
            </div>
          </div>
        )}

        {error && !quotaError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations générales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mon Restaurant"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez votre établissement..."
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <MapPin className="inline h-5 w-5 mr-2 text-gray-400" />
              Adresse
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse *
                </label>
                <input
                  type="text"
                  id="address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Rue de la République"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal *
                </label>
                <input
                  type="text"
                  id="postalCode"
                  required
                  pattern="[0-9]{5}"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="69001"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline h-4 w-4 mr-1 text-gray-400" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="04 78 00 00 00"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline h-4 w-4 mr-1 text-gray-400" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@monrestaurant.fr"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="inline h-4 w-4 mr-1 text-gray-400" />
                  Site web
                </label>
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.monrestaurant.fr"
                />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Photos
            </h2>
            
            <div className="space-y-4">
              {/* Images existantes */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage || images.length >= quotaManager.getPlanLimits((user?.plan || 'free') as any).maxPhotosPerPlace}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Ajouter des photos
                    </>
                  )}
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  {images.length} / {quotaManager.getPlanLimits((user?.plan || 'free') as any).maxPhotosPerPlace} photos
                  (max 5MB par photo)
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/pro/places"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading || !!quotaError}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Création...
                </span>
              ) : (
                'Créer l\'établissement'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}