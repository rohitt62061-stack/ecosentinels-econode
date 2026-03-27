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
    const { image_base64, user_id, ward_id } = await req.json()

    if (!image_base64) {
      throw new Error('No image provided')
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!anthropicApiKey) throw new Error('ANTHROPIC_API_KEY not set')

    // 1. Call Claude-3.5-Sonnet to classify waste
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: image_base64.replace(/^data:image\/[a-z]+;base64,/, ''),
                },
              },
              {
                type: 'text',
                text: 'Classify this waste into one of these categories: biodegradable, recyclable, hazardous. Also provide a 1-sentence disposal tip. Respond strictly in JSON format: {"category": "category_name", "description": "item name", "tip": "tip text", "is_correct": true/false}',
              },
            ],
          },
        ],
      }),
    })

    const anthropicData = await response.json()
    const result = JSON.parse(anthropicData.content[0].text)

    // 2. Insert into waste_events
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: event, error: eventError } = await supabaseClient
      .from('waste_events')
      .insert({
        user_id,
        ward_id,
        waste_category: result.category,
        item_description: result.description,
        disposal_tip: result.tip,
        is_correct: result.is_correct
      })
      .select()
      .single()

    if (eventError) throw eventError

    // 3. Update Citizen Score
    if (result.is_correct) {
      await supabaseClient.rpc('increment_citizen_score', { p_user_id: user_id })
    }

    return new Response(
      JSON.stringify({ status: 'success', data: event, analysis: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
