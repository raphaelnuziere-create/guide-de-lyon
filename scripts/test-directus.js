const https = require('https');

const DIRECTUS_URL = 'https://guide-lyon-cms.directus.app';
const DIRECTUS_EMAIL = 'admin@guide-lyon.fr';
const DIRECTUS_PASSWORD = 'AdminPassword123!';

// Fonction pour faire des requêtes HTTP
function makeRequest(url, options = {}, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonResponse });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Fonction pour obtenir le token Directus
async function getDirectusToken() {
    try {
        console.log('🔑 Test d\'authentification Directus...');
        
        const authData = {
            email: DIRECTUS_EMAIL,
            password: DIRECTUS_PASSWORD
        };

        const response = await makeRequest(`${DIRECTUS_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }, authData);

        if (response.status === 200 && response.data.data) {
            console.log('✅ Authentification réussie!');
            return response.data.data.access_token;
        } else {
            console.log('❌ Échec de l\'authentification:', response.status, response.data);
            return null;
        }
    } catch (error) {
        console.log('❌ Erreur lors de l\'authentification:', error.message);
        return null;
    }
}

// Fonction pour tester les collections
async function testCollections(token) {
    const collections = ['entreprises', 'evenements', 'articles'];
    
    console.log('\n📊 Test des collections...');
    
    for (const collection of collections) {
        try {
            const response = await makeRequest(`${DIRECTUS_URL}/items/${collection}?limit=1`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                const count = response.data.data ? response.data.data.length : 0;
                console.log(`✅ ${collection}: accessible (${count} items)`);
            } else {
                console.log(`❌ ${collection}: erreur ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${collection}: erreur - ${error.message}`);
        }
    }
}

// Fonction principale
async function main() {
    console.log('=== Test de connexion Directus ===\n');
    
    const token = await getDirectusToken();
    
    if (token) {
        console.log(`Token obtenu: ${token.substring(0, 20)}...`);
        await testCollections(token);
    }
    
    console.log('\n=== Fin du test ===');
}

main().catch(console.error);