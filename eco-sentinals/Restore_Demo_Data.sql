-- ECONODE DEMO DATA RESTORE SCRIPT
-- RUN THIS IN THE SUPABASE SQL EDITOR

-- 1. CLEANUP
TRUNCATE aqi_readings, pollution_detections, policy_recommendations, 
         waste_events, citizen_scores, fleet_routes, iot_sensor_readings CASCADE;

-- 2. SEED AQI READINGS (30 Days, 5 Wards)
-- Synthetic pattern simulating Delhi AQI: Night improvement, Morning/Evening peaks.
INSERT INTO aqi_readings (ward_id, aqi_value, pm25, pm10, recorded_at)
SELECT 
  w.id as ward_id,
  (
    CASE 
      WHEN EXTRACT(HOUR FROM t.ts) BETWEEN 1 AND 5 THEN (40 + RANDOM() * 20) -- Night Low
      WHEN EXTRACT(HOUR FROM t.ts) BETWEEN 7 AND 10 THEN (140 + RANDOM() * 80) -- Morning Peak
      WHEN EXTRACT(HOUR FROM t.ts) BETWEEN 18 AND 21 THEN (120 + RANDOM() * 60) -- Evening Peak
      ELSE (70 + RANDOM() * 40) -- Baseline
    END
  )::INT as aqi_value,
  (40 + RANDOM() * 120) as pm25, -- PM2.5 roughly follows AQI
  (80 + RANDOM() * 100) as pm10,
  t.ts as recorded_at
FROM wards w
CROSS JOIN generate_series(
  NOW() - INTERVAL '30 days',
  NOW(),
  INTERVAL '30 minutes'
) AS t(ts);

-- 3. SEED POLLUTION DETECTIONS
-- Create 20 baseline detections for dashboards
INSERT INTO pollution_detections (ward_id, source_type, confidence_score, detected_at)
SELECT 
  id,
  (ARRAY['construction_dust', 'biomass_burning', 'vehicle_exhaust'])[FLOOR(RANDOM() * 3 + 1)],
  (0.65 + RANDOM() * 0.3),
  NOW() - (RANDOM() * INTERVAL '48 hours')
FROM wards, generate_series(1, 4);

-- 4. SEED POLICY RECOMMENDATIONS (Demo Specifics)
INSERT INTO policy_recommendations (ward_id, detection_id, actions, status, escalation_target, generated_at)
SELECT 
  w.id, d.id,
  '[{"action":"Halt construction 6-9 AM on Ring Road","priority":"high","target":"Ward Officer"},
    {"action":"Deploy water sprinkler truck on Ajmal Khan Road","priority":"medium","target":"Sanitation Dept"},
    {"action":"Alert 3 nearby schools with N95 advisory","priority":"high","target":"Education Dept"}]'::jsonb,
  CASE WHEN w.ward_number = 31 THEN 'approved' ELSE 'pending' END,
  'Ward Officer',
  NOW() - (RANDOM() * INTERVAL '2 hours')
FROM wards w
JOIN pollution_detections d ON d.ward_id = w.id
ORDER BY RANDOM()
LIMIT 3;

-- 5. SEED CITIZEN SCORES & WASTE EVENTS
-- Populate leaderboard
INSERT INTO citizen_scores (user_id, ward_id, total_scans, correct_scans, segregation_score, monthly_credits)
SELECT 
  p.id, p.ward_id,
  (10 + RANDOM() * 50)::INT,
  (8 + RANDOM() * 40)::INT,
  (75 + RANDOM() * 20),
  (100 + RANDOM() * 500)
FROM profiles p
WHERE p.role = 'citizen';

-- 6. SEED SMART BIN DATA (IoT)
INSERT INTO iot_sensor_readings (bin_id, ward_id, fill_level_pct, waste_type_detected, battery_level, latitude, longitude)
SELECT 
  'BIN-' || LPAD(i::text, 3, '0'),
  w.id,
  (RANDOM() * 95),
  (ARRAY['biodegradable', 'recyclable', 'hazardous'])[FLOOR(RANDOM() * 3 + 1)],
  (20 + RANDOM() * 80),
  28.6139 + (RANDOM() - 0.5) * 0.1, -- Randomly near New Delhi
  77.2090 + (RANDOM() - 0.5) * 0.1
FROM wards w, generate_series(1, 3) as i;

-- SUCCESS
SELECT 'Demo data successfully restored. Row count in aqi_readings: ' || COUNT(*) FROM aqi_readings;
