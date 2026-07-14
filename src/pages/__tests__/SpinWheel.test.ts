import { describe, it, expect } from 'vitest'

/* ===== Replicate data from SpinWheel.tsx ===== */
const destinations = [
  "Torres del Paine", "Mount Fitz Roy", "Swiss Alps", "Dolomites", "Mount Fuji",
  "Banff", "Yosemite", "Zhangjiajie", "Ha Long Bay", "Milford Sound",
  "Bora Bora", "Maldives", "Santorini", "Amalfi Coast", "Plitvice Lakes",
  "Iguazu Falls", "Na Pali Coast", "Seychelles", "Raja Ampat", "Whitehaven Beach",
  "Salar de Uyuni", "Grand Canyon", "Namib Desert", "Cappadocia", "Wadi Rum",
  "Antelope Canyon", "Pamukkale", "Iceland Black Sand", "The Wave Arizona", "Socotra Island",
  "Machu Picchu", "Petra", "Taj Mahal", "Angkor Wat", "Bagan",
  "Alhambra", "Kyoto", "Venice", "Chefchaouen", "Meteora",
  "Amazon", "Serengeti", "Galapagos", "Bamboo Grove", "Jiuzhaigou",
  "Hallerbos", "Snaefellsnes", "Okavango", "Tsingy", "Valley of Flowers",
]

const SLICE_COUNT = destinations.length
const SLICE_DEG = 360 / SLICE_COUNT

/* ===== Pure logic extracted from SpinWheel.tsx ===== */
function computeSpinResult(rotation: number): { sliceIndex: number; destination: string } {
  // Normalize rotation to 0-360 with epsilon for floating point precision
  const normalized = (((rotation % 360) + 360) % 360) + 0.0001
  // The pointer is at the top (0 degrees). The wheel rotates clockwise.
  // After rotating `normalized` degrees clockwise, compute which slice is at the pointer.
  const rawIndex = Math.floor(normalized / SLICE_DEG)
  // Since the wheel rotates clockwise but slices index counter-clockwise:
  const sliceIndex = (SLICE_COUNT - rawIndex) % SLICE_COUNT
  return { sliceIndex, destination: destinations[sliceIndex] }
}

function generateRandomSpin(currentRotation: number): { newRotation: number; targetSlice: number } {
  const extraRotations = (5 + Math.floor(Math.random() * 5)) * 360
  const randomSlice = Math.floor(Math.random() * SLICE_COUNT)
  const sliceOffset = randomSlice * SLICE_DEG
  const totalRotation = currentRotation + extraRotations + (360 - sliceOffset)
  return { newRotation: totalRotation, targetSlice: randomSlice }
}

function canSpin(roamCoins: number): boolean {
  return roamCoins >= 1000000
}

/* ===== TESTS ===== */

describe('SpinWheel destinations array', () => {
  it('has exactly 50 destinations', () => {
    expect(destinations).toHaveLength(50)
  })

  it('all destinations are non-empty strings', () => {
    destinations.forEach((dest) => {
      expect(dest).toBeTruthy()
      expect(typeof dest).toBe('string')
      expect(dest.length).toBeGreaterThan(2)
    })
  })

  it('has no duplicate destinations', () => {
    const unique = new Set(destinations)
    expect(unique.size).toBe(destinations.length)
  })

  it('includes all expected iconic destinations', () => {
    expect(destinations).toContain('Torres del Paine')
    expect(destinations).toContain('Mount Fuji')
    expect(destinations).toContain('Grand Canyon')
    expect(destinations).toContain('Machu Picchu')
    expect(destinations).toContain('Taj Mahal')
    expect(destinations).toContain('Bora Bora')
    expect(destinations).toContain('Santorini')
    expect(destinations).toContain('Amazon')
    expect(destinations).toContain('Venice')
    expect(destinations).toContain('Kyoto')
  })

  it('has no empty or whitespace-only entries', () => {
    destinations.forEach((dest) => {
      expect(dest.trim()).toBe(dest)
    })
  })
})

