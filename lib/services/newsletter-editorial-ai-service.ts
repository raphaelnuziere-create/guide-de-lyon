import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface EditorialContent {
  anecdote: {
    title: string;
    content: string;
    short_version: string;
    category: string;
  };
  tip: {
    content: string;
    category: string;
  };
  question: {
    content: string;
    type: string;
  };
  greeting: {
    content: string;
    tone: string;
  };
  weather_comment?: {
    content: string;
    mood: string;
  };
}

export interface PersonalizationContext {
  firstName?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  preferences: {
    events: boolean;
    news: boolean;
    articles: boolean;
    deals: boolean;
  };
  dayOfWeek: number; // 0-6
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  weather?: {
    condition: string;
    temperature: number;
    description: string;
  };
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

/**
 * Service principal pour générer du contenu éditorial personnalisé
 */
export class NewsletterEditorialAIService {
  
  private static editorialGuidelines: string = '';

  /**
   * Initialise le service avec les guidelines éditoriaux
   */
  private static async loadEditorialGuidelines(): Promise<string> {
    if (this.editorialGuidelines) return this.editorialGuidelines;
    
    try {
      const guidelinesPath = join(process.cwd(), 'content', 'newsletter-editorial-guidelines.md');
      this.editorialGuidelines = readFileSync(guidelinesPath, 'utf-8');
      return this.editorialGuidelines;
    } catch (error) {
      console.error('Erreur chargement guidelines éditoriaux:', error);
      return '';
    }
  }

  /**
   * Génère le contenu éditorial personnalisé pour une newsletter
   */
  static async generateEditorialContent(context: PersonalizationContext): Promise<EditorialContent> {
    const guidelines = await this.loadEditorialGuidelines();
    
    // Récupérer le contenu de base depuis la BDD
    const baseContent = await this.getBaseContentFromDB(context);
    
    // Générer le contenu personnalisé avec OpenAI
    const personalizedContent = await this.personalizeWithAI(baseContent, context, guidelines);
    
    // Mettre à jour les statistiques d'usage
    await this.updateUsageStats(baseContent);
    
    return personalizedContent;
  }

  /**
   * Récupère le contenu de base depuis la base de données
   */
  private static async getBaseContentFromDB(context: PersonalizationContext) {
    if (!supabase) throw new Error('Supabase not configured');

    try {
      // Récupérer une anecdote selon le jour de la semaine
      const { data: anecdote } = await supabase
        .rpc('get_daily_anecdote', { target_day: context.dayOfWeek });

      // Récupérer un conseil d'ami selon le contexte
      const { data: tip } = await supabase
        .rpc('get_friendly_tip', { tip_context: context.timeOfDay });

      // Récupérer une question engageante
      const { data: question } = await supabase
        .rpc('get_engagement_question', { question_context: context.frequency });

      // Récupérer une salutation contextuelle
      const { data: greeting } = await supabase
        .rpc('get_contextual_greeting', {
          target_time: context.timeOfDay,
          target_day: context.dayOfWeek,
          weather: context.weather?.condition
        });

      return {
        anecdote: anecdote?.[0] || null,
        tip: tip?.[0] || null,
        question: question?.[0] || null,
        greeting: greeting || null
      };
    } catch (error) {
      console.error('Erreur récupération contenu BDD:', error);
      return { anecdote: null, tip: null, question: null, greeting: null };
    }
  }

