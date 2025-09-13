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
import { useAuth } from '@/lib/auth/AuthContext';
import { EstablishmentService } from '@/app/lib/services/establishmentService';
import { PhotoService, Photo } from '@/lib/services/photoService';
import { EventsService, type Event as EventType, type EventQuota } from '@/lib/services/events-service';

// Utilisation du type Event du service
type Event = EventType;

export default function EvenementsPage() {
  const router = useRouter();
  const { user, establishment, loading: authLoading, plan, planLimits } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [quota, setQuota] = useState<EventQuota | null>(null);
  const [establishmentPhotos, setEstablishmentPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (!authLoading) {
      checkAuthAndLoadData();
    }
  }, [authLoading]);

  const checkAuthAndLoadData = async () => {
    try {
      
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
      setEstablishmentId(establishmentData.id);

      // Charger les événements avec le nouveau service
      const eventsData = await EventsService.getEstablishmentEvents(establishmentData.id, true);
      setEvents(eventsData);

      // Charger les quotas
      const quotaData = await EventsService.checkEventQuota(establishmentData.id);
      setQuota(quotaData);

      // Charger les photos de l'établissement
      try {
        const photos = await PhotoService.getEstablishmentPhotos(establishmentData.id);
        setEstablishmentPhotos(photos);
      } catch (error) {
        console.error('Error loading establishment photos:', error);
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

    try {
      const success = await EventsService.deleteEvent(eventId);
      if (success) {
        setEvents(events.filter(e => e.id !== eventId));
        // Recharger les quotas
        if (establishmentId) {
          const quotaData = await EventsService.checkEventQuota(establishmentId);
          setQuota(quotaData);
        }
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (date: string) => {
    return EventsService.formatEventDate(date);
  };

  const getVisibilityInfo = (visibility: string) => {
    switch (visibility) {
      case 'newsletter':
        return { text: 'Newsletter + Homepage + Page établissement', color: 'text-yellow-600', icon: '🌟' };
      case 'homepage':
        return { text: 'Homepage + Page établissement', color: 'text-blue-600', icon: '🏠' };
      case 'establishment_only':
        return { text: 'Page établissement uniquement', color: 'text-gray-600', icon: '📄' };
      default:
        return { text: 'Non défini', color: 'text-gray-400', icon: '❓' };
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'expert':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            EXPERT
          </span>
        );
      case 'pro':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
            <Eye className="w-3 h-3 mr-1" />
            PRO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500 text-white">
            BASIC
          </span>
        );
    }
  };

  const getMainPhoto = () => {
    // Priorité : photo principale, sinon première photo
    const mainPhoto = establishmentPhotos.find(photo => photo.is_main);
    return mainPhoto || establishmentPhotos[0] || null;
  };

  if (loading || planLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const userPlan = plan || 'basic';
  const canAddEvent = quota?.can_create ?? false;

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
              {getPlanBadge(plan)}
              {quota && (
                <span className="text-sm text-gray-600">
                  {quota.events_used}/{quota.events_limit} événements utilisés ce mois
                </span>
              )}
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
        {/* Info quota et upgrade prompts */}
        {quota && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Quota d'événements ce mois
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold">
                    <span className={quota.events_used >= quota.events_limit ? 'text-red-600' : 'text-green-600'}>
                      {quota.events_used}
                    </span>
                    <span className="text-gray-400">/{quota.events_limit}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {quota.remaining > 0 ? (
                      <span className="flex items-center text-green-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {quota.remaining} événement{quota.remaining > 1 ? 's' : ''} restant{quota.remaining > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Quota atteint
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Upgrade prompt selon le plan */}
            {plan === 'basic' && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Plan Basic</strong> : Vos événements sont visibles uniquement sur votre page d'établissement
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Passez au plan Pro pour apparaître sur la page d'accueil !
                    </p>
                  </div>
                  <Link
                    href="/pro/upgrade"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    Passer Pro
                  </Link>
                </div>
              </div>
            )}
            
            {plan === 'pro' && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Plan Pro</strong> : Vos événements apparaissent sur la homepage
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Passez au plan Expert pour 6 événements/mois + newsletter !
                    </p>
                  </div>
                  <Link
                    href="/pro/upgrade"
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition"
                  >
                    Passer Expert
                  </Link>
                </div>
              </div>
            )}
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
            {events.map((event) => {
              const mainPhoto = getMainPhoto();
              return (
                <div key={event.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    {/* Photo de l'établissement */}
                    {mainPhoto && (
                      <div className="w-24 h-16 mr-4 flex-shrink-0">
                        <img
                          src={mainPhoto.url}
                          alt={mainPhoto.caption || 'Photo établissement'}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}