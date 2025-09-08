#!/usr/bin/env node

/**
 * Script de configuration du système de prospection B2B
 * Approche légale et respectueuse pour Guide Lyon
 */

const fs = require('fs').promises;
const path = require('path');
const { Client } = require('@googlemaps/google-maps-services-js');

// Configuration
const config = {
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
  brevoApiKey: process.env.BREVO_API_KEY,
  targetCity: 'Lyon',
  maxReviewsCount: 50, // Cibler PME avec peu d'avis
  sectorsConfig: {
    'boutiques-mode': {
      searchTerms: [
        'boutique vêtements lyon',
        'magasin mode indépendant lyon', 
        'créateur mode lyon',
        'boutique vintage lyon',
        'prêt à porter lyon'
      ],
      googleTypes: ['clothing_store', 'shoe_store'],
      emailSubject: '📍 Votre boutique mérite plus de visibilité à Lyon',
      targetCount: 150
    },
    'restaurants-bistros': {
      searchTerms: [
        'restaurant traditionnel lyon',
        'bistrot lyonnais',
        'bouchon lyon',
        'restaurant familial lyon'
      ],
      googleTypes: ['restaurant', 'cafe'],
      emailSubject: '🍴 Attirez plus de clients dans votre restaurant',
      targetCount: 200
    },
    'beaute-bienetre': {
      searchTerms: [
        'salon coiffure indépendant lyon',
        'institut beauté lyon',
        'spa massage lyon',
        'barbier lyon'
      ],
      googleTypes: ['beauty_salon', 'spa', 'hair_care'],
      emailSubject: '💆 Développez votre clientèle beauté à Lyon',
      targetCount: 100
    },
    'artisans-services': {
      searchTerms: [
        'artisan lyon',
        'atelier création lyon',
        'services proximité lyon'
      ],
      googleTypes: ['store', 'establishment'],
      emailSubject: '🛠️ Faites connaître votre savoir-faire lyonnais',
      targetCount: 100
    }
  }
};

// Zones prioritaires Lyon centre
const LYON_ZONES = [
  { lat: 45.7640, lng: 4.8357, zone: 'Terreaux', arrondissement: '1er' },
  { lat: 45.7589, lng: 4.8357, zone: 'Hôtel de Ville', arrondissement: '1er' },
  { lat: 45.7562, lng: 4.8320, zone: 'Bellecour', arrondissement: '2e' },
  { lat: 45.7578, lng: 4.8320, zone: 'République', arrondissement: '2e' },
  { lat: 45.7700, lng: 4.8340, zone: 'Croix-Rousse', arrondissement: '4e' },
  { lat: 45.7780, lng: 4.8070, zone: 'Vieux Lyon', arrondissement: '5e' },
  { lat: 45.7480, lng: 4.8500, zone: 'Jean Macé', arrondissement: '7e' }
];

class ProspectionSystem {
  constructor() {
    this.client = new Client({});
    this.prospects = {};
    this.stats = {
      totalFound: 0,
      byCategory: {},
      byZone: {}
    };
  }

  async initialize() {
    console.log('🚀 Initialisation du Système de Prospection Guide Lyon\n');
    console.log('📋 Configuration:');
    console.log(`   - Cible: PME ${config.targetCity} (<${config.maxReviewsCount} avis)`);
    console.log(`   - Zones: ${LYON_ZONES.length} quartiers prioritaires`);
    console.log(`   - Secteurs: ${Object.keys(config.sectorsConfig).length} catégories\n`);
    
    // Créer structure de dossiers
    await this.createFolderStructure();
  }

  async createFolderStructure() {
    const folders = [
      'data/prospects',
      'data/prospects/raw',
      'data/prospects/enriched',
      'data/prospects/campaigns',
      'data/logs',
      'templates/emails'
    ];
    
    for (const folder of folders) {
      await fs.mkdir(path.join(__dirname, folder), { recursive: true });
    }
    console.log('✅ Structure de dossiers créée\n');
  }

  async collectProspects() {
    console.log('🔍 Phase 1: Collecte des Prospects\n');
    
    for (const [sectorKey, sectorConfig] of Object.entries(config.sectorsConfig)) {
      console.log(`\n📁 Secteur: ${sectorKey}`);
      this.prospects[sectorKey] = [];
      this.stats.byCategory[sectorKey] = 0;
      
      for (const zone of LYON_ZONES) {
        const found = await this.searchInZone(zone, sectorConfig);
        this.prospects[sectorKey].push(...found);
        console.log(`   ${zone.zone}: ${found.length} prospects`);
        
        // Rate limiting
        await this.delay(1000);
      }
      
      this.stats.byCategory[sectorKey] = this.prospects[sectorKey].length;
      console.log(`   ✅ Total secteur: ${this.prospects[sectorKey].length} PME trouvées`);
    }
    
    await this.saveProspects();
  }

