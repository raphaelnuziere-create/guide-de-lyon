'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Euro,
  Users,
  ArrowRight,
  Crown,
  Shield,
  Sparkles
} from 'lucide-react';
import { EventsService, type Event } from '@/lib/services/events-service';

interface EventsSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewAll?: boolean;
  visibility?: 'homepage' | 'newsletter';
}

export default function EventsSection({
  title = "Événements à Lyon",
  subtitle = "Découvrez les prochains événements des établissements lyonnais",
  limit = 6,
  showViewAll = true,
  visibility = 'homepage'
}: EventsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [visibility, limit]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await EventsService.getEventsByVisibility(visibility, limit);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (timeString?: string) => {
    return EventsService.formatEventTime(timeString);
  };

  const getPlanBadge = (plan?: string) => {
    switch (plan) {
      case 'expert':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-amber-500 text-white">
            <Crown className="w-3 h-3 mr-1" />
            EXPERT
          </span>
        );
      case 'pro':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
            <Shield className="w-3 h-3 mr-1" />
            PRO
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return null; // Ne rien afficher si pas d'événements
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
          {visibility === 'newsletter' && (
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800">
                <Sparkles className="w-4 h-4 mr-2" />
                Événements premium des membres Expert
              </span>
            </div>
          )}
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <article key={event.id} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Image */}
              {event.image_url ? (
                <div className="relative h-48 w-full bg-gray-200">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Plan badge */}
                  <div className="absolute top-3 right-3">
                    {getPlanBadge(event.establishment_plan)}
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center relative">
                  <Calendar className="w-16 h-16 text-white opacity-50" />
                  <div className="absolute top-3 right-3">
                    {getPlanBadge(event.establishment_plan)}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {/* Date et heure */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(event.start_date)}
                  </div>
                  {event.start_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(event.start_time)}
                    </div>
                  )}
                </div>

                {/* Titre */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                  {event.title}
                </h3>

                {/* Description */}
                {event.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                    {event.description}
                  </p>
                )}

                {/* Établissement */}
                <div className="mb-4">
                  <Link 
                    href={`/etablissement/${event.establishment_slug}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    {event.establishment_name}
                  </Link>
                </div>

                {/* Détails pratiques */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </div>
                  )}
                  
                  {event.price && (
                    <div className="flex items-center gap-1">
                      <Euro className="w-3 h-3" />
                      {event.price}€
                    </div>
                  )}
                  
                  {event.capacity && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {event.capacity} places
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xs text-gray-400">
                    {event.visibility === 'newsletter' ? 'Premium' : 
                     event.visibility === 'homepage' ? 'Mis en avant' : 'Standard'}
                  </div>
                  
                  <Link
                    href={`/etablissement/${event.establishment_slug}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    Voir l'établissement
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        {showViewAll && events.length >= limit && (
          <div className="text-center mt-12">
            <Link
              href="/evenements"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Voir tous les événements
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* CTA pour les établissements */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Vous organisez des événements ?
          </h3>
          <p className="text-gray-600 mb-6">
            Rejoignez le Guide de Lyon pour faire connaître vos événements auprès de milliers de Lyonnais
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/pro/signup"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Créer mon compte pro
            </Link>
            <div className="text-sm text-gray-500">
              • Plan Basic gratuit • Visibilité immédiate • Support inclus
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}