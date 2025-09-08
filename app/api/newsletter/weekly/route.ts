import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyEvents, prepareEmailData, getNewsletterSubscribers, truncateText } from '@/lib/services/weekly-events-service';
import fs from 'fs';
import path from 'path';

// Configuration Brevo
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

interface EmailData {
  events: any[];
  events_count: number;
  week_start_date: string;
  week_end_date: string;
  has_events: boolean;
}

/**
 * Compile le template HTML avec les données
 */
function compileTemplate(templateHtml: string, data: EmailData): string {
  let compiled = templateHtml;
  
  // Remplacer les variables simples
  compiled = compiled.replace(/{{events_count}}/g, data.events_count.toString());
  compiled = compiled.replace(/{{week_start_date}}/g, data.week_start_date);
  compiled = compiled.replace(/{{week_end_date}}/g, data.week_end_date);
  
  // Gérer la logique conditionnelle pour les événements
  if (data.has_events && data.events.length > 0) {
    // Construire le HTML des événements
    const eventsHtml = data.events.map(event => `
      <div class="event-card" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin-bottom: 25px; overflow: hidden;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="vertical-align: top; width: 100px;">
              <div class="date-box" style="background-color: #ef4444; color: white; border-radius: 8px; padding: 15px; text-align: center; margin-right: 20px; min-width: 80px;">
                <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px;">
                  ${event.day_name}
                </div>
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 2px;">
                  ${event.day_number}
                </div>
                <div style="font-size: 12px; text-transform: uppercase;">
                  ${event.month_name}
                </div>
              </div>
            </td>
            <td style="vertical-align: top; padding-left: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px; font-weight: bold; line-height: 1.3;">
                ${event.title}
              </h3>
              
              ${event.location ? `
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="color: #6b7280; font-size: 14px; margin-right: 5px;">📍</span>
                  <span style="color: #6b7280; font-size: 14px;">${event.location}</span>
                </div>
              ` : ''}
              
              ${event.time ? `
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                  <span style="color: #6b7280; font-size: 14px; margin-right: 5px;">🕐</span>
                  <span style="color: #6b7280; font-size: 14px;">${event.time}</span>
                </div>
              ` : ''}
              
              ${event.category ? `
                <div style="margin-bottom: 12px;">
                  <span style="background-color: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ${event.category}
                  </span>
                </div>
              ` : ''}
              
              ${event.description ? `
                <p style="margin: 10px 0 15px 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                  ${truncateText(event.description, 120)}
                </p>
              ` : ''}
              
              ${event.price ? `
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <span style="color: #059669; font-size: 14px; font-weight: bold;">
                    💰 ${event.price}
                  </span>
                </div>
              ` : ''}
              
              ${event.event_url ? `
                <a href="${event.event_url}" style="display: inline-block; padding: 8px 16px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;">
                  En savoir plus
                </a>
              ` : ''}
            </td>
          </tr>
        </table>
      </div>
    `).join('');
    
    // Remplacer la section événements
    compiled = compiled.replace(/{{#each events}}.*?{{\/each}}/gs, eventsHtml);
    compiled = compiled.replace(/{{#unless events}}.*?{{\/unless}}/gs, '');
    
  } else {
    // Pas d'événements - afficher le message par défaut
    const noEventsHtml = `
      <div style="text-align: center; padding: 40px 20px; background-color: #f9fafb; border-radius: 12px;">
        <div style="font-size: 48px; margin-bottom: 15px;">🤷‍♂️</div>
        <h3 style="margin: 0 0 10px 0; color: #6b7280; font-size: 18px;">
          Pas d'événements cette semaine
        </h3>
        <p style="margin: 0; color: #9ca3af; font-size: 14px;">
          Mais restez connecté, de nouveaux événements sont ajoutés régulièrement !
        </p>
      </div>
    `;
    
    compiled = compiled.replace(/{{#each events}}.*?{{\/each}}/gs, '');
    compiled = compiled.replace(/{{#unless events}}.*?{{\/unless}}/gs, noEventsHtml);
  }
  
  // Nettoyer les variables non utilisées
  compiled = compiled.replace(/{{unsubscribe_link}}/g, 'https://guide-lyon.com/newsletter/unsubscribe');
  
  return compiled;
}

/**
 * Envoie l'email via Brevo
 */
async function sendEmail(to: string, subject: string, htmlContent: string) {
  if (!BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY not configured');
  }

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: {
        name: "Guide de Lyon",
        email: "newsletter@guide-lyon.com"
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent,
      headers: {
        'List-Unsubscribe': '<https://guide-lyon.com/newsletter/unsubscribe>'
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Handler pour l'envoi de la newsletter hebdomadaire
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'autorisation (simple token ou IP whitelist)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'default-secret';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    console.log('🚀 Démarrage envoi newsletter hebdomadaire');

    // 1. Récupérer les événements de la semaine
    const weeklyData = await getWeeklyEvents();
    const emailData = prepareEmailData(weeklyData);
    
    console.log(`📅 Événements trouvés: ${emailData.events_count}`);

    // 2. Récupérer les abonnés
    const subscribers = await getNewsletterSubscribers();
    console.log(`👥 Abonnés actifs: ${subscribers.length}`);

    if (subscribers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Aucun abonné trouvé',
        stats: { events: emailData.events_count, subscribers: 0, sent: 0 }
      });
    }

    // 3. Charger le template
    const templatePath = path.join(process.cwd(), 'email-templates', 'newsletter-hebdomadaire.html');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');

    // 4. Compiler le template
    const compiledHtml = compileTemplate(templateHtml, emailData);

    // 5. Générer le sujet
    const subject = emailData.has_events 
      ? `Cette semaine à Lyon : ${emailData.events_count} événement${emailData.events_count > 1 ? 's' : ''} à ne pas manquer !`
      : `Cette semaine à Lyon - Agenda des prochains événements`;

    // 6. Envoyer les emails (par batch pour éviter les limites)
    let successCount = 0;
    let errorCount = 0;
    const batchSize = 10; // Envoyer par groupe de 10

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const promises = batch.map(async (email) => {
        try {
          await sendEmail(email, subject, compiledHtml);
          successCount++;
          console.log(`✅ Email envoyé à: ${email}`);
        } catch (error) {
          errorCount++;
          console.error(`❌ Erreur envoi à ${email}:`, error);
        }
      });

      await Promise.all(promises);
      
      // Petit délai entre les batches
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`📊 Résultats: ${successCount} envoyés, ${errorCount} erreurs`);

    return NextResponse.json({
      success: true,
      message: 'Newsletter envoyée avec succès',
      stats: {
        events: emailData.events_count,
        subscribers: subscribers.length,
        sent: successCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('❌ Erreur newsletter hebdomadaire:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    );
  }
}

/**
 * Handler pour test manuel (GET)
 */
export async function GET() {
  try {
    const weeklyData = await getWeeklyEvents();
    const emailData = prepareEmailData(weeklyData);
    
    return NextResponse.json({
      success: true,
      data: emailData,
      preview: `${emailData.events_count} événements du ${emailData.week_start_date} au ${emailData.week_end_date}`
    });
    
  } catch (error) {
    console.error('❌ Erreur test newsletter:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du test',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    );
  }
}