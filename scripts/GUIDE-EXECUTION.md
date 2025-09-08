# 🚀 Guide d'Exécution - Système de Prospection Guide Lyon

## Stratégie en 2 Phases

### ✅ PHASE 1 : Créer la Vitrine (Jour 1-3)
**Objectif :** Avoir 50-100 établissements prestigieux sur le site

#### Étape 1 : Installer les dépendances
```bash
npm install @googlemaps/google-maps-services-js @supabase/supabase-js sib-api-v3-sdk
```

#### Étape 2 : Ajouter votre clé Google Maps
```bash
# Dans .env.local
GOOGLE_MAPS_API_KEY=votre_cle_google_maps
```

#### Étape 3 : Peupler avec les établissements connus
```bash
node scripts/populate-known-establishments.js
```

Cela va ajouter automatiquement :
- Paul Bocuse, Brasserie Georges, La Mère Brazier
- Galeries Lafayette, Printemps
- Musée des Confluences, Opéra de Lyon
- Sofitel, InterContinental
- Et 40+ autres établissements emblématiques

**✅ Résultat :** Votre site aura l'air crédible et établi

---

### 📧 PHASE 2 : Prospection PME (Jour 4-30)
**Objectif :** Contacter 500 PME avec l'argument "vitrine"

#### Étape 1 : Collecter les PME cibles
```bash
node scripts/setup-prospection-system.js
```

Cela va :
- Identifier 500+ PME lyonnaises (< 50 avis Google)
- Les classer par secteur
- Générer un CSV pour enrichissement

#### Étape 2 : Enrichir les emails (Manuel mais efficace)

**Option A - Service payant (50€/mois) :**
1. Créer compte sur Hunter.io ou Snov.io
2. Uploader le CSV `data/prospects/enriched/manual-enrichment.csv`
3. Récupérer les emails trouvés

**Option B - Recherche manuelle (gratuit) :**
Pour chaque PME prioritaire :
1. Aller sur leur site web → Page Contact
2. Chercher sur Pages Jaunes
3. Google : "nom boutique lyon email contact"
4. LinkedIn / Facebook Pro

#### Étape 3 : Configurer Brevo
1. Créer compte gratuit sur [Brevo](https://www.brevo.com)
2. Récupérer votre API Key
3. Ajouter dans `.env.local` :
```bash
BREVO_API_KEY=votre_cle_brevo
```

#### Étape 4 : Envoyer les emails

**Test d'abord :**
```bash
node scripts/brevo-sender.js test
```

**Puis campagne par secteur :**
```bash
# Commencer petit (10 emails)
node scripts/brevo-sender.js send boutiques-mode 10

# Si bon taux de réponse, augmenter
node scripts/brevo-sender.js send boutiques-mode 50
```

---

## 📝 Votre Pitch Email Gagnant

**Objet :** 📍 Rejoignez Paul Bocuse et Brasserie Georges sur Guide Lyon

**Message clé :**
```
"Nous référençons déjà Paul Bocuse, Brasserie Georges, 
les Galeries Lafayette et 50+ établissements prestigieux.

Votre boutique/restaurant a sa place parmi ces références lyonnaises.

Inscription 100% GRATUITE - Créez votre page en 2 minutes"
```

---

## 📊 Métriques de Succès

| Métrique | Objectif | Alerte |
|----------|----------|--------|
| Taux d'ouverture | > 30% | < 20% = revoir objet |
| Taux de clic | > 5% | < 2% = revoir message |
| Taux d'inscription | > 2% | < 1% = revoir offre |
| Désinscription | < 2% | > 5% = STOP campagne |

---

## ⏰ Planning Semaine 1

### Lundi-Mardi
- [ ] Installer dépendances
- [ ] Lancer `populate-known-establishments.js`
- [ ] Vérifier que les établissements apparaissent sur le site
- [ ] Faire screenshots pour prospection

### Mercredi-Jeudi
- [ ] Lancer `setup-prospection-system.js`
- [ ] Enrichir 50 emails manuellement
- [ ] Configurer compte Brevo

### Vendredi
- [ ] Envoyer 10 emails test secteur "boutiques-mode"
- [ ] Analyser résultats
- [ ] Ajuster message si nécessaire

---

## 🎯 Tips de Pro

### Ce qui marche :
✅ "Rejoignez Paul Bocuse" → Preuve sociale forte
✅ "100% gratuit" → Enlève la friction
✅ "Badge Premium offert" → Urgence/rareté
✅ Envoyer mardi-jeudi 10h-11h → Meilleurs taux

### À éviter :
❌ Plus d'1 email sans réponse
❌ Emails génériques (info@)
❌ Vendredi après-midi / Lundi matin
❌ Promesses exagérées

---

## 🆘 Problèmes Fréquents

**"Les établissements n'apparaissent pas sur le site"**
→ Vérifier que `status: 'active'` dans la base de données

**"Taux d'ouverture faible"**
→ Tester d'autres objets : 
- "Paul Bocuse est sur Guide Lyon, et vous ?"
- "Invitation exclusive - Guide Lyon"

**"Pas de réponses"**
→ Ajouter urgence : "Offre limitée aux 50 premiers"

---

## 📞 Script Téléphonique (si besoin)

"Bonjour, je suis [Nom] de Guide Lyon. 
Nous venons de lancer un annuaire premium avec Paul Bocuse, 
Brasserie Georges et les Galeries Lafayette.

Votre établissement correspond parfaitement à nos critères de qualité.
L'inscription est gratuite, puis-je vous envoyer le lien par email ?"

→ Si oui : Récupérer l'email et envoyer
→ Si non : "Je comprends, bonne journée"

---

## ✅ Checklist Finale

- [ ] Phase 1 : 50+ établissements prestigieux ajoutés
- [ ] Phase 2 : 500 PME identifiées
- [ ] 100+ emails enrichis
- [ ] Brevo configuré
- [ ] Templates emails personnalisés
- [ ] Premier batch de 10 emails envoyé
- [ ] Dashboard de suivi en place

---

## 💡 Conseil Final

**Commencez PETIT** : 10 emails → analyser → ajuster → 50 emails → scale

**La clé** : L'argument "Rejoignez Paul Bocuse" est 10x plus efficace 
qu'un pitch classique. C'est votre avantage compétitif !

Bonne prospection ! 🚀