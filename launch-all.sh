#!/bin/bash

# ============================================
# GUIDE DE LYON - SCRIPT DE LANCEMENT
# ============================================
# Lance automatiquement les 5 versions avec serveurs locaux

echo "🚀 GUIDE DE LYON - Lancement des 5 versions"
echo "============================================="

# Vérifier si on est dans le bon dossier
if [[ ! -d "guide-lyon-v1" ]]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis le dossier guide-lyon-v2"
    exit 1
fi

# Lire la clé API Pexels depuis .env.local
if [[ -f ".env.local" ]]; then
    export $(grep -v '^#' .env.local | xargs)
    echo "📄 Fichier .env.local trouvé"
else
    echo "⚠️  Fichier .env.local non trouvé, utilisation de la clé par défaut"
    PEXELS_API_KEY="YOUR_PEXELS_API_KEY_HERE"
fi

echo "🔑 Clé Pexels: ${PEXELS_API_KEY:0:20}..."

# Configurer la clé Pexels dans tous les projets
echo "⚙️  Configuration de la clé Pexels dans les 5 versions..."

for i in {1..5}; do
    PEXELS_FILE="guide-lyon-v${i}/api/pexels-integration.js"
    if [[ -f "$PEXELS_FILE" ]]; then
        # Remplacer la clé API dans le fichier
        sed -i.bak "s/YOUR_PEXELS_API_KEY/$PEXELS_API_KEY/g" "$PEXELS_FILE"
        echo "✅ Version $i: Clé configurée"
    else
        echo "❌ Version $i: Fichier $PEXELS_FILE non trouvé"
    fi
done

# Définir les ports
PORTS=(8001 8002 8003 8004 8005)
URLS=()

echo ""
echo "🌐 Lancement des serveurs locaux..."
echo "===================================="

# Fonction pour tuer les processus sur les ports
cleanup() {
    echo ""
    echo "🛑 Arrêt des serveurs..."
    for port in "${PORTS[@]}"; do
        PID=$(lsof -ti:$port)
        if [[ -n "$PID" ]]; then
            kill -9 $PID 2>/dev/null
            echo "   ✅ Port $port libéré"
        fi
    done
    exit 0
}

# Gérer Ctrl+C
trap cleanup SIGINT SIGTERM

# Lancer les serveurs Python
for i in {1..5}; do
    VERSION_DIR="guide-lyon-v${i}"
    PORT=${PORTS[$((i-1))]}
    URL="http://localhost:${PORT}"
    URLS+=("$URL")
    
    if [[ -d "$VERSION_DIR" ]]; then
        echo "🚀 Version $i: Démarrage sur port $PORT"
        cd "$VERSION_DIR"
        
        # Lancer serveur Python en arrière-plan
        python3 -m http.server $PORT > ../server_v${i}.log 2>&1 &
        SERVER_PID=$!
        
        # Attendre que le serveur démarre
        sleep 1
        
        # Vérifier si le serveur fonctionne
        if curl -s "$URL" > /dev/null; then
            echo "   ✅ Serveur actif: $URL"
        else
            echo "   ❌ Erreur de démarrage sur port $PORT"
        fi
        
        cd ..
    else
        echo "❌ Dossier $VERSION_DIR non trouvé"
    fi
done

echo ""
echo "🌍 URLs disponibles:"
echo "==================="
for i in {1..5}; do
    echo "📌 Version $i: ${URLS[$((i-1))]}"
done

echo ""
echo "📖 Descriptions des versions:"
echo "============================="
echo "🔹 Version 1 (8001): Moderne Minimaliste - Design épuré, bleu Lyon"
echo "🌈 Version 2 (8002): Moderne Coloré - Gradients multicolores"
echo "💼 Version 3 (8003): Premium Corporate - Luxe sombre et doré" 
echo "⚡ Version 4 (8004): Startup Moderne - Style SaaS tech"
echo "🏛️ Version 5 (8005): Local & Authentique - Couleurs lyonnaises"

# Attendre un peu avant d'ouvrir les navigateurs
echo ""
echo "⏳ Ouverture des navigateurs dans 3 secondes..."
sleep 3

# Ouvrir tous les URLs dans le navigateur par défaut
echo "🖥️  Ouverture des 5 versions dans votre navigateur..."
for url in "${URLS[@]}"; do
    if command -v open &> /dev/null; then
        # macOS
        open "$url"
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open "$url"
    elif command -v start &> /dev/null; then
        # Windows
        start "$url"
    else
        echo "   ℹ️  Ouvrez manuellement: $url"
    fi
    sleep 1  # Petit délai entre les ouvertures
done

echo ""
echo "✨ TOUS LES SERVEURS SONT LANCÉS!"
echo "================================="
echo "🎯 Testez les 5 versions de Guide de Lyon"
echo "📊 Comparez les designs et fonctionnalités"
echo "🔄 Press Ctrl+C pour arrêter tous les serveurs"
echo ""
echo "📋 Logs serveurs disponibles:"
for i in {1..5}; do
    echo "   📄 Version $i: server_v${i}.log"
done

# Attendre indéfiniment (les serveurs tournent en arrière-plan)
echo ""
echo "⏸️  Serveurs actifs... (Ctrl+C pour arrêter)"
while true; do
    sleep 1
done