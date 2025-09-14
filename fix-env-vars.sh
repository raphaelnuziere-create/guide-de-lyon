#!/bin/bash

echo "🔧 Correction des variables d'environnement Vercel"

# Fonction pour ajouter une variable sans retour à la ligne
add_env_var() {
    local name=$1
    local value=$2
    local env=$3
    
    echo "Ajout de $name..."
    printf "%s" "$value" | vercel env add "$name" "$env" --force
}

# Variables Directus corrigées
add_env_var "NEXT_PUBLIC_DIRECTUS_URL" "https://guide-lyon-cms.directus.app" "production"
add_env_var "NEXT_PUBLIC_USE_DIRECTUS" "true" "production"

echo "✅ Variables mises à jour"
echo "🚀 Redéployez avec: vercel --prod"