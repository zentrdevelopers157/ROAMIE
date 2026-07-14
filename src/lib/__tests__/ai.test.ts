import { describe, it, expect, beforeEach, vi } from 'vitest'
import { chatWithRoamie, generateTrip } from '../ai'
import type { AITripResponse } from '../ai'

/* ===== MOCK FETCH & ENV ===== */

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockReset()

  // Vitest exposes VITE_* env variables into import.meta.env when set on process.env
  import.meta.env.VITE_GEMINI_API_KEY = 'test-api-key'
})

/* ===== TEST API KEY ===== */

function stubImportMetaEnv(key: string | undefined) {
  if (key === undefined) {
    delete import.meta.env.VITE_GEMINI_API_KEY
  } else {
    import.meta.env.VITE_GEMINI_API_KEY = key
  }
}

/* ===== HELPERS ===== */

function mockGeminiResponse(text: string, ok = true, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    text: async () => status >= 400 ? text : '',
    json: async () => ({
      candidates: [
        {
          content: {
            parts: [{ text }],
          },
          finishReason: ok ? 'STOP' : undefined,
        },
      ],
    }),
  })
}

function mockEmptyResponse(finishReason = 'SAFETY') {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    text: async () => '',
    json: async () => ({
      candidates: [
        {
          content: { parts: [] },
          finishReason,
        },
      ],
    }),
  })
}

/* ===== TESTS ===== */

// ── chatWithRoamie ──────────────────────────────────────────
describe('chatWithRoamie', () => {
  it('returns the AI response text', async () => {
    mockGeminiResponse('Try the chai at Chandni Chowk! 🍵')
    const reply = await chatWithRoamie('Best street food in Delhi?', [])
    expect(reply).toBe('Try the chai at Chandni Chowk! 🍵')
  })

  it('includes conversation history in the request', async () => {
    mockGeminiResponse('Definitely!')
    await chatWithRoamie('Any tips?', [
      { role: 'user', content: 'Where should I go?' },
      { role: 'assistant', content: 'Goa is great!' },
    ])

    const calledUrl = mockFetch.mock.calls[0][0] as string
    const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body)

    // Should contain history + new message
    expect(calledBody.contents).toHaveLength(3)
    expect(calledBody.contents[0].role).toBe('user')
    expect(calledBody.contents[1].role).toBe('model')
    expect(calledBody.contents[2].role).toBe('user')
    expect(calledUrl).toContain('gemini-2.0-flash')
  })

  it('throws when API key is missing', async () => {
    stubImportMetaEnv(undefined)
    await expect(chatWithRoamie('Hello', [])).rejects.toThrow('Gemini API key not configured')
  })

  it('throws when API key is placeholder', async () => {
    stubImportMetaEnv('your-gemini-key-here')
    await expect(chatWithRoamie('Hello', [])).rejects.toThrow('Gemini API key not configured')
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => 'Rate limited',
      json: async () => ({}),
    })
    await expect(chatWithRoamie('Hi', [])).rejects.toThrow('Gemini API error (429)')
  })

  it('throws on empty response', async () => {
    mockEmptyResponse()
    await expect(chatWithRoamie('Hello', [])).rejects.toThrow('empty response')
  })

  it('trims whitespace from response', async () => {
    mockGeminiResponse('  Hey there!   ')
    const reply = await chatWithRoamie('Hi', [])
    expect(reply).toBe('Hey there!')
  })

  it('includes correct system instruction in request body', async () => {
    mockGeminiResponse('Sure!')
    await chatWithRoamie('Hello', [])

    const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(calledBody.system_instruction).toBeDefined()
    expect(calledBody.system_instruction.parts[0].text).toContain('Roamie')
    expect(calledBody.system_instruction.parts[0].text).toContain('witty')
  })

  it('uses temperature 0.8 and max 1000 tokens', async () => {
    mockGeminiResponse('OK')
    await chatWithRoamie('Hi', [])

    const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(calledBody.generationConfig.temperature).toBe(0.8)
    expect(calledBody.generationConfig.maxOutputTokens).toBe(1000)
  })
})

// ── generateTrip ────────────────────────────────────────────
describe('generateTrip', () => {
  const defaultDNA = {
    name: 'TestUser',
    vibes: [0],
    adventureLevel: 7,
    socialLevel: 5,
  }

  const validTripJSON: AITripResponse = {
    destination: 'Goa',
    dates: 'December 2026',
    moods: ['relaxed', 'adventurous'],
    itinerary: [
      {
        day: 1,
        activities: [
          { time: '10:00', name: 'Beach Yoga', type: 'activity', cost: 500 },
          { time: '13:00', name: 'Fish Curry Lunch', type: 'food', cost: 300 },
        ],
      },
      {
        day: 2,
        activities: [
          { time: '09:00', name: 'Sunset Cruise', type: 'activity', cost: 1200 },
        ],
      },
    ],
    recommendations: {
      hotels: [
        { name: 'Beach Resort', price: 5000, reason: 'Best tasty food nearby with amazing beach views' },
        { name: 'Budget Stay', price: 2000, reason: 'Affordable and close to local eateries' },
        { name: 'Luxury Villa', price: 12000, reason: 'Premium dining experience included' },
      ],
      flights: [
        { name: 'IndiGo Direct', price: 5000, reason: 'Best value with good meal options' },
        { name: 'SpiceJet', price: 3500, reason: 'Budget friendly with snacks' },
        { name: 'Vistara', price: 8000, reason: 'Full service with gourmet meals' },
      ],
      trains: [
        { name: 'Shatabdi Express', price: 1500, reason: 'Scenic route with tasty pantry food' },
        { name: 'Rajdhani Express', price: 3000, reason: 'Premium dining car with local cuisine' },
        { name: 'Passenger Train', price: 500, reason: 'Cheapest option with street food stops' },
      ],
    },
  }

  it('returns parsed AITripResponse from valid JSON', async () => {
    mockGeminiResponse(JSON.stringify(validTripJSON))
    const result = await generateTrip('I want to go to Goa', defaultDNA)
    expect(result.destination).toBe('Goa')
    expect(result.itinerary).toHaveLength(2)
    expect(result.itinerary[0].activities).toHaveLength(2)
    expect(result.itinerary[1].activities[0].name).toBe('Sunset Cruise')
  })

  it('handles JSON wrapped in markdown code fences', async () => {
    mockGeminiResponse('```json\n' + JSON.stringify(validTripJSON) + '\n```')
    const result = await generateTrip('Goa trip', defaultDNA)
    expect(result.destination).toBe('Goa')
  })

  it('handles JSON with trailing text after the object', async () => {
    mockGeminiResponse(JSON.stringify(validTripJSON) + '\n\nHope you enjoy this plan!')
    const result = await generateTrip('Goa trip', defaultDNA)
    expect(result.destination).toBe('Goa')
    expect(result.itinerary).toHaveLength(2)
  })

  it('throws when API key is missing', async () => {
    stubImportMetaEnv(undefined)
    await expect(generateTrip('any', defaultDNA)).rejects.toThrow('Gemini API key not configured')
  })

  it('throws when response has no JSON object', async () => {
    mockGeminiResponse('Sorry, I cannot generate that.')
    await expect(generateTrip('test', defaultDNA)).rejects.toThrow('Could not parse AI response as JSON')
  })

  it('throws when parsed JSON is missing required fields', async () => {
    mockGeminiResponse(JSON.stringify({ destination: 'Goa', moods: [] })) // no itinerary
    await expect(generateTrip('test', defaultDNA)).rejects.toThrow('missing required fields')
  })

  it('throws on empty response from API', async () => {
    mockEmptyResponse()
    await expect(generateTrip('test', defaultDNA)).rejects.toThrow('empty response')
  })

  it('throws on API error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
      json: async () => ({}),
    })
    await expect(generateTrip('test', defaultDNA)).rejects.toThrow('Gemini API error (500)')
  })

  it('includes travel DNA in system prompt', async () => {
    mockGeminiResponse(JSON.stringify(validTripJSON))
    await generateTrip('Goa trip', defaultDNA)

    const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    const systemText = calledBody.system_instruction.parts[0].text
    expect(systemText).toContain('User DNA')
    expect(systemText).toContain('"adventureLevel":7')
    expect(systemText).toContain('"name":"TestUser"')
  })

  it('uses temperature 0.7 and max 2000 tokens', async () => {
    mockGeminiResponse(JSON.stringify(validTripJSON))
    await generateTrip('test', defaultDNA)

    const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(calledBody.generationConfig.temperature).toBe(0.7)
    expect(calledBody.generationConfig.maxOutputTokens).toBe(2000)
  })

  it('sends user input as a single content message', async () => {
    mockGeminiResponse(JSON.stringify(validTripJSON))
    await generateTrip('Take me to the mountains!', defaultDNA)

    const calledBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(calledBody.contents).toHaveLength(1)
    expect(calledBody.contents[0].parts[0].text).toBe('Take me to the mountains!')
  })
})
