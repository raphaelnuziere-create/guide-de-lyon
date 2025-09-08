# Stratégie d'Enrichissement Email pour Guide Lyon

## ⚖️ Cadre Légal B2B en France

### Ce qui est AUTORISÉ en B2B :
- **Prospection B2B sans opt-in préalable** SI :
  - Email professionnel générique (contact@, info@, etc.)
  - Relation avec l'activité professionnelle
  - Lien de désinscription obligatoire
  - Première prise de contact uniquement

### Ce qui est INTERDIT :
- Emails personnels (prenom.nom@)
- Envois répétés sans consentement
- Absence de désinscription
- Données obtenues illégalement

## 📧 Stratégie d'Enrichissement des Emails

### Phase 1 : Collecte Semi-Automatique (LÉGAL)

#### 1. Extraction depuis sites web (via API ou manuel)
```javascript
// Exemple : Hunter.io API (service légal)
const Hunter = require('hunter.io');
const hunter = new Hunter('YOUR_API_KEY');

async function findEmailLegally(domain) {
  try {
    const result = await hunter.domainSearch({
      domain: domain,
      type: 'generic' // Cherche emails génériques uniquement
    });
    return result.emails.filter(e => 
      e.value.startsWith('contact@') || 
      e.value.startsWith('info@')
    );
  } catch (error) {
    return null;
  }
}
```

#### 2. Services d'enrichissement légaux
- **Hunter.io** : ~$49/mois pour 1000 recherches
- **Clearbit** : ~$99/mois 
- **Snov.io** : ~$39/mois pour 1000 crédits
- **FindThatLead** : ~$49/mois

### Phase 2 : Enrichissement Manuel Ciblé

#### Processus pour PME prioritaires :
1. **Identifier les TOP 100 établissements** par catégorie
2. **Recherche manuelle structurée** :
   ```
   Site web → Page Contact
   Google → "nom entreprise lyon email"
   LinkedIn → Page entreprise
   Facebook Pro → Section À propos
   Pages Jaunes → Fiche entreprise
   ```

3. **Template de recherche Google** :
   ```
   "Boutique XYZ" Lyon (contact OR email OR "@")
   site:facebook.com "Boutique XYZ" Lyon
   site:linkedin.com "Boutique XYZ" Lyon
   ```

### Phase 3 : Outreach Progressif

#### Semaine 1-2 : Test sur 50 entreprises
```javascript
// Structure de données recommandée
const prospectBatch1 = {
  "shopping-mode": [
    {
      name: "Boutique Mode Lyon",
      email: "contact@boutique-lyon.fr", // Email générique trouvé
      source: "website", // Traçabilité importante
      consent_status: "legitimate_interest_b2b",
      first_contact_date: null,
      unsubscribed: false
    }
  ]
};
```

#### Semaine 3-4 : Scale à 200 entreprises
- Analyser taux d'ouverture/réponse
- Ajuster le message
- Documenter les désinscriptions

## 📝 Template Email Conforme

```html
Objet: [Invitation] Visibilité gratuite pour [NOM_BOUTIQUE] sur Guide Lyon

Bonjour,

En tant que [boutique de mode indépendante] située [quartier], 
nous vous invitons à rejoindre gratuitement Guide Lyon, 
le nouvel annuaire local des commerces lyonnais.

✓ Page dédiée avec photos
✓ Référencement local optimisé  
✓ 100% gratuit, sans engagement

[BOUTON: Créer ma page gratuite]

Si cela ne vous intéresse pas, nous ne vous recontacterons pas.

Cordialement,
L'équipe Guide Lyon

---
Se désinscrire | Guide Lyon, 69002 Lyon
```

## 🎯 Approche par Secteur

### Shopping & Mode (Priorité 1)
- **Cible** : Boutiques < 50 avis Google
- **Message** : "Annuaire shopping lyonnais gratuit"
- **Volume** : 100-150 boutiques
- **Zones** : Presqu'île, Croix-Rousse

### Restaurants (Priorité 2)  
- **Cible** : Bistrots et brasseries locales
- **Message** : "Guide gastronomique Lyon"
- **Volume** : 150-200 établissements
- **Zones** : Vieux Lyon, Presqu'île

### Beauté & Bien-être (Priorité 3)
- **Cible** : Salons indépendants
- **Message** : "Annuaire beauté Lyon"
- **Volume** : 80-100 établissements

## 🛠️ Outils Recommandés

### Pour la collecte :
1. **Google Places API** : Données de base (légal)
2. **Hunter.io** : Enrichissement emails (légal)
3. **PhantomBuster** : Extraction LinkedIn (zone grise)

### Pour l'envoi :
1. **Brevo** : Excellent pour prospection B2B
2. **Lemlist** : Spécialisé cold outreach
3. **SendinBlue** : Alternative économique

## 📊 KPIs à Suivre

```javascript
const campaignMetrics = {
  legal_compliance: {
    consent_type: "legitimate_interest_b2b",
    unsubscribe_rate: "< 5%", // Si > 5%, revoir l'approche
    complaint_rate: "< 0.1%", // Si > 0.1%, STOP
    bounce_rate: "< 10%"
  },
  performance: {
    open_rate_target: "> 25%",
    click_rate_target: "> 3%",
    signup_rate_target: "> 1%"
  }
};
```

## ⚠️ Points d'Attention Légaux

### FAIRE :
✅ Garder logs de tous les envois  
✅ Traiter désinscriptions sous 48h  
✅ Documenter source de chaque email  
✅ Un seul email de prospection par contact  
✅ Utiliser emails génériques (contact@, info@)  

### NE PAS FAIRE :
❌ Acheter des listes d'emails  
❌ Scraper Google Maps directement  
❌ Envoyer sans lien de désinscription  
❌ Relancer sans consentement  
❌ Utiliser emails personnels nominatifs  

## 🚀 Plan d'Action Immédiat

### Jour 1-3 : Préparation
1. Installer script `collect-businesses-legally.js`
2. Configurer compte Brevo
3. Créer templates emails

### Jour 4-7 : Collecte
1. Lancer collecte via Google Places API
2. Enrichir TOP 50 manuellement
3. Préparer premier batch

### Jour 8-14 : Test
1. Envoyer à 50 entreprises
2. Analyser résultats
3. Ajuster message si nécessaire

### Jour 15+ : Scale
1. Augmenter progressivement volume
2. Automatiser avec Brevo
3. Optimiser selon retours

## 💡 Astuce Finale

**Approche "Soft" Recommandée** :
Au lieu d'un email de vente direct, proposez d'abord de la valeur :

"Nous avons créé une page gratuite pour votre établissement sur Guide Lyon 
avec vos informations publiques. Voulez-vous la personnaliser ?"

Cette approche génère plus d'engagement et moins de plaintes.