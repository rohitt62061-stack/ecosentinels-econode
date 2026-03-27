-- Econode Database Schema
-- Run this in your Supabase SQL Editor

-- 0. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Profiles (links to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  role TEXT CHECK (role IN ('mcd', 'citizen')),
  ward_id UUID,
  allowed_domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Wards (city ward zones)
CREATE TABLE IF NOT EXISTS wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_name TEXT NOT NULL,
  ward_number INTEGER,
  city TEXT,
  state TEXT,
  officer_email TEXT,
  boundary GEOMETRY(Polygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AQI Readings (data per ward)
CREATE TABLE IF NOT EXISTS aqi_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  station_id TEXT,
  aqi_value INTEGER,
  pm25 FLOAT,
  pm10 FLOAT,
  o3 FLOAT,
  co FLOAT,
  no2 FLOAT,
  so2 FLOAT,
  wind_speed FLOAT,
  wind_direction FLOAT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pollution Detections (ML source classification)
CREATE TABLE IF NOT EXISTS pollution_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  source_type TEXT CHECK (source_type IN ('construction_dust','biomass_burning','vehicle_exhaust','industrial','unknown')),
  confidence_score FLOAT,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  policy_triggered BOOLEAN DEFAULT FALSE
);

-- 5. Policy Recommendations (AI-generated actions)
CREATE TABLE IF NOT EXISTS policy_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id UUID REFERENCES pollution_detections(id) ON DELETE SET NULL,
  ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  actions JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','implemented','rejected')),
  escalation_target TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. IoT Sensor Readings (smart bin data)
CREATE TABLE IF NOT EXISTS iot_sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_id TEXT NOT NULL,
  ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  fill_level_pct FLOAT,
  waste_type_detected TEXT,
  battery_level FLOAT,
  latitude FLOAT,
  longitude FLOAT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Waste Events (citizen scans)
CREATE TABLE IF NOT EXISTS waste_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  waste_category TEXT CHECK (waste_category IN ('biodegradable','recyclable','hazardous')),
  item_description TEXT,
  disposal_tip TEXT,
  is_correct BOOLEAN,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Citizen Scores (segregation scores)
CREATE TABLE IF NOT EXISTS citizen_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  total_scans INTEGER DEFAULT 0,
  correct_scans INTEGER DEFAULT 0,
  segregation_score FLOAT DEFAULT 0,
  monthly_credits DECIMAL(10,2) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_scan_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Fleet Routes (optimized paths)
CREATE TABLE IF NOT EXISTS fleet_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id TEXT,
  ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  waypoints JSONB,
  total_distance_km FLOAT,
  estimated_emissions_kg FLOAT,
  route_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned','active','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AI Suggestions (cached advisories)
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID REFERENCES wards(id) ON DELETE CASCADE,
  aqi_at_time INTEGER,
  source_detected TEXT,
  suggestion_text TEXT,
  suggestion_type TEXT CHECK (suggestion_type IN ('health','activity','policy','waste')),
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_aqi_ward_time ON aqi_readings(ward_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_iot_bin_time ON iot_sensor_readings(bin_id, recorded_at DESC);

-- View: Latest Ward AQI
CREATE OR REPLACE VIEW latest_ward_aqi AS
SELECT DISTINCT ON (ward_id) 
  ward_id, 
  aqi_value, 
  pm25, 
  pm10, 
  no2, 
  so2, 
  co, 
  wind_speed, 
  recorded_at
FROM aqi_readings 
ORDER BY ward_id, recorded_at DESC;

CREATE OR REPLACE VIEW latest_bin_readings AS
SELECT DISTINCT ON (bin_id) *
FROM iot_sensor_readings
ORDER BY bin_id, recorded_at DESC;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========

-- Helper functions
CREATE OR REPLACE FUNCTION get_user_role() RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_mcd() RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'mcd';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_citizen() RETURNS BOOLEAN AS $$
  SELECT get_user_role() = 'citizen';
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles: users see own row only
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Wards: MCD sees all, citizens see their own ward only
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mcd all wards" ON wards FOR SELECT USING (is_mcd());
CREATE POLICY "citizen own ward" ON wards FOR SELECT USING (
  is_citizen() AND id = (SELECT ward_id FROM profiles WHERE id = auth.uid())
);

-- AQI: MCD sees all, citizens see their ward only
ALTER TABLE aqi_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mcd all aqi" ON aqi_readings FOR SELECT USING (is_mcd());
CREATE POLICY "citizen ward aqi" ON aqi_readings FOR SELECT USING (
  is_citizen() AND ward_id = (SELECT ward_id FROM profiles WHERE id = auth.uid())
);

-- Policy recommendations: MCD only, citizens blocked
ALTER TABLE policy_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mcd policy" ON policy_recommendations FOR ALL USING (is_mcd());

-- Pollution detections: MCD only
ALTER TABLE pollution_detections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mcd detections" ON pollution_detections FOR SELECT USING (is_mcd());

-- Fleet routes: MCD only
ALTER TABLE fleet_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mcd fleet" ON fleet_routes FOR ALL USING (is_mcd());

-- Waste events: citizens own, MCD audit
ALTER TABLE waste_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "citizen own events" ON waste_events FOR ALL USING (is_citizen() AND user_id = auth.uid());
CREATE POLICY "mcd audit events" ON waste_events FOR SELECT USING (is_mcd());

-- Citizen scores: own + MCD read
ALTER TABLE citizen_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "citizen own score" ON citizen_scores FOR ALL USING (is_citizen() AND user_id = auth.uid());
CREATE POLICY "mcd read scores" ON citizen_scores FOR SELECT USING (is_mcd());

-- AI suggestions: citizen gets ward only, MCD gets all
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "citizen suggestions" ON ai_suggestions FOR SELECT USING (
  is_citizen() AND ward_id = (SELECT ward_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "mcd suggestions" ON ai_suggestions FOR SELECT USING (is_mcd());

-- IoT: MCD only (select), plus sensor inserts from edge devices and secure updates by MCD
ALTER TABLE iot_sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mcd iot select" ON iot_sensor_readings FOR SELECT USING (is_mcd());
CREATE POLICY "iot sensor inserts" ON iot_sensor_readings FOR INSERT WITH CHECK (
  bin_id IS NOT NULL
  AND ward_id IS NOT NULL
  AND fill_level_pct >= 0
  AND fill_level_pct <= 100
  AND battery_level >= 0
  AND battery_level <= 100
);
CREATE POLICY "mcd iot modify" ON iot_sensor_readings FOR UPDATE USING (is_mcd()) WITH CHECK (is_mcd());
CREATE POLICY "mcd iot delete" ON iot_sensor_readings FOR DELETE USING (is_mcd());

-- ==========================================
-- VERIFICATION QUERY
-- ==========================================
-- Run this to confirm RLS is enabled on all tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';


