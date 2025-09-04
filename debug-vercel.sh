#!/bin/bash

echo "=========================================="
echo "🔍 DEBUG COMPLET VERCEL"
echo "=========================================="
echo ""

# 1. Vérifier le statut git
echo "📍 Statut Git:"
git status --short
echo ""

# 2. Vérifier le dernier commit
echo "📍 Dernier commit poussé:"
git log -1 --oneline
echo ""

# 3. Vérifier la branche
echo "📍 Branche actuelle:"
git branch --show-current
echo ""

# 4. Build local de test
echo "📍 Test du build local:"
npm run build > build-log.txt 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Build local RÉUSSI"
    echo "Pages trouvées:"
    ls -la .next/server/app/ 2>/dev/null | head -10
else
    echo "❌ Build local ÉCHOUÉ"
    echo "Erreurs:"
    tail -20 build-log.txt
fi
echo ""

# 5. Structure des pages
echo "📍 Structure des pages app/:"
find app -name "page.tsx" -o -name "page.jsx" | sort
echo ""

# 6. Vérification des erreurs TypeScript
echo "📍 Erreurs TypeScript:"
npx tsc --noEmit 2>&1 | head -10 || echo "✅ Pas d'erreurs TypeScript critiques"
echo ""

# 7. Créer un rapport
cat > VERCEL-DEBUG-REPORT.md << EOF
# 📊 RAPPORT DE DEBUG VERCEL

## Informations Système
- Date: $(date)
- Node: $(node -v)
- NPM: $(npm -v)
- Next.js: $(npm list next | grep next@ | head -1)

## État Git
- Branche: $(git branch --show-current)
- Dernier commit: $(git log -1 --oneline)
- Repository: raphaelnuziere-create/guide-de-lyon

## Pages Disponibles
$(find app -name "page.tsx" | sed 's/app//' | sed 's/\/page.tsx//' | sed 's/^$/\//')

## Actions Recommandées
1. Vérifier dans Vercel Dashboard:
   - Le déploiement est-il "Ready" ?
   - Y a-t-il des erreurs dans l'onglet Functions ?
   - Le domaine est-il bien configuré ?

2. Si toujours 404:
   - Cliquez sur "View Function Logs"
   - Cherchez les erreurs de build
   - Vérifiez les Environment Variables

3. Solution alternative:
   - Créer un nouveau projet Vercel
   - Importer le même repository
   - Comparer les configurations
EOF

echo "✅ Rapport créé: VERCEL-DEBUG-REPORT.md"
echo ""
echo "=========================================="
echo "📝 PROCHAINES ÉTAPES:"
echo "1. Vérifiez le rapport VERCEL-DEBUG-REPORT.md"
echo "2. Allez dans Vercel Dashboard"
echo "3. Cliquez sur le dernier deployment"
echo "4. Regardez l'onglet 'Function Logs'"
echo "=========================================="