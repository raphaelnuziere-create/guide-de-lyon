<?php
require_once 'config.php';

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Debug Directus - Guide de Lyon</title>
    <style>
        body { 
            font-family: monospace; 
            background: #1a1a1a; 
            color: #00ff00; 
            padding: 20px; 
            line-height: 1.6;
        }
        .success { color: #00ff00; }
        .error { color: #ff0000; }
        .warning { color: #ffaa00; }
        .info { color: #00aaff; }
        pre { background: #000; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🔧 Debug Directus Connection</h1>
    
    <?php
    echo "<h2>📋 Configuration</h2>";
    echo "<pre>";
    echo "DIRECTUS_URL: " . DIRECTUS_URL . "\n";
    echo "DIRECTUS_EMAIL: " . DIRECTUS_EMAIL . "\n";
    echo "DIRECTUS_PASSWORD: " . (DIRECTUS_PASSWORD ? str_repeat('*', strlen(DIRECTUS_PASSWORD)) : 'NOT SET') . "\n";
    echo "</pre>";
    
    echo "<h2>🔑 Test d'authentification</h2>";
    
    $auth_data = json_encode([
        'email' => DIRECTUS_EMAIL,
        'password' => DIRECTUS_PASSWORD
    ]);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, DIRECTUS_URL . '/auth/login');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $auth_data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, getHeaders());
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_VERBOSE, true);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    echo "<pre>";
    echo "HTTP Code: $http_code\n";
    
    if ($curl_error) {
        echo "<span class='error'>CURL Error: $curl_error</span>\n";
    }
    
    if ($response) {
        echo "Response: " . htmlspecialchars($response) . "\n";
        
        $data = json_decode($response, true);
        if ($data && isset($data['data']['access_token'])) {
            echo "<span class='success'>✅ Token obtenu!</span>\n";
            $token = $data['data']['access_token'];
            echo "Token: " . substr($token, 0, 20) . "...\n";
            
            // Test des collections
            echo "\n<h2>📊 Test des collections</h2>";
            
            $collections = ['entreprises', 'evenements', 'articles'];
            
            foreach ($collections as $collection) {
                echo "\n--- Test collection: $collection ---\n";
                
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, DIRECTUS_URL . "/items/$collection?limit=1");
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge(getHeaders(), [
                    'Authorization: Bearer ' . $token
                ]));
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                
                $coll_response = curl_exec($ch);
                $coll_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                
                echo "HTTP Code: $coll_http_code\n";
                
                if ($coll_response) {
                    $coll_data = json_decode($coll_response, true);
                    if ($coll_data && isset($coll_data['data'])) {
                        echo "<span class='success'>✅ Collection accessible (" . count($coll_data['data']) . " items)</span>\n";
                    } else {
                        echo "<span class='warning'>⚠️ Response: " . htmlspecialchars($coll_response) . "</span>\n";
                    }
                } else {
                    echo "<span class='error'>❌ Pas de réponse</span>\n";
                }
            }
            
        } else {
            echo "<span class='error'>❌ Pas de token dans la réponse</span>\n";
        }
    } else {
        echo "<span class='error'>❌ Pas de réponse</span>\n";
    }
    echo "</pre>";
    
    echo "<h2>🌐 Test de l'URL Directus</h2>";
    echo "<pre>";
    
    // Test simple de l'URL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, DIRECTUS_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $url_response = curl_exec($ch);
    $url_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $url_error = curl_error($ch);
    curl_close($ch);
    
    echo "URL Test HTTP Code: $url_http_code\n";
    if ($url_error) {
        echo "<span class='error'>URL Error: $url_error</span>\n";
    }
    if ($url_response) {
        echo "URL accessible\n";
    }
    echo "</pre>";
    ?>
    
    <h2>📝 Notes</h2>
    <pre>
Pour configurer Directus Cloud:
1. Aller sur https://directus.cloud
2. Créer un projet "guide-lyon-cms"
3. Configurer l'utilisateur admin
4. Créer les collections: entreprises, evenements, articles
5. Mettre à jour config.php avec les bonnes credentials
    </pre>
    
    <p><a href="/" style="color: #00aaff;">← Retour à l'accueil</a></p>
</body>
</html>