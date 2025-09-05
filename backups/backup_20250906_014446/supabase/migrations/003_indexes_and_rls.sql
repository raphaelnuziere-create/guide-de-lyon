-- =====================================================
-- PARTIE 3 : INDEXES ET ROW LEVEL SECURITY
-- =====================================================

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_establishments_user_id ON establishments(user_id);
CREATE INDEX IF NOT EXISTS idx_establishments_status ON establishments(status);
CREATE INDEX IF NOT EXISTS idx_establishments_slug ON establishments(slug);
CREATE INDEX IF NOT EXISTS idx_subscriptions_establishment ON subscriptions(establishment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_events_establishment ON events(establishment_id);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_media_establishment ON establishment_media(establishment_id);
CREATE INDEX IF NOT EXISTS idx_analytics_establishment_date ON establishment_analytics(establishment_id, date);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishment_analytics ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES IF ANY
DROP POLICY IF EXISTS "Public can view active establishments" ON establishments;
DROP POLICY IF EXISTS "Users can manage their own establishments" ON establishments;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Public can view published events" ON events;
DROP POLICY IF EXISTS "Users can manage their own events" ON events;
DROP POLICY IF EXISTS "Public can view active media" ON establishment_media;
DROP POLICY IF EXISTS "Users can manage their own media" ON establishment_media;
DROP POLICY IF EXISTS "Users can view their own analytics" ON establishment_analytics;

-- CREATE NEW POLICIES

-- Establishments policies
CREATE POLICY "Public can view active establishments" 
ON establishments FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can manage their own establishments" 
ON establishments FOR ALL 
USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" 
ON subscriptions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM establishments 
    WHERE establishments.id = subscriptions.establishment_id 
    AND establishments.user_id = auth.uid()
  )
);

-- Events policies
CREATE POLICY "Public can view published events" 
ON events FOR SELECT 
USING (status = 'published');

CREATE POLICY "Users can manage their own events" 
ON events FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM establishments 
    WHERE establishments.id = events.establishment_id 
    AND establishments.user_id = auth.uid()
  )
);

-- Media policies
CREATE POLICY "Public can view active media" 
ON establishment_media FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can manage their own media" 
ON establishment_media FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM establishments 
    WHERE establishments.id = establishment_media.establishment_id 
    AND establishments.user_id = auth.uid()
  )
);

-- Analytics policies
CREATE POLICY "Users can view their own analytics" 
ON establishment_analytics FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM establishments 
    WHERE establishments.id = establishment_analytics.establishment_id 
    AND establishments.user_id = auth.uid()
  )
);