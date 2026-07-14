import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  generateReminders,
  dismissReminder,
  clearAllDismissed,
  requestBrowserNotificationPermission,
  sendBrowserNotification,
  getBrowserNotificationStatus,
} from '../reminders'
import type { ReminderInput } from '../reminders'

/* ===== MOCK localStorage & window ===== */
const localStorageStore = new Map<string, string>()

beforeEach(() => {
  localStorageStore.clear()

  vi.stubGlobal('localStorage', {
    getItem: (key: string) => localStorageStore.get(key) ?? null,
    setItem: (key: string, value: string) => { localStorageStore.set(key, value) },
    removeItem: (key: string) => { localStorageStore.delete(key) },
    clear: () => localStorageStore.clear(),
    get length() { return localStorageStore.size },
    key: (i: number) => [...localStorageStore.keys()][i] ?? null,
  })

  // Stub window so browser notification functions don't throw
  vi.stubGlobal('window', {})

  clearAllDismissed()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

/* ===== HELPERS ===== */

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
}

/**
 * Build a YYYY-MM-DD string that is N days from today at 23:59 UTC.
 * Using end-of-day UTC avoids the `new Date("YYYY-MM-DD") → midnight UTC` parsing issue
 * where today's date can appear to be "yesterday" when the wall clock has passed UTC midnight.
 */
function daysFromNowEod(n: number): string {
  const d = new Date()
  // Target noon UTC on the target day to avoid boundary issues
  const utcTarget = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n, 23, 59, 59))
  return utcTarget.toISOString()
}

/** Build an ISO string that is exactly N hours from now. */
function nowPlusHours(h: number): string {
  return new Date(Date.now() + h * 3_600_000).toISOString()
}

function makeInput(overrides: Partial<ReminderInput> = {}): ReminderInput {
  return {
    trips: [],
    name: 'TestUser',
    roamCoins: 100,
    hasOnboarded: true,
    ...overrides,
  }
}

/* ===== TESTS ===== */

