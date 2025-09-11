-- =====================================================
-- FIX INSCRIPTION PRO - COLONNES MANQUANTES
-- =====================================================
-- Ce script ajoute toutes les colonnes manquantes pour
-- que l'inscription pro fonctionne sans erreurs

-- 1. AJOUTER COLONNES BUSINESS MANQUANTES
-- =====================================================

-- Colonnes de base manquantes
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100),
ADD COLUMN IF NOT EXISTS specialties TEXT[],
ADD COLUMN IF NOT EXISTS features TEXT[],
ADD COLUMN IF NOT EXISTS services TEXT[],
ADD COLUMN IF NOT EXISTS amenities TEXT[],  -- COLONNE MANQUANTE CRITIQUE
ADD COLUMN IF NOT EXISTS price_range VARCHAR(20) DEFAULT 'Budget',
ADD COLUMN IF NOT EXISTS address_district VARCHAR(100),
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- 2. COLONNES RESTAURANT SPÉCIFIQUES
-- =====================================================
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS menu JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS cuisine_types TEXT[],
ADD COLUMN IF NOT EXISTS dietary_options TEXT[];

-- 3. COLONNES HÉBERGEMENT SPÉCIFIQUES  
-- =====================================================
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS rooms JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS hotel_amenities TEXT[];

-- 4. COLONNES COMMERCE SPÉCIFIQUES
-- =====================================================
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS product_categories TEXT[],
ADD COLUMN IF NOT EXISTS brands TEXT[],
ADD COLUMN IF NOT EXISTS payment_methods TEXT[];

-- 5. COLONNES PLAN ET BILLING
-- =====================================================
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'expert')),
ADD COLUMN IF NOT EXISTS plan_billing_cycle VARCHAR(20) CHECK (plan_billing_cycle IN ('monthly', 'yearly'));

-- 6. CONTRAINTES ET INDEX
-- =====================================================

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_establishments_plan ON establishments(plan);
CREATE INDEX IF NOT EXISTS idx_establishments_category ON establishments(category);
CREATE INDEX IF NOT EXISTS idx_establishments_subcategory ON establishments(subcategory);
CREATE INDEX IF NOT EXISTS idx_establishments_status ON establishments(status);

-- 7. NETTOYAGE DES DONNÉES EXISTANTES
-- =====================================================

-- Mettre à jour les établissements existants avec des valeurs par défaut
UPDATE establishments 
SET 
  specialties = COALESCE(specialties, '{}'),
  features = COALESCE(features, '{}'),
  services = COALESCE(services, '{}'),
  amenities = COALESCE(amenities, '{}'),  -- FIX CRITIQUE
  cuisine_types = COALESCE(cuisine_types, '{}'),
  dietary_options = COALESCE(dietary_options, '{}'),
  hotel_amenities = COALESCE(hotel_amenities, '{}'),
  product_categories = COALESCE(product_categories, '{}'),
  brands = COALESCE(brands, '{}'),
  payment_methods = COALESCE(payment_methods, '{}'),
  plan = COALESCE(plan, 'basic'),
  views_count = COALESCE(views_count, 0)
WHERE 
  specialties IS NULL OR 
  features IS NULL OR 
  services IS NULL OR 
  amenities IS NULL OR
  plan IS NULL OR
  views_count IS NULL;

-- 8. MESSAGE DE CONFIRMATION
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ FIX INSCRIPTION PRO APPLIQUÉ AVEC SUCCÈS';
    RAISE NOTICE '📊 Colonnes ajoutées: amenities, specialties, features, services, etc.';
    RAISE NOTICE '🏪 Le workflow d''inscription professionnel devrait maintenant fonctionner';
END $$;

-- 9. VÉRIFICATION
-- =====================================================

-- Vérifier que la colonne amenities existe maintenant
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'establishments' 
        AND column_name = 'amenities'
    ) THEN
        RAISE NOTICE '✅ Colonne amenities trouvée dans establishments';
    ELSE
        RAISE EXCEPTION '❌ Colonne amenities toujours manquante !';
    END IF;
END $$;