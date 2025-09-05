#!/usr/bin/env python3
"""
Script pour créer automatiquement les tables via Supabase
"""

import json
import subprocess
import sys

def create_tables():
    print("🚀 Création automatique des tables Supabase...")
    print("=" * 50)
    
    # Le script SQL complet
    sql_script = """
-- SUPPRESSION DES ANCIENNES TABLES
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS merchants CASCADE;

-- CRÉATION DE MERCHANTS
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    phone TEXT,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    onboarding_completed BOOLEAN DEFAULT false
);

-- CRÉATION DE PLACES
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRÉATION DE EVENTS
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID REFERENCES merchants(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVATION RLS
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- CRÉATION DES POLICIES
CREATE POLICY "all_merchants" ON merchants FOR ALL USING (true);
CREATE POLICY "all_places" ON places FOR ALL USING (true);
CREATE POLICY "all_events" ON events FOR ALL USING (true);

-- VÉRIFICATION
SELECT 'Tables créées avec succès !' as message;
    """
    
    # Copier le script dans le presse-papier
    process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
    process.communicate(sql_script.encode())
    
    print("✅ Script SQL copié dans le presse-papier !")
    print("")
    print("INSTRUCTIONS FINALES :")
    print("-" * 50)
    print("1. J'ouvre Supabase SQL Editor...")
    subprocess.run(['open', 'https://supabase.com/dashboard/project/ikefyhxelzydaogrnwxi/sql/new'])
    
    print("2. Dans la page qui s'ouvre :")
    print("   - Cliquez dans la zone de texte")
    print("   - Faites Cmd+A pour tout sélectionner")
    print("   - Faites Cmd+V pour coller")
    print("   - Cliquez sur RUN (bouton vert)")
    print("")
    print("3. Vous devriez voir : 'Tables créées avec succès !'")
    print("")
    print("✅ Le script est prêt, il ne reste qu'à cliquer RUN !")
    
    # Vérifier après quelques secondes
    print("")
    input("Appuyez sur ENTRÉE après avoir cliqué RUN...")
    
    # Test de vérification
    import urllib.request
    import urllib.parse
    
    # Charger les variables d'environnement depuis .env.local
    import os
    from dotenv import load_dotenv
    load_dotenv('.env.local')
    
    supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
    supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ ERREUR: Variables d'environnement manquantes dans .env.local")
        print("Vérifiez que NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont définies")
        return
    
    url = f"{supabase_url}/rest/v1/merchants"
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        response = urllib.request.urlopen(req)
        data = response.read()
        
        if response.status == 200:
            print("✅ SUCCÈS ! La table 'merchants' a été créée !")
            print("🎉 Vous pouvez maintenant créer des comptes sur :")
            print("   https://www.guide-de-lyon.fr/pro/register")
            
            # Ouvrir la page d'inscription
            subprocess.run(['open', 'https://www.guide-de-lyon.fr/pro/register'])
        else:
            print("⚠️ La table n'est pas encore accessible")
    except Exception as e:
        if "PGRST" in str(e):
            print("❌ La table 'merchants' n'existe pas encore")
            print("   Assurez-vous d'avoir exécuté le script SQL")
        else:
            print(f"Erreur de vérification : {e}")

if __name__ == "__main__":
    create_tables()