-- Script pour corriger la longueur des URLs de médias
-- Les URLs Google Places sont très longues (>500 caractères)

-- Augmenter la taille de la colonne URL des médias
ALTER TABLE establishment_media 
ALTER COLUMN url TYPE TEXT;

-- Vérifier la modification
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'establishment_media' 
  AND column_name = 'url';