-- Migration pour ajouter les images aux articles de blog
-- ============================================

-- Ajouter la colonne image_url à la table blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_alt TEXT;

-- Créer un index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_blog_posts_image_url ON blog_posts(image_url);

-- Commentaires sur les colonnes
COMMENT ON COLUMN blog_posts.image_url IS 'URL de l''image de l''article (Pexels ou autre)';
COMMENT ON COLUMN blog_posts.image_alt IS 'Texte alternatif pour l''accessibilité';

-- Vérifier que la migration s'est bien effectuée
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'blog_posts' 
    AND column_name = 'image_url'
  ) THEN
    RAISE NOTICE 'Migration réussie : colonne image_url ajoutée à blog_posts';
  ELSE
    RAISE EXCEPTION 'Erreur : la colonne image_url n''a pas été ajoutée';
  END IF;
END $$;