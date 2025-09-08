-- Créer une table pour stocker les références des images téléchargées
CREATE TABLE IF NOT EXISTS article_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug VARCHAR(255) UNIQUE NOT NULL,
  local_path VARCHAR(500) NOT NULL,
  original_url TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  file_size INTEGER,
  mime_type VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche rapide par slug
CREATE INDEX IF NOT EXISTS idx_article_images_slug ON article_images(article_slug);

-- Désactiver RLS pour cette table
ALTER TABLE article_images DISABLE ROW LEVEL SECURITY;