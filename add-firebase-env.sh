#!/bin/bash

# Variables Firebase Admin (vous devez remplacer par vos propres valeurs)
# Aller sur: https://console.firebase.google.com/project/guide-de-lyon-b6a38/settings/serviceaccounts/adminsdk
# Générer une nouvelle clé privée et copier les valeurs

echo "Ajout des variables d'environnement Firebase sur Vercel..."

# Variables publiques Firebase (remplacer par vos valeurs)
# IMPORTANT: Remplacez ces valeurs par vos propres clés Firebase
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production <<< '[VOTRE_CLE_FIREBASE_API]'
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production <<< '[VOTRE_DOMAINE_AUTH_FIREBASE]'
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production <<< '[VOTRE_PROJECT_ID_FIREBASE]'
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production <<< '[VOTRE_STORAGE_BUCKET_FIREBASE]'
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production <<< '[VOTRE_SENDER_ID]'
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production <<< '[VOTRE_APP_ID_FIREBASE]'

# Variables Firebase Admin (à remplir)
echo "IMPORTANT: Vous devez obtenir ces valeurs depuis Firebase Console"
echo "1. Aller sur https://console.firebase.google.com/project/[VOTRE_PROJECT_ID]/settings/serviceaccounts/adminsdk"
echo "2. Cliquer sur 'Générer une nouvelle clé privée'"
echo "3. Copier les valeurs du fichier JSON généré"

vercel env add FIREBASE_ADMIN_PROJECT_ID production <<< '[VOTRE_PROJECT_ID_FIREBASE]'
vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production

echo "Variables ajoutées avec succès!"
