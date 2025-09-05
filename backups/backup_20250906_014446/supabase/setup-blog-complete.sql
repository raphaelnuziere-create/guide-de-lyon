-- Configuration complète du blog avec images
-- ============================================

-- 1. Créer la table blog_posts si elle n'existe pas
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    image_alt TEXT,
    category VARCHAR(100),
    tags TEXT[],
    author_id UUID REFERENCES profiles(id),
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Ajouter les colonnes image si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'image_url') THEN
        ALTER TABLE blog_posts ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'blog_posts' AND column_name = 'image_alt') THEN
        ALTER TABLE blog_posts ADD COLUMN image_alt TEXT;
    END IF;
END $$;

-- 3. Créer des articles de démonstration s'il n'y en a pas
INSERT INTO blog_posts (title, slug, excerpt, content, category, tags, published, published_at)
SELECT * FROM (VALUES
    (
        'Nouvelle boulangerie artisanale dans le Vieux Lyon',
        'nouvelle-boulangerie-vieux-lyon',
        'Une boulangerie traditionnelle vient d''ouvrir ses portes rue Saint-Jean, proposant des spécialités lyonnaises.',
        'Une nouvelle boulangerie artisanale a ouvert ses portes dans le quartier historique du Vieux Lyon. Située rue Saint-Jean, cette boulangerie propose des pains au levain, des brioches aux pralines et autres spécialités lyonnaises. Le propriétaire, ancien chef pâtissier d''un grand restaurant étoilé, met un point d''honneur à utiliser des farines locales et biologiques.',
        'Commerces',
        ARRAY['boulangerie', 'vieux-lyon', 'artisanat'],
        true,
        NOW() - INTERVAL '2 days'
    ),
    (
        'Top 10 des restaurants avec terrasse pour cet été',
        'top-10-restaurants-terrasse-ete',
        'Découvrez notre sélection des meilleures terrasses où déguster un repas en plein air à Lyon.',
        'L''été approche et avec lui l''envie de profiter des terrasses ensoleillées. Nous avons sélectionné pour vous les 10 meilleures adresses lyonnaises où savourer un repas en extérieur. Du bouchon traditionnel aux restaurants gastronomiques, en passant par les bistrots branchés, voici notre guide complet des terrasses incontournables.',
        'Restaurants',
        ARRAY['restaurant', 'terrasse', 'été', 'guide'],
        true,
        NOW() - INTERVAL '5 days'
    ),
    (
        'Le Parc de la Tête d''Or fait peau neuve',
        'parc-tete-or-renovation',
        'D''importants travaux de rénovation sont en cours au Parc de la Tête d''Or pour moderniser les installations.',
        'Le Parc de la Tête d''Or, poumon vert de Lyon, bénéficie d''un programme de rénovation ambitieux. Les travaux, qui s''étaleront sur 18 mois, incluent la modernisation des aires de jeux, la création de nouveaux espaces de détente et l''amélioration de l''accessibilité. Le lac sera également nettoyé et ses berges réaménagées.',
        'Espaces verts',
        ARRAY['parc', 'tête-or', 'rénovation', 'nature'],
        true,
        NOW() - INTERVAL '1 week'
    ),
    (
        'Festival des Lumières 2024 : Le programme dévoilé',
        'festival-lumieres-2024-programme',
        'La Fête des Lumières revient du 5 au 8 décembre avec des installations spectaculaires.',
        'La traditionnelle Fête des Lumières de Lyon se tiendra du 5 au 8 décembre 2024. Cette année, plus de 30 installations lumineuses transformeront la ville. Des artistes du monde entier viendront illuminer les façades des monuments emblématiques. Le parcours s''étendra de la Presqu''île au Vieux Lyon, en passant par la Croix-Rousse.',
        'Événements',
        ARRAY['festival', 'lumières', 'événement', 'culture'],
        true,
        NOW() - INTERVAL '3 days'
    ),
    (
        'Guide des marchés de Lyon : Où faire ses courses',
        'guide-marches-lyon',
        'Tour d''horizon des meilleurs marchés lyonnais pour trouver des produits frais et locaux.',
        'Lyon compte de nombreux marchés où il fait bon flâner et faire ses emplettes. Du marché de la Croix-Rousse au marché quai Saint-Antoine, en passant par celui de Monplaisir, chaque quartier a son marché de proximité. Découvrez nos conseils pour profiter au mieux de ces lieux de vie et dénicher les meilleurs produits.',
        'Shopping',
        ARRAY['marché', 'shopping', 'produits-locaux'],
        true,
        NOW() - INTERVAL '10 days'
    ),
    (
        'Nouveau musée d''art contemporain à Confluence',
        'nouveau-musee-art-contemporain-confluence',
        'Un nouveau musée dédié à l''art contemporain ouvrira ses portes en 2025 dans le quartier de Confluence.',
        'Le quartier de Confluence continue sa transformation avec l''annonce de l''ouverture d''un nouveau musée d''art contemporain. Prévu pour 2025, ce musée de 5000m² accueillera des collections permanentes et des expositions temporaires d''artistes internationaux. L''architecture du bâtiment, signée par un cabinet renommé, promet d''être spectaculaire.',
        'Culture',
        ARRAY['musée', 'art', 'confluence', 'culture'],
        true,
        NOW() - INTERVAL '4 days'
    ),
    (
        'Les meilleures adresses pour un brunch à Lyon',
        'meilleures-adresses-brunch-lyon',
        'Notre sélection des cafés et restaurants où savourer un brunch gourmand le week-end.',
        'Le brunch est devenu une tradition du week-end à Lyon. Que vous soyez plutôt sucré ou salé, végétarien ou carnivore, nous avons sélectionné pour vous les meilleures adresses. De la Croix-Rousse à Gerland, découvrez où déguster pancakes, œufs Benedict et autres délices du brunch.',
        'Restaurants',
        ARRAY['brunch', 'café', 'restaurant', 'week-end'],
        true,
        NOW() - INTERVAL '6 days'
    ),
    (
        'Transport : Nouvelles lignes de tram prévues pour 2025',
        'nouvelles-lignes-tram-2025',
        'Le réseau TCL s''agrandit avec deux nouvelles lignes de tramway qui desserviront l''est et l''ouest lyonnais.',
        'Le réseau de transport lyonnais continue son expansion. Deux nouvelles lignes de tramway sont prévues pour 2025, permettant de mieux desservir les quartiers est et ouest de la métropole. Ces nouvelles lignes faciliteront les déplacements de milliers d''habitants et contribueront à réduire l''usage de la voiture en ville.',
        'Transport',
        ARRAY['transport', 'tram', 'TCL', 'mobilité'],
        true,
        NOW() - INTERVAL '8 days'
    )
) AS t(title, slug, excerpt, content, category, tags, published, published_at)
WHERE NOT EXISTS (SELECT 1 FROM blog_posts LIMIT 1);

