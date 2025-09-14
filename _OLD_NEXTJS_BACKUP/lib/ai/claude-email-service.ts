/**
 * Service Claude optimisé pour génération d'emails transactionnels
 * Utilise Claude 3 Haiku (modèle économique) pour les templates
 */

import Anthropic from '@anthropic-ai/sdk';

interface EmailGenerationOptions {
  eventType: string;
  userPlan: string;
  variables: Record<string, any>;
  templatePrompt?: string;
}

interface GeneratedEmail {
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  confidence: number;
}

export class ClaudeEmailService {
  private claude: Anthropic;
  private model: string;
  private isTestMode: boolean;

  constructor() {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY not configured');
    }

    this.claude = new Anthropic({
      apiKey: apiKey
    });
    
    // Utiliser Haiku pour économiser les coûts
    this.model = process.env.EMAIL_AI_MODEL || 'claude-3-haiku-20240307';
    this.isTestMode = process.env.EMAIL_TEST_MODE === 'true';
    
    console.log(`[Claude Email Service] Initialized with model: ${this.model}, Test mode: ${this.isTestMode}`);
  }

  /**
   * Génère un email transactionnel avec Claude (usage économique)
   */
  async generateTransactionalEmail(options: EmailGenerationOptions): Promise<GeneratedEmail | null> {
    try {
      const prompt = this.buildPrompt(options);
      
      console.log(`[Claude Email] Generating email for event: ${options.eventType}, plan: ${options.userPlan}`);
      
      const message = await this.claude.messages.create({
        model: this.model,
        max_tokens: 2000, // Limité pour économiser
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const result = this.parseClaudeResponse(content.text);
      
      console.log(`[Claude Email] Generated successfully for ${options.eventType}. Confidence: ${result.confidence}`);
      
      return result;
    } catch (error) {
      console.error('[Claude Email] Generation failed:', error);
      return null;
    }
  }

  /**
   * Construit le prompt optimisé pour Claude Haiku
   */
  private buildPrompt(options: EmailGenerationOptions): string {
    const { eventType, userPlan, variables, templatePrompt } = options;
    
    // Prompts spécifiques par type d'événement
    const eventPrompts = {
      'plan_upgrade': `Rédige un email de félicitations pour une entreprise lyonnaise qui vient de passer au forfait ${userPlan} sur Guide de Lyon. Ton chaleureux mais professionnel.`,
      
      'plan_downgrade': `Rédige un email de rétention pour une entreprise qui vient de passer à un forfait inférieur. Ton compréhensif avec offre de retour.`,
      
      'event_created_free': `Email pour féliciter une entreprise qui vient de créer un événement. Forfait gratuit = visible sur page entreprise uniquement. Inciter gentiment à upgrader pour page d'accueil.`,
      
      'event_created_premium': `Email de félicitations pour entreprise Premium qui vient de créer un événement. Mettre en avant la visibilité page d'accueil + newsletter.`,
      
      'user_welcome': `Email de bienvenue pour nouvelle inscription pro sur Guide de Lyon. Ton accueillant, présenter les premières étapes.`,
      
      'payment_failed': `Email pour échec de paiement. Ton poli mais urgent, proposer solutions de règlement.`,
      
      'profile_incomplete': `Rappel amical pour compléter le profil entreprise. Expliquer les bénéfices d'un profil complet.`
    };

    const basePrompt = templatePrompt || eventPrompts[eventType as keyof typeof eventPrompts] || 
      `Rédige un email transactionnel pour l'événement: ${eventType}`;

    return `Tu es rédacteur pour Guide de Lyon, plateforme lyonnaise qui renaît après 16 ans.

${basePrompt}

CONTEXTE:
- Événement: ${eventType}
- Plan utilisateur: ${userPlan}
- Variables disponibles: ${Object.keys(variables).join(', ')}

CONTRAINTES:
- Style: Professionnel mais chaleureux, spécifique à Lyon
- Longueur: 150-300 mots maximum
- Structure: Salutation → Message principal → CTA → Signature
- Variables: Utiliser {{nom_entreprise}}, {{event_title}}, etc.
- CTA: Lien d'action clair
- Branding: Guide de Lyon, renaissance après 16 ans

FORMAT RÉPONSE (JSON strict):
{
  "subject": "Objet email max 60 caractères",
  "htmlContent": "HTML complet avec styles inline, design responsive",
  "textContent": "Version texte simple",
  "variables": ["variable1", "variable2"],
  "confidence": 0.85
}

IMPORTANT: 
- HTML avec styles inline uniquement
- Couleurs Guide de Lyon: #e74c3c (rouge), #3498db (bleu)
- Responsive design
- JSON valide uniquement, pas d'explication`;
  }

  /**
   * Parse la réponse de Claude et valide le format
   */
  private parseClaudeResponse(response: string): GeneratedEmail {
    try {
      // Nettoyer la réponse (enlever markdown si présent)
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      
      const parsed = JSON.parse(cleanResponse);
      
      // Validation des champs requis
      const required = ['subject', 'htmlContent', 'textContent', 'variables', 'confidence'];
      for (const field of required) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validation des limites
      if (parsed.subject.length > 80) {
        parsed.subject = parsed.subject.substring(0, 77) + '...';
      }

      if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
        parsed.confidence = 0.8; // Valeur par défaut
      }

      return {
        subject: parsed.subject,
        htmlContent: parsed.htmlContent,
        textContent: parsed.textContent,
        variables: Array.isArray(parsed.variables) ? parsed.variables : [],
        confidence: parsed.confidence
      };
    } catch (error) {
      console.error('[Claude Email] Response parsing failed:', error);
      
      // Fallback: template générique
      return {
        subject: 'Notification Guide de Lyon',
        htmlContent: this.getFallbackTemplate(),
        textContent: 'Nous vous confirmons que votre action sur Guide de Lyon a été prise en compte.',
        variables: ['nom_entreprise'],
        confidence: 0.1
      };
    }
  }

  /**
   * Template de secours en cas d'erreur IA
   */
  private getFallbackTemplate(): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Guide de Lyon</h1>
      </div>
      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
        <h2 style="color: #2c3e50;">Bonjour {{nom_entreprise}},</h2>
        <p>Nous vous confirmons que votre action sur Guide de Lyon a été prise en compte avec succès.</p>
        <p>Notre équipe reste à votre disposition pour toute question.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://www.guide-de-lyon.fr/pro/dashboard" style="display: inline-block; background: #e74c3c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">
            Accéder à mon dashboard
          </a>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 14px;">
          <strong>Guide de Lyon</strong><br>
          Votre partenaire lyonnais
        </div>
      </div>
    </div>`;
  }

  /**
   * Méthode pour tester la génération sans consommer de tokens
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test minimal avec très peu de tokens
      const message = await this.claude.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Réponds juste "OK" si tu me reçois.'
          }
        ]
      });

      const content = message.content[0];
      return content.type === 'text' && content.text.trim().toLowerCase().includes('ok');
    } catch (error) {
      console.error('[Claude Email] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Estimate du coût d'une génération
   */
  estimateTokenCost(prompt: string, expectedResponse: number = 500): number {
    // Claude 3 Haiku pricing approximatif
    const inputTokens = Math.ceil(prompt.length / 4); // Approximation
    const outputTokens = expectedResponse;
    
    // Prix approximatifs (à ajuster selon la tarification actuelle)
    const inputCostPer1000 = 0.00025; // $0.25/1K tokens
    const outputCostPer1000 = 0.00125; // $1.25/1K tokens
    
    const inputCost = (inputTokens / 1000) * inputCostPer1000;
    const outputCost = (outputTokens / 1000) * outputCostPer1000;
    
    return inputCost + outputCost;
  }
}

// Export singleton pour économiser les instances
export const claudeEmailService = new ClaudeEmailService();