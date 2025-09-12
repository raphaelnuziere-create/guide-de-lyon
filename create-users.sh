#!/bin/bash

echo "🚀 Création des utilisateurs test dans Directus..."

DIRECTUS_URL="http://localhost:8055"

# Essayer de se connecter avec différents credentials admin
echo "🔐 Tentative de connexion admin..."

# Credentials possibles
declare -a admin_creds=(
  '{"email": "admin@admin.com", "password": "admin"}'
  '{"email": "admin@example.com", "password": "admin"}'
  '{"email": "admin@test.com", "password": "password"}'
  '{"email": "admin", "password": "admin"}'
)

ACCESS_TOKEN=""
ADMIN_EMAIL=""

# Tester chaque credential
for creds in "${admin_creds[@]}"; do
  echo "   Essai avec: $(echo $creds | grep -o '"email": "[^"]*"')"
  
  response=$(curl -s -X POST "$DIRECTUS_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "$creds")
  
  # Vérifier si la connexion a réussi
  if echo "$response" | grep -q '"access_token"'; then
    ACCESS_TOKEN=$(echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d '"' -f 4)
    ADMIN_EMAIL=$(echo $creds | grep -o '"email": "[^"]*"' | cut -d '"' -f 4)
    echo "✅ Connexion admin réussie avec: $ADMIN_EMAIL"
    break
  fi
done

# Vérifier si on a un token
if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Impossible de se connecter en tant qu'admin"
  echo ""
  echo "📝 Veuillez créer les comptes manuellement :"
  echo "   1. Aller sur http://localhost:8055/admin"
  echo "   2. Se connecter avec vos credentials admin"
  echo "   3. Users > Create User"
  echo "   4. Créer pro@test.com / ProTest123!"
  echo "   5. Créer expert@test.com / ExpertTest123!"
  exit 1
fi

echo "👤 Création des utilisateurs test..."

# Créer utilisateur PRO
echo "   Création de pro@test.com..."
pro_response=$(curl -s -X POST "$DIRECTUS_URL/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "email": "pro@test.com",
    "password": "ProTest123!",
    "first_name": "Test",
    "last_name": "Pro",
    "status": "active"
  }')

if echo "$pro_response" | grep -q '"id"'; then
  pro_id=$(echo "$pro_response" | grep -o '"id":"[^"]*"' | cut -d '"' -f 4)
  echo "✅ Utilisateur PRO créé: pro@test.com (ID: $pro_id)"
elif echo "$pro_response" | grep -q -i "already exists\|duplicate"; then
  echo "ℹ️ L'utilisateur pro@test.com existe déjà"
else
  echo "⚠️ Erreur création PRO: $pro_response"
fi

# Créer utilisateur EXPERT
echo "   Création de expert@test.com..."
expert_response=$(curl -s -X POST "$DIRECTUS_URL/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "email": "expert@test.com",
    "password": "ExpertTest123!",
    "first_name": "Test",
    "last_name": "Expert",
    "status": "active"
  }')

if echo "$expert_response" | grep -q '"id"'; then
  expert_id=$(echo "$expert_response" | grep -o '"id":"[^"]*"' | cut -d '"' -f 4)
  echo "✅ Utilisateur EXPERT créé: expert@test.com (ID: $expert_id)"
elif echo "$expert_response" | grep -q -i "already exists\|duplicate"; then
  echo "ℹ️ L'utilisateur expert@test.com existe déjà"
else
  echo "⚠️ Erreur création EXPERT: $expert_response"
fi

echo ""
echo "🎉 Configuration terminée !"
echo "🔗 Testez maintenant sur: http://localhost:3000/auth/pro/connexion"
echo "👤 Comptes disponibles:"
echo "   • PRO: pro@test.com / ProTest123!"
echo "   • EXPERT: expert@test.com / ExpertTest123!"