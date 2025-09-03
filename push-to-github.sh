#!/bin/bash

# Script pour pousser le code vers GitHub
# Remplacez VOTRE-USERNAME par votre nom d'utilisateur GitHub

echo "📦 Configuration du repository GitHub..."
echo "Veuillez entrer votre nom d'utilisateur GitHub:"
read github_username

# Supprimer l'ancien remote s'il existe
git remote remove origin 2>/dev/null

# Ajouter le nouveau remote
git remote add origin https://github.com/${github_username}/guide-lyon-v2.git

echo "🔄 Vérification de la configuration..."
git remote -v

echo "📤 Push du code vers GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Code poussé avec succès vers GitHub!"
    echo "Repository URL: https://github.com/${github_username}/guide-lyon-v2"
else
    echo "❌ Erreur lors du push. Vérifiez vos credentials GitHub."
fi