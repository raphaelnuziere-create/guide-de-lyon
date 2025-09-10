-- =====================================================
-- SYSTÈME EMAIL TRANSACTIONNEL COMPLET
-- =====================================================
-- Date: 2025-01-09
-- Description: Tables, triggers et fonctions pour emails automatiques

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TEMPLATES D'EMAILS TRANSACTIONNELS  
-- =====================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identification
  name VARCHAR(100) NOT NULL UNIQUE,
  event_type VARCHAR(50) NOT NULL, -- 'user_upgrade', 'event_created', etc.
  user_plan VARCHAR(20), -- 'free', 'premium', 'business', NULL = all plans
  
  -- Contenu 
  subject_template TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  
  -- IA et personnalisation
  ai_prompt TEXT, -- Prompt Claude pour génération future
  variables_required TEXT[], -- ['nom_entreprise', 'forfait']
  
  -- Configuration
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false, -- Templates système non modifiables
  delay_minutes INTEGER DEFAULT 0, -- Délai avant envoi
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Performance tracking
  sent_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0.00,
  click_rate DECIMAL(5,2) DEFAULT 0.00
);

-- =====================================================
-- 2. PRÉFÉRENCES EMAIL DES UTILISATEURS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_email_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Préférences par type
  transactional_enabled BOOLEAN DEFAULT true, -- Factures, confirmations
  activity_notifications BOOLEAN DEFAULT true, -- Événements, profil
  newsletter_enabled BOOLEAN DEFAULT true, -- Newsletter quotidienne/hebdo
  tips_enabled BOOLEAN DEFAULT true, -- Conseils business
  promotions_enabled BOOLEAN DEFAULT true, -- Offres spéciales
  
  -- Fréquence
  notification_frequency VARCHAR(20) DEFAULT 'immediate', -- immediate, daily, weekly, never
  
  -- Tracking
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribe_token VARCHAR(100) UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
);

-- =====================================================
-- 3. HISTORIQUE DES EMAILS ENVOYÉS
-- =====================================================
CREATE TABLE IF NOT EXISTS transactional_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Références
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id),
  
  -- Contenu envoyé (snapshot)
  email_address VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  
  -- Trigger et contexte
  triggered_by VARCHAR(100) NOT NULL, -- 'user_upgrade', 'event_created'
  trigger_data JSONB, -- Données spécifiques au trigger
  
  -- Statut envoi
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, bounced
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Tracking Brevo
  brevo_message_id TEXT,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  -- Performance
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0
);

