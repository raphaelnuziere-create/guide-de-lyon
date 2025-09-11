#!/bin/bash

# ============================================
# SYNC ENVIRONMENT VARIABLES TO VERCEL
# ============================================
# Ce script synchronise vos variables .env.local vers Vercel

echo "🚀 Synchronisation des variables d'environnement vers Vercel..."

# Lire le fichier .env.local et extraire les variables critiques
if [ ! -f ".env.local" ]; then
    echo "❌ Fichier .env.local non trouvé!"
    exit 1
fi

# Variables critiques pour Supabase
echo "📋 Variables Supabase à ajouter:"
echo "NEXT_PUBLIC_SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2)"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d'=' -f2)"
echo "SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d'=' -f2)"

echo ""
echo "🔧 Pour ajouter ces variables à Vercel, exécutez manuellement:"
echo ""
echo "vercel env add NEXT_PUBLIC_SUPABASE_URL"
echo "# Entrez: $(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2)"
echo ""
echo "vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY"  
echo "# Entrez: $(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d'=' -f2)"
echo ""
echo "vercel env add SUPABASE_SERVICE_ROLE_KEY"
echo "# Entrez: $(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d'=' -f2)"

echo ""
echo "✅ Puis relancez: vercel --prod"