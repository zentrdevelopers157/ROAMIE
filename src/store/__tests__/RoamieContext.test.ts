import { describe, it, expect } from 'vitest'
import { roamieReducer, initialState, generateId } from '../RoamieContext'
import type { RoamieState, SavedTrip } from '../RoamieContext'

/* ===== HELPERS ===== */

function makeTrip(overrides: Partial<SavedTrip> = {}): SavedTrip {
  return {
    id: generateId(),
    destination: 'Goa',
    preferences: ['beach'],
    likedMoods: [0],
    itinerary: [{ time: '10:00', title: 'Beach Walk', description: 'Morning stroll' }],
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function fullState(overrides: Partial<RoamieState> = {}): RoamieState {
  return { ...initialState, ...overrides }
}

/* ===== TESTS ===== */

describe('roamieReducer', () => {
  // ── Initial State ──────────────────────────────────────
  describe('initialState', () => {
    it('has default values', () => {
      expect(initialState).toEqual({
        name: '',
        nickname: '',
        selectedVibes: [],
        adventureLevel: 5,
        socialLevel: 6,
        trips: [],
        onboarded: false,
        roamCoins: 100,
        isPro: false,
        proExpiresAt: null,
        confirmedBookings: [],
        selectedDestKinds: [],
      })
    })
  })

  // ── SET_NAME ───────────────────────────────────────────
  describe('SET_NAME', () => {
    it('sets the name', () => {
      const next = roamieReducer(fullState(), { type: 'SET_NAME', payload: 'Alice' })
      expect(next.name).toBe('Alice')
      // other fields untouched
      expect(next.adventureLevel).toBe(5)
    })

    it('allows empty name', () => {
      const next = roamieReducer(fullState({ name: 'Bob' }), { type: 'SET_NAME', payload: '' })
      expect(next.name).toBe('')
    })
  })

  // ── SET_VIBES ──────────────────────────────────────────
  describe('SET_VIBES', () => {
    it('stores selected vibes', () => {
      const next = roamieReducer(fullState(), { type: 'SET_VIBES', payload: [0, 2, 4] })
      expect(next.selectedVibes).toEqual([0, 2, 4])
    })

    it('replaces previous vibes', () => {
      const next = roamieReducer(fullState({ selectedVibes: [1, 3] }), { type: 'SET_VIBES', payload: [5] })
      expect(next.selectedVibes).toEqual([5])
    })

    it('allows empty vibes array', () => {
      const next = roamieReducer(fullState({ selectedVibes: [0] }), { type: 'SET_VIBES', payload: [] })
      expect(next.selectedVibes).toEqual([])
    })
  })

  // ── SET_ADVENTURE_LEVEL ────────────────────────────────
  describe('SET_ADVENTURE_LEVEL', () => {
    it('sets adventure level', () => {
      const next = roamieReducer(fullState(), { type: 'SET_ADVENTURE_LEVEL', payload: 8 })
      expect(next.adventureLevel).toBe(8)
    })

    it('handles extreme values', () => {
      const next = roamieReducer(fullState(), { type: 'SET_ADVENTURE_LEVEL', payload: 0 })
      expect(next.adventureLevel).toBe(0)
    })

    it('handles high values', () => {
      const next = roamieReducer(fullState(), { type: 'SET_ADVENTURE_LEVEL', payload: 10 })
      expect(next.adventureLevel).toBe(10)
    })
  })

  // ── SET_SOCIAL_LEVEL ──────────────────────────────────
  describe('SET_SOCIAL_LEVEL', () => {
    it('sets social level', () => {
      const next = roamieReducer(fullState(), { type: 'SET_SOCIAL_LEVEL', payload: 3 })
      expect(next.socialLevel).toBe(3)
    })
  })

  // ── COMPLETE_ONBOARDING ────────────────────────────────
  describe('COMPLETE_ONBOARDING', () => {
    it('marks onboarded as true', () => {
      const next = roamieReducer(fullState(), { type: 'COMPLETE_ONBOARDING' })
      expect(next.onboarded).toBe(true)
    })

    it('is idempotent', () => {
      const next = roamieReducer(fullState({ onboarded: true }), { type: 'COMPLETE_ONBOARDING' })
      expect(next.onboarded).toBe(true)
    })
  })

  // ── ADD_TRIP ───────────────────────────────────────────
  describe('ADD_TRIP', () => {
    it('adds a trip to the front of the list', () => {
      const existing = makeTrip({ id: 'old', destination: 'Manali' })
      const newTrip = makeTrip({ id: 'new', destination: 'Goa' })
      const next = roamieReducer(fullState({ trips: [existing] }), {
        type: 'ADD_TRIP',
        payload: newTrip,
      })
      expect(next.trips).toHaveLength(2)
      expect(next.trips[0].id).toBe('new')
      expect(next.trips[1].id).toBe('old')
    })

    it('adds first trip to empty list', () => {
      const trip = makeTrip()
      const next = roamieReducer(fullState(), { type: 'ADD_TRIP', payload: trip })
      expect(next.trips).toHaveLength(1)
      expect(next.trips[0].destination).toBe('Goa')
    })
  })

  // ── REMOVE_TRIP ────────────────────────────────────────
  describe('REMOVE_TRIP', () => {
    it('removes a trip by id', () => {
      const tripA = makeTrip({ id: 'a' })
      const tripB = makeTrip({ id: 'b' })
      const next = roamieReducer(fullState({ trips: [tripA, tripB] }), {
        type: 'REMOVE_TRIP',
        payload: 'a',
      })
      expect(next.trips).toHaveLength(1)
      expect(next.trips[0].id).toBe('b')
    })

    it('does nothing when id does not exist', () => {
      const trips = [makeTrip({ id: 'x' })]
      const next = roamieReducer(fullState({ trips }), {
        type: 'REMOVE_TRIP',
        payload: 'nonexistent',
      })
      expect(next.trips).toHaveLength(1)
      expect(next.trips[0].id).toBe('x')
    })

    it('handles removing from empty list', () => {
      const next = roamieReducer(fullState(), {
        type: 'REMOVE_TRIP',
        payload: 'any',
      })
      expect(next.trips).toHaveLength(0)
    })
  })

  // ── UPDATE_TRIP_DATES ──────────────────────────────────
  describe('UPDATE_TRIP_DATES', () => {
    it('sets start and end dates on the matching trip', () => {
      const trip = makeTrip({ id: 't1' })
      const next = roamieReducer(fullState({ trips: [trip] }), {
        type: 'UPDATE_TRIP_DATES',
        payload: { id: 't1', startDate: '2026-08-01', endDate: '2026-08-05' },
      })
      expect(next.trips[0].startDate).toBe('2026-08-01')
      expect(next.trips[0].endDate).toBe('2026-08-05')
    })

    it('does not modify other trips', () => {
      const t1 = makeTrip({ id: 't1' })
      const t2 = makeTrip({ id: 't2' })
      const next = roamieReducer(fullState({ trips: [t1, t2] }), {
        type: 'UPDATE_TRIP_DATES',
        payload: { id: 't1', startDate: '2026-09-01', endDate: '2026-09-03' },
      })
      expect(next.trips[0].startDate).toBe('2026-09-01')
      expect(next.trips[1].startDate).toBeUndefined()
    })

    it('handles updating a non-existent trip id gracefully', () => {
      const trip = makeTrip({ id: 't1' })
      const next = roamieReducer(fullState({ trips: [trip] }), {
        type: 'UPDATE_TRIP_DATES',
        payload: { id: 'phantom', startDate: '2026-10-01', endDate: '2026-10-10' },
      })
      expect(next.trips).toHaveLength(1)
      expect(next.trips[0].startDate).toBeUndefined()
    })

    it('allows empty date strings', () => {
      const trip = makeTrip({ id: 't1' })
      const next = roamieReducer(fullState({ trips: [trip] }), {
        type: 'UPDATE_TRIP_DATES',
        payload: { id: 't1', startDate: '', endDate: '' },
      })
      expect(next.trips[0].startDate).toBe('')
      expect(next.trips[0].endDate).toBe('')
    })
  })

  // ── ADD_COINS ──────────────────────────────────────────
  describe('ADD_COINS', () => {
    it('adds coins to default balance', () => {
      const next = roamieReducer(fullState(), { type: 'ADD_COINS', payload: 50 })
      expect(next.roamCoins).toBe(150)
    })

    it('adds coins to existing balance', () => {
      const next = roamieReducer(fullState({ roamCoins: 200 }), { type: 'ADD_COINS', payload: 500 })
      expect(next.roamCoins).toBe(700)
    })

    it('handles zero coins', () => {
      const next = roamieReducer(fullState({ roamCoins: 100 }), { type: 'ADD_COINS', payload: 0 })
      expect(next.roamCoins).toBe(100)
    })

    it('handles negative coins by falling back gracefully', () => {
      const next = roamieReducer(fullState({ roamCoins: 50 }), { type: 'ADD_COINS', payload: -10 })
      expect(next.roamCoins).toBe(40)
    })

    it('works when roamCoins is 0 or undefined (nullish coalescing)', () => {
      const state = fullState({ roamCoins: 0 })
      const next = roamieReducer(state, { type: 'ADD_COINS', payload: 50 })
      // 0 ?? 100 => 0, then 0 + 50 = 50
      expect(next.roamCoins).toBe(50)
    })
  })

  // ── SET_PRO ────────────────────────────────────────────
  describe('SET_PRO', () => {
    it('activates Pro status with expiry', () => {
      const next = roamieReducer(fullState(), {
        type: 'SET_PRO',
        payload: { isPro: true, expiresAt: '2026-08-15T00:00:00.000Z' },
      })
      expect(next.isPro).toBe(true)
      expect(next.proExpiresAt).toBe('2026-08-15T00:00:00.000Z')
    })

    it('deactivates Pro status', () => {
      const state = fullState({ isPro: true, proExpiresAt: '2026-08-15T00:00:00.000Z' })
      const next = roamieReducer(state, {
        type: 'SET_PRO',
        payload: { isPro: false, expiresAt: null },
      })
      expect(next.isPro).toBe(false)
      expect(next.proExpiresAt).toBeNull()
    })

    it('does not affect other state fields', () => {
      const state = fullState({ name: 'Test', roamCoins: 500 })
      const next = roamieReducer(state, {
        type: 'SET_PRO',
        payload: { isPro: true, expiresAt: null },
      })
      expect(next.name).toBe('Test')
      expect(next.roamCoins).toBe(500)
    })
  })

  // ── LOAD_STATE ─────────────────────────────────────────
  describe('LOAD_STATE', () => {
    it('replaces the entire state', () => {
      const newState: RoamieState = {
        name: 'Loaded',
        nickname: '',
        selectedVibes: [0],
        adventureLevel: 9,
        socialLevel: 2,
        trips: [makeTrip({ destination: 'Loaded Trip' })],
        onboarded: true,
        roamCoins: 999,
        isPro: true,
        proExpiresAt: '2026-09-01T00:00:00.000Z',
        confirmedBookings: [],
        selectedDestKinds: [],
      }
      const next = roamieReducer(fullState({ name: 'Old', roamCoins: 100 }), {
        type: 'LOAD_STATE',
        payload: newState,
      })
      expect(next).toEqual(newState)
    })

    it('does not merge — completely replaces', () => {
      const next = roamieReducer(fullState({ name: 'WillBeLost' }), {
        type: 'LOAD_STATE',
        payload: fullState({ name: 'Restored' }),
      })
      expect(next.name).toBe('Restored')
    })
  })

  // ── DEFAULT (unknown action) ───────────────────────────
  describe('unknown action type', () => {
    it('returns state unchanged', () => {
      const state = fullState({ name: 'Test' })
      const result = roamieReducer(state, { type: 'UNKNOWN' as never, payload: '' })
      expect(result).toBe(state) // same reference
    })
  })

  // ── IMMUTABILITY ───────────────────────────────────────
  describe('immutability', () => {
    it('does not mutate the original state on SET_NAME', () => {
      const original = fullState({ name: 'Original' })
      const copy = { ...original }
      roamieReducer(original, { type: 'SET_NAME', payload: 'Changed' })
      expect(original).toEqual(copy)
    })

    it('does not mutate the trips array on ADD_TRIP', () => {
      const original = fullState()
      Object.freeze(original) // will throw if mutated
      expect(() => {
        roamieReducer(original, { type: 'ADD_TRIP', payload: makeTrip() })
      }).not.toThrow()
    })
  })
})

/* ===== generateId ===== */
describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId()
    expect(id).toBeTruthy()
    expect(typeof id).toBe('string')
  })

  it('returns unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })

  it('is less than 32 characters', () => {
    const id = generateId()
    expect(id.length).toBeLessThan(32)
  })
})
