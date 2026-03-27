import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function test() {
  console.log("Connecting to:", process.env.VITE_SUPABASE_URL);

  // 1. Log in as officer
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: 'officer@mcdindia.gov.in',
    password: 'password123'
  });

  if (authError) {
    console.error("Auth error:", authError);
    return;
  }
  console.log("Logged in! User ID:", auth.user.id);

  // 2. Fetch Wards
  const { data: wards } = await supabase.from('wards').select('id, ward_name').order('ward_name');
  console.log("Wards found:", wards ? wards.length : 0);
  if (!wards || wards.length === 0) return;

  const targetWard = wards[0].id;
  console.log(`Querying for ward: ${wards[0].ward_name} (${targetWard})`);

  // 3. Fetch Readings
  const pastDate = new Date();
  pastDate.setHours(pastDate.getHours() - 24);

  const { data: readings, error: readingsError } = await supabase
    .from('aqi_readings')
    .select('recorded_at, aqi_value')
    .eq('ward_id', targetWard)
    .gt('recorded_at', pastDate.toISOString())
    .order('recorded_at', { ascending: true });

  if (readingsError) {
    console.error("Readings Error:", readingsError);
  } else {
    console.log(`Readings returned: ${readings.length} rows`);
    if (readings.length > 0) console.log("First row style sample:", readings[0]);
  }
}

test();
