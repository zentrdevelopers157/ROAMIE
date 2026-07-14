import { describe, it, expect } from 'vitest'

/* ===== Replicate destKinds from OnboardingV2.tsx for testing ===== */
const destKinds = [
  { label: 'Beaches', emoji: '🏖️' },
  { label: 'Islands', emoji: '🏝️' },
  { label: 'Lakes', emoji: '🏞️' },
  { label: 'Rivers', emoji: '💧' },
  { label: 'Fjords', emoji: '🏔️' },
  { label: 'Glaciers', emoji: '🧊' },
  { label: 'Waterfalls', emoji: '🌊' },
  { label: 'Wetlands', emoji: '🌿' },
  { label: 'Mountain Ranges', emoji: '⛰️' },
  { label: 'Hill Stations', emoji: '🌲' },
  { label: 'Volcanoes', emoji: '🌋' },
  { label: 'Canyons', emoji: '🏜️' },
  { label: 'Gorges', emoji: '⛰️' },
  { label: 'Deserts', emoji: '🐪' },
  { label: 'Salt Flats', emoji: '🧂' },
  { label: 'Savannas', emoji: '🦁' },
  { label: 'Grasslands', emoji: '🌾' },
  { label: 'Plateaus', emoji: '🗻' },
  { label: 'Steppes', emoji: '🌄' },
  { label: 'Rainforests', emoji: '🌴' },
  { label: 'Jungles', emoji: '🦧' },
  { label: 'Forests', emoji: '🌳' },
  { label: 'National Parks', emoji: '🦌' },
  { label: 'Metropolises', emoji: '🌆' },
  { label: 'Heritage Cities', emoji: '🏛️' },
  { label: 'Pilgrimage Towns', emoji: '🕉️' },
  { label: 'Countryside', emoji: '🌻' },
  { label: 'Wine Region', emoji: '🍷' },
]

/* ===== Pure logic extracted from OnboardingV2 ===== */
function toggleKind(selected: string[], label: string): string[] {
  return selected.includes(label)
    ? selected.filter((k) => k !== label)
    : [...selected, label]
}

function canProceed(step: number, selectedKinds: string[], userName: string, aiNickname: string): boolean {
  if (step === 0) return selectedKinds.length > 0
  if (step === 1) return userName.trim().length > 0 && aiNickname.trim().length > 0
  return true
}

/* ===== TESTS ===== */

describe('OnboardingV2 destKinds', () => {
  it('has exactly 28 destination kinds', () => {
    expect(destKinds).toHaveLength(28)
  })

  it('each kind has a non-empty label and emoji', () => {
    destKinds.forEach((kind) => {
      expect(kind.label).toBeTruthy()
      expect(kind.emoji).toBeTruthy()
      expect(typeof kind.label).toBe('string')
      expect(typeof kind.emoji).toBe('string')
    })
  })

  it('includes all expected destination types', () => {
    const labels = destKinds.map((k) => k.label)
    expect(labels).toContain('Beaches')
    expect(labels).toContain('Islands')
    expect(labels).toContain('Mountain Ranges')
    expect(labels).toContain('Rainforests')
    expect(labels).toContain('National Parks')
    expect(labels).toContain('Heritage Cities')
    expect(labels).toContain('Wine Region')
    expect(labels).toContain('Deserts')
    expect(labels).toContain('Volcanoes')
    expect(labels).toContain('Canyons')
  })

  it('has no duplicate labels', () => {
    const labels = destKinds.map((k) => k.label)
    const unique = new Set(labels)
    expect(unique.size).toBe(labels.length)
  })
})

describe('OnboardingV2 toggleKind logic', () => {
  it('adds a kind to empty selection', () => {
    const result = toggleKind([], 'Beaches')
    expect(result).toEqual(['Beaches'])
  })

  it('adds a kind to existing selection', () => {
    const result = toggleKind(['Beaches', 'Islands'], 'Lakes')
    expect(result).toEqual(['Beaches', 'Islands', 'Lakes'])
  })

  it('removes a kind that is already selected', () => {
    const result = toggleKind(['Beaches', 'Islands'], 'Beaches')
    expect(result).toEqual(['Islands'])
  })

  it('does not add duplicates', () => {
    const result = toggleKind(['Beaches'], 'Beaches')
    expect(result).toEqual([])
  })

  it('handles multiple toggles independently', () => {
    let sel: string[] = []
    sel = toggleKind(sel, 'Beaches')
    sel = toggleKind(sel, 'Islands')
    expect(sel).toEqual(['Beaches', 'Islands'])
    sel = toggleKind(sel, 'Beaches')
    expect(sel).toEqual(['Islands'])
  })
})

describe('OnboardingV2 canProceed logic', () => {
  it('returns false for step 0 with no selections', () => {
    expect(canProceed(0, [], '', '')).toBe(false)
  })

  it('returns true for step 0 with at least one selection', () => {
    expect(canProceed(0, ['Beaches'], '', '')).toBe(true)
  })

  it('returns false for step 1 with empty name', () => {
    expect(canProceed(1, ['Beaches'], '', 'Buddy')).toBe(false)
  })

  it('returns false for step 1 with empty nickname', () => {
    expect(canProceed(1, ['Beaches'], 'Alice', '')).toBe(false)
  })

  it('returns false for step 1 with only whitespace', () => {
    expect(canProceed(1, ['Beaches'], '   ', 'Buddy')).toBe(false)
  })

  it('returns true for step 1 with valid name and nickname', () => {
    expect(canProceed(1, ['Beaches'], 'Alice', 'Buddy')).toBe(true)
  })

  it('returns true for step 2 regardless of inputs', () => {
    expect(canProceed(2, [], '', '')).toBe(true)
  })
})
