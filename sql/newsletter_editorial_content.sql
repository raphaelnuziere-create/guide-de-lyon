-- ============================================
-- BASE DE DONNÉES CONTENU ÉDITORIAL NEWSLETTER
-- Guide de Lyon - Anecdotes, histoires et contenus personnalisés
-- ============================================

-- 1. Table des anecdotes et histoires lyonnaises
DROP TABLE IF EXISTS newsletter_editorial_content CASCADE;
CREATE TABLE newsletter_editorial_content (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'anecdote', 'story', 'tip', 'question', 'fact'
  category VARCHAR(50) NOT NULL, -- 'patrimoine', 'gastronomie', 'personnage', 'moderne', 'insolite'
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  short_version TEXT, -- Version courte pour newsletter quotidienne
  day_of_week INTEGER, -- 1-7, NULL pour utilisation flexible
  season VARCHAR(20), -- 'spring', 'summer', 'autumn', 'winter', NULL pour toute l'année
  tags TEXT[], -- Tags pour recherche et filtrage
  
  -- Métadonnées
  author VARCHAR(100), -- Membre de l'équipe qui a écrit
  source VARCHAR(255), -- Source de l'info si applicable
  difficulty_level INTEGER DEFAULT 1, -- 1=facile, 2=moyen, 3=expert (pour varier)
  mood VARCHAR(30), -- 'joyeux', 'nostalgique', 'surprenant', 'informatif'
  
  -- Usage et performance
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  performance_score DECIMAL(3,2) DEFAULT 5.0, -- Note sur 10 basée sur engagement
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT newsletter_editorial_content_type_check CHECK (type IN ('anecdote', 'story', 'tip', 'question', 'fact', 'personal_story')),
  CONSTRAINT newsletter_editorial_content_category_check CHECK (category IN ('patrimoine', 'gastronomie', 'personnage', 'moderne', 'insolite', 'tradition', 'quartier')),
  CONSTRAINT newsletter_editorial_content_day_check CHECK (day_of_week IS NULL OR (day_of_week >= 1 AND day_of_week <= 7)),
  CONSTRAINT newsletter_editorial_content_season_check CHECK (season IS NULL OR season IN ('spring', 'summer', 'autumn', 'winter'))
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_newsletter_editorial_content_type ON newsletter_editorial_content(type);
CREATE INDEX idx_newsletter_editorial_content_category ON newsletter_editorial_content(category);
CREATE INDEX idx_newsletter_editorial_content_day ON newsletter_editorial_content(day_of_week) WHERE day_of_week IS NOT NULL;
CREATE INDEX idx_newsletter_editorial_content_active ON newsletter_editorial_content(is_active) WHERE is_active = true;
CREATE INDEX idx_newsletter_editorial_content_last_used ON newsletter_editorial_content(last_used_at);
CREATE INDEX idx_newsletter_editorial_content_performance ON newsletter_editorial_content(performance_score DESC);

-- 2. Table des conseils d'ami
DROP TABLE IF EXISTS newsletter_friendly_tips CASCADE;
CREATE TABLE newsletter_friendly_tips (
  id SERIAL PRIMARY KEY,
  tip_text TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'transport', 'food', 'culture', 'practical', 'secret_spot'
  context VARCHAR(100), -- Contexte d'utilisation : 'morning', 'evening', 'weekend', 'rainy_day'
  season VARCHAR(20),
  neighborhood VARCHAR(100), -- Arrondissement ou quartier concerné
  
  -- Métadonnées
  author VARCHAR(100),
  verified BOOLEAN DEFAULT false, -- Info vérifiée par l'équipe
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des questions engageantes
DROP TABLE IF EXISTS newsletter_engagement_questions CASCADE;
CREATE TABLE newsletter_engagement_questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'preference', 'experience', 'opinion', 'discovery'
  expected_responses TEXT[], -- Types de réponses attendues
  follow_up_text TEXT, -- Texte de suivi si la question génère des réponses
  
  -- Contexte d'utilisation
  context VARCHAR(100), -- 'daily', 'weekly', 'event_related', 'seasonal'
  season VARCHAR(20),
  related_topic VARCHAR(100), -- 'food', 'culture', 'nightlife', 'sport', etc.
  
  -- Performance
  usage_count INTEGER DEFAULT 0,
  response_count INTEGER DEFAULT 0, -- Nombre de réponses reçues
  engagement_score DECIMAL(3,2) DEFAULT 0, -- Score d'engagement calculé
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des salutations personnalisées
DROP TABLE IF EXISTS newsletter_greetings CASCADE;
CREATE TABLE newsletter_greetings (
  id SERIAL PRIMARY KEY,
  greeting_text VARCHAR(255) NOT NULL,
  tone VARCHAR(50) NOT NULL, -- 'energetic', 'casual', 'warm', 'playful'
  time_of_day VARCHAR(20), -- 'morning', 'afternoon', 'evening'
  day_of_week INTEGER, -- 1-7 pour des salutations spécifiques
  weather_context VARCHAR(50), -- 'sunny', 'rainy', 'cold', 'hot'
  season VARCHAR(20),
  
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Données initiales - ANECDOTES ET HISTOIRES

INSERT INTO newsletter_editorial_content (type, category, title, content, short_version, day_of_week, tags, author, mood) VALUES

-- PATRIMOINE ET HISTOIRE
('anecdote', 'patrimoine', 'La Basilique Notre-Dame de Fourvière', 
'Tu sais pourquoi on l''appelle "l''éléphant à l''envers" ? Vue de loin, ses quatre tours ressemblent aux pattes d''un éléphant renversé ! Les Lyonnais ont toujours eu de l''humour pour surnommer leurs monuments. D''ailleurs, avant sa construction en 1884, les Lyonnais l''appelaient déjà "la chose" pendant les travaux ! 😄',
'Fun fact : Notre-Dame de Fourvière = "l''éléphant à l''envers" ! Regarde bien ses tours... 🐘',
1, ARRAY['basilique', 'fourvière', 'surnom', 'architecture'], 'Emma', 'joyeux'),

('story', 'patrimoine', 'Les Traboules secrètes', 
'Petite confidence entre nous : il y a plus de 400 traboules à Lyon, mais seulement une quarantaine sont ouvertes au public. Les autres ? C''est le secret jalousement gardé des cours d''immeubles privées ! Moi, j''ai eu la chance de visiter une traboule privée dans le 1er arrondissement... magique ! Si tu croises un habitant sympa, n''hésite pas à demander, parfois ils acceptent de te faire découvrir leur petit secret ! 🗝️',
'Secret : 400 traboules à Lyon, seulement 40 ouvertes au public ! Les autres sont des trésors cachés... 🤫',
2, ARRAY['traboules', 'secret', 'patrimoine', 'vieux-lyon'], 'Thomas', 'informatif'),

('anecdote', 'patrimoine', 'Place Bellecour record', 
'Entre nous, tu savais que Bellecour est LA plus grande place piétonne d''Europe ? 312m x 200m ! J''ai testé : il faut exactement 4 minutes pour la traverser en marchant normalement. Et devine quoi ? Certains matins, j''y croise des gens qui font leur jogging ! Pas mal comme piste de course, non ? 🏃‍♀️',
'Record : Bellecour = plus grande place piétonne d''Europe ! 312m x 200m de pur bonheur lyonnais 🏃‍♀️',
1, ARRAY['bellecour', 'record', 'place', 'europe'], 'Sarah', 'surprenant'),

-- GASTRONOMIE
('anecdote', 'gastronomie', 'Le secret des Bouchons authentiques', 
'Tu veux mon vrai secret pour reconnaître un authentique bouchon lyonnais ? Cherche le petit certificat "Authentique Bouchon Lyonnais" sur la devanture ! Ils ne sont que 20 à l''avoir dans toute la ville. L''association qui délivre ce certificat vérifie tout : la déco, les plats, l''ambiance... Même moi, j''ai appris ça récemment ! 🍽️',
'Secret de Lyonnaise : cherche le certificat "Authentique Bouchon Lyonnais" ! Seulement 20 dans toute la ville 🍷',
2, ARRAY['bouchon', 'restaurant', 'authentique', 'certificat'], 'Marie', 'informatif'),

('story', 'gastronomie', 'La véritable origine de la Quenelle', 
'Confession de Lyonnaise : la quenelle lyonnaise n''est pas née à Lyon mais... à Nantua ! 😱 Oui oui, tu as bien lu ! Mais on l''a tellement bien adoptée qu''elle fait partie de notre patrimoine culinaire. D''ailleurs, la vraie recette lyonnaise utilise de la semoule de blé dur, pas comme les imitations qu''on trouve parfois... Chut, on garde ça entre nous ! 🤫',
'Petit secret : la quenelle lyonnaise vient... de Nantua ! Mais elle est devenue 100% lyonnaise dans nos cœurs ❤️',
2, ARRAY['quenelle', 'gastronomie', 'origine', 'nantua'], 'Jean-Pierre', 'surprenant'),

-- PERSONNAGES
('story', 'personnage', 'Paul Bocuse et ses facéties', 
'Anecdote personnelle que m''a racontée un chef lyonnais : Paul Bocuse avait l''habitude de faire ses courses au marché de Lyon avec sa toque ! Les gens le reconnaissaient de loin et il adorait discuter avec les producteurs. Un jour, il a dit à un marchand de légumes : "Vos tomates sont meilleures que celles de mon jardin !" Le marchand a encore l''étiquette encadrée dans son stand... 👨‍🍳',
'Paul Bocuse faisait ses courses au marché avec sa toque ! Un vrai Lyonnais simple et accessible 👨‍🍳',
3, ARRAY['bocuse', 'chef', 'marché', 'anecdote'], 'Emma', 'nostalgique'),

-- MODERNE
('anecdote', 'moderne', 'Les Vélo''v précurseurs', 
'Entre nous, le Vélo''v fête ses 18 ans cette année ! C''était l''un des premiers systèmes de vélo-partage au monde. On était visionnaires ! Je me souviens encore de la première fois où j''ai vu ces vélos gris... j''avais du mal à comprendre le concept. Maintenant, je ne peux plus m''en passer ! Et toi, tu es team Vélo''v ? 🚲',
'Les Vélo''v ont 18 ans ! Pionniers mondiaux du vélo-partage. On était en avance sur notre temps ! 🚲',
4, ARRAY['velov', 'vélo', 'transport', 'innovation'], 'Lucas', 'joyeux'),

-- INSOLITE
('fact', 'insolite', 'Le mystère de Part-Dieu', 
'Fun fact que même certains Lyonnais ignorent : on dit "LA Part-Dieu" et pas "Part-Dieu" ! Même pour la gare ! 🚄 Cette règle s''applique partout : le quartier, le centre commercial, la tour... Moi-même, j''ai mis des années à l''intégrer ! Et maintenant, j''ai l''oreille qui tique quand j''entends "je vais à Part-Dieu" au lieu de "je vais à LA Part-Dieu" ! 😄',
'Règle de Lyonnais : on dit "LA Part-Dieu" pas "Part-Dieu" ! Même les nouveaux l''apprennent... 🚄',
5, ARRAY['part-dieu', 'grammaire', 'lyonnais', 'règle'], 'Marie', 'playful'),

-- TRADITION
('story', 'tradition', 'Les Bugnes et leur timing parfait', 
'Tradition sacrée que ma grand-mère lyonnaise m''a transmise : les vraies bugnes se mangent SEULEMENT pendant le Carnaval ! Le reste de l''année, c''est presque sacrilège pour un vrai Lyonnais. Elle me disait : "Les bugnes hors saison, c''est comme les décos de Noël en juillet !" 😂 Maintenant, j''attends février avec impatience... Et toi, tu respectes la tradition ? 🥮',
'Tradition de grand-mère : les bugnes SEULEMENT pendant le Carnaval ! Le reste de l''année = sacrilège lyonnais ! 🥮',
6, ARRAY['bugnes', 'carnaval', 'tradition', 'grand-mère'], 'Sarah', 'nostalgique');

-- 6. Données initiales - CONSEILS D'AMI

INSERT INTO newsletter_friendly_tips (tip_text, category, context, author, verified) VALUES

-- TRANSPORTS
('Petit conseil de Lyonnaise : évite la Presqu''île entre 17h et 19h, c''est l''enfer ! Passe plutôt par les berges du Rhône, c''est plus zen 😌', 'transport', 'evening', 'Emma', true),
('Entre nous : le TCL à 1,90€ le ticket, ça pique ! Pense au abonnement mensuel si tu prends souvent les transports. J''ai calculé : rentable dès 32 trajets ! 🚇', 'transport', 'practical', 'Thomas', true),
('Secret de local : prends le funiculaire tôt le matin pour Fourvière, pas de queue et vue dégagée ! 🚠', 'transport', 'morning', 'Marie', true),

-- NOURRITURE
('Conseil d''amie : arrive tôt au marché Saint-Antoine, les meilleurs produits partent vite ! Surtout le samedi 🥕', 'food', 'morning', 'Sarah', true),
('Pssst... le fromager de gauche place Carnot fait les meilleurs saint-marcellin de Lyon. Merci qui ? 😄🧀', 'food', 'weekend', 'Jean-Pierre', true),
('Entre gourmands : les halles de Lyon Paul Bocuse le mardi matin = moins de monde, plus de temps pour discuter avec les producteurs ! 🦪', 'food', 'morning', 'Emma', true),

-- CULTURE
('Tu le savais ? Le jeudi, l''entrée au musée des Confluences est gratuite pour les -26 ans ! Parfait pour une sortie improvisée 🏛️', 'culture', 'practical', 'Lucas', true),
('Conseil perso : réserve tes places d''Opéra en ligne le 1er du mois, les meilleurs tarifs partent en quelques heures ! 🎭', 'culture', 'practical', 'Marie', true),

-- LIEUX SECRETS
('Spot secret : la terrasse de la bibliothèque Part-Dieu (7e étage) pour une vue imprenable sur Lyon ! Gratuit et paisible 📚', 'secret_spot', 'afternoon', 'Thomas', true),
('Mon bon plan : les jardins du Rosaire à Fourvière le matin, personne et vue magnifique sur la ville ! 🌹', 'secret_spot', 'morning', 'Sarah', true);

-- 7. Données initiales - QUESTIONS ENGAGEANTES

INSERT INTO newsletter_engagement_questions (question_text, question_type, context, related_topic, expected_responses) VALUES

-- PRÉFÉRENCES
('Dis-moi, c''est quoi ton café lyonnais préféré ? ☕ J''ai hâte de découvrir de nouvelles adresses !', 'preference', 'daily', 'food', ARRAY['nom de café', 'quartier', 'spécialité']),
('Alors, team OL ou team ASVEL ? 😄 Ou tu es plus team... randonnée dans les Monts du Lyonnais ?', 'preference', 'daily', 'sport', ARRAY['football', 'basketball', 'autre sport']),
('Question du jour : bouchon traditionnel ou cuisine du monde ? Moi je craque pour les deux ! 🍽️', 'preference', 'daily', 'food', ARRAY['bouchon', 'international', 'les deux']),

-- EXPÉRIENCES
('Tu as déjà testé les fameux bugnes de chez... ? Raconte-moi ta meilleure adresse ! 🥮', 'experience', 'seasonal', 'food', ARRAY['boulangerie', 'avis', 'recette maison']),
('Alors, tu as déjà fait la visite guidée des traboules ? C''est magique ou pas ? 🗝️', 'experience', 'weekly', 'culture', ARRAY['oui/non', 'ressenti', 'recommandation']),
('Question curiosité : tu as déjà pris le funiculaire juste pour le plaisir ? 🚠', 'experience', 'weekly', 'transport', ARRAY['oui/non', 'fréquence', 'pourquoi']),

-- DÉCOUVERTE
('Raconte-moi : quelle est ta dernière découverte lyonnaise ? J''adore les bons plans ! ⭐', 'discovery', 'weekly', 'general', ARRAY['lieu', 'restaurant', 'activité']),
('Tu me conseilles quoi pour ce week-end ? J''ai envie de nouveauté ! 🌟', 'discovery', 'weekly', 'general', ARRAY['activité', 'lieu', 'événement']);

-- 8. Données initiales - SALUTATIONS

INSERT INTO newsletter_greetings (greeting_text, tone, time_of_day, day_of_week, weather_context) VALUES

-- MATINS
('Salut {first_name} ! ☀️ Prêt(e) pour une nouvelle journée lyonnaise ?', 'energetic', 'morning', NULL, 'sunny'),
('Coucou {first_name} ! Comment ça va ce matin ? ☕', 'warm', 'morning', NULL, NULL),
('Hello {first_name} ! J''espère que tu as bien dormi ! 😊', 'casual', 'morning', NULL, NULL),
('Bonjour {first_name} ! Belle journée qui s''annonce à Lyon ! 🌤️', 'warm', 'morning', NULL, 'sunny'),
('Salut toi ! Alors, ce café matinal, il était bon ? ☕', 'playful', 'morning', NULL, NULL),

-- SPÉCIFIQUES JOURS
('Salut {first_name} ! C''est lundi, on attaque la semaine en beauté ! 💪', 'energetic', 'morning', 1, NULL),
('Coucou {first_name} ! Mardi = journée parfaite pour découvrir Lyon ! ⭐', 'warm', 'morning', 2, NULL),
('Hello {first_name} ! Mercredi, milieu de semaine... tu tiens le coup ? 😄', 'casual', 'morning', 3, NULL),
('Hey {first_name} ! Jeudi, le week-end approche ! Tu sens ça ? 😊', 'playful', 'morning', 4, NULL),
('Salut {first_name} ! Vendredi, enfin ! Quels sont tes plans pour le week-end ? 🎉', 'energetic', 'morning', 5, NULL),

-- MÉTÉO
('Salut {first_name} ! Il pleut ? Parfait pour découvrir ces super cafés cosy ! ☔☕', 'warm', 'morning', NULL, 'rainy'),
('Coucou {first_name} ! Grand soleil sur Lyon ! Les terrasses vont être prises d''assaut 😎', 'energetic', 'morning', NULL, 'sunny'),
('Hello {first_name} ! Brouillard matinal... typique de notre belle Lyon d''hiver ! 🌫️', 'casual', 'morning', NULL, 'cold');

-- 9. Fonctions utilitaires pour sélection intelligente

-- Fonction pour récupérer une anecdote selon le jour et éviter les répétitions
CREATE OR REPLACE FUNCTION get_daily_anecdote(target_day INTEGER DEFAULT NULL)
RETURNS TABLE(id INTEGER, title VARCHAR(255), content TEXT, short_version TEXT, category VARCHAR(50)) AS $$
DECLARE
    selected_day INTEGER;
BEGIN
    -- Si pas de jour spécifié, utiliser le jour actuel
    selected_day := COALESCE(target_day, EXTRACT(DOW FROM CURRENT_DATE));
    
    RETURN QUERY
    SELECT nec.id, nec.title, nec.content, nec.short_version, nec.category
    FROM newsletter_editorial_content nec
    WHERE nec.is_active = true
      AND (nec.day_of_week = selected_day OR nec.day_of_week IS NULL)
      AND (nec.last_used_at IS NULL OR nec.last_used_at < CURRENT_DATE - INTERVAL '30 days')
    ORDER BY nec.performance_score DESC, nec.usage_count ASC, RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour récupérer un conseil d'ami contextuel
CREATE OR REPLACE FUNCTION get_friendly_tip(tip_context VARCHAR DEFAULT NULL)
RETURNS TABLE(tip_text TEXT, category VARCHAR(50)) AS $$
BEGIN
    RETURN QUERY
    SELECT nft.tip_text, nft.category
    FROM newsletter_friendly_tips nft
    WHERE nft.is_active = true
      AND (nft.context = tip_context OR nft.context IS NULL)
      AND (nft.last_used_at IS NULL OR nft.last_used_at < CURRENT_DATE - INTERVAL '14 days')
    ORDER BY nft.usage_count ASC, RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour récupérer une question engageante
CREATE OR REPLACE FUNCTION get_engagement_question(question_context VARCHAR DEFAULT 'daily')
RETURNS TABLE(question_text TEXT, question_type VARCHAR(50), follow_up_text TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT neq.question_text, neq.question_type, neq.follow_up_text
    FROM newsletter_engagement_questions neq
    WHERE neq.is_active = true
      AND neq.context = question_context
      AND (neq.last_used_at IS NULL OR neq.last_used_at < CURRENT_DATE - INTERVAL '7 days')
    ORDER BY neq.engagement_score DESC, neq.usage_count ASC, RANDOM()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour récupérer une salutation contextuelle
CREATE OR REPLACE FUNCTION get_contextual_greeting(
    target_time VARCHAR DEFAULT 'morning',
    target_day INTEGER DEFAULT NULL,
    weather VARCHAR DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT greeting_text INTO result
    FROM newsletter_greetings
    WHERE is_active = true
      AND time_of_day = target_time
      AND (day_of_week = target_day OR day_of_week IS NULL)
      AND (weather_context = weather OR weather_context IS NULL)
    ORDER BY usage_count ASC, RANDOM()
    LIMIT 1;
    
    RETURN COALESCE(result, 'Salut ! 👋');
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers pour mettre à jour les compteurs d'usage

CREATE OR REPLACE FUNCTION update_content_usage()
RETURNS TRIGGER AS $$
BEGIN
    NEW.usage_count = COALESCE(NEW.usage_count, 0) + 1;
    NEW.last_used_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Vue pour les statistiques éditoriales
CREATE OR REPLACE VIEW newsletter_editorial_stats AS
SELECT 
    'anecdotes' as content_type,
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE last_used_at IS NOT NULL) as used_items,
    AVG(performance_score) as avg_performance,
    COUNT(*) FILTER (WHERE usage_count = 0) as unused_items
FROM newsletter_editorial_content
UNION ALL
SELECT 
    'tips' as content_type,
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE last_used_at IS NOT NULL) as used_items,
    NULL as avg_performance,
    COUNT(*) FILTER (WHERE usage_count = 0) as unused_items
FROM newsletter_friendly_tips
UNION ALL
SELECT 
    'questions' as content_type,
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE last_used_at IS NOT NULL) as used_items,
    AVG(engagement_score) as avg_performance,
    COUNT(*) FILTER (WHERE usage_count = 0) as unused_items
FROM newsletter_engagement_questions;

-- Commentaires
COMMENT ON TABLE newsletter_editorial_content IS 'Contenus éditoriaux pour newsletters : anecdotes, histoires, faits sur Lyon';
COMMENT ON TABLE newsletter_friendly_tips IS 'Conseils amicaux et astuces de locaux pour les newsletters';
COMMENT ON TABLE newsletter_engagement_questions IS 'Questions pour engager la communauté dans les newsletters';
COMMENT ON TABLE newsletter_greetings IS 'Salutations personnalisées et contextuelles';
COMMENT ON FUNCTION get_daily_anecdote(INTEGER) IS 'Récupère une anecdote pour le jour donné en évitant les répétitions';
COMMENT ON FUNCTION get_friendly_tip(VARCHAR) IS 'Récupère un conseil d''ami selon le contexte';
COMMENT ON FUNCTION get_engagement_question(VARCHAR) IS 'Récupère une question engageante pour le contexte donné';
COMMENT ON FUNCTION get_contextual_greeting(VARCHAR, INTEGER, VARCHAR) IS 'Récupère une salutation adaptée au contexte';