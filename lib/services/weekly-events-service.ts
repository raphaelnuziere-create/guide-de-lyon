import { supabase } from '@/lib/supabase';

export interface WeeklyEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  category?: string;
  price?: string;
  event_url?: string;
  image_url?: string;
  organizer?: string;
}

export interface WeeklyEventsData {
  events: WeeklyEvent[];
  weekStartDate: string;
  weekEndDate: string;
  eventsCount: number;
}

/**
 * Récupère les événements de la semaine depuis Supabase
 */
export async function getWeeklyEvents(): Promise<WeeklyEventsData> {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }

  // Calculer les dates de début et fin de semaine (lundi à dimanche)
  const today = new Date();
  const currentDay = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
  
  // Calculer le lundi de la semaine courante
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);
  
  // Calculer le dimanche de la semaine courante
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        location,
        start_date,
        end_date,
        start_time,
        end_time,
        category,
        price,
        event_url,
        image_url,
        organizer
      `)
      .gte('start_date', weekStart.toISOString().split('T')[0])
      .lte('start_date', weekEnd.toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Erreur récupération événements:', error);
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    return {
      events: events || [],
      weekStartDate: formatDate(weekStart),
      weekEndDate: formatDate(weekEnd),
      eventsCount: events?.length || 0
    };

  } catch (error) {
    console.error('Erreur service événements hebdomadaires:', error);
    throw error;
  }
}

/**
 * Prépare les données pour le template email
 */
export function prepareEmailData(weeklyData: WeeklyEventsData) {
  const { events, weekStartDate, weekEndDate, eventsCount } = weeklyData;

  const formattedEvents = events.map(event => {
    const eventDate = new Date(event.start_date);
    
    return {
      ...event,
      day_name: formatDayName(eventDate),
      day_number: eventDate.getDate().toString(),
      month_name: formatMonthName(eventDate),
      time: event.start_time ? formatTime(event.start_time) : null,
      description: event.description || ''
    };
  });

  return {
    events: formattedEvents,
    events_count: eventsCount,
    week_start_date: weekStartDate,
    week_end_date: weekEndDate,
    has_events: eventsCount > 0
  };
}

/**
 * Formate une date au format français
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long'
  });
}

/**
 * Formate le nom du jour en français
 */
function formatDayName(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short'
  }).toUpperCase();
}

/**
 * Formate le nom du mois en français
 */
function formatMonthName(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    month: 'short'
  }).toUpperCase();
}

/**
 * Formate l'heure (HH:MM)
 */
function formatTime(time: string): string {
  try {
    const [hours, minutes] = time.split(':');
    return `${hours}h${minutes !== '00' ? minutes : ''}`;
  } catch {
    return time;
  }
}

/**
 * Tronque un texte à une longueur donnée
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Récupère la liste des abonnés à la newsletter
 */
export async function getNewsletterSubscribers(): Promise<string[]> {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }

  try {
    // Récupérer tous les utilisateurs qui ont accepté de recevoir la newsletter
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('is_active', true)
      .eq('weekly_events', true);

    if (error) {
      console.error('Erreur récupération abonnés:', error);
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    return subscribers?.map(sub => sub.email) || [];

  } catch (error) {
    console.error('Erreur service abonnés newsletter:', error);
    throw error;
  }
}

/**
 * Vérifie si c'est dimanche (jour d'envoi)
 */
export function isSunday(): boolean {
  const today = new Date();
  return today.getDay() === 0; // 0 = dimanche
}

/**
 * Vérifie si c'est l'heure d'envoi (par exemple 9h du matin)
 */
export function isSendTime(targetHour: number = 9): boolean {
  const now = new Date();
  return now.getHours() === targetHour;
}