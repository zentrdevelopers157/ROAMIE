/* ===== AI TRIP GENERATOR (OpenAI) ===== */

export interface AIActivity {
  time: string
  name: string
  type: 'food' | 'stay' | 'activity' | 'transport'
  cost: number
}

export interface AIDay {
  day: number
  activities: AIActivity[]
}

export interface AITripResponse {
  destination: string
  dates: string
  moods: string[]
  itinerary: AIDay[]
}

/**
 * Generate a trip itinerary using OpenAI's GPT-4o-mini.
 * Returns parsed JSON matching AITripResponse.
 */
export async function generateTrip(
  userInput: string,
  travelDNA: {
    name: string
    vibes: number[]
    adventureLevel: number
    socialLevel: number
  },
): Promise<AITripResponse> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!apiKey || apiKey === 'sk-your-key') {
    throw new Error('OpenAI API key not configured. Set VITE_OPENAI_API_KEY in .env')
  }

  const systemPrompt = `You are Roamie, a witty travel companion with a flair for adventure.

User DNA: ${JSON.stringify(travelDNA)}

Generate a 3-day itinerary. Return ONLY valid JSON (no markdown, no code fences):
{
  "destination": "string",
  "dates": "string",
  "moods": ["string"],
  "itinerary": [
    {
      "day": 1,
      "activities": [
        {
          "time": "10:00 AM",
          "name": "Activity Name",
          "type": "food|stay|activity|transport",
          "cost": 500
        }
      ]
    }
  ]
}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`OpenAI API error (${response.status}): ${errBody}`)
  }

  const data = await response.json()
  const content: string = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('OpenAI returned empty response')
  }

  // Extract JSON from the response (handle markdown-wrapped or raw)
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Could not parse AI response as JSON')
  }

  const parsed: AITripResponse = JSON.parse(jsonMatch[0])

  // Basic validation
  if (!parsed.destination || !parsed.itinerary || !Array.isArray(parsed.itinerary)) {
    throw new Error('AI response missing required fields')
  }

  return parsed
}
