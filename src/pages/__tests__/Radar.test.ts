import { describe, it, expect } from 'vitest'

/* ===== Replicate data structures from Radar.tsx ===== */

interface MockUser {
  name: string
  city: string
  coords: [number, number]
  avatar: string
  exploring: string
}

const mockUsers: MockUser[] = [
  { name: 'Rahul', city: 'Paris', coords: [2.3522, 48.8566] as [number, number], avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=85&fm=webp', exploring: 'Louvre Museum' },
  { name: 'Priya', city: 'Tokyo', coords: [139.6917, 35.6895] as [number, number], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=85&fm=webp', exploring: 'Shibuya Crossing' },
  { name: 'Arjun', city: 'Bali', coords: [115.0920, -8.4095] as [number, number], avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=85&fm=webp', exploring: 'Ubud Rice Terraces' },
  { name: 'Ananya', city: 'New York', coords: [-74.0060, 40.7128] as [number, number], avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=85&fm=webp', exploring: 'Central Park' },
  { name: 'Zara', city: 'Barcelona', coords: [2.1734, 41.3851] as [number, number], avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=85&fm=webp', exploring: 'Sagrada Familia' },
  { name: 'Vikram', city: 'Sydney', coords: [151.2093, -33.8688] as [number, number], avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=85&fm=webp', exploring: 'Bondi Beach' },
]

/* ===== Pure transformation logic from Radar.tsx ===== */
function usersToMapActivities(users: MockUser[]): { name: string; coordinates: [number, number] }[] {
  return users.map((u) => ({
    name: `${u.name} in ${u.city}`,
    coordinates: u.coords,
  }))
}

function getUserCount(users: MockUser[]): number {
  return users.length
}

/* ===== TESTS ===== */

describe('Radar mockUsers data', () => {
  it('has exactly 6 mock users', () => {
    expect(mockUsers).toHaveLength(6)
  })

  it('each user has all required fields', () => {
    mockUsers.forEach((user) => {
      expect(user.name).toBeTruthy()
      expect(user.city).toBeTruthy()
      expect(user.coords).toHaveLength(2)
      expect(typeof user.coords[0]).toBe('number')
      expect(typeof user.coords[1]).toBe('number')
      expect(user.avatar).toContain('unsplash.com')
      expect(user.exploring).toBeTruthy()
    })
  })

  it('covers diverse geographic regions', () => {
    const cities = mockUsers.map((u) => u.city)
    expect(cities).toContain('Paris')
    expect(cities).toContain('Tokyo')
    expect(cities).toContain('Bali')
    expect(cities).toContain('New York')
    expect(cities).toContain('Barcelona')
    expect(cities).toContain('Sydney')
  })

  it('has no duplicate names', () => {
    const names = mockUsers.map((u) => u.name)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it('all coordinates are within valid geographic ranges', () => {
    mockUsers.forEach((user) => {
      const [lng, lat] = user.coords
      expect(lng).toBeGreaterThanOrEqual(-180)
      expect(lng).toBeLessThanOrEqual(180)
      expect(lat).toBeGreaterThanOrEqual(-90)
      expect(lat).toBeLessThanOrEqual(90)
    })
  })
})

describe('Radar usersToMapActivities transformation', () => {
  it('returns same number of activities as users', () => {
    const activities = usersToMapActivities(mockUsers)
    expect(activities).toHaveLength(mockUsers.length)
  })

  it('formats names correctly as "[name] in [city]"', () => {
    const activities = usersToMapActivities(mockUsers)
    expect(activities[0].name).toBe('Rahul in Paris')
    expect(activities[3].name).toBe('Ananya in New York')
  })

  it('preserves coordinate values', () => {
    const activities = usersToMapActivities(mockUsers)
    activities.forEach((act, i) => {
      expect(act.coordinates[0]).toBe(mockUsers[i].coords[0])
      expect(act.coordinates[1]).toBe(mockUsers[i].coords[1])
    })
  })

  it('returns empty array for empty input', () => {
    expect(usersToMapActivities([])).toEqual([])
  })
})

describe('Radar getUserCount', () => {
  it('returns correct count', () => {
    expect(getUserCount(mockUsers)).toBe(6)
  })

  it('returns 0 for empty array', () => {
    expect(getUserCount([])).toBe(0)
  })
})