  /**
   * Personnalise le contenu avec OpenAI selon les guidelines
   */
  private static async personalizeWithAI(
    baseContent: any, 
    context: PersonalizationContext, 
    guidelines: string
  ): Promise<EditorialContent> {
    
    const systemPrompt = `
Tu es l'assistant éditorial de Guide de Lyon, chargé de personnaliser les newsletters avec un ton amical, sincère et authentique.

CONTEXTE UTILISATEUR:
- Prénom: ${context.firstName || 'ami(e)'}
- Fréquence: ${context.frequency}
- Jour: ${this.getDayName(context.dayOfWeek)}
- Saison: ${context.season}
- Moment: ${context.timeOfDay}
- Météo: ${context.weather ? `${context.weather.condition} (${context.weather.temperature}°C)` : 'inconnue'}

GUIDELINES ÉDITORIAUX:
${guidelines}

INSTRUCTIONS SPÉCIFIQUES:
1. TOUJOURS tutoyer et adopter un ton chaleureux d'ami lyonnais
2. Personnaliser avec le prénom quand disponible
3. Adapter au contexte météo/temporel
4. Garder l'authenticité et la passion pour Lyon
5. Inclure des émojis avec modération
6. Créer du lien social et de la complicité

Personnalise le contenu fourni en gardant l'essence mais en l'adaptant parfaitement au contexte.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `
Personnalise ce contenu pour la newsletter ${context.frequency} :

ANECDOTE DE BASE: ${baseContent.anecdote ? JSON.stringify(baseContent.anecdote) : 'Aucune anecdote disponible'}

CONSEIL DE BASE: ${baseContent.tip ? JSON.stringify(baseContent.tip) : 'Aucun conseil disponible'}

QUESTION DE BASE: ${baseContent.question ? JSON.stringify(baseContent.question) : 'Aucune question disponible'}

SALUTATION DE BASE: ${baseContent.greeting || 'Aucune salutation disponible'}

Retourne un JSON avec cette structure exacte :
{
  "anecdote": {
    "title": "Titre personnalisé",
    "content": "Contenu complet personnalisé avec ton amical",
    "short_version": "Version courte pour newsletter",
    "category": "catégorie"
  },
  "tip": {
    "content": "Conseil personnalisé avec ton d'ami",
    "category": "catégorie"
  },
  "question": {
    "content": "Question engageante personnalisée",
    "type": "type de question"
  },
  "greeting": {
    "content": "Salutation chaleureuse personnalisée avec prénom",
    "tone": "warm/playful/energetic"
  }
  ${context.weather ? ',\n  "weather_comment": {\n    "content": "Commentaire sur la météo lié à Lyon",\n    "mood": "joyeux/cocooning/energique"\n  }' : ''}
}
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('Pas de réponse d\'OpenAI');

      // Parser la réponse JSON
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '');
      const personalizedContent = JSON.parse(cleanResponse);

