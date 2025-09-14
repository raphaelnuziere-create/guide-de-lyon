<?php
require_once '../api/config.php';

echo "=== Test de connexion Directus ===\n";

// Test d'authentification
echo "Test d'authentification...\n";
$token = getDirectusToken();

if ($token) {
    echo "✅ Authentification réussie!\n";
    echo "Token: " . substr($token, 0, 20) . "...\n\n";
    
    // Test de récupération des collections
    echo "Test de récupération des collections...\n";
    $collections = directusRequest('');
    
    if (isset($collections['error'])) {
        echo "❌ Erreur: " . $collections['error'] . "\n";
    } else {
        echo "✅ Connexion API réussie!\n";
        
        // Tester les collections spécifiques
        echo "\nTest des collections:\n";
        
        $collections_to_test = ['entreprises', 'evenements', 'articles'];
        
        foreach ($collections_to_test as $collection) {
            echo "- Testant $collection...\n";
            $result = directusRequest($collection . '?limit=1');
            
            if (isset($result['error'])) {
                echo "  ❌ Erreur: " . $result['error'] . "\n";
            } elseif (isset($result['data'])) {
                echo "  ✅ Collection accessible (items: " . count($result['data']) . ")\n";
            } else {
                echo "  ⚠️  Collection vide ou non configurée\n";
            }
        }
    }
} else {
    echo "❌ Échec de l'authentification\n";
    echo "Vérifiez les credentials dans config.php\n";
}

echo "\n=== Fin du test ===\n";
?>