describe('generateReminders', () => {
  // ── No reminders for empty state ──────────────────────
  it('allows only coin-related reminders when not onboarded with no trips', () => {
    const result = generateReminders(makeInput({ hasOnboarded: false, trips: [], roamCoins: 100 }))
    // Coin tip is independent of onboarding status
    result.forEach((r) => {
      // No inactivity or trending (those require onboarding/hasTrips)
      expect(r.type).not.toBe('inactivity')
      expect(r.type).not.toBe('trending')
    })
  })

  // ── Upcoming trip (startDate within 7 days) ───────────
  describe('upcoming trip reminders (startDate)', () => {
    it('creates a reminder for a trip starting today (within 24h)', () => {
      const trip = {
        id: 't1',
        destination: 'Goa',
        createdAt: daysAgo(10),
        startDate: nowPlusHours(1), // 1 hour from now = definitely today
      }
      const result = generateReminders(makeInput({ trips: [trip] }))
      const upcoming = result.find((r) => r.type === 'trip_pending' && r.message.includes("Today"))
      expect(upcoming).toBeDefined()
      expect(upcoming!.title).toContain('Goa')
    })

    it('creates a reminder for a trip starting tomorrow (25-47h from now)', () => {
      const trip = {
        id: 't2',
        destination: 'Manali',
        createdAt: daysAgo(5),
        startDate: nowPlusHours(25), // 25 hours from now = definitely tomorrow
      }
      const result = generateReminders(makeInput({ trips: [trip] }))
      const upcoming = result.find((r) => r.message.includes('tomorrow'))
      expect(upcoming).toBeDefined()
      expect(upcoming!.emoji).toBe('⏰')
    })

    it('creates a reminder for a trip starting within 3 days', () => {
      const trip = {
        id: 't3',
        destination: 'Bali',
        createdAt: daysAgo(3),
        startDate: daysFromNowEod(3),
      }
      const result = generateReminders(makeInput({ trips: [trip] }))
      const upcoming = result.find((r) => r.emoji === '🗓️')
      expect(upcoming).toBeDefined()
      expect(upcoming!.message).toMatch(/Only \d+ days until Bali!/)
    })

    it('creates a reminder for a trip 4-7 days away', () => {
      const trip = {
        id: 't4',
        destination: 'Paris',
        createdAt: daysAgo(2),
        startDate: daysFromNowEod(5),
      }
      const result = generateReminders(makeInput({ trips: [trip] }))
      const upcoming = result.find((r) => r.emoji === '🌟')
      expect(upcoming).toBeDefined()
      expect(upcoming!.message).toMatch(/Paris trip is coming up/)
    })

    it('does NOT create upcoming reminder for a trip starting more than 7 days away', () => {
      const trip = {
        id: 't5',
        destination: 'Tokyo',
        createdAt: daysAgo(1),
        startDate: daysFromNowEod(10),
      }
      const result = generateReminders(makeInput({ trips: [trip] }))
      const upcoming = result.find((r) => r.id?.startsWith('rem_upcoming_'))
      expect(upcoming).toBeUndefined()
    })

    it('does NOT create upcoming reminder for a trip that already started', () => {
      const trip = {
        id: 't6',
        destination: 'Goa',
        createdAt: daysAgo(20),
        startDate: daysFromNowEod(-5),
      }
      const result = generateReminders(makeInput({ trips: [trip] }))
      const upcoming = result.find((r) => r.id?.startsWith('rem_upcoming_'))
      expect(upcoming).toBeUndefined()
    })
  })

  // ── Pending trip (created > 2 days, no startDate) ────
  describe('pending trip reminders (no startDate)', () => {
    it('creates reminder for trip created 3 days ago with no startDate', () => {
      const trip = {
        id: 't10',
        destination: 'Kerala',
        createdAt: daysAgo(3),
      }
      const result = generateReminders(makeInput({ trips: [trip] }))
      const pending = result.find((r) => r.type === 'trip_pending' && r.emoji === '✈️')
      expect(pending).toBeDefined()
      expect(pending!.message).toContain('When are you going')
    })

    it('creates reminder for trip created 7+ days ago with extended message', () => {
      const trip = {
        id: 't11',
        destination: 'Rishikesh',
        createdAt: daysAgo(10),
      }
      const result = generateReminders(makeInput({ trips: [trip] }))
      const pending = result.find((r) => r.type === 'trip_pending' && r.emoji === '✈️')
      expect(pending).toBeDefined()
      expect(pending!.message).toContain('Set your travel dates')
    })

    it('does NOT create pending reminder for recent trips (< 2 days)', () => {
      const trip = {
        id: 't12',
        destination: 'Goa',
        createdAt: daysAgo(1),
      }
      const result = generateReminders(makeInput({ trips: [trip] }))
      const pending = result.find((r) => r.id === 'rem_trip_t12')
      expect(pending).toBeUndefined()
    })

    it('skips pending reminder when startDate-based reminder already exists', () => {
      const trip = {
        id: 't13',
        destination: 'Manali',
        createdAt: daysAgo(10),
        startDate: nowPlusHours(25), // tomorrow
      }
      const result = generateReminders(makeInput({ trips: [trip] }))
      const pending = result.find((r) => r.id === 'rem_trip_t13')
      expect(pending).toBeUndefined()
    })
  })

  // ── Inactivity reminders ──────────────────────────────
  describe('inactivity reminders', () => {
    it('prompts to plan first trip when user has no trips', () => {
      const result = generateReminders(makeInput({ trips: [], name: 'Alice' }))
      const idle = result.find((r) => r.type === 'inactivity')
      expect(idle).toBeDefined()
      expect(idle!.title).toContain('Alice')
      expect(idle!.message).toContain("haven't planned any trips")
      expect(idle!.actionLabel).toBe('Plan a Trip')
    })

    it('prompts exploration when last trip was 5+ days ago', () => {
      const trip = {
        id: 't20',
        destination: 'Goa',
        createdAt: daysAgo(10),
      }
      const result = generateReminders(makeInput({ trips: [trip] }))
      const idle = result.find((r) => r.type === 'inactivity')
      expect(idle).toBeDefined()
      expect(idle!.message).toContain('Ready to explore')
    })

    it('does NOT show inactivity reminder if user has not onboarded', () => {
      const result = generateReminders(makeInput({ hasOnboarded: false, trips: [] }))
      const idle = result.find((r) => r.type === 'inactivity')
      expect(idle).toBeUndefined()
    })
  })

  // ── RoamCoin tip ──────────────────────────────────────
  describe('RoamCoin tip reminder', () => {
    it('shows coin tip when roamCoins >= 50', () => {
      const result = generateReminders(makeInput({ roamCoins: 100 }))
      const tip = result.find((r) => r.type === 'pro_tip')
      expect(tip).toBeDefined()
      expect(tip!.title).toContain('100')
      expect(tip!.actionLabel).toBe('See Stats')
    })

    it('does NOT show coin tip when roamCoins < 50', () => {
      const result = generateReminders(makeInput({ roamCoins: 30 }))
      const tip = result.find((r) => r.type === 'pro_tip')
      expect(tip).toBeUndefined()
    })
  })

  // ── Trending ──────────────────────────────────────────
  describe('trending reminder', () => {
    it('shows trending when user has trips', () => {
      const trip = { id: 't30', destination: 'Goa', createdAt: daysAgo(1) }
      const result = generateReminders(makeInput({ trips: [trip] }))
      const trend = result.find((r) => r.type === 'trending')
      expect(trend).toBeDefined()
      expect(trend!.emoji).toBe('🔥')
    })

    it('does NOT show trending when user has no trips', () => {
      const result = generateReminders(makeInput({ trips: [] }))
      const trend = result.find((r) => r.type === 'trending')
      expect(trend).toBeUndefined()
    })
  })

  // ── Dismiss functionality ─────────────────────────────
  describe('dismiss persists across calls', () => {
    it('excludes dismissed reminders from subsequent generations', () => {
      const trip = {
        id: 't40',
        destination: 'Goa',
        createdAt: daysAgo(3),
      }
      const input = makeInput({ trips: [trip], roamCoins: 100 })

      const first = generateReminders(input)
      expect(first.length).toBeGreaterThan(0)

      dismissReminder(first[0].id)

      const second = generateReminders(input)
      expect(second.find((r) => r.id === first[0].id)).toBeUndefined()
    })

    it('clearAllDismissed resets all dismissals', () => {
      const trip = {
        id: 't41',
        destination: 'Goa',
        createdAt: daysAgo(3),
      }
      const input = makeInput({ trips: [trip] })

      const first = generateReminders(input)
      const dismissedId = first[0].id
      dismissReminder(dismissedId)

      clearAllDismissed()
      const second = generateReminders(input)
      expect(second.find((r) => r.id === dismissedId)).toBeDefined()
    })
  })

  // ── Sorting ───────────────────────────────────────────
  it('sorts reminders by createdAt descending', () => {
    const today = daysAgo(0)
    const old = daysAgo(5)

    const trip1 = { id: 's1', destination: 'New', createdAt: today }
    const trip2 = { id: 's2', destination: 'Old', createdAt: old }

    const result = generateReminders(makeInput({ trips: [trip1, trip2], roamCoins: 30 }))

    for (let i = 1; i < result.length; i++) {
      const prev = new Date(result[i - 1].createdAt).getTime()
      const curr = new Date(result[i].createdAt).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })
})

/* ===== Browser Notification Functions ===== */

describe('browser notification functions', () => {
  describe('getBrowserNotificationStatus', () => {
    it('returns unsupported when Notification is not available', () => {
      const original = (globalThis as Record<string, unknown>).Notification
      delete (globalThis as Record<string, unknown>).Notification
      expect(getBrowserNotificationStatus()).toBe('unsupported')
      ;(globalThis as Record<string, unknown>).Notification = original
    })
  })

  describe('requestBrowserNotificationPermission', () => {
    it('resolves to denied when Notification is not available', async () => {
      const original = (globalThis as Record<string, unknown>).Notification
      delete (globalThis as Record<string, unknown>).Notification
      const result = await requestBrowserNotificationPermission()
      expect(result).toBe('denied')
      ;(globalThis as Record<string, unknown>).Notification = original
    })
  })

  describe('sendBrowserNotification', () => {
    it('does not throw when Notification is not available', () => {
      const original = (globalThis as Record<string, unknown>).Notification
      delete (globalThis as Record<string, unknown>).Notification
      expect(() => sendBrowserNotification('Test', { body: 'test' })).not.toThrow()
      ;(globalThis as Record<string, unknown>).Notification = original
    })
  })
})