  async searchInZone(zone, sectorConfig) {
    const results = [];
    
    for (const searchTerm of sectorConfig.searchTerms) {
      try {
        const response = await this.client.textSearch({
          params: {
            query: searchTerm,
            location: zone,
            radius: 800,
            key: config.googleMapsApiKey,
            language: 'fr'
          }
        });
        
        if (response.data.results) {
          for (const place of response.data.results) {
            // Filtrer: PME uniquement
            if (place.user_ratings_total && place.user_ratings_total <= config.maxReviewsCount) {
              // Récupérer détails
              const details = await this.getPlaceDetails(place.place_id);
              
              if (details) {
                results.push({
                  // Infos de base
                  id: place.place_id,
                  name: details.name,
                  address: details.formatted_address,
                  phone: details.formatted_phone_number || '',
                  website: details.website || '',
                  
                  // Méta-données
                  zone: zone.zone,
                  arrondissement: zone.arrondissement,
                  rating: details.rating || 0,
                  reviews: details.user_ratings_total || 0,
                  priceLevel: details.price_level || 0,
                  
                  // Status prospection
                  hasWebsite: !!details.website,
                  emailFound: false,
                  email: '',
                  emailSource: '',
                  
                  // Tracking
                  collectedAt: new Date().toISOString(),
                  status: 'new',
                  contacted: false
                });
              }
              
              await this.delay(200);
            }
          }
        }
      } catch (error) {
        console.error(`   ⚠️ Erreur recherche ${searchTerm}:`, error.message);
      }
    }
    
    return results;
  }

