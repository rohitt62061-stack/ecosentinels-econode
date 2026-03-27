import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // 1. Fetch latest fill levels for all bins
    const { data: bins, error: binsError } = await supabaseClient
      .from('bins')
      .select('id, ward_id, fill_level_pct, latitude, longitude')

    if (binsError) throw binsError

    // 2. Fetch latest AQI readings for each ward
    const { data: aqiReadings, error: aqiError } = await supabaseClient
      .from('aqi_readings')
      .select('ward_id, aqi_value, pm25')
      .order('recorded_at', { ascending: false })
      .limit(100) // Get recent samples

    if (aqiError) throw aqiError

    // 3. Logic: Correlate High PM2.5 with High Fill Levels
    const ghostNodes = []
    
    // Map ward to latest PM2.5
    const wardPmMap: Record<string, number> = {}
    aqiReadings.forEach(r => {
      if (!wardPmMap[r.ward_id]) wardPmMap[r.ward_id] = r.pm25
    })

    bins.forEach(bin => {
      const pmVal = wardPmMap[bin.ward_id] || 0
      
      // IF PM2.5 > 150 AND Bin Fill > 60%, trigger Ghost Waste prediction
      if (pmVal > 150 && bin.fill_level_pct > 60) {
        ghostNodes.push({
          id: `GHOST-${bin.id}`,
          latitude: bin.latitude + (Math.random() - 0.5) * 0.002,
          longitude: bin.longitude + (Math.random() - 0.5) * 0.002,
          type: 'ghost',
          confidence: 0.82,
          source_bin: bin.id,
          ward_id: bin.ward_id
        })
      }
    })

    return new Response(
      JSON.stringify({ status: 'success', ghost_nodes: ghostNodes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
