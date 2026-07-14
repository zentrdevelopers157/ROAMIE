/* ===== AI Trip Generator & Chat (Google Gemini) ===== */

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

export interface AIRecommendationOption {
  name: string
  price: number
  reason: string
}

export interface AIRecommendations {
  hotels: AIRecommendationOption[]
  flights: AIRecommendationOption[]
  trains: AIRecommendationOption[]
}

export interface AITripResponse {
  destination: string
  dates: string
  moods: string[]
  itinerary: AIDay[]
  recommendations: AIRecommendations
}

/* ===== Internal helpers ===== */

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key || key === 'your-gemini-key-here') {
    throw new Error(
      'Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env\n' +
      'Get a free key at https://aistudio.google.com/apikey',
    )
  }
  return key
}

const MODEL = 'gemini-2.0-flash'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

/**
 * Call the Gemini API with a given request body.
 * Returns the parsed JSON response.
 */
async function callGemini(
  systemPrompt: string,
  contents: { role: string; parts: { text: string }[] }[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const apiKey = getApiKey()

  const body: Record<string, unknown> = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  }

  const response = await fetch(
    `${BASE_URL}/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )

  if (!response.ok) {
    const errBody = await response.text().catch(() => '')
    throw new Error(`Gemini API error (${response.status}): ${errBody}`)
  }

  const data = await response.json()
  const text: string | undefined =
    data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    const reason = data.candidates?.[0]?.finishReason ?? 'unknown'
    throw new Error(`Gemini returned empty response (finishReason: ${reason})`)
  }

  return text.trim()
}

/* ===== FREE-FORM CHAT ===== */

/**
 * Free-form chat with Roamie as a witty travel companion.
 * Returns the AI's response as a string.
 */
export async function chatWithRoamie(
  message: string,
  history: ChatMessage[],
): Promise<string> {
  const systemPrompt =
    `You are Roamie, a witty, warm travel companion. You speak naturally, use light Hinglish if appropriate, and give subjective travel advice. Keep answers concise.

CRITICAL: If the user asks for hidden spots, restaurants, or local recommendations, return JSON ONLY (no markdown, no code fences) in this format:
{
  "type": "place",
  "name": "Place Name",
  "description": "Brief description",
  "openTime": "9 AM - 10 PM",
  "imageUrl": "https://source.unsplash.com/800x600/?[query]"
}

For normal conversation, return plain text.`

  // Convert history to Gemini's contents format
  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }))

  // Append the new user message
  contents.push({
    role: 'user',
    parts: [{ text: message }],
  })

  return callGemini(systemPrompt, contents, 0.8, 1000)
}

/* ===== TRIP GENERATOR ===== */

/**
 * Generate a trip itinerary using Google Gemini.
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
  const systemPrompt = `You are Roamie, a witty travel companion with a flair for adventure.

User DNA: ${JSON.stringify(travelDNA)}

Generate a 3-day itinerary with recommendations. Return ONLY valid JSON (no markdown, no code fences):
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
  ],
  "recommendations": {
    "hotels": [
      { "name": "Hotel Name", "price": 5000, "reason": "I recommend this because it has the best tasty food nearby..." },
      { "name": "Second Option", "price": 3000, "reason": "Budget-friendly with good reviews..." },
      { "name": "Third Option", "price": 8000, "reason": "Luxury stay with amazing views..." }
    ],
    "flights": [
      { "name": "Airline & Route", "price": 12000, "reason": "Best value for money..." },
      { "name": "Alternative", "price": 8000, "reason": "Budget carrier option..." },
      { "name": "Premium", "price": 25000, "reason": "Full-service with meals..." }
    ],
    "trains": [
      { "name": "Train Name", "price": 2500, "reason": "Scenic route with comfortable seating..." },
      { "name": "Express Train", "price": 1500, "reason": "Fast and affordable..." },
      { "name": "Luxury Train", "price": 5000, "reason": "Premium experience with dining car..." }
    ]
  }
}

Each recommendations array MUST have exactly 3 options. The 'reason' field MUST include mention of food quality or local cuisine specifically.`

  const raw = await callGemini(
    systemPrompt,
    [{ role: 'user', parts: [{ text: userInput }] }],
    0.7,
    2000,
  )

  // Extract JSON from the response (handle markdown-wrapped or raw)
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Could not parse AI response as JSON: ' + raw.slice(0, 200))
  }

  const parsed: AITripResponse = JSON.parse(jsonMatch[0])

  // Basic validation
  if (!parsed.destination || !parsed.itinerary || !Array.isArray(parsed.itinerary)) {
    throw new Error('AI response missing required fields')
  }

  return parsed
}
