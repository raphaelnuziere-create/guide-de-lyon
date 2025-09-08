'use client';

import { useState } from 'react';
import { Clock, Plus, Trash2, Copy, X } from 'lucide-react';

interface TimeSlot {
  open: string;
  close: string;
}

interface OpeningHoursData {
  [key: string]: TimeSlot[] | null;
}

const DAYS = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
];

export function OpeningHours({ 
  initialHours = {}, 
  onSave,
  readOnly = false 
}: { 
  initialHours?: OpeningHoursData;
  onSave: (hours: OpeningHoursData) => void;
  readOnly?: boolean;
}) {
  const [hours, setHours] = useState<OpeningHoursData>(initialHours);
  const [specialClosures, setSpecialClosures] = useState<string[]>([]);
  const [newClosure, setNewClosure] = useState('');

  const toggleDay = (day: string) => {
    if (readOnly) return;
    
    if (hours[day]) {
      const newHours = { ...hours };
      delete newHours[day];
      setHours(newHours);
    } else {
      setHours({
        ...hours,
        [day]: [{ open: '09:00', close: '18:00' }]
      });
    }
  };

  const updateTimeSlot = (day: string, index: number, field: 'open' | 'close', value: string) => {
    if (readOnly) return;
    
    const daySlots = hours[day] || [];
    const newSlots = [...daySlots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setHours({ ...hours, [day]: newSlots });
  };

  const addTimeSlot = (day: string) => {
    if (readOnly) return;
    
    const daySlots = hours[day] || [];
    setHours({
      ...hours,
      [day]: [...daySlots, { open: '14:00', close: '18:00' }]
    });
  };

  const removeTimeSlot = (day: string, index: number) => {
    if (readOnly) return;
    
    const daySlots = hours[day] || [];
    const newSlots = daySlots.filter((_, i) => i !== index);
    if (newSlots.length === 0) {
      toggleDay(day);
    } else {
      setHours({ ...hours, [day]: newSlots });
    }
  };

  const copyToAllDays = (sourceDay: string) => {
    if (readOnly) return;
    
    const sourceHours = hours[sourceDay];
    if (!sourceHours) return;

    const newHours: OpeningHoursData = {};
    DAYS.forEach(({ key }) => {
      newHours[key] = JSON.parse(JSON.stringify(sourceHours));
    });
    setHours(newHours);
  };

  const addSpecialClosure = () => {
    if (readOnly || !newClosure) return;
    
    setSpecialClosures([...specialClosures, newClosure]);
    setNewClosure('');
  };

  const removeSpecialClosure = (index: number) => {
    if (readOnly) return;
    
    setSpecialClosures(specialClosures.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horaires d'ouverture
        </h3>
        {!readOnly && (
          <button 
            onClick={() => onSave(hours)} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sauvegarder
          </button>
        )}
      </div>

      {DAYS.map(({ key, label }) => (
        <div key={key} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!hours[key]}
                  onChange={() => toggleDay(key)}
                  disabled={readOnly}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className="font-medium">{label}</span>
            </div>
            
            {!readOnly && hours[key] && hours[key]!.length === 1 && (
              <button
                onClick={() => copyToAllDays(key)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                Copier à tous les jours
              </button>
            )}
          </div>

          {hours[key] && (
            <div className="space-y-2 ml-12">
              {hours[key]!.map((slot, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={slot.open}
                    onChange={(e) => updateTimeSlot(key, index, 'open', e.target.value)}
                    disabled={readOnly}
                    className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span>à</span>
                  <input
                    type="time"
                    value={slot.close}
                    onChange={(e) => updateTimeSlot(key, index, 'close', e.target.value)}
                    disabled={readOnly}
                    className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {!readOnly && hours[key]!.length > 1 && (
                    <button
                      onClick={() => removeTimeSlot(key, index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              
              {!readOnly && (
                <button
                  onClick={() => addTimeSlot(key)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un créneau
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Fermetures exceptionnelles */}
      <div className="border-t pt-4 mt-6">
        <h4 className="font-medium mb-3">Fermetures exceptionnelles</h4>
        
        {specialClosures.length > 0 && (
          <div className="space-y-2 mb-3">
            {specialClosures.map((closure, index) => (
              <div key={index} className="flex items-center justify-between bg-orange-50 p-2 rounded">
                <span className="text-sm">{closure}</span>
                {!readOnly && (
                  <button
                    onClick={() => removeSpecialClosure(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {!readOnly && (
          <div className="flex gap-2">
            <input
              type="date"
              value={newClosure}
              onChange={(e) => setNewClosure(e.target.value)}
              className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addSpecialClosure}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}