<?php
// Configuration Directus Cloud
define('DIRECTUS_URL', 'https://guide-lyon-cms.directus.app');
define('DIRECTUS_EMAIL', 'admin@guide-lyon.fr');
define('DIRECTUS_PASSWORD', 'AdminPassword123!');

// Headers pour les requêtes API
function getHeaders() {
    return [
        'Content-Type: application/json',
        'Accept: application/json'
    ];
}

// Fonction pour authentification Directus
function getDirectusToken() {
    static $token = null;
    
    if ($token !== null) {
        return $token;
    }
    
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
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code === 200) {
        $data = json_decode($response, true);
        $token = $data['data']['access_token'] ?? null;
    }
    
    return $token;
}

// Fonction pour requêtes API Directus
function directusRequest($endpoint, $method = 'GET', $data = null) {
    $token = getDirectusToken();
    if (!$token) {
        return ['error' => 'Authentication failed'];
    }
    
    $headers = array_merge(getHeaders(), [
        'Authorization: Bearer ' . $token
    ]);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, DIRECTUS_URL . '/items/' . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    if ($method === 'POST' && $data) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($response === false) {
        return ['error' => 'Request failed'];
    }
    
    return json_decode($response, true);
}
?>