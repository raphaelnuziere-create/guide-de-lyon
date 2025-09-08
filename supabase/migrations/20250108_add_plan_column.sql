-- Migration: Ajout de la colonne plan dans establishments
-- Date: 2025-01-08
-- Description: Ajoute la colonne plan pour gérer les abonnements

-- Ajouter la colonne plan avec une valeur par défaut
ALTER TABLE establishments 
ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'expert'));

-- Mettre à jour les établissements existants selon leur metadata
UPDATE establishments 
SET plan = COALESCE((metadata->>'plan')::text, 'basic')
WHERE plan IS NULL OR plan = 'basic';

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_establishments_plan ON establishments(plan);

-- Ajouter des commentaires
COMMENT ON COLUMN establishments.plan IS 'Plan d''abonnement: basic (gratuit), pro (29€), expert (79€)';