# Instructions Migration Système de Scraping

## 🚀 Étapes pour activer le système de scraping

### 1. Exécuter la migration SQL dans Supabase

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New Query**
5. Copiez tout le contenu du fichier: `supabase/migrations/20250108_scraping_system_fixed.sql`
6. Collez dans l'éditeur SQL
7. Cliquez sur **Run** (ou Cmd+Enter)

### 2. Vérifier l'installation

```bash
npx tsx scripts/test-scraping.ts
```

### 3. Variables d'environnement requises

Vérifiez que ces variables sont dans `.env.local`:

```env
# Supabase (déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_key

# OpenAI (déjà configuré)
OPENAI_API_KEY=votre_openai_key

# Cron Secret
CRON_SECRET=votre_secret_unique
```

### 4. Tester le scraping manuel

```bash
# Démarrer le serveur
npm run dev

# Dans un autre terminal, déclencher le scraping
curl -X POST http://localhost:3000/api/scraping/trigger \
  -H "x-cron-secret: votre_secret_unique"
```

### 5. Voir les articles

- Ouvrez: http://localhost:3000/actualites
- Les articles scrapés et réécrits apparaîtront automatiquement

## 📊 Dashboard de monitoring

Pour voir les statistiques du scraping:

1. Allez dans Supabase Dashboard > Table Editor
2. Visualisez les tables:
   - `scraped_articles`: Tous les articles
   - `scraping_sources`: Sources configurées
   - `scraping_queue`: File d'attente
   - `scraping_logs`: Historique

## 🔄 Configuration Cron (Production)

Sur Vercel:

1. Allez dans Settings > Functions
2. Ajoutez un Cron Job:
   - Path: `/api/cron/scraping`
   - Schedule: `0 */2 * * *` (toutes les 2 heures)
3. Ajoutez la variable `CRON_SECRET` dans Environment Variables

## ✅ Checklist de déploiement

- [ ] Migration SQL exécutée
- [ ] Variables d'environnement configurées
- [ ] Test local réussi
- [ ] Articles visibles sur /actualites
- [ ] Cron job configuré sur Vercel

## 🎯 Fonctionnalités du système

- **Scraping automatique** toutes les 2 heures
- **Réécriture IA** avec GPT-4
- **Publication automatique** si score > 0.85
- **Auteur**: Toujours "Raphael"
- **Pas de citations** de sources
- **SEO optimisé** pour Lyon
- **Images** récupérées automatiquement

## 🐛 Dépannage

Si les articles ne s'affichent pas:
1. Vérifiez que la migration SQL est bien exécutée
2. Vérifiez les logs dans `scraping_logs`
3. Testez manuellement avec `scripts/test-scraping.ts`
4. Vérifiez OPENAI_API_KEY