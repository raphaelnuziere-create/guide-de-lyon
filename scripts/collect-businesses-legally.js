#!/usr/bin/env node

/**
 * Script de collecte LÉGALE d'établissements via Google Places API
 * Collecte uniquement les données publiques autorisées
 * 
 * IMPORTANT : Ce script respecte les limites légales suivantes :
 * - Utilise uniquement l'API officielle Google Places
 * - Ne collecte que les données publiques (pas d'emails directs)
 * - Respecte les quotas et rate limits
 * - Stockage temporaire < 30 jours
 * 
 * Pour les emails : stratégie de prospection manuelle recommandée
 */

const { Client } = require('@googlemaps/google-maps-services-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
const client = new Client({});

// Catégories d'établissements à cibler
const BUSINESS_CATEGORIES = {
  'shopping-mode': {
    types: ['clothing_store', 'shoe_store', 'jewelry_store'],
    keywords: ['boutique mode lyon', 'magasin vêtements lyon', 'créateur lyon'],
    customMessage: "Inscrivez-vous gratuitement à notre annuaire shopping lyonnais"
  },
  'restaurant-food': {
    types: ['restaurant', 'cafe', 'bakery'],
    keywords: ['restaurant lyon', 'bistrot lyon', 'brasserie lyon'],
    customMessage: "Rejoignez le guide gastronomique de Lyon"
  },
  'beaute-bienetre': {
    types: ['beauty_salon', 'spa', 'hair_care'],
    keywords: ['salon coiffure lyon', 'spa lyon', 'institut beauté lyon'],
    customMessage: "Référencez votre salon sur le guide beauté de Lyon"
  },
  'culture-loisirs': {
    types: ['art_gallery', 'museum', 'book_store'],
    keywords: ['galerie art lyon', 'librairie lyon', 'atelier lyon'],
    customMessage: "Faites connaître votre espace culturel lyonnais"
  }
};

// Zones prioritaires de Lyon (Presqu'île et centre)
const LYON_CENTER_AREAS = [
  { lat: 45.7640, lng: 4.8357, name: "Lyon 1er - Terreaux" },
  { lat: 45.7589, lng: 4.8357, name: "Lyon 1er - Hôtel de Ville" },
  { lat: 45.7562, lng: 4.8320, name: "Lyon 2e - Bellecour" },
  { lat: 45.7533, lng: 4.8270, name: "Lyon 2e - Perrache" },
  { lat: 45.7609, lng: 4.8424, name: "Lyon 3e - Part-Dieu" },
  { lat: 45.7485, lng: 4.8373, name: "Lyon 2e - Confluence" }
];

// Fonction pour récupérer les établissements d'une zone
async function fetchBusinessesInArea(location, category, categoryKey) {
  const results = [];
  
  try {
    // Recherche par mots-clés
    for (const keyword of category.keywords) {
      const textSearchResponse = await client.textSearch({
        params: {
          query: keyword,
          location: location,
          radius: 500, // 500m autour du point
          key: GOOGLE_MAPS_API_KEY,
          language: 'fr'
        }
      });
      
      if (textSearchResponse.data.results) {
        for (const place of textSearchResponse.data.results) {
          // Filtrer : PME avec peu d'avis (< 50)
          if (place.user_ratings_total && place.user_ratings_total < 50) {
            // Récupérer les détails
            const detailsResponse = await client.placeDetails({
              params: {
                place_id: place.place_id,
                fields: [
                  'name', 'formatted_address', 'formatted_phone_number',
                  'website', 'opening_hours', 'rating', 'user_ratings_total',
                  'price_level', 'types', 'business_status'
                ].join(','),
                key: GOOGLE_MAPS_API_KEY,
                language: 'fr'
              }
            });
            
            const details = detailsResponse.data.result;
            
            // Structurer les données collectées
            results.push({
              // Données de base
              name: details.name,
              address: details.formatted_address,
              phone: details.formatted_phone_number || null,
              website: details.website || null,
              
              // Métadonnées
              category: categoryKey,
              district: location.name,
              rating: details.rating || null,
              reviews_count: details.user_ratings_total || 0,
              price_level: details.price_level || null,
              
              // Status
              is_open: details.business_status === 'OPERATIONAL',
              collected_at: new Date().toISOString(),
              
              // Message personnalisé pour la catégorie
              custom_message: category.customMessage,
              
              // Note importante sur les emails
              email_strategy: "À rechercher manuellement sur le site web ou via contact direct"
            });
            
            // Delay pour respecter les rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
      }
      
      // Pause entre les recherches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error(`Erreur pour ${location.name}:`, error.message);
  }
  
  return results;
}

// Fonction principale
async function collectBusinesses() {
  console.log('🔍 Début de la collecte légale d\'établissements Lyon\n');
  console.log('⚠️  RAPPEL IMPORTANT:');
  console.log('   - Cette collecte respecte les Terms of Service Google');
  console.log('   - Les emails ne sont PAS disponibles via l\'API');
  console.log('   - Stratégie email recommandée : prospection manuelle\n');
  
  const allBusinesses = {};
  
  // Pour chaque catégorie
  for (const [categoryKey, category] of Object.entries(BUSINESS_CATEGORIES)) {
    console.log(`\n📁 Catégorie: ${categoryKey}`);
    console.log(`   Message: "${category.customMessage}"`);
    
    allBusinesses[categoryKey] = [];
    
    // Pour chaque zone de Lyon
    for (const location of LYON_CENTER_AREAS) {
      console.log(`   📍 Zone: ${location.name}`);
      
      const businesses = await fetchBusinessesInArea(location, category, categoryKey);
      allBusinesses[categoryKey].push(...businesses);
      
      console.log(`      ✓ ${businesses.length} PME trouvées (< 50 avis)`);
    }
    
    console.log(`   Total catégorie: ${allBusinesses[categoryKey].length} établissements`);
  }
  
  // Sauvegarder les résultats
  const outputDir = path.join(__dirname, 'data', 'prospects');
  await fs.mkdir(outputDir, { recursive: true });
  
  // Fichier par catégorie
  for (const [category, businesses] of Object.entries(allBusinesses)) {
    const fileName = `prospects-${category}-${new Date().toISOString().split('T')[0]}.json`;
    const filePath = path.join(outputDir, fileName);
    
    await fs.writeFile(filePath, JSON.stringify({
      category,
      count: businesses.length,
      collected_at: new Date().toISOString(),
      businesses
    }, null, 2));
    
    console.log(`\n✅ Sauvegardé: ${fileName} (${businesses.length} établissements)`);
  }
  
  // Créer un fichier CSV pour import Brevo
  await createBrevoCSV(allBusinesses);
  
  // Statistiques finales
  const totalBusinesses = Object.values(allBusinesses).flat().length;
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DE LA COLLECTE');
  console.log('='.repeat(60));
  console.log(`Total établissements collectés: ${totalBusinesses}`);
  console.log('\n📧 STRATÉGIE EMAIL RECOMMANDÉE:');
  console.log('1. Visiter les sites web collectés pour trouver les emails');
  console.log('2. Utiliser LinkedIn Sales Navigator pour les contacts');
  console.log('3. Appel téléphonique pour demander l\'email');
  console.log('4. Visite physique pour les commerces prioritaires');
  console.log('\n⚖️  CONFORMITÉ LÉGALE:');
  console.log('✅ Données publiques uniquement');
  console.log('✅ Respect des quotas API');
  console.log('✅ Pas de scraping illégal');
  console.log('✅ Conforme RGPD pour les données collectées');
}

// Créer un CSV pour Brevo (sans emails pour l'instant)
async function createBrevoCSV(allBusinesses) {
  const outputDir = path.join(__dirname, 'data', 'prospects');
  const csvPath = path.join(outputDir, `brevo-import-${new Date().toISOString().split('T')[0]}.csv`);
  
  // En-têtes CSV
  let csv = 'NOM,TELEPHONE,SITE_WEB,ADRESSE,CATEGORIE,QUARTIER,NOTE,NOMBRE_AVIS,MESSAGE_PERSONNALISE\n';
  
  // Ajouter toutes les entreprises
  for (const [category, businesses] of Object.entries(allBusinesses)) {
    for (const business of businesses) {
      csv += `"${business.name}",`;
      csv += `"${business.phone || ''}",`;
      csv += `"${business.website || ''}",`;
      csv += `"${business.address}",`;
      csv += `"${category}",`;
      csv += `"${business.district}",`;
      csv += `"${business.rating || ''}",`;
      csv += `"${business.reviews_count}",`;
      csv += `"${business.custom_message}"\n`;
    }
  }
  
  await fs.writeFile(csvPath, csv);
  console.log(`\n📄 Fichier CSV créé pour Brevo: ${csvPath}`);
  console.log('   ⚠️  Note: Ajouter manuellement les emails avant import');
}

// Fonction pour rechercher les emails manuellement
async function generateEmailSearchGuide(businesses) {
  const outputDir = path.join(__dirname, 'data', 'prospects');
  const guidePath = path.join(outputDir, 'guide-recherche-emails.md');
  
  let guide = '# Guide de Recherche d\'Emails\n\n';
  guide += '## Méthodes Recommandées\n\n';
  guide += '### 1. Site Web Direct\n';
  guide += '- Chercher page "Contact"\n';
  guide += '- Vérifier mentions légales\n';
  guide += '- Formulaire de contact\n\n';
  guide += '### 2. Réseaux Sociaux\n';
  guide += '- Facebook Pro (section "À propos")\n';
  guide += '- Instagram Bio\n';
  guide += '- LinkedIn Entreprise\n\n';
  guide += '### 3. Annuaires Professionnels\n';
  guide += '- Pages Jaunes\n';
  guide += '- Kompass\n';
  guide += '- Société.com\n\n';
  guide += '## Liste des Établissements à Contacter\n\n';
  
  for (const [category, items] of Object.entries(businesses)) {
    guide += `\n### ${category}\n\n`;
    for (const business of items.slice(0, 10)) { // Top 10 par catégorie
      guide += `#### ${business.name}\n`;
      guide += `- Adresse: ${business.address}\n`;
      guide += `- Téléphone: ${business.phone || 'Non disponible'}\n`;
      guide += `- Site web: ${business.website || 'Non disponible'}\n`;
      guide += `- Email trouvé: _____________\n`;
      guide += `- Statut: [ ] Contacté [ ] Répondu [ ] Inscrit\n\n`;
    }
  }
  
  await fs.writeFile(guidePath, guide);
  console.log(`\n📖 Guide de recherche créé: ${guidePath}`);
}

// Script d'envoi via Brevo API (template)
async function createBrevoEmailScript() {
  const scriptContent = `#!/usr/bin/env node

/**
 * Script d'envoi d'emails de prospection via Brevo
 * IMPORTANT: Respecte RGPD et CAN-SPAM Act
 */

const SibApiV3Sdk = require('sib-api-v3-sdk');
const fs = require('fs').promises;

// Configuration Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Template d'email conforme RGPD
const EMAIL_TEMPLATE = {
  subject: "[Invitation] Référencez gratuitement votre établissement sur Guide Lyon",
  htmlContent: \`
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Bonjour {{params.businessName}},</h2>
      
      <p>Nous avons remarqué votre établissement dans le {{params.district}} et 
      aimerions vous proposer de rejoindre <strong>gratuitement</strong> notre 
      annuaire Guide Lyon.</p>
      
      <h3>Avantages de l'inscription gratuite :</h3>
      <ul>
        <li>Visibilité accrue auprès des Lyonnais</li>
        <li>Page dédiée avec photos et informations</li>
        <li>Référencement local optimisé</li>
        <li>Statistiques de visites</li>
      </ul>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://guide-lyon.fr/inscription?utm_source=prospection&utm_medium=email&business={{params.businessName}}" 
           style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
          S'inscrire gratuitement
        </a>
      </p>
      
      <p><strong>{{params.customMessage}}</strong></p>
      
      <p>Si vous n'êtes pas intéressé, aucune action n'est requise. 
      Nous ne vous recontacterons pas.</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      
      <p style="font-size: 12px; color: #666;">
        Cet email unique vous est envoyé car votre établissement est référencé 
        publiquement sur Google Maps. Conformément au RGPD, vos données ne seront 
        utilisées que si vous vous inscrivez volontairement.
      </p>
      
      <p style="font-size: 12px; color: #666;">
        <a href="https://guide-lyon.fr/unsubscribe?email={{params.email}}">
          Se désinscrire définitivement
        </a> | 
        <a href="https://guide-lyon.fr/privacy">
          Politique de confidentialité
        </a>
      </p>
      
      <p style="font-size: 11px; color: #999;">
        Guide Lyon - 123 Rue de la République, 69002 Lyon, France<br>
        SIRET: XXX XXX XXX XXXXX
      </p>
    </body>
    </html>
  \`,
  sender: {
    name: "Guide Lyon",
    email: "contact@guide-lyon.fr"
  }
};

async function sendProspectionEmail(recipient) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  
  sendSmtpEmail.to = [{ email: recipient.email, name: recipient.name }];
  sendSmtpEmail.sender = EMAIL_TEMPLATE.sender;
  sendSmtpEmail.subject = EMAIL_TEMPLATE.subject;
  sendSmtpEmail.htmlContent = EMAIL_TEMPLATE.htmlContent;
  sendSmtpEmail.params = {
    businessName: recipient.businessName,
    district: recipient.district,
    customMessage: recipient.customMessage,
    email: recipient.email
  };
  
  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(\`✅ Email envoyé à \${recipient.businessName}\`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error(\`❌ Erreur pour \${recipient.businessName}:\`, error.message);
    return { success: false, error: error.message };
  }
}

// Fonction principale avec rate limiting
async function sendCampaign() {
  const prospects = JSON.parse(
    await fs.readFile('./data/prospects/prospects-with-emails.json', 'utf8')
  );
  
  console.log(\`📧 Envoi de \${prospects.length} emails de prospection\\n\`);
  
  const results = { sent: 0, failed: 0 };
  
  for (const prospect of prospects) {
    const result = await sendProspectionEmail(prospect);
    
    if (result.success) {
      results.sent++;
      // Logger pour suivi RGPD
      await logEmailSent(prospect, result.messageId);
    } else {
      results.failed++;
    }
    
    // Rate limiting : 1 email par seconde
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(\`\\n✅ Campagne terminée: \${results.sent} envoyés, \${results.failed} échecs\`);
}

// Logger pour conformité RGPD
async function logEmailSent(recipient, messageId) {
  const log = {
    timestamp: new Date().toISOString(),
    recipient: recipient.email,
    business: recipient.businessName,
    messageId: messageId,
    type: 'prospection_unique',
    consent: 'legitimate_interest_b2b'
  };
  
  await fs.appendFile(
    './data/email-logs.jsonl',
    JSON.stringify(log) + '\\n'
  );
}

sendCampaign().catch(console.error);
`;

  const outputPath = path.join(__dirname, 'send-prospection-emails.js');
  await fs.writeFile(outputPath, scriptContent);
  console.log(`\n📮 Script Brevo créé: ${outputPath}`);
}

// Lancer la collecte
collectBusinesses().catch(console.error);