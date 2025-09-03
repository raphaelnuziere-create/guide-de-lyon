#!/bin/bash

echo "==============================================="
echo "🔧 SCRIPT DE RÉSOLUTION DES PROBLÈMES VERCEL"
echo "==============================================="
echo ""

# Fonction pour afficher en couleur
print_success() {
    echo -e "\033[0;32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[0;31m❌ $1\033[0m"
}

print_info() {
    echo -e "\033[0;34mℹ️  $1\033[0m"
}

print_warning() {
    echo -e "\033[0;33m⚠️  $1\033[0m"
}

# Étape 1: Vérifier GitHub CLI
echo "📍 Étape 1: Vérification de GitHub CLI"
if command -v gh &> /dev/null; then
    print_success "GitHub CLI est installé"
    
    # Vérifier l'authentification
    if gh auth status &>/dev/null; then
        print_success "Vous êtes connecté à GitHub"
    else
        print_warning "Vous devez vous connecter à GitHub"
        echo "Exécutez: gh auth login"
        echo "Choisissez: GitHub.com → HTTPS → Login with web browser"
        exit 1
    fi
else
    print_error "GitHub CLI n'est pas installé"
    echo "Installation en cours..."
    brew install gh
    echo "Puis exécutez à nouveau ce script"
    exit 1
fi

echo ""
echo "📍 Étape 2: Vérification du repository"

# Vérifier la visibilité du repo
REPO_INFO=$(gh repo view raphaelnuziere-create/guide-de-lyon --json visibility,isPrivate 2>&1)

if [[ $REPO_INFO == *"Could not resolve"* ]]; then
    print_error "Repository non trouvé ou pas d'accès"
    echo "Vérifiez que vous êtes connecté avec le bon compte GitHub"
    exit 1
fi

IS_PRIVATE=$(echo $REPO_INFO | grep -o '"isPrivate":[^,}]*' | cut -d: -f2)

if [[ $IS_PRIVATE == "true" ]]; then
    print_warning "Le repository est PRIVÉ"
    echo ""
    echo "🔓 SOLUTION RAPIDE: Rendre le repo PUBLIC temporairement"
    echo ""
    echo "Voulez-vous rendre le repository PUBLIC maintenant? (y/n)"
    read -r response
    
    if [[ "$response" == "y" ]]; then
        print_info "Passage du repository en PUBLIC..."
        gh repo edit raphaelnuziere-create/guide-de-lyon --visibility public
        
        if [ $? -eq 0 ]; then
            print_success "Repository maintenant PUBLIC!"
            echo ""
            echo "📝 PROCHAINES ÉTAPES:"
            echo "1. Allez sur https://vercel.com/dashboard"
            echo "2. Cliquez sur votre projet 'guide-lyon-v2'"
            echo "3. Cliquez sur 'Redeploy' (bouton en haut à droite)"
            echo "4. Attendez 2-3 minutes"
            echo "5. Testez: https://www.guide-de-lyon.fr/test"
            echo ""
            echo "Une fois que tout fonctionne, vous pourrez repasser en privé avec:"
            echo "gh repo edit raphaelnuziere-create/guide-de-lyon --visibility private"
        else
            print_error "Erreur lors du changement de visibilité"
            echo "Essayez manuellement sur GitHub.com"
        fi
    else
        echo ""
        echo "📋 INSTRUCTIONS MANUELLES:"
        echo "1. Allez sur https://github.com/raphaelnuziere-create/guide-de-lyon"
        echo "2. Cliquez sur Settings (⚙️)"
        echo "3. Scrollez tout en bas"
        echo "4. 'Change repository visibility' → Public"
        echo "5. Confirmez"
        echo "6. Retournez sur Vercel et cliquez 'Redeploy'"
    fi
else
    print_success "Le repository est déjà PUBLIC"
    echo ""
    echo "Le problème n'est pas la visibilité du repo."
    echo ""
    echo "📝 VÉRIFICATIONS À FAIRE:"
    echo "1. Sur Vercel (https://vercel.com/dashboard):"
    echo "   - Le projet existe-t-il?"
    echo "   - Y a-t-il des erreurs dans l'onglet 'Functions'?"
    echo "   - Dans Settings → Git, le repo est-il bien connecté?"
    echo ""
    echo "2. Essayez de redéployer:"
    echo "   - Cliquez sur 'Redeploy' dans Vercel"
    echo "   - Ou forcez un nouveau commit:"
    git add . && git commit -m "Force redeploy" --allow-empty && git push
fi

echo ""
echo "==============================================="
echo "📧 Si le problème persiste:"
echo "Partagez ces informations avec le support:"
echo "- Repository: raphaelnuziere-create/guide-de-lyon" 
echo "- Branch: main"
echo "- Derniers commits poussés avec succès"
echo "==============================================="