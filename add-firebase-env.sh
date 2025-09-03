#!/bin/bash

# Variables Firebase Admin (vous devez remplacer par vos propres valeurs)
# Aller sur: https://console.firebase.google.com/project/guide-de-lyon-b6a38/settings/serviceaccounts/adminsdk
# Générer une nouvelle clé privée et copier les valeurs

echo "Ajout des variables d'environnement Firebase sur Vercel..."

# Variables publiques Firebase (déjà dans .env.local)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production <<< 'AIzaSyCx6EvZlp_pX9GaRu_NvCHTa3Tk_k18OU4'
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production <<< 'guide-de-lyon-b6a38.firebaseapp.com'
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production <<< 'guide-de-lyon-b6a38'
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production <<< 'guide-de-lyon-b6a38.firebasestorage.app'
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production <<< '173827247208'
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production <<< '1:173827247208:web:899a74bd3a5a24f1f63fdd'

# Variables Firebase Admin (à remplir)
echo "IMPORTANT: Vous devez obtenir ces valeurs depuis Firebase Console"
echo "1. Aller sur https://console.firebase.google.com/project/guide-de-lyon-b6a38/settings/serviceaccounts/adminsdk"
echo "2. Cliquer sur 'Générer une nouvelle clé privée'"
echo "3. Copier les valeurs du fichier JSON généré"

vercel env add FIREBASE_ADMIN_PROJECT_ID production <<< 'guide-de-lyon-b6a38'
vercel env add FIREBASE_ADMIN_CLIENT_EMAIL production
vercel env add FIREBASE_ADMIN_PRIVATE_KEY production

echo "Variables ajoutées avec succès!"
