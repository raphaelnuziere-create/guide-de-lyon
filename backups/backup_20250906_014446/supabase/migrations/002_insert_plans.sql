-- =====================================================
-- PARTIE 2 : INSERTION DES 3 PLANS
-- =====================================================

INSERT INTO subscription_plans (
  name, slug, price_monthly, price_yearly,
  max_photos, max_events_per_month, max_description_length,
  events_on_homepage, events_in_newsletter, events_on_social,
  has_carousel, has_video, has_pdf_menu, has_reservation_link,
  has_statistics, statistics_days,
  directory_boost, badge_type,
  display_order
) VALUES 
-- PLAN BASIC (GRATUIT)
(
  'Basic', 'basic', 0.00, 0.00,
  1, 3, 200,
  false, false, false,
  false, false, false, false,
  false, 0,
  0, NULL,
  1
),
-- PLAN PRO (19€/mois)
(
  'Pro', 'pro', 19.00, 182.40,
  6, 3, 500,
  true, true, false,
  true, false, false, false,
  true, 30,
  100, 'verified',
  2
),
-- PLAN EXPERT (49€/mois)
(
  'Expert', 'expert', 49.00, 470.40,
  10, 5, 1500,
  true, true, true,
  true, true, true, true,
  true, 90,
  200, 'expert',
  3
)
ON CONFLICT (slug) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_photos = EXCLUDED.max_photos,
  max_events_per_month = EXCLUDED.max_events_per_month,
  max_description_length = EXCLUDED.max_description_length,
  events_on_homepage = EXCLUDED.events_on_homepage,
  events_in_newsletter = EXCLUDED.events_in_newsletter,
  events_on_social = EXCLUDED.events_on_social,
  has_carousel = EXCLUDED.has_carousel,
  has_video = EXCLUDED.has_video,
  has_pdf_menu = EXCLUDED.has_pdf_menu,
  has_reservation_link = EXCLUDED.has_reservation_link,
  has_statistics = EXCLUDED.has_statistics,
  statistics_days = EXCLUDED.statistics_days,
  directory_boost = EXCLUDED.directory_boost,
  badge_type = EXCLUDED.badge_type,
  updated_at = NOW();