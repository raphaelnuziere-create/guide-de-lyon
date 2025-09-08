'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Plus, Edit, Trash, Save, X, ChefHat, 
  Utensils, DollarSign, Leaf, AlertTriangle 
} from 'lucide-react'
import { supabase } from '@/app/lib/supabase/client'

interface MenuItem {
  id?: string
  name: string
  description?: string
  price?: number
  isVegetarian?: boolean
  isVegan?: boolean
  allergens?: string[]
}

interface MenuSection {
  id?: string
  name: string
  description?: string
  items: MenuItem[]
}

export default function MenuManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [establishment, setEstablishment] = useState<any>(null)
  const [menu, setMenu] = useState<MenuSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)

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
      
      // Charger le menu existant ou créer un menu vide
      if (data.menu && Array.isArray(data.menu)) {
        setMenu(data.menu)
      } else {
        setMenu([])
      }

    } catch (error) {
      console.error('Error loading establishment:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveMenu = async () => {
    if (!establishment || !supabase) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('establishments')
        .update({ 
          menu: menu,
          updated_at: new Date().toISOString()
        })
        .eq('id', establishment.id)

      if (error) throw error

      alert('Menu sauvegardé avec succès!')
      
    } catch (error) {
      console.error('Error saving menu:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const addSection = () => {
    const newSection: MenuSection = {
      id: `section-${Date.now()}`,
      name: 'Nouvelle section',
      description: '',
      items: []
    }
    setMenu([...menu, newSection])
    setEditingSection(newSection.id!)
  }

  const deleteSection = (sectionIndex: number) => {
    if (confirm('Supprimer cette section du menu ?')) {
      setMenu(menu.filter((_, i) => i !== sectionIndex))
    }
  }

  const updateSection = (sectionIndex: number, updates: Partial<MenuSection>) => {
    const updatedMenu = [...menu]
    updatedMenu[sectionIndex] = { ...updatedMenu[sectionIndex], ...updates }
    setMenu(updatedMenu)
  }

  const addItem = (sectionIndex: number) => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: 'Nouveau plat',
      description: '',
      price: 0,
      isVegetarian: false,
      isVegan: false,
      allergens: []
    }
    const updatedMenu = [...menu]
    updatedMenu[sectionIndex].items.push(newItem)
    setMenu(updatedMenu)
    setEditingItem(newItem.id!)
  }

  const deleteItem = (sectionIndex: number, itemIndex: number) => {
    if (confirm('Supprimer ce plat ?')) {
      const updatedMenu = [...menu]
      updatedMenu[sectionIndex].items.splice(itemIndex, 1)
      setMenu(updatedMenu)
    }
  }

  const updateItem = (sectionIndex: number, itemIndex: number, updates: Partial<MenuItem>) => {
    const updatedMenu = [...menu]
    updatedMenu[sectionIndex].items[itemIndex] = {
      ...updatedMenu[sectionIndex].items[itemIndex],
      ...updates
    }
    setMenu(updatedMenu)
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
                <ChefHat className="h-8 w-8 mr-3 text-blue-600" />
                Gestion du menu
              </h1>
              <p className="text-gray-600 mt-2">
                Gérez le menu de {establishment.name}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addSection}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une section
              </button>
              <button
                onClick={saveMenu}
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

        {/* Menu Sections */}
        <div className="space-y-8">
          {menu.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune section de menu</h3>
              <p className="text-gray-500 mb-6">Commencez par ajouter une section à votre menu</p>
              <button
                onClick={addSection}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Créer ma première section
              </button>
            </div>
          ) : (
            menu.map((section, sectionIndex) => (
              <div key={sectionIndex} className="bg-white rounded-lg shadow-lg p-6">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                  {editingSection === section.id ? (
                    <div className="flex-1 mr-4">
                      <input
                        type="text"
                        value={section.name}
                        onChange={(e) => updateSection(sectionIndex, { name: e.target.value })}
                        className="text-xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                        placeholder="Nom de la section"
                        autoFocus
                      />
                      <textarea
                        value={section.description}
                        onChange={(e) => updateSection(sectionIndex, { description: e.target.value })}
                        className="w-full mt-2 p-2 border border-gray-200 rounded"
                        placeholder="Description de la section (optionnel)"
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">{section.name}</h2>
                      {section.description && (
                        <p className="text-gray-600 mt-1">{section.description}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {editingSection === section.id ? (
                      <button
                        onClick={() => setEditingSection(null)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingSection(section.id!)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteSection(sectionIndex)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="border border-gray-200 rounded-lg p-4">
                      {editingItem === item.id ? (
                        <MenuItemEditor
                          item={item}
                          onUpdate={(updates) => updateItem(sectionIndex, itemIndex, updates)}
                          onSave={() => setEditingItem(null)}
                          onCancel={() => setEditingItem(null)}
                        />
                      ) : (
                        <MenuItemDisplay
                          item={item}
                          onEdit={() => setEditingItem(item.id!)}
                          onDelete={() => deleteItem(sectionIndex, itemIndex)}
                        />
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={() => addItem(sectionIndex)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition"
                  >
                    <Plus className="h-5 w-5 mx-auto mb-1" />
                    Ajouter un plat
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Composant pour éditer un plat
function MenuItemEditor({ 
  item, 
  onUpdate, 
  onSave, 
  onCancel 
}: { 
  item: MenuItem
  onUpdate: (updates: Partial<MenuItem>) => void
  onSave: () => void
  onCancel: () => void 
}) {
  const [allergenInput, setAllergenInput] = useState('')

  const addAllergen = () => {
    if (allergenInput.trim() && !item.allergens?.includes(allergenInput.trim())) {
      onUpdate({
        allergens: [...(item.allergens || []), allergenInput.trim()]
      })
      setAllergenInput('')
    }
  }

  const removeAllergen = (allergen: string) => {
    onUpdate({
      allergens: item.allergens?.filter(a => a !== allergen)
    })
  }

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <input
            type="text"
            value={item.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full text-lg font-semibold border-b-2 border-blue-500 bg-transparent focus:outline-none"
            placeholder="Nom du plat"
          />
          <textarea
            value={item.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full mt-2 p-2 border border-gray-200 rounded"
            placeholder="Description du plat"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Prix (€)</label>
          <input
            type="number"
            value={item.price}
            onChange={(e) => onUpdate({ price: parseFloat(e.target.value) || 0 })}
            className="w-full p-2 border border-gray-200 rounded"
            step="0.50"
            min="0"
          />
        </div>
      </div>

      {/* Dietary Options */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={item.isVegetarian}
            onChange={(e) => onUpdate({ isVegetarian: e.target.checked })}
            className="mr-2"
          />
          <Leaf className="h-4 w-4 text-green-600 mr-1" />
          Végétarien
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={item.isVegan}
            onChange={(e) => onUpdate({ isVegan: e.target.checked })}
            className="mr-2"
          />
          <Leaf className="h-4 w-4 text-green-700 mr-1" />
          Végan
        </label>
      </div>

      {/* Allergens */}
      <div>
        <label className="block text-sm text-gray-600 mb-2">Allergènes</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {item.allergens?.map((allergen, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
              {allergen}
              <button
                onClick={() => removeAllergen(allergen)}
                className="ml-1 text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={allergenInput}
            onChange={(e) => setAllergenInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAllergen()}
            className="flex-1 p-2 border border-gray-200 rounded text-sm"
            placeholder="Ajouter un allergène"
          />
          <button
            onClick={addAllergen}
            className="px-3 py-2 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          Annuler
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  )
}

// Composant pour afficher un plat
function MenuItemDisplay({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: MenuItem
  onEdit: () => void
  onDelete: () => void 
}) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          {item.isVegetarian && <Leaf className="h-4 w-4 text-green-600" title="Végétarien" />}
          {item.isVegan && <Leaf className="h-4 w-4 text-green-700" title="Végan" />}
        </div>
        {item.description && (
          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
        )}
        {item.allergens && item.allergens.length > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-xs text-red-600">
              Allergènes: {item.allergens.join(', ')}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 ml-4">
        {item.price && (
          <span className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign className="h-4 w-4" />
            {item.price.toFixed(2)}€
          </span>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:bg-red-100 rounded"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}