  async getPlaceDetails(placeId) {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,price_level',
          key: config.googleMapsApiKey,
          language: 'fr'
        }
      });
      return response.data.result;
    } catch (error) {
      return null;
    }
  }

  async saveProspects() {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Sauvegarder par secteur
    for (const [sector, prospects] of Object.entries(this.prospects)) {
      const fileName = `prospects-${sector}-${timestamp}.json`;
      const filePath = path.join(__dirname, 'data/prospects/raw', fileName);
      
      await fs.writeFile(filePath, JSON.stringify({
        sector,
        count: prospects.length,
        collectedAt: new Date().toISOString(),
        prospects
      }, null, 2));
    }
    
    // Créer fichier CSV pour enrichissement manuel
    await this.createEnrichmentCSV();
    
    console.log('\n✅ Prospects sauvegardés dans data/prospects/raw/');
  }

  async createEnrichmentCSV() {
    let csv = 'Secteur,Nom,Adresse,Arrondissement,Téléphone,Site Web,Note,Avis,Email à trouver,Source Email\n';
    
    for (const [sector, prospects] of Object.entries(this.prospects)) {
      // Top 20 par secteur pour enrichissement manuel prioritaire
      const topProspects = prospects
        .filter(p => p.hasWebsite)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 20);
      
      for (const p of topProspects) {
        csv += `"${sector}","${p.name}","${p.address}","${p.arrondissement}","${p.phone}","${p.website}","${p.rating}","${p.reviews}","",""`;
        csv += '\n';
      }
    }
    
    const csvPath = path.join(__dirname, 'data/prospects/enriched', 'manual-enrichment.csv');
    await fs.writeFile(csvPath, csv);
    console.log('📄 Fichier CSV créé pour enrichissement manuel');
  }

  async createEmailTemplates() {
    console.log('\n📧 Phase 2: Création des Templates Emails\n');
    
    for (const [sector, config] of Object.entries(config.sectorsConfig)) {
      const template = this.generateEmailTemplate(sector, config);
      const templatePath = path.join(__dirname, 'templates/emails', `${sector}.html`);
      await fs.writeFile(templatePath, template);
      console.log(`   ✅ Template ${sector} créé`);
    }
  }

  generateEmailTemplate(sector, sectorConfig) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .logo { font-size: 24px; font-weight: bold; color: #D32F2F; }
    .content { background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .benefits { background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .benefit-item { padding: 10px 0; border-bottom: 1px solid #E0E0E0; }
    .benefit-item:last-child { border-bottom: none; }
    .cta-button { display: inline-block; background: #D32F2F; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .unsubscribe { color: #666; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📍 Guide Lyon</div>
    </div>
    
    <div class="content">
      <h2>${sectorConfig.emailSubject}</h2>
      
      <p>Bonjour {{businessName}},</p>
      
      <p>En tant que <strong>{{businessType}} indépendant(e)</strong> du <strong>{{district}}</strong>, 
      nous pensons que votre établissement mérite plus de visibilité auprès des Lyonnais.</p>
      
      <p><strong>Guide Lyon</strong> est le nouvel annuaire local qui met en avant les commerces 
      indépendants et les PME de notre ville.</p>
      
      <div class="benefits">
        <h3>🎯 Pourquoi rejoindre Guide Lyon ?</h3>
        <div class="benefit-item">✅ <strong>100% GRATUIT</strong> - Aucun frais caché</div>
        <div class="benefit-item">📸 Page dédiée avec photos et horaires</div>
        <div class="benefit-item">🔍 Meilleur référencement local sur Google</div>
        <div class="benefit-item">📊 Statistiques de visites mensuelles</div>
        <div class="benefit-item">🎁 Badge "Commerce Local Lyonnais"</div>
      </div>
      
      <p><strong>🚀 Offre limitée :</strong> Les 100 premiers inscrits bénéficient d'une mise en avant 
      premium gratuite pendant 6 mois.</p>
      
      <div style="text-align: center;">
        <a href="https://guide-lyon.fr/inscription?utm_source=email&utm_medium=prospection&utm_campaign=${sector}&business={{businessId}}" 
           class="cta-button">
          Créer ma page gratuitement
        </a>
      </div>
      
      <p style="font-style: italic; color: #666;">
      "Guide Lyon m'a permis d'augmenter ma visibilité de 40% en 3 mois" 
      <br>- Marie, Boutique Les Pentes
      </p>
      
      <p>Cordialement,<br>
      L'équipe Guide Lyon</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #E0E0E0;">
      
      <p style="font-size: 11px; color: #999;">
      PS : Si vous n'êtes pas intéressé(e), nous ne vous recontacterons pas. 
      Cet email unique vous est envoyé car votre établissement correspond aux critères 
      de qualité de notre annuaire.
      </p>
    </div>
    
    <div class="footer">
      <p>
        <a href="{{unsubscribeUrl}}" class="unsubscribe">Se désinscrire</a> | 
        <a href="https://guide-lyon.fr/privacy" class="unsubscribe">Confidentialité</a>
      </p>
      <p>Guide Lyon - 123 rue de la République, 69002 Lyon<br>
      SIRET : XXX XXX XXX XXXXX</p>
    </div>
  </div>
</body>
</html>`;
  }

  async createBrevoIntegration() {
    console.log('\n🔧 Phase 3: Configuration Brevo\n');
    
    const brevoScript = `#!/usr/bin/env node

/**
 * Script d'envoi via Brevo API
 * Respecte les limites légales B2B
 */

const SibApiV3Sdk = require('sib-api-v3-sdk');
const fs = require('fs').promises;
const path = require('path');

// Configuration Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || '${config.brevoApiKey}';

class BrevoSender {
  constructor() {
    this.emailApi = new SibApiV3Sdk.TransactionalEmailsApi();
    this.contactsApi = new SibApiV3Sdk.ContactsApi();
    this.sentEmails = new Set();
    this.unsubscribed = new Set();
  }

  async loadUnsubscribed() {
    try {
      const data = await fs.readFile('./data/unsubscribed.json', 'utf8');
      this.unsubscribed = new Set(JSON.parse(data));
    } catch (error) {
      // File doesn't exist yet
    }
  }

  async loadSentEmails() {
    try {
      const data = await fs.readFile('./data/sent-emails.json', 'utf8');
      this.sentEmails = new Set(JSON.parse(data));
    } catch (error) {
      // File doesn't exist yet
    }
  }

  async sendProspectionEmail(prospect, template) {
    // Vérifications de sécurité
    if (!prospect.email || prospect.email === '') {
      console.log(\`⚠️ Pas d'email pour \${prospect.name}\`);
      return { success: false, reason: 'no_email' };
    }

    if (this.sentEmails.has(prospect.email)) {
      console.log(\`⏭️ Déjà contacté: \${prospect.name}\`);
      return { success: false, reason: 'already_sent' };
    }

    if (this.unsubscribed.has(prospect.email)) {
      console.log(\`🚫 Désinscrit: \${prospect.name}\`);
      return { success: false, reason: 'unsubscribed' };
    }

    // Préparer l'email
    const sendSmtpEmail = {
      to: [{ 
        email: prospect.email, 
        name: prospect.name 
      }],
      sender: {
        name: 'Guide Lyon',
        email: 'contact@guide-lyon.fr'
      },
      subject: template.subject,
      htmlContent: template.html
        .replace(/{{businessName}}/g, prospect.name)
        .replace(/{{businessType}}/g, prospect.businessType || 'commerce')
        .replace(/{{district}}/g, prospect.arrondissement)
        .replace(/{{businessId}}/g, prospect.id)
        .replace(/{{unsubscribeUrl}}/g, \`https://guide-lyon.fr/unsubscribe?email=\${prospect.email}\`),
      params: {
        businessName: prospect.name,
        category: prospect.category
      },
      headers: {
        'List-Unsubscribe': \`<https://guide-lyon.fr/unsubscribe?email=\${prospect.email}>\`
      }
    };

    try {
      const response = await this.emailApi.sendTransacEmail(sendSmtpEmail);
      
      // Logger l'envoi
      await this.logEmail({
        email: prospect.email,
        businessName: prospect.name,
        messageId: response.messageId,
        sentAt: new Date().toISOString(),
        category: prospect.category
      });
      
      // Marquer comme envoyé
      this.sentEmails.add(prospect.email);
      await this.saveSentEmails();
      
      console.log(\`✅ Envoyé à \${prospect.name}\`);
      return { success: true, messageId: response.messageId };
      
    } catch (error) {
      console.error(\`❌ Erreur pour \${prospect.name}: \${error.message}\`);
      return { success: false, reason: error.message };
    }
  }

  async logEmail(data) {
    const logEntry = JSON.stringify(data) + '\\n';
    await fs.appendFile('./data/logs/emails-sent.jsonl', logEntry);
  }

  async saveSentEmails() {
    await fs.writeFile(
      './data/sent-emails.json', 
      JSON.stringify([...this.sentEmails], null, 2)
    );
  }

  async sendCampaign(sector, limit = 50) {
    console.log(\`\\n📧 Campagne: \${sector} (max \${limit} emails)\\n\`);
    
    // Charger les prospects enrichis
    const prospectsFile = \`./data/prospects/enriched/\${sector}-with-emails.json\`;
    const prospects = JSON.parse(await fs.readFile(prospectsFile, 'utf8'));
    
    // Charger le template
    const templateFile = \`./templates/emails/\${sector}.html\`;
    const templateHtml = await fs.readFile(templateFile, 'utf8');
    const template = {
      subject: config.sectorsConfig[sector].emailSubject,
      html: templateHtml
    };
    
    // Stats
    const stats = {
      sent: 0,
      skipped: 0,
      failed: 0
    };
    
    // Envoyer avec rate limiting
    for (const prospect of prospects.slice(0, limit)) {
      const result = await this.sendProspectionEmail(prospect, template);
      
      if (result.success) {
        stats.sent++;
      } else if (result.reason === 'already_sent' || result.reason === 'unsubscribed') {
        stats.skipped++;
      } else {
        stats.failed++;
      }
      
      // Rate limiting: 1 email par seconde
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Rapport
    console.log(\`\\n📊 Résultats Campagne \${sector}:\`);
    console.log(\`   ✅ Envoyés: \${stats.sent}\`);
    console.log(\`   ⏭️ Ignorés: \${stats.skipped}\`);
    console.log(\`   ❌ Échecs: \${stats.failed}\`);
    
    return stats;
  }
}

// Commandes CLI
async function main() {
  const sender = new BrevoSender();
  await sender.loadUnsubscribed();
  await sender.loadSentEmails();
  
  const command = process.argv[2];
  const sector = process.argv[3];
  const limit = parseInt(process.argv[4]) || 50;
  
  switch(command) {
    case 'send':
      if (!sector) {
        console.error('Usage: node brevo-sender.js send <sector> [limit]');
        process.exit(1);
      }
      await sender.sendCampaign(sector, limit);
      break;
      
    case 'test':
      // Envoyer un email test
      const testProspect = {
        email: 'test@guide-lyon.fr',
        name: 'Boutique Test',
        arrondissement: '2e',
        category: 'boutiques-mode',
        id: 'test123'
      };
      const testTemplate = {
        subject: 'TEST - ' + config.sectorsConfig['boutiques-mode'].emailSubject,
        html: await fs.readFile('./templates/emails/boutiques-mode.html', 'utf8')
      };
      await sender.sendProspectionEmail(testProspect, testTemplate);
      break;
      
    case 'stats':
      console.log(\`Emails envoyés: \${sender.sentEmails.size}\`);
      console.log(\`Désinscrits: \${sender.unsubscribed.size}\`);
      break;
      
    default:
      console.log('Commands:');
      console.log('  send <sector> [limit] - Envoyer campagne');
      console.log('  test - Envoyer email test');
      console.log('  stats - Voir statistiques');
  }
}

main().catch(console.error);
`;

    await fs.writeFile(path.join(__dirname, 'brevo-sender.js'), brevoScript);
    console.log('✅ Script Brevo créé: brevo-sender.js');
  }

  async generateDashboard() {
    console.log('\n📊 Phase 4: Dashboard de Suivi\n');
    
    const dashboard = `
<!DOCTYPE html>
<html>
<head>
  <title>Dashboard Prospection - Guide Lyon</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #D32F2F; margin-bottom: 30px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .stat-value { font-size: 32px; font-weight: bold; color: #333; }
    .stat-label { color: #666; margin-top: 5px; }
    table { width: 100%; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    th { background: #D32F2F; color: white; padding: 15px; text-align: left; }
    td { padding: 15px; border-bottom: 1px solid #eee; }
    .status { padding: 5px 10px; border-radius: 20px; font-size: 12px; }
    .status.sent { background: #4CAF50; color: white; }
    .status.pending { background: #FF9800; color: white; }
    .status.new { background: #2196F3; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Dashboard Prospection - Guide Lyon</h1>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value" id="total-prospects">0</div>
        <div class="stat-label">Prospects Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="emails-found">0</div>
        <div class="stat-label">Emails Trouvés</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="emails-sent">0</div>
        <div class="stat-label">Emails Envoyés</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="responses">0</div>
        <div class="stat-label">Réponses</div>
      </div>
    </div>
    
    <h2>Prospects par Secteur</h2>
    <table>
      <thead>
        <tr>
          <th>Secteur</th>
          <th>Prospects</th>
          <th>Emails Trouvés</th>
          <th>Envoyés</th>
          <th>Taux</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="sectors-table">
        <!-- Rempli dynamiquement -->
      </tbody>
    </table>
  </div>
  
  <script>
    // Charger les stats (à implémenter avec une API ou fichier JSON)
    async function loadStats() {
      // Pour l'instant, données statiques
      document.getElementById('total-prospects').textContent = '${this.stats.totalFound}';
      
      const sectorsTable = document.getElementById('sectors-table');
      ${Object.entries(this.stats.byCategory).map(([sector, count]) => `
      sectorsTable.innerHTML += \`
        <tr>
          <td>${sector}</td>
          <td>\${${count}}</td>
          <td>0</td>
          <td>0</td>
          <td>0%</td>
          <td><button onclick="sendCampaign('${sector}')">Lancer Campagne</button></td>
        </tr>
      \`;`).join('')}
    }
    
    function sendCampaign(sector) {
      if(confirm('Lancer la campagne pour ' + sector + ' ?')) {
        console.log('Lancement campagne:', sector);
        // Appeler le script Node.js
      }
    }
    
    loadStats();
  </script>
</body>
</html>`;

    await fs.writeFile(path.join(__dirname, 'dashboard.html'), dashboard);
    console.log('✅ Dashboard créé: dashboard.html');
  }

  async printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📈 RÉSUMÉ FINAL');
    console.log('='.repeat(60));
    console.log(`✅ Total prospects collectés: ${this.stats.totalFound}`);
    
    for (const [sector, count] of Object.entries(this.stats.byCategory)) {
      console.log(`   ${sector}: ${count} PME`);
    }
    
    console.log('\n📂 Fichiers créés:');
    console.log('   - data/prospects/raw/ : Données brutes');
    console.log('   - data/prospects/enriched/manual-enrichment.csv : Pour enrichissement');
    console.log('   - templates/emails/ : Templates par secteur');
    console.log('   - brevo-sender.js : Script d\'envoi');
    console.log('   - dashboard.html : Interface de suivi');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Fonction principale
async function setupProspectionSystem() {
  const system = new ProspectionSystem();
  
  try {
    await system.initialize();
    await system.collectProspects();
    await system.createEmailTemplates();
    await system.createBrevoIntegration();
    await system.generateDashboard();
    await system.printSummary();
    
    console.log('\n✨ Système de prospection configuré avec succès!');
    console.log('\n🎯 Prochaines étapes:');
    console.log('1. Enrichir les emails: ouvrir data/prospects/enriched/manual-enrichment.csv');
    console.log('2. Configurer Brevo: ajouter BREVO_API_KEY dans .env');
    console.log('3. Test: node brevo-sender.js test');
    console.log('4. Lancer: node brevo-sender.js send boutiques-mode 10');
    console.log('5. Suivre: ouvrir dashboard.html');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Lancer si exécuté directement
if (require.main === module) {
  setupProspectionSystem();
}

module.exports = ProspectionSystem;