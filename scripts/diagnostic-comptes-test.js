#!/usr/bin/env node

/**
 * DIAGNOSTIC COMPTES DE TEST
 * ==========================
 * 
 * Ce script diagnostique pourquoi les comptes pro et expert ne marchent pas
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase depuis .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ikefyhxelzydaogrnwxi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrZWZ5aHhlbHp5ZGFvZ3Jud3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY5Njc1NCwiZXhwIjoyMDcxMjcyNzU0fQ.Ink48F4a18sn-nbcKBbxwBCRA9Yur1z1_vmrR_Ku47Y';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnosticCompletTestaComptes() {
    console.log('🔍 DIAGNOSTIC COMPLETS COMPTES DE TEST');
    console.log('=====================================\n');

    try {
        // 1. Vérifier les utilisateurs auth
        console.log('1️⃣ UTILISATEURS AUTH:');
        const { data: users, error: usersError } = await supabase
            .from('auth.users')
            .select('id, email, created_at, email_confirmed_at')
            .like('email', '%test.com');

        if (usersError) {
            console.log('❌ Erreur récupération users:', usersError.message);
            // Essayer avec une approche différente
            const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
            if (authError) {
                console.log('❌ Erreur auth admin:', authError.message);
            } else {
                const testUsers = authUsers.users.filter(u => u.email?.includes('test.com'));
                console.log('👥 Utilisateurs trouvés via auth.admin:', testUsers.length);
                testUsers.forEach(user => {
                    console.log(`   - ${user.email} | ID: ${user.id} | Confirmé: ${user.email_confirmed_at ? '✅' : '❌'}`);
                });
            }
        } else {
            console.log('👥 Utilisateurs trouvés:', users?.length || 0);
            users?.forEach(user => {
                console.log(`   - ${user.email} | ID: ${user.id} | Confirmé: ${user.email_confirmed_at ? '✅' : '❌'}`);
            });
        }

        // 2. Vérifier les établissements
        console.log('\n2️⃣ ÉTABLISSEMENTS:');
        const { data: establishments, error: estError } = await supabase
            .from('establishments')
            .select('id, name, email, plan, status, verified, user_id')
            .like('email', '%test.com');

        if (estError) {
            console.log('❌ Erreur récupération établissements:', estError.message);
        } else {
            console.log('🏪 Établissements trouvés:', establishments?.length || 0);
            establishments?.forEach(est => {
                console.log(`   - ${est.email} | Plan: ${est.plan} | Statut: ${est.status} | User ID: ${est.user_id ? '✅' : '❌'}`);
            });
        }

        // 3. Diagnostic des problèmes
        console.log('\n3️⃣ DIAGNOSTIC DES PROBLÈMES:');
        
        const comptesTestes = ['basic@test.com', 'pro@test.com', 'expert@test.com'];
        
        for (const email of comptesTestes) {
            console.log(`\n🔍 Analyse ${email}:`);
            
            // Chercher l'utilisateur
            const { data: authData } = await supabase.auth.admin.listUsers();
            const user = authData?.users.find(u => u.email === email);
            
            if (!user) {
                console.log(`   ❌ PROBLÈME: Utilisateur ${email} n'existe pas dans auth`);
                console.log(`   💡 SOLUTION: Créer via Supabase Dashboard > Auth > Users`);
                continue;
            }
            
            if (!user.email_confirmed_at) {
                console.log(`   ⚠️  PROBLÈME: Email ${email} non confirmé`);
                console.log(`   💡 SOLUTION: Confirmer email via Dashboard`);
            } else {
                console.log(`   ✅ Utilisateur auth OK`);
            }
            
            // Chercher l'établissement
            const { data: est } = await supabase
                .from('establishments')
                .select('*')
                .eq('email', email)
                .single();
            
            if (!est) {
                console.log(`   ❌ PROBLÈME: Établissement ${email} n'existe pas`);
                console.log(`   💡 SOLUTION: Exécuter create-all-test-accounts.sql`);
            } else if (est.user_id !== user.id) {
                console.log(`   ❌ PROBLÈME: user_id incorrect (${est.user_id} vs ${user.id})`);
                console.log(`   💡 SOLUTION: UPDATE establishments SET user_id='${user.id}' WHERE email='${email}'`);
            } else if (est.status !== 'active') {
                console.log(`   ⚠️  PROBLÈME: Statut ${est.status} au lieu de 'active'`);
                console.log(`   💡 SOLUTION: UPDATE establishments SET status='active' WHERE email='${email}'`);
            } else {
                console.log(`   ✅ Établissement OK`);
            }
        }

        // 4. Instructions de correction
        console.log('\n4️⃣ INSTRUCTIONS DE CORRECTION:');
        console.log('===============================');
        console.log('');
        console.log('Si des comptes manquent:');
        console.log('1. 🌐 Aller sur: https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/auth/users');
        console.log('2. ➕ Cliquer "Add User"');
        console.log('3. 📧 Créer chaque compte manquant:');
        console.log('   - basic@test.com / BasicTest123!');
        console.log('   - pro@test.com / ProTest123!');
        console.log('   - expert@test.com / ExpertTest123!');
        console.log('4. ✅ Confirmer les emails immédiatement');
        console.log('5. 🗃️ Exécuter scripts/create-all-test-accounts.sql');
        console.log('');
        console.log('📝 Puis tester la connexion sur:');
        console.log('https://guide-lyon-v2-b6wyq3tvp-raphaels-projects-8d8ce8f4.vercel.app/auth/pro/connexion');

    } catch (error) {
        console.error('💥 Erreur durant le diagnostic:', error.message);
    }
}

// Charger les variables d'environnement
if (require('fs').existsSync('.env.local')) {
    const envContent = require('fs').readFileSync('.env.local', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key] = valueParts.join('=');
        }
    });
}

// Exécuter le diagnostic
diagnosticCompletTestaComptes();