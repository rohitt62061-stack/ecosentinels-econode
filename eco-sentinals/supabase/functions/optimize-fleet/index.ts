import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Location {
  lat: number;
  lng: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { locations }: { locations: Location[] } = await req.json()

    if (!locations || locations.length < 2) {
      return new Response(
        JSON.stringify({ status: 'success', optimized_indices: locations.length === 1 ? [0] : [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const nPoints = locations.length
    const distMatrix: number[][] = Array.from({ length: nPoints }, () => Array(nPoints).fill(Infinity))

    for (let i = 0; i < nPoints; i++) {
      for (let j = 0; j < nPoints; j++) {
        if (i !== j) {
          distMatrix[i][j] = Math.sqrt(
            Math.pow(locations[i].lat - locations[j].lat, 2) + 
            Math.pow(locations[i].lng - locations[j].lng, 2)
          )
        }
      }
    }

    // ACO Parameters
    const nAnts = 20
    const iterations = 50
    const alpha = 1.0 // Pheromone importance
    const beta = 2.0  // Distance importance
    const evaporation = 0.5
    const Q = 100

    let pheromones: number[][] = Array.from({ length: nPoints }, () => Array(nPoints).fill(1))
    let bestPath: number[] = []
    let minLength = Infinity

    for (let step = 0; step < iterations; step++) {
      const paths: number[][] = []
      const pathLengths: number[] = []

      for (let a = 0; a < nAnts; a++) {
        const visited = [0] // Always start at depot
        let pathLen = 0

        while (visited.length < nPoints) {
          const i = visited[visited.length - 1]
          const probs: number[] = []
          let sumProbs = 0

          for (let j = 0; j < nPoints; j++) {
            if (!visited.includes(j)) {
              const p = Math.pow(pheromones[i][j], alpha) * Math.pow(1.0 / distMatrix[i][j], beta)
              probs.push(p)
              sumProbs += p
            } else {
              probs.push(0)
            }
          }

          // Weighted selection
          const rand = Math.random() * sumProbs
          let cumulative = 0
          let nextNode = -1
          for (let j = 0; j < nPoints; j++) {
            cumulative += probs[j]
            if (cumulative >= rand) {
              nextNode = j
              break
            }
          }

          if (nextNode === -1) nextNode = Array.from({length: nPoints}, (_, k) => k).find(k => !visited.includes(k))!
          
          pathLen += distMatrix[i][nextNode]
          visited.push(nextNode)
        }

        pathLen += distMatrix[visited[visited.length - 1]][0] // Back to depot
        paths.push(visited)
        pathLengths.push(pathLen)

        if (pathLen < minLength) {
          minLength = pathLen
          bestPath = [...visited]
        }
      }

      // Evaporation
      for (let i = 0; i < nPoints; i++) {
        for (let j = 0; j < nPoints; j++) {
          pheromones[i][j] *= (1 - evaporation)
        }
      }

      // Update Pheromones
      for (let k = 0; k < paths.length; k++) {
        const p = paths[k]
        const len = pathLengths[k]
        for (let i = 0; i < p.length - 1; i++) {
          pheromones[p[i]][p[i+1]] += Q / len
        }
        pheromones[p[p.length-1]][0] += Q / len
      }
    }

    return new Response(
      JSON.stringify({ 
        status: 'success', 
        optimized_indices: bestPath,
        algorithm: "Ant Colony Optimization (ACO)"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
