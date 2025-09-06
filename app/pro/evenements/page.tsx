'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Home,
  Mail,
  Share2,
  Lock,
  AlertCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/app/lib/supabase/client';
import { EstablishmentService } from '@/app/lib/services/establishmentService';

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location?: string;
  image_url?: string;
  status: 'draft' | 'published' | 'cancelled';
  show_on_establishment_page: boolean;
  show_on_homepage: boolean;
  show_in_newsletter: boolean;
  show_on_social: boolean;
  created_at: string;
}

export default function EvenementsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [establishment, setEstablishment] = useState<any>(null);
  const [eventsRemaining, setEventsRemaining] = useState(0);
  const [planLimits, setPlanLimits] = useState<any>(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/pro/connexion');
        return;
      }

      // Charger l'établissement
      const establishmentData = await EstablishmentService.getEstablishment(user.id);
      if (!establishmentData) {
        router.push('/pro/inscription');
        return;
      }

      setEstablishment(establishmentData);

      // Charger les limites du plan
      const limits = await EstablishmentService.getPlanLimits(establishmentData.plan);
      setPlanLimits(limits);
      
      // Calculer les événements restants
      const remaining = EstablishmentService.getEventsRemaining(establishmentData);
      setEventsRemaining(remaining);

      // Charger les événements
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .eq('establishment_id', establishmentData.id)
        .order('start_date', { ascending: false });

      if (!error && eventsData) {
        setEvents(eventsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const toggleEventStatus = async (eventId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    const { error } = await supabase
      .from('events')
      .update({ status: newStatus })
      .eq('id', eventId);

    if (!error) {
      setEvents(events.map(e => 
        e.id === eventId ? { ...e, status: newStatus } : e
      ));
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (!error) {
      setEvents(events.filter(e => e.id !== eventId));
      // Recharger les données pour mettre à jour le compteur
      checkAuthAndLoadData();
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const canAddEvent = eventsRemaining > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/pro/dashboard" 
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Gestion des événements
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {eventsRemaining}/{planLimits?.max_events || 3} événements restants ce mois
              </span>
              {canAddEvent ? (
                <Link
                  href="/pro/evenements/nouveau"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nouvel événement
                </Link>
              ) : (
                <div className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Limite atteinte
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerte si limite atteinte */}
        {!canAddEvent && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-900">Limite d'événements atteinte</h3>
              <p className="text-sm text-amber-800 mt-1">
                Vous avez atteint votre limite mensuelle. Les compteurs sont réinitialisés le 1er de chaque mois.
              </p>
              {establishment?.plan !== 'expert' && (
                <Link
                  href="/pro/abonnement"
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-900 hover:text-amber-700 mt-2"
                >
                  Passer au plan Expert pour plus d'événements
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Liste des événements */}
        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun événement créé
            </h2>
            <p className="text-gray-600 mb-6">
              Créez votre premier événement pour attirer plus de clients
            </p>
            {canAddEvent && (
              <Link
                href="/pro/evenements/nouveau"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
              >
                <Plus className="h-5 w-5" />
                Créer un événement
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {event.title}
                      </h3>
                      <span className={`
                        px-2 py-1 text-xs font-medium rounded-full
                        ${event.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : event.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                        }
                      `}>
                        {event.status === 'published' ? 'Publié' : 
                         event.status === 'cancelled' ? 'Annulé' : 'Brouillon'}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(event.start_date)}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                      )}
                    </div>

                    {/* Canaux de diffusion */}
                    <div className="flex flex-wrap gap-2">
                      {event.show_on_establishment_page && (
                        <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          <Home className="h-3 w-3" />
                          Page établissement
                        </span>
                      )}
                      {event.show_on_homepage && (
                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          planLimits?.can_show_homepage 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-gray-50 text-gray-400'
                        }`}>
                          {planLimits?.can_show_homepage ? (
                            <>
                              <Sparkles className="h-3 w-3" />
                              Page d'accueil
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              Page d'accueil (Pro+)
                            </>
                          )}
                        </span>
                      )}
                      {event.show_in_newsletter && (
                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          planLimits?.can_show_newsletter 
                            ? 'bg-purple-50 text-purple-700' 
                            : 'bg-gray-50 text-gray-400'
                        }`}>
                          {planLimits?.can_show_newsletter ? (
                            <>
                              <Mail className="h-3 w-3" />
                              Newsletter
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              Newsletter (Pro+)
                            </>
                          )}
                        </span>
                      )}
                      {event.show_on_social && (
                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          planLimits?.can_show_social 
                            ? 'bg-pink-50 text-pink-700' 
                            : 'bg-gray-50 text-gray-400'
                        }`}>
                          {planLimits?.can_show_social ? (
                            <>
                              <Share2 className="h-3 w-3" />
                              Réseaux sociaux
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3" />
                              Réseaux sociaux (Expert)
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleEventStatus(event.id, event.status)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                      title={event.status === 'published' ? 'Dépublier' : 'Publier'}
                    >
                      {event.status === 'published' ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <Link
                      href={`/pro/evenements/${event.id}/modifier`}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}