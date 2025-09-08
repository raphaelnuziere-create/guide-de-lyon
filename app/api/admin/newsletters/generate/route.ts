import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth/admin-auth';
import { NewsletterContentService } from '@/lib/services/newsletter-content-service';
import { FreeWeatherService } from '@/lib/services/free-weather-service';
import { NewsletterEditorialAIService, PersonalizationContext } from '@/lib/services/newsletter-editorial-ai-service';

/**
 * POST /api/admin/newsletters/generate
 * Génère une nouvelle newsletter (quotidienne ou hebdomadaire)
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const authError = requireAdmin(request);
    if (authError) return authError;

    const { type } = await request.json();

    if (!type || !['daily', 'weekly'].includes(type)) {
      return NextResponse.json(
        { error: 'Type invalide. Utilisez "daily" ou "weekly"' }, 
        { status: 400 }
      );
    }

    console.log(`🚀 Génération newsletter ${type}`);

    // 1. Récupérer le contenu selon le type
    let content, weather, subject, scheduledFor;

    if (type === 'daily') {
      // Newsletter quotidienne
      const [dailyContent, weatherData] = await Promise.all([
        NewsletterContentService.getDailyContent(),
        FreeWeatherService.getDailyDetailedWeather()
      ]);

      content = dailyContent;
      weather = weatherData;
      subject = `Aujourd'hui à Lyon - ${new Date().toLocaleDateString('fr-FR', { 
        weekday: 'long', day: 'numeric', month: 'long' 
      })}`;

      // Programmer pour demain matin 8h
      scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + 1);
      scheduledFor.setHours(8, 0, 0, 0);

    } else {
      // Newsletter hebdomadaire
      const [weeklyContent, weeklyWeather] = await Promise.all([
        NewsletterContentService.getWeeklyContent(),
        FreeWeatherService.getWeeklyForecast()
      ]);

      content = weeklyContent;
      weather = weeklyWeather;
      subject = `Cette semaine à Lyon - ${content.events?.length || 0} événements à découvrir`;

      // Programmer pour dimanche prochain 9h
      scheduledFor = new Date();
      const daysUntilSunday = (7 - scheduledFor.getDay()) % 7;
      scheduledFor.setDate(scheduledFor.getDate() + (daysUntilSunday || 7));
      scheduledFor.setHours(9, 0, 0, 0);
    }

    // 2. Générer le contenu éditorial personnalisé
    const personalizationContext: PersonalizationContext = {
      frequency: type,
      preferences: { events: true, news: true, articles: true, deals: false },
      dayOfWeek: new Date().getDay(),
      season: getCurrentSeason(),
      weather: weather?.periods?.[0] ? {
        condition: weather.periods[0].condition,
        temperature: weather.periods[0].temperature,
        description: weather.periods[0].description
      } : undefined,
      timeOfDay: 'morning'
    };

    const editorialContent = await NewsletterEditorialAIService.generateEditorialContent(personalizationContext);

    // 3. Récupérer le nombre d'abonnés pour ce type
    const subscribersCount = await getSubscribersCount(type);

    // 4. Créer un aperçu HTML
    const contentPreview = await generateContentPreview(content, editorialContent, weather, type);

    // 5. Sauvegarder en base avec statut "pending"
    const { data: newsletter, error } = await supabase
      .from('newsletter_queue')
      .insert({
        type,
        status: 'pending',
        subject,
        scheduled_for: scheduledFor.toISOString(),
        content: JSON.stringify(content),
        content_preview: contentPreview,
        editorial_content: JSON.stringify(editorialContent),
        weather_data: JSON.stringify(weather),
        subscribers_count: subscribersCount,
        events_count: content.events?.length || 0,
        news_count: content.news?.length || 0,
        created_by: 'admin', // Créé par admin
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur sauvegarde newsletter:', error);
      return NextResponse.json({ error: 'Erreur sauvegarde' }, { status: 500 });
    }

    console.log(`✅ Newsletter ${type} générée avec ID: ${newsletter.id}`);

    return NextResponse.json({
      success: true,
      newsletter: {
        id: newsletter.id,
        type: newsletter.type,
        subject: newsletter.subject,
        status: newsletter.status,
        scheduledFor: newsletter.scheduled_for,
        subscribersCount: newsletter.subscribers_count
      }
    });

  } catch (error) {
    console.error('Erreur génération newsletter:', error);
    return NextResponse.json(
      { error: 'Erreur interne', details: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * Récupère le nombre d'abonnés pour un type de newsletter
 */
async function getSubscribersCount(type: 'daily' | 'weekly'): Promise<number> {
  if (!supabase) return 0;

  try {
    const column = type === 'daily' ? 'daily_frequency' : 'weekly_frequency';
    
    const { count, error } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('verified_at', true)
      .eq(column, true);

    if (error) {
      console.error('Erreur comptage abonnés:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Exception comptage abonnés:', error);
    return 0;
  }
}

/**
 * Génère un aperçu HTML du contenu de la newsletter
 */
async function generateContentPreview(
  content: any, 
  editorialContent: any, 
  weather: any, 
  type: string
): Promise<string> {
  
  let preview = `<div style="font-family: Arial, sans-serif; max-width: 600px;">`;
  
  // Salutation
  if (editorialContent?.greeting) {
    preview += `<h2 style="color: #1f2937;">${editorialContent.greeting.content}</h2>`;
  }

  // Météo
  if (weather && type === 'daily') {
    preview += `<div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">`;
    preview += `<h3>Météo aujourd'hui</h3>`;
    if (weather.periods) {
      weather.periods.forEach((period: any) => {
        preview += `<p><strong>${period.time}:</strong> ${period.temperature}°C - ${period.description}</p>`;
      });
    }
    preview += `</div>`;
  }

  // Anecdote
  if (editorialContent?.anecdote) {
    preview += `<div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #f59e0b;">`;
    preview += `<h3 style="color: #92400e;">${editorialContent.anecdote.title}</h3>`;
    preview += `<p style="color: #451a03;">${editorialContent.anecdote.content}</p>`;
    preview += `</div>`;
  }

  // Événements
  if (content.events && content.events.length > 0) {
    preview += `<div style="background: #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0;">`;
    preview += `<h3 style="color: #92400e;">📅 Événements (${content.events.length})</h3>`;
    content.events.slice(0, 3).forEach((event: any) => {
      preview += `<div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px;">`;
      preview += `<h4 style="margin: 0 0 8px 0;">${event.title}</h4>`;
      if (event.location) preview += `<p style="margin: 0; color: #6b7280;">📍 ${event.location}</p>`;
      if (event.description) preview += `<p style="margin: 8px 0; color: #4b5563;">${event.description.substring(0, 100)}...</p>`;
      preview += `</div>`;
    });
    if (content.events.length > 3) {
      preview += `<p style="color: #6b7280;">... et ${content.events.length - 3} autres événements</p>`;
    }
    preview += `</div>`;
  }

  // Actualités
  if (content.news && content.news.length > 0) {
    preview += `<div style="background: #ecfeff; padding: 20px; border-radius: 12px; margin: 20px 0;">`;
    preview += `<h3 style="color: #0e7490;">📰 Actualités (${content.news.length})</h3>`;
    content.news.slice(0, 3).forEach((article: any) => {
      preview += `<div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px;">`;
      preview += `<h4 style="margin: 0 0 8px 0;">${article.title}</h4>`;
      if (article.excerpt) preview += `<p style="margin: 0; color: #4b5563;">${article.excerpt.substring(0, 120)}...</p>`;
      preview += `</div>`;
    });
    preview += `</div>`;
  }

  // Conseil
  if (editorialContent?.tip) {
    preview += `<div style="background: #ecfdf5; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #10b981;">`;
    preview += `<h3 style="color: #065f46;">💡 Conseil</h3>`;
    preview += `<p style="color: #064e3b;">${editorialContent.tip.content}</p>`;
    preview += `</div>`;
  }

  preview += `</div>`;
  
  return preview;
}

/**
 * Détermine la saison actuelle
 */
function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}