      return personalizedContent;

    } catch (error) {
      console.error('Erreur personnalisation OpenAI:', error);
      
      // Fallback avec contenu de base si erreur
      return this.createFallbackContent(baseContent, context);
    }
  }

  /**
   * Génère un contenu de fallback si OpenAI échoue
   */
  private static createFallbackContent(baseContent: any, context: PersonalizationContext): EditorialContent {
    const firstName = context.firstName || 'ami(e)';
    
    return {
      anecdote: {
        title: baseContent.anecdote?.title || 'Histoire lyonnaise',
        content: baseContent.anecdote?.content || 'Lyon regorge d\'histoires fascinantes !',
        short_version: baseContent.anecdote?.short_version || 'Lyon, ville d\'histoires !',
        category: baseContent.anecdote?.category || 'general'
      },
      tip: {
        content: baseContent.tip?.tip_text || `Petit conseil de Lyon pour ${firstName} : profite bien de ta journée ! 😊`,
        category: baseContent.tip?.category || 'general'
      },
      question: {
        content: baseContent.question?.question_text || `Alors ${firstName}, dis-moi ce qui te plaît le plus à Lyon ? 🤔`,
        type: baseContent.question?.question_type || 'preference'
      },
      greeting: {
        content: baseContent.greeting || `Salut ${firstName} ! 👋`,
        tone: 'warm'
      }
    };
  }

  /**
   * Met à jour les statistiques d'usage du contenu utilisé
   */
  private static async updateUsageStats(baseContent: any): Promise<void> {
    if (!supabase) return;

    try {
      const updates = [];

      if (baseContent.anecdote?.id) {
        updates.push(
          supabase
            .from('newsletter_editorial_content')
            .update({ 
              usage_count: supabase.sql`usage_count + 1`,
              last_used_at: new Date().toISOString()
            })
            .eq('id', baseContent.anecdote.id)
        );
      }

      if (baseContent.tip?.id) {
        updates.push(
          supabase
            .from('newsletter_friendly_tips')
            .update({ 
              usage_count: supabase.sql`usage_count + 1`,
              last_used_at: new Date().toISOString()
            })
            .eq('id', baseContent.tip.id)
        );
      }

      if (baseContent.question?.id) {
        updates.push(
          supabase
            .from('newsletter_engagement_questions')
            .update({ 
              usage_count: supabase.sql`usage_count + 1`,
              last_used_at: new Date().toISOString()
            })
            .eq('id', baseContent.question.id)
        );
      }

      await Promise.all(updates);
    } catch (error) {
      console.error('Erreur mise à jour statistiques:', error);
    }
  }

  /**
   * Génère une section météo personnalisée
   */
  static async generateWeatherSection(context: PersonalizationContext): Promise<string> {
    if (!context.weather) return '';

    const prompt = `
Génère un commentaire météo amical pour Lyon avec ces infos :
- Condition: ${context.weather.condition}
- Température: ${context.weather.temperature}°C
- Description: ${context.weather.description}

Ton : ami lyonnais chaleureux, 1-2 phrases max, avec émoji approprié.
Relie toujours la météo à des activités ou lieux lyonnais spécifiques.
Exemples de style attendu :
- "Il pleut ? Parfait pour découvrir ces super cafés cosy de la Presqu'île ! ☔"
- "Grand soleil sur Lyon ! Les terrasses des berges du Rhône t'attendent 😎"
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 150,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Erreur génération météo:', error);
      return '';
    }
  }

  /**
   * Génère une réflexion personnelle pour l'édito mensuel
   */
  static async generateMonthlyEditorial(
    month: string, 
    year: string, 
    context: PersonalizationContext
  ): Promise<string> {
    const guidelines = await this.loadEditorialGuidelines();
    
    const prompt = `
${guidelines}

Génère un édito personnel et authentique pour la newsletter mensuelle de Guide de Lyon.

CONTEXTE:
- Mois: ${month} ${year}
- Saison: ${context.season}
- Prénom lecteur: ${context.firstName || 'ami(e)'}

EXIGENCES:
1. Ton personnel et sincère (comme une lettre à un ami)
2. Réflexion sur Lyon, son évolution, ses enjeux du moment
3. Lien avec la saison/période
4. Entre 200-300 mots
5. Tutoiement obligatoire
6. Émojis avec modération
7. Finir par une ouverture/question

Structure suggérée :
- Salutation personnelle
- Réflexion sur Lyon ce mois-ci
- Observation personnelle/anecdote
- Ouverture vers l'avenir
- Question engageante

Écris comme si tu étais Emma, lyonnaise passionnée qui aime sa ville.
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Erreur génération édito mensuel:', error);
      return '';
    }
  }

  /**
   * Analyse et améliore les performances du contenu existant
   */
  static async analyzeContentPerformance(): Promise<void> {
    if (!supabase) return;

    try {
      // Récupérer les statistiques de performance
      const { data: stats } = await supabase
        .from('newsletter_sends')
        .select(`
          newsletter_content_id,
          opened_at,
          clicked_at,
          sent_at
        `)
        .not('newsletter_content_id', 'is', null);

      if (!stats) return;

      // Calculer les scores de performance
      const performanceScores = new Map();
      
      stats.forEach(stat => {
        const contentId = stat.newsletter_content_id;
        if (!performanceScores.has(contentId)) {
          performanceScores.set(contentId, { opens: 0, clicks: 0, sends: 0 });
        }
        
        const score = performanceScores.get(contentId);
        score.sends++;
        if (stat.opened_at) score.opens++;
        if (stat.clicked_at) score.clicks++;
      });

      // Mettre à jour les scores dans la BDD
      for (const [contentId, scores] of performanceScores) {
        const openRate = scores.opens / scores.sends;
        const clickRate = scores.clicks / scores.sends;
        const performanceScore = (openRate * 0.7 + clickRate * 0.3) * 10;

        await supabase
          .from('newsletter_editorial_content')
          .update({ performance_score: Math.round(performanceScore * 100) / 100 })
          .eq('id', contentId);
      }

    } catch (error) {
      console.error('Erreur analyse performance:', error);
    }
  }

  /**
   * Utilitaires
   */
  private static getDayName(dayOfWeek: number): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[dayOfWeek] || 'Inconnu';
  }

  private static getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }

  /**
   * Génère un contexte de personnalisation automatique
   */
  static createPersonalizationContext(
    subscriber: any,
    weather?: any
  ): PersonalizationContext {
    const now = new Date();
    
    return {
      firstName: subscriber.first_name,
      frequency: subscriber.daily_frequency ? 'daily' : 
                subscriber.weekly_frequency ? 'weekly' : 'monthly',
      preferences: {
        events: subscriber.wants_events || false,
        news: subscriber.wants_news || false,
        articles: subscriber.wants_articles || false,
        deals: subscriber.wants_deals || false,
      },
      dayOfWeek: now.getDay(),
      season: this.getCurrentSeason(),
      weather: weather ? {
        condition: weather.condition,
        temperature: weather.temperature,
        description: weather.description
      } : undefined,
      timeOfDay: now.getHours() < 12 ? 'morning' : 
                 now.getHours() < 18 ? 'afternoon' : 'evening'
    };
  }
}