export interface Ward {
  id: string;
  ward_name: string;
  ward_number: number | null;
  city: string | null;
  state: string | null;
  officer_email: string | null;
  boundary: any | null; // PostGIS geometry
  created_at: string | null;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: 'mcd' | 'citizen';
  ward_id: string | null;
  allowed_domain: string | null;
  created_at: string | null;
}

export interface CitizenScore {
  id: string;
  user_id: string | null;
  ward_id: string | null;
  total_scans: number | null;
  correct_scans: number | null;
  segregation_score: number | null;
  monthly_credits: number | null;
  streak_days: number | null;
  last_scan_date: string | null;
  updated_at: string | null;
}

export interface AqiReading {
  id: string;
  ward_id: string | null;
  station_id: string | null;
  aqi_value: number | null;
  pm25: number | null;
  pm10: number | null;
  o3: number | null;
  co: number | null;
  no2: number | null;
  so2: number | null;
  wind_speed: number | null;
  wind_direction: number | null;
  recorded_at: string | null;
}

export interface PollutionDetection {
  id: string;
  ward_id: string | null;
  source_type: 'construction_dust' | 'biomass_burning' | 'vehicle_exhaust' | 'industrial' | 'unknown' | null;
  confidence_score: number | null;
  detected_at: string | null;
  policy_triggered: boolean | null;
}

export interface WasteEvent {
  id: string;
  user_id: string | null;
  ward_id: string | null;
  waste_category: 'biodegradable' | 'recyclable' | 'hazardous' | null;
  item_description: string | null;
  disposal_tip: string | null;
  is_correct: boolean | null;
  scanned_at: string | null;
  image_url: string | null;
}

export interface PolicyRecommendation {
  id: string;
  detection_id: string | null;
  ward_id: string | null;
  actions: any | null; // jsonb
  status: 'pending' | 'approved' | 'implemented' | 'rejected' | null;
  escalation_target: string | null;
  generated_at: string | null;
}

export interface FleetRoute {
  id: string;
  truck_id: string | null;
  ward_id: string | null;
  waypoints: any | null; // jsonb
  total_distance_km: number | null;
  estimated_emissions_kg: number | null;
  route_date: string | null;
  status: 'planned' | 'active' | 'completed' | null;
  created_at: string | null;
}

export interface IoTSensorReading {
  id: string;
  bin_id: string;
  ward_id: string | null;
  fill_level_pct: number | null;
  waste_type_detected: string | null;
  battery_level: number | null;
  latitude: number | null;
  longitude: number | null;
  recorded_at: string | null;
}

export interface AiSuggestion {
  id: string;
  ward_id: string | null;
  aqi_at_time: number | null;
  source_detected: string | null;
  suggestion_text: string | null;
  suggestion_type: 'health' | 'activity' | 'policy' | 'waste' | null;
  generated_at: string | null;
}

export interface UserPromotion {
  email: string;
  new_role: string;
  ward_number: number | null;
}

export interface WardLeaderboard {
  ward_id: string;
  ward_name: string;
  avg_score: number | null;
  total_events: number | null;
  rank: number | null;
}

export interface WardAQIView {
  ward_id: string;
  ward_name: string;
  ward_number: number | null;
  latitude: number;
  longitude: number;
  aqi_value: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  wind_speed: number;
  recorded_at: string;
}
