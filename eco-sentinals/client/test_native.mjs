import fs from 'fs';

// parse .env manually
const envStr = fs.readFileSync('.env', 'utf-8');
const env = {};
envStr.split('\n').forEach(line => {
  const parts = line.split('=');
  if(parts.length >= 2) {
    const k = parts[0].trim();
    const v = parts.slice(1).join('=').trim().replace(/['"]/g, '');
    env[k] = v;
  }
});

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY'];

async function run() {
  console.log("Authenticating as officer@mcdindia.gov.in...");
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: 'officer@mcdindia.gov.in', password: 'password123' })
  });
  
  const authData = await authRes.json();
  if(!authRes.ok) {
    console.error("Auth Failed:");
    console.dir(authData, { depth: null });
    return;
  }
  
  const token = authData.access_token;
  console.log("Token retrieved successfully.");
  console.log("Fetching Wards...");
  
  const wardRes = await fetch(`${SUPABASE_URL}/rest/v1/wards?select=id%2Cward_name&order=ward_name.asc`, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log(`Wards API HTTP ${wardRes.status} ${wardRes.statusText}`);
  const wardText = await wardRes.text();
  
  try {
    const json = JSON.parse(wardText);
    console.log("Wards Output JSON:");
    console.log(JSON.stringify(json, null, 2));
  } catch(e) {
    console.log("Wards Output raw text:");
    console.log(wardText);
  }
}

run().catch(console.error);