describe('SpinWheel constants', () => {
  it('SLICE_COUNT equals destinations length', () => {
    expect(SLICE_COUNT).toBe(50)
  })

  it('SLICE_DEG is exactly 7.2 degrees', () => {
    expect(SLICE_DEG).toBe(7.2)
  })

  it('all slices add up to 360 degrees', () => {
    expect(SLICE_COUNT * SLICE_DEG).toBe(360)
  })
})

describe('SpinWheel computeSpinResult', () => {
  it('returns slice 0 at 0 degrees rotation', () => {
    const result = computeSpinResult(0)
    expect(result.sliceIndex).toBe(0)
    expect(result.destination).toBe(destinations[0])
  })

  it('returns each slice for the correct rotation angle', () => {
    // After rotating 360 degrees, we should be back at slice 0
    expect(computeSpinResult(360).sliceIndex).toBe(0)

    // After rotating SLICE_DEG degrees, the next slice is at the pointer
    // 7.2 degrees rotation → slices shift by 1 in reverse
    const resultOneSlice = computeSpinResult(SLICE_DEG)
    expect(resultOneSlice.sliceIndex).toBe(SLICE_COUNT - 1)
    expect(resultOneSlice.destination).toBe(destinations[SLICE_COUNT - 1])
  })

  it('handles rotations larger than 360 degrees', () => {
    const result = computeSpinResult(720 + SLICE_DEG * 3)
    expect(result.sliceIndex).toBe(SLICE_COUNT - 3)
  })

  it('returns a valid destination for any rotation', () => {
    for (let deg = 0; deg < 3600; deg += 37) {
      const result = computeSpinResult(deg)
      expect(result.sliceIndex).toBeGreaterThanOrEqual(0)
      expect(result.sliceIndex).toBeLessThan(SLICE_COUNT)
      expect(destinations[result.sliceIndex]).toBe(result.destination)
    }
  })
})

describe('SpinWheel generateRandomSpin', () => {
  it('always produces a new rotation greater than current', () => {
    const current = 1200
    for (let i = 0; i < 50; i++) {
      const spin = generateRandomSpin(current)
      expect(spin.newRotation).toBeGreaterThan(current)
    }
  })

  it('new rotation is between 5 and 10 full rotations past current', () => {
    const current = 0
    for (let i = 0; i < 50; i++) {
      const spin = generateRandomSpin(current)
      const addedRotation = spin.newRotation - current
      expect(addedRotation).toBeGreaterThanOrEqual(5 * 360)
      expect(addedRotation).toBeLessThan(10 * 360 + 360)
    }
  })

  it('target slice is always a valid index', () => {
    const current = 500
    for (let i = 0; i < 100; i++) {
      const spin = generateRandomSpin(current)
      expect(spin.targetSlice).toBeGreaterThanOrEqual(0)
      expect(spin.targetSlice).toBeLessThan(50)
    }
  })
})

describe('SpinWheel canSpin guard', () => {
  it('returns false when coins are below threshold', () => {
    expect(canSpin(999999)).toBe(false)
    expect(canSpin(500000)).toBe(false)
    expect(canSpin(0)).toBe(false)
  })

  it('returns true when coins are exactly at threshold', () => {
    expect(canSpin(1000000)).toBe(true)
  })

  it('returns true when coins exceed threshold', () => {
    expect(canSpin(1000001)).toBe(true)
    expect(canSpin(5000000)).toBe(true)
  })

  it('handles edge case of negative coins', () => {
    expect(canSpin(-100)).toBe(false)
  })
})

describe('SpinWheel end-to-end spin simulation', () => {
  it('correctly selects the destination after a full spin', () => {
    const current = 0
    const spin = generateRandomSpin(current)
    const result = computeSpinResult(spin.newRotation)
    expect(result.sliceIndex).toBe(spin.targetSlice)
    expect(destinations[result.sliceIndex]).toBe(result.destination)
  })
})