-- =====================================================
-- 4. QUEUE DES EMAILS À TRAITER
-- =====================================================
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Références
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id),
  
  -- Configuration
  event_type VARCHAR(100) NOT NULL,
  trigger_data JSONB NOT NULL,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  
  -- Statut
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- =====================================================
-- 5. INDEXES POUR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_email_templates_event_type ON email_templates(event_type, user_plan);
CREATE INDEX IF NOT EXISTS idx_transactional_emails_user ON transactional_emails(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactional_emails_status ON transactional_emails(status, sent_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_user ON email_queue(user_id, created_at);

-- =====================================================
-- 6. TRIGGERS DE MISE À JOUR
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at 
  BEFORE UPDATE ON email_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_email_preferences_updated_at ON user_email_preferences;
CREATE TRIGGER update_user_email_preferences_updated_at 
  BEFORE UPDATE ON user_email_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. FONCTION POUR DÉCLENCHER UN EMAIL TRANSACTIONNEL
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_transactional_email(
  p_user_id UUID,
  p_event_type VARCHAR(100),
  p_trigger_data JSONB DEFAULT '{}'::jsonb,
  p_delay_minutes INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
  v_template_id UUID;
  v_user_plan VARCHAR(20);
  v_email_enabled BOOLEAN;
BEGIN
  -- Récupérer le plan utilisateur
  SELECT plan_type INTO v_user_plan FROM users WHERE id = p_user_id;
  
  -- Vérifier les préférences email
  SELECT 
    CASE 
      WHEN p_event_type LIKE '%upgrade%' OR p_event_type LIKE '%payment%' THEN transactional_enabled
      WHEN p_event_type LIKE '%event%' OR p_event_type LIKE '%activity%' THEN activity_notifications
      ELSE transactional_enabled
    END
  INTO v_email_enabled
  FROM user_email_preferences 
  WHERE user_id = p_user_id;
  
  -- Si pas de préférences, créer avec valeurs par défaut
  IF v_email_enabled IS NULL THEN
    INSERT INTO user_email_preferences (user_id) VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    v_email_enabled := true;
  END IF;
  
  -- Si emails désactivés, ne pas envoyer
  IF v_email_enabled = false THEN
    RETURN NULL;
  END IF;
  
  -- Trouver le template approprié
  SELECT id INTO v_template_id
  FROM email_templates 
  WHERE event_type = p_event_type 
    AND is_active = true
    AND (user_plan IS NULL OR user_plan = v_user_plan)
  ORDER BY user_plan NULLS LAST -- Préférer les templates spécifiques au plan
  LIMIT 1;
  
  -- Si pas de template, ne pas créer d'entrée queue
  IF v_template_id IS NULL THEN
    RAISE NOTICE 'No template found for event_type: % and plan: %', p_event_type, v_user_plan;
    RETURN NULL;
  END IF;
  
  -- Ajouter à la queue
  INSERT INTO email_queue (
    user_id, template_id, event_type, trigger_data, scheduled_for
  ) VALUES (
    p_user_id, v_template_id, p_event_type, p_trigger_data,
    NOW() + (p_delay_minutes || ' minutes')::INTERVAL
  ) RETURNING id INTO v_queue_id;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. TRIGGERS AUTOMATIQUES SUR ACTIONS UTILISATEUR
-- =====================================================

-- Trigger sur changement de plan
CREATE OR REPLACE FUNCTION notify_user_plan_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Si changement de plan
  IF OLD.plan_type IS DISTINCT FROM NEW.plan_type THEN
    -- Upgrade
    IF NEW.plan_type > OLD.plan_type OR (OLD.plan_type = 'free' AND NEW.plan_type IN ('premium', 'business')) THEN
      PERFORM trigger_transactional_email(
        NEW.id, 
        'plan_upgrade',
        jsonb_build_object(
          'old_plan', OLD.plan_type,
          'new_plan', NEW.plan_type,
          'upgrade_date', NOW()
        )
      );
    -- Downgrade  
    ELSE
      PERFORM trigger_transactional_email(
        NEW.id,
        'plan_downgrade', 
        jsonb_build_object(
          'old_plan', OLD.plan_type,
          'new_plan', NEW.plan_type,
          'downgrade_date', NOW()
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_plan_change ON users;
CREATE TRIGGER trigger_user_plan_change
  AFTER UPDATE OF plan_type ON users
  FOR EACH ROW
  WHEN (OLD.plan_type IS DISTINCT FROM NEW.plan_type)
  EXECUTE FUNCTION notify_user_plan_change();

-- Trigger sur création d'événement
CREATE OR REPLACE FUNCTION notify_event_created()
RETURNS TRIGGER AS $$
DECLARE
  v_user_plan VARCHAR(20);
  v_event_type VARCHAR(50);
BEGIN
  -- Récupérer le plan de l'utilisateur
  SELECT plan_type INTO v_user_plan FROM users WHERE id = NEW.organizer_id;
  
  -- Déterminer le type d'email selon le plan
  IF v_user_plan IN ('premium', 'business') THEN
    v_event_type := 'event_created_premium';
  ELSE
    v_event_type := 'event_created_free';
  END IF;
  
  -- Déclencher l'email
  PERFORM trigger_transactional_email(
    NEW.organizer_id,
    v_event_type,
    jsonb_build_object(
      'event_title', NEW.title,
      'event_date', NEW.start_date,
      'event_location', NEW.location,
      'user_plan', v_user_plan,
      'homepage_visible', CASE WHEN v_user_plan IN ('premium', 'business') THEN true ELSE false END
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_event_created ON events;
CREATE TRIGGER trigger_event_created
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_created();

-- =====================================================
-- 9. TEMPLATES PAR DÉFAUT
-- =====================================================

-- Template: Upgrade de plan
INSERT INTO email_templates (
  name, event_type, subject_template, html_content, text_content,
  variables_required, is_system, ai_prompt
) VALUES (
  'Plan Upgrade Success',
  'plan_upgrade',
  'Félicitations {{nom_entreprise}} ! Bienvenue dans {{nouveau_forfait}} 🎉',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">🎉 Félicitations !</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px;">Bienvenue dans le forfait {{nouveau_forfait}}</p>
    </div>
    <div style="background: white; padding: 30px; border: 2px solid #e74c3c; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #2c3e50;">Bonjour {{nom_entreprise}},</h2>
      <p>Excellente nouvelle ! Votre passage au forfait <strong>{{nouveau_forfait}}</strong> est effectif dès maintenant.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #27ae60; margin-top: 0;">🚀 Vos nouvelles fonctionnalités :</h3>
        <ul style="color: #2c3e50;">
          {{#if homepage_visible}}
          <li>✅ Événements visibles sur la page d''accueil</li>
          <li>✅ Mise en avant dans la newsletter</li>
          {{/if}}
          <li>✅ Analytics détaillés de votre profil</li>
          <li>✅ Support prioritaire</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.guide-de-lyon.fr/pro/dashboard" style="display: inline-block; background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Découvrir mon nouveau dashboard
        </a>
      </div>
      
      <p>Besoin d''aide ? Répondez à cet email, nous sommes là pour vous accompagner !</p>
      
      <div style="border-top: 2px solid #ecf0f1; padding-top: 20px; margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 14px;">
        <strong>Guide de Lyon</strong><br>
        Votre partenaire pour rayonner à Lyon
      </div>
    </div>
  </div>',
  'Félicitations {{nom_entreprise}} !

Votre passage au forfait {{nouveau_forfait}} est effectif dès maintenant.

Vos nouvelles fonctionnalités :
{{#if homepage_visible}}
- Événements visibles sur la page d''accueil  
- Mise en avant dans la newsletter
{{/if}}
- Analytics détaillés de votre profil
- Support prioritaire

Découvrez votre nouveau dashboard : https://www.guide-de-lyon.fr/pro/dashboard

L''équipe Guide de Lyon',
  ARRAY['nom_entreprise', 'nouveau_forfait', 'ancien_forfait', 'homepage_visible'],
  true,
  'Rédige un email de félicitations chaleureux pour une entreprise lyonnaise qui vient d''upgrader son forfait Guide de Lyon. Ton professionnel mais enthousiastes. Mettre en avant les nouvelles fonctionnalités débloquées.'
) ON CONFLICT (name) DO NOTHING;

-- Template: Événement créé (forfait gratuit)
INSERT INTO email_templates (
  name, event_type, user_plan, subject_template, html_content, text_content,
  variables_required, is_system
) VALUES (
  'Event Created Free Plan',
  'event_created_free',
  'free',
  '🎉 {{event_title}} est maintenant en ligne !',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">🎉 Bravo !</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px;">Votre événement est en ligne</p>
    </div>
    <div style="background: white; padding: 30px; border: 2px solid #3498db; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #2c3e50;">Félicitations {{nom_entreprise}} !</h2>
      <p>Votre événement <strong>"{{event_title}}"</strong> est maintenant visible sur votre page entreprise.</p>
      
      <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">📍 Votre événement :</h3>
        <p style="margin: 5px 0;"><strong>Titre :</strong> {{event_title}}</p>
        <p style="margin: 5px 0;"><strong>Date :</strong> {{event_date_formatted}}</p>
        <p style="margin: 5px 0;"><strong>Lieu :</strong> {{event_location}}</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="margin: 0 0 10px 0;">🚀 Envie de plus de visibilité ?</h3>
        <p style="margin: 0 0 15px 0;">Avec un forfait Premium, votre événement apparaît sur notre page d''accueil et dans notre newsletter quotidienne !</p>
        <a href="https://www.guide-de-lyon.fr/pro/upgrade" style="display: inline-block; background: white; color: #e67e22; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Découvrir les forfaits Premium
        </a>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.guide-de-lyon.fr/pro/evenements" style="display: inline-block; background: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Gérer mes événements
        </a>
      </div>
      
      <div style="border-top: 2px solid #ecf0f1; padding-top: 20px; margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 14px;">
        <strong>Guide de Lyon</strong><br>
        Votre vitrine lyonnaise
      </div>
    </div>
  </div>',
  'Félicitations {{nom_entreprise}} !

Votre événement "{{event_title}}" est maintenant en ligne sur votre page entreprise.

📍 Détails :
- Titre : {{event_title}}
- Date : {{event_date_formatted}}  
- Lieu : {{event_location}}

🚀 PLUS DE VISIBILITÉ ?
Avec un forfait Premium, votre événement apparaît sur notre page d''accueil et dans notre newsletter quotidienne !

Découvrir les forfaits : https://www.guide-de-lyon.fr/pro/upgrade
Gérer mes événements : https://www.guide-de-lyon.fr/pro/evenements

L''équipe Guide de Lyon',
  ARRAY['nom_entreprise', 'event_title', 'event_date_formatted', 'event_location'],
  true
) ON CONFLICT (name) DO NOTHING;

-- Template: Événement créé (forfait premium)
INSERT INTO email_templates (
  name, event_type, user_plan, subject_template, html_content, text_content,
  variables_required, is_system
) VALUES (
  'Event Created Premium Plan', 
  'event_created_premium',
  'premium',
  '🌟 {{event_title}} en ligne et sur la page d''accueil !',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">🌟 Fantastique !</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px;">Votre événement Premium est en ligne</p>
    </div>
    <div style="background: white; padding: 30px; border: 2px solid #f39c12; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #2c3e50;">Bravo {{nom_entreprise}} !</h2>
      <p>Votre événement <strong>"{{event_title}}"</strong> bénéficie de la visibilité Premium !</p>
      
      <div style="background: #fef9e7; padding: 20px; border-radius: 8px; border-left: 4px solid #f39c12; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin-top: 0;">📍 Votre événement :</h3>
        <p style="margin: 5px 0;"><strong>Titre :</strong> {{event_title}}</p>
        <p style="margin: 5px 0;"><strong>Date :</strong> {{event_date_formatted}}</p>
        <p style="margin: 5px 0;"><strong>Lieu :</strong> {{event_location}}</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #27ae60, #229954); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0;">🎯 Votre visibilité Premium :</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>✅ Affiché sur la page d''accueil de Guide-de-Lyon.fr</li>
          <li>✅ Inclus dans notre newsletter quotidienne</li>
          <li>✅ Priorité dans les recherches</li>
          <li>✅ Analytics détaillés disponibles</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.guide-de-lyon.fr/pro/evenements" style="display: inline-block; background: #f39c12; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Voir mes statistiques
        </a>
      </div>
      
      <p style="color: #7f8c8d; font-style: italic;">💡 Conseil : Partagez le lien de votre événement sur vos réseaux sociaux pour maximiser votre audience !</p>
      
      <div style="border-top: 2px solid #ecf0f1; padding-top: 20px; margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 14px;">
        <strong>Guide de Lyon</strong><br>
        Votre partenaire Premium pour rayonner à Lyon
      </div>
    </div>
  </div>',
  'Bravo {{nom_entreprise}} !

Votre événement "{{event_title}}" bénéficie de la visibilité Premium !

📍 Détails :
- Titre : {{event_title}}
- Date : {{event_date_formatted}}
- Lieu : {{event_location}}

🎯 Votre visibilité Premium :
✅ Affiché sur la page d''accueil
✅ Inclus dans notre newsletter quotidienne  
✅ Priorité dans les recherches
✅ Analytics détaillés

Voir vos statistiques : https://www.guide-de-lyon.fr/pro/evenements

L''équipe Guide de Lyon',
  ARRAY['nom_entreprise', 'event_title', 'event_date_formatted', 'event_location'],
  true
) ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 10. FONCTION D'INITIALISATION DES PRÉFÉRENCES
-- =====================================================
CREATE OR REPLACE FUNCTION init_user_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_init_email_preferences ON users;
CREATE TRIGGER trigger_init_email_preferences
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION init_user_email_preferences();

-- =====================================================
-- RÉSUMÉ DE LA MIGRATION
-- =====================================================
-- ✅ Tables créées : email_templates, user_email_preferences, transactional_emails, email_queue
-- ✅ Fonction trigger_transactional_email() pour déclencher des emails
-- ✅ Triggers automatiques sur users.plan_type et events (création)
-- ✅ Templates par défaut pour upgrade et création événement
-- ✅ Index pour performance
-- ✅ Initialisation automatique des préférences utilisateur

SELECT 'Migration terminée avec succès ! Système email transactionnel opérationnel.' as status;