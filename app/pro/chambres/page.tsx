'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Plus, Edit, Trash, Save, X, Bed, 
  Users, DollarSign, Wifi, Bath, Car, Coffee
} from 'lucide-react'
import { supabase } from '@/app/lib/supabase/client'

interface Room {
  id?: string
  name: string
  description: string
  price: number
  capacity: number
  amenities: string[]
  images?: string[]
}

export default function RoomsManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [establishment, setEstablishment] = useState<any>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingRoom, setEditingRoom] = useState<string | null>(null)

  const commonAmenities = [
    'Télévision', 'WiFi gratuit', 'Climatisation', 'Chauffage',
    'Salle de bain privée', 'Douche', 'Baignoire', 'Sèche-cheveux',
    'Coffre-fort', 'Minibar', 'Bureau', 'Balcon', 'Vue sur rue',
    'Vue sur cour', 'Accès handicapé', 'Lit double', 'Lits jumeaux',
    'Lit bébé possible', 'Canapé-lit'
  ]

  useEffect(() => {
    if (!user) {
      router.push('/auth/pro/connexion')
      return
    }
    loadEstablishmentData()
  }, [user])

  const loadEstablishmentData = async () => {
    if (!user || !supabase) return
    
    try {
      setLoading(true)
      
      let { data, error } = await supabase
        .from('establishments')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error && error.message?.includes('column')) {
        const result = await supabase
          .from('establishments')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle()
        data = result.data
        error = result.error
      }

      if (error || !data) {
        router.push('/pro/inscription')
        return
      }

      setEstablishment(data)
      
      // Charger les chambres existantes ou créer un array vide
      if (data.rooms && Array.isArray(data.rooms)) {
        setRooms(data.rooms)
      } else {
        setRooms([])
      }

    } catch (error) {
      console.error('Error loading establishment:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveRooms = async () => {
    if (!establishment || !supabase) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('establishments')
        .update({ 
          rooms: rooms,
          updated_at: new Date().toISOString()
        })
        .eq('id', establishment.id)

      if (error) throw error

      alert('Types de chambres sauvegardés avec succès!')
      
    } catch (error) {
      console.error('Error saving rooms:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const addRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: 'Nouveau type de chambre',
      description: '',
      price: 0,
      capacity: 2,
      amenities: []
    }
    setRooms([...rooms, newRoom])
    setEditingRoom(newRoom.id!)
  }

  const deleteRoom = (roomIndex: number) => {
    if (confirm('Supprimer ce type de chambre ?')) {
      setRooms(rooms.filter((_, i) => i !== roomIndex))
    }
  }

  const updateRoom = (roomIndex: number, updates: Partial<Room>) => {
    const updatedRooms = [...rooms]
    updatedRooms[roomIndex] = { ...updatedRooms[roomIndex], ...updates }
    setRooms(updatedRooms)
  }

  const toggleAmenity = (roomIndex: number, amenity: string) => {
    const room = rooms[roomIndex]
    const hasAmenity = room.amenities.includes(amenity)
    const updatedAmenities = hasAmenity
      ? room.amenities.filter(a => a !== amenity)
      : [...room.amenities, amenity]
    
    updateRoom(roomIndex, { amenities: updatedAmenities })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!establishment) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bed className="h-8 w-8 mr-3 text-blue-600" />
                Gestion des chambres
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez les types de chambres de {establishment.name}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addRoom}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau type
              </button>
              <button
                onClick={saveRooms}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Rooms List */}
        <div className="space-y-6">
          {rooms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Bed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun type de chambre</h3>
              <p className="text-gray-500 mb-6">Ajoutez vos premiers types de chambres</p>
              <button
                onClick={addRoom}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Créer mon premier type
              </button>
            </div>
          ) : (
            rooms.map((room, roomIndex) => (
              <div key={roomIndex} className="bg-white rounded-lg shadow-lg p-6">
                {editingRoom === room.id ? (
                  <RoomEditor
                    room={room}
                    roomIndex={roomIndex}
                    onUpdate={updateRoom}
                    onSave={() => setEditingRoom(null)}
                    onCancel={() => setEditingRoom(null)}
                    commonAmenities={commonAmenities}
                    toggleAmenity={toggleAmenity}
                  />
                ) : (
                  <RoomDisplay
                    room={room}
                    onEdit={() => setEditingRoom(room.id!)}
                    onDelete={() => deleteRoom(roomIndex)}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Composant pour éditer une chambre
function RoomEditor({
  room,
  roomIndex,
  onUpdate,
  onSave,
  onCancel,
  commonAmenities,
  toggleAmenity
}: {
  room: Room
  roomIndex: number
  onUpdate: (index: number, updates: Partial<Room>) => void
  onSave: () => void
  onCancel: () => void
  commonAmenities: string[]
  toggleAmenity: (roomIndex: number, amenity: string) => void
}) {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du type de chambre
          </label>
          <input
            type="text"
            value={room.name}
            onChange={(e) => onUpdate(roomIndex, { name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Chambre Double Standard"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix par nuit (€)
          </label>
          <input
            type="number"
            value={room.price}
            onChange={(e) => onUpdate(roomIndex, { price: parseFloat(e.target.value) || 0 })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            step="1"
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={room.description}
          onChange={(e) => onUpdate(roomIndex, { description: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Décrivez cette chambre..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Capacité (nombre de personnes)
        </label>
        <select
          value={room.capacity}
          onChange={(e) => onUpdate(roomIndex, { capacity: parseInt(e.target.value) })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>1 personne</option>
          <option value={2}>2 personnes</option>
          <option value={3}>3 personnes</option>
          <option value={4}>4 personnes</option>
          <option value={5}>5 personnes</option>
          <option value={6}>6 personnes</option>
        </select>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Équipements de la chambre
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {commonAmenities.map((amenity) => (
            <label key={amenity} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={room.amenities.includes(amenity)}
                onChange={() => toggleAmenity(roomIndex, amenity)}
                className="mr-2 rounded"
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          Annuler
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  )
}

// Composant pour afficher une chambre
function RoomDisplay({
  room,
  onEdit,
  onDelete
}: {
  room: Room
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
          <div className="flex items-center text-blue-600">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-sm">{room.capacity} pers.</span>
          </div>
          <div className="flex items-center text-green-600 font-semibold">
            <DollarSign className="h-4 w-4" />
            <span>{room.price}€/nuit</span>
          </div>
        </div>
        
        {room.description && (
          <p className="text-gray-600 mb-3">{room.description}</p>
        )}
        
        {room.amenities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Équipements :</h4>
            <div className="flex flex-wrap gap-1">
              {room.amenities.slice(0, 6).map((amenity, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 6 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{room.amenities.length - 6} autres
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}