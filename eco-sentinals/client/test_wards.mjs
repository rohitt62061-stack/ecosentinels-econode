import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testWards() {
  console.log("Logging in...");
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'officer@mcdindia.gov.in',
    password: 'password123'
  });

  if (authErr) {
    console.error("Login failed:", authErr);
    return;
  }
  
  console.log("Logged in as:", auth.user.email);
  
  console.log("Fetching Wards...");
  const { data, error } = await supabase.from('wards').select('id, ward_name').order('ward_name');
  
  if (error) {
    console.error("FETCH ERROR:");
    console.error(JSON.stringify(error, null, 2));
  } else {
    console.log(`Success! Fetched ${data.length} wards.`);
    console.log(data);
  }
}

testWards();