-- 4. Ajouter des images par défaut aux articles
UPDATE blog_posts 
SET 
    image_url = CASE 
        WHEN title LIKE '%boulangerie%' THEN 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&h=900&fit=crop'
        WHEN title LIKE '%restaurant%' OR title LIKE '%brunch%' THEN 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop'
        WHEN title LIKE '%parc%' OR title LIKE '%Tête d''Or%' THEN 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1600&h=900&fit=crop'
        WHEN title LIKE '%festival%' OR title LIKE '%lumières%' THEN 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&h=900&fit=crop'
        WHEN title LIKE '%marché%' THEN 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&h=900&fit=crop'
        WHEN title LIKE '%musée%' OR title LIKE '%art%' THEN 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1600&h=900&fit=crop'
        WHEN title LIKE '%transport%' OR title LIKE '%tram%' THEN 'https://images.unsplash.com/photo-1555967522-37949fc21dcb?w=1600&h=900&fit=crop'
        ELSE 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=1600&h=900&fit=crop' -- Image par défaut de Lyon
    END,
    image_alt = title
WHERE image_url IS NULL;

-- 5. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);

-- 6. Activer RLS (Row Level Security)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture publique
CREATE POLICY "blog_posts_read_public" ON blog_posts
    FOR SELECT
    USING (published = true);

-- Politique pour l'édition par les admins
CREATE POLICY "blog_posts_admin_all" ON blog_posts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 7. Afficher le résultat
SELECT 
    title,
    category,
    CASE 
        WHEN image_url IS NOT NULL THEN '✅ Image ajoutée'
        ELSE '❌ Pas d''image'
    END as statut_image,
    published_at
FROM blog_posts
ORDER BY published_at DESC;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Configuration du blog terminée avec succès !';
    RAISE NOTICE '📸 Les images ont été ajoutées aux articles';
    RAISE NOTICE '🔒 La sécurité RLS est activée';
END $$;