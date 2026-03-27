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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const waqiToken = Deno.env.get('WAQI_TOKEN') || 'demo' // Use 'demo' as fallback
    const delhiAqiUrl = `https://api.waqi.info/feed/delhi/?token=${waqiToken}`

    // 1. Fetch from WAQI
    const response = await fetch(delhiAqiUrl)
    const data = await response.json()

    if (data.status !== 'ok') {
      throw new Error(`WAQI API error: ${data.data}`)
    }

    const aqiData = data.data
    const pm25 = aqiData.iaqi.pm25?.v || 0
    const pm10 = aqiData.iaqi.pm10?.v || 0
    const no2 = aqiData.iaqi.no2?.v || 0
    const so2 = aqiData.iaqi.so2?.v || 0
    const co = aqiData.iaqi.co?.v || 0
    const aqiValue = aqiData.aqi

    // 2. Assign to all wards (as a simple sync)
    const { data: wards, error: wardsError } = await supabaseClient
      .from('wards')
      .select('id')

    if (wardsError) throw wardsError

    const readings = wards.map(w => ({
      ward_id: w.id,
      aqi_value: aqiValue,
      pm25: pm25,
      pm10: pm10,
      no2: no2,
      so2: so2,
      co: co,
      recorded_at: new Date().toISOString()
    }))

    const { error: insertError } = await supabaseClient
      .from('aqi_readings')
      .insert(readings)

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ status: 'success', wards_updated: wards.length, aqi: aqiValue }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
