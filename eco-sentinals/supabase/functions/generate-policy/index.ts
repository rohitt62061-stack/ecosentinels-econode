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
    const payload = await req.json()
    // Handle Supabase Webhook payload structure
    const detection = payload.record || payload

    if (!detection || !detection.ward_id) {
      throw new Error('Invalid detection payload')
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) throw new Error('ANTHROPIC_API_KEY not set')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch Ward info for context
    const { data: ward } = await supabaseClient
      .from('wards')
      .select('*')
      .eq('id', detection.ward_id)
      .single()

    // 2. Call Claude to generate recommended actions
    const prompt = `You are a Delhi Urban Governance AI. 
    A pollution event has been detected in ward: ${ward?.ward_name} (#${ward?.ward_number}).
    Source Type: ${detection.source_type}
    Confidence: ${detection.confidence_score}
    
    Recommend 3 immediate administrative actions (e.g., dispatch sprinklers, reroute traffic, issue industrial fine).
    Respond strictly in JSON: {"actions": ["Action 1", "Action 2", "Action 3"], "escalation": "Department Name"}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const anthropicData = await response.json()
    const result = JSON.parse(anthropicData.content[0].text)

    // 3. Store in policy_recommendations
    const { error: insertError } = await supabaseClient
      .from('policy_recommendations')
      .insert({
        detection_id: detection.id,
        ward_id: detection.ward_id,
        actions: result.actions,
        escalation_target: result.escalation,
        status: 'pending'
      })

    if (insertError) throw insertError

    // 4. Update the detection to mark policy as triggered
    await supabaseClient
      .from('pollution_detections')
      .update({ policy_triggered: true })
      .eq('id', detection.id)

    return new Response(
      JSON.stringify({ status: 'success', actions: result.actions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
