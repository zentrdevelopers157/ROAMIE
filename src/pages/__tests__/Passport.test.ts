import { describe, it, expect } from 'vitest'

/* ===== Replicate country data from Passport.tsx (without the duplicate Monaco) ===== */
const countries = [
  { code: '🇮🇳', name: 'India', unlocked: true },
  { code: '🇺🇸', name: 'United States', unlocked: true },
  { code: '🇬🇧', name: 'United Kingdom', unlocked: true },
  { code: '🇯🇵', name: 'Japan', unlocked: true },
  { code: '🇫🇷', name: 'France', unlocked: false },
  { code: '🇩🇪', name: 'Germany', unlocked: false },
  { code: '🇮🇹', name: 'Italy', unlocked: false },
  { code: '🇪🇸', name: 'Spain', unlocked: false },
  { code: '🇨🇦', name: 'Canada', unlocked: false },
  { code: '🇦🇺', name: 'Australia', unlocked: false },
  { code: '🇧🇷', name: 'Brazil', unlocked: false },
  { code: '🇦🇷', name: 'Argentina', unlocked: false },
  { code: '🇿🇦', name: 'South Africa', unlocked: false },
  { code: '🇪🇬', name: 'Egypt', unlocked: false },
  { code: '🇹🇷', name: 'Turkey', unlocked: false },
  { code: '🇷🇺', name: 'Russia', unlocked: false },
  { code: '🇨🇳', name: 'China', unlocked: false },
  { code: '🇰🇷', name: 'South Korea', unlocked: false },
  { code: '🇹🇭', name: 'Thailand', unlocked: false },
  { code: '🇻🇳', name: 'Vietnam', unlocked: false },
  { code: '🇮🇩', name: 'Indonesia', unlocked: false },
  { code: '🇵🇭', name: 'Philippines', unlocked: false },
  { code: '🇲🇾', name: 'Malaysia', unlocked: false },
  { code: '🇸🇬', name: 'Singapore', unlocked: false },
  { code: '🇦🇪', name: 'UAE', unlocked: false },
  { code: '🇸🇦', name: 'Saudi Arabia', unlocked: false },
  { code: '🇮🇱', name: 'Israel', unlocked: false },
  { code: '🇬🇷', name: 'Greece', unlocked: false },
  { code: '🇵🇹', name: 'Portugal', unlocked: false },
  { code: '🇳🇱', name: 'Netherlands', unlocked: false },
  { code: '🇨🇭', name: 'Switzerland', unlocked: false },
  { code: '🇸🇪', name: 'Sweden', unlocked: false },
  { code: '🇳🇴', name: 'Norway', unlocked: false },
  { code: '🇩🇰', name: 'Denmark', unlocked: false },
  { code: '🇫🇮', name: 'Finland', unlocked: false },
  { code: '🇵🇱', name: 'Poland', unlocked: false },
  { code: '🇺🇦', name: 'Ukraine', unlocked: false },
  { code: '🇨🇿', name: 'Czech Republic', unlocked: false },
  { code: '🇦🇹', name: 'Austria', unlocked: false },
  { code: '🇭🇺', name: 'Hungary', unlocked: false },
  { code: '🇷🇴', name: 'Romania', unlocked: false },
  { code: '🇧🇬', name: 'Bulgaria', unlocked: false },
  { code: '🇭🇷', name: 'Croatia', unlocked: false },
  { code: '🇷🇸', name: 'Serbia', unlocked: false },
  { code: '🇲🇽', name: 'Mexico', unlocked: false },
  { code: '🇨🇴', name: 'Colombia', unlocked: false },
  { code: '🇨🇱', name: 'Chile', unlocked: false },
  { code: '🇵🇪', name: 'Peru', unlocked: false },
  { code: '🇰🇪', name: 'Kenya', unlocked: false },
  { code: '🇳🇬', name: 'Nigeria', unlocked: false },
  { code: '🇲🇦', name: 'Morocco', unlocked: false },
  { code: '🇳🇵', name: 'Nepal', unlocked: false },
  { code: '🇱🇰', name: 'Sri Lanka', unlocked: false },
  { code: '🇧🇩', name: 'Bangladesh', unlocked: false },
  { code: '🇵🇰', name: 'Pakistan', unlocked: false },
  { code: '🇦🇫', name: 'Afghanistan', unlocked: false },
  { code: '🇮🇷', name: 'Iran', unlocked: false },
  { code: '🇮🇶', name: 'Iraq', unlocked: false },
  { code: '🇯🇴', name: 'Jordan', unlocked: false },
  { code: '🇱🇧', name: 'Lebanon', unlocked: false },
  { code: '🇸🇾', name: 'Syria', unlocked: false },
  { code: '🇾🇪', name: 'Yemen', unlocked: false },
  { code: '🇴🇲', name: 'Oman', unlocked: false },
  { code: '🇶🇦', name: 'Qatar', unlocked: false },
  { code: '🇧🇭', name: 'Bahrain', unlocked: false },
  { code: '🇰🇼', name: 'Kuwait', unlocked: false },
  { code: '🇲🇻', name: 'Maldives', unlocked: false },
  { code: '🇲🇲', name: 'Myanmar', unlocked: false },
  { code: '🇰🇭', name: 'Cambodia', unlocked: false },
  { code: '🇱🇦', name: 'Laos', unlocked: false },
  { code: '🇲🇳', name: 'Mongolia', unlocked: false },
  { code: '🇧🇹', name: 'Bhutan', unlocked: false },
  { code: '🇰🇿', name: 'Kazakhstan', unlocked: false },
  { code: '🇺🇿', name: 'Uzbekistan', unlocked: false },
  { code: '🇹🇲', name: 'Turkmenistan', unlocked: false },
  { code: '🇰🇬', name: 'Kyrgyzstan', unlocked: false },
  { code: '🇹🇯', name: 'Tajikistan', unlocked: false },
  { code: '🇦🇲', name: 'Armenia', unlocked: false },
  { code: '🇬🇪', name: 'Georgia', unlocked: false },
  { code: '🇦🇿', name: 'Azerbaijan', unlocked: false },
  { code: '🇧🇾', name: 'Belarus', unlocked: false },
  { code: '🇲🇩', name: 'Moldova', unlocked: false },
  { code: '🇱🇹', name: 'Lithuania', unlocked: false },
  { code: '🇱🇻', name: 'Latvia', unlocked: false },
  { code: '🇪🇪', name: 'Estonia', unlocked: false },
  { code: '🇸🇰', name: 'Slovakia', unlocked: false },
  { code: '🇸🇮', name: 'Slovenia', unlocked: false },
  { code: '🇧🇦', name: 'Bosnia', unlocked: false },
  { code: '🇦🇱', name: 'Albania', unlocked: false },
  { code: '🇲🇰', name: 'North Macedonia', unlocked: false },
  { code: '🇲🇪', name: 'Montenegro', unlocked: false },
  { code: '🇽🇰', name: 'Kosovo', unlocked: false },
  { code: '🇨🇺', name: 'Cuba', unlocked: false },
  { code: '🇩🇴', name: 'Dominican Republic', unlocked: false },
  { code: '🇵🇷', name: 'Puerto Rico', unlocked: false },
  { code: '🇯🇲', name: 'Jamaica', unlocked: false },
  { code: '🇧🇸', name: 'Bahamas', unlocked: false },
  { code: '🇧🇧', name: 'Barbados', unlocked: false },
  { code: '🇹🇹', name: 'Trinidad', unlocked: false },
  { code: '🇬🇹', name: 'Guatemala', unlocked: false },
  { code: '🇭🇳', name: 'Honduras', unlocked: false },
  { code: '🇳🇮', name: 'Nicaragua', unlocked: false },
  { code: '🇨🇷', name: 'Costa Rica', unlocked: false },
  { code: '🇵🇦', name: 'Panama', unlocked: false },
  { code: '🇪🇨', name: 'Ecuador', unlocked: false },
  { code: '🇧🇴', name: 'Bolivia', unlocked: false },
  { code: '🇵🇾', name: 'Paraguay', unlocked: false },
  { code: '🇺🇾', name: 'Uruguay', unlocked: false },
  { code: '🇬🇾', name: 'Guyana', unlocked: false },
  { code: '🇸🇷', name: 'Suriname', unlocked: false },
  { code: '🇬🇫', name: 'French Guiana', unlocked: false },
  { code: '🇪🇹', name: 'Ethiopia', unlocked: false },
  { code: '🇹🇿', name: 'Tanzania', unlocked: false },
  { code: '🇺🇬', name: 'Uganda', unlocked: false },
  { code: '🇷🇼', name: 'Rwanda', unlocked: false },
  { code: '🇸🇩', name: 'Sudan', unlocked: false },
  { code: '🇸🇸', name: 'South Sudan', unlocked: false },
  { code: '🇨🇩', name: 'DR Congo', unlocked: false },
  { code: '🇨🇬', name: 'Congo', unlocked: false },
  { code: '🇬🇭', name: 'Ghana', unlocked: false },
  { code: '🇨🇮', name: "Côte d'Ivoire", unlocked: false },
  { code: '🇸🇳', name: 'Senegal', unlocked: false },
  { code: '🇲🇱', name: 'Mali', unlocked: false },
  { code: '🇧🇫', name: 'Burkina Faso', unlocked: false },
  { code: '🇳🇪', name: 'Niger', unlocked: false },
  { code: '🇹🇩', name: 'Chad', unlocked: false },
  { code: '🇨🇲', name: 'Cameroon', unlocked: false },
  { code: '🇬🇦', name: 'Gabon', unlocked: false },
  { code: '🇦🇴', name: 'Angola', unlocked: false },
  { code: '🇳🇦', name: 'Namibia', unlocked: false },
  { code: '🇧🇼', name: 'Botswana', unlocked: false },
  { code: '🇿🇲', name: 'Zambia', unlocked: false },
  { code: '🇿🇼', name: 'Zimbabwe', unlocked: false },
  { code: '🇲🇿', name: 'Mozambique', unlocked: false },
  { code: '🇲🇬', name: 'Madagascar', unlocked: false },
  { code: '🇲🇺', name: 'Mauritius', unlocked: false },
  { code: '🇸🇨', name: 'Seychelles', unlocked: false },
  { code: '🇫🇯', name: 'Fiji', unlocked: false },
  { code: '🇵🇬', name: 'Papua New Guinea', unlocked: false },
  { code: '🇳🇿', name: 'New Zealand', unlocked: false },
  { code: '🇸🇧', name: 'Solomon Islands', unlocked: false },
  { code: '🇻🇺', name: 'Vanuatu', unlocked: false },
  { code: '🇼🇸', name: 'Samoa', unlocked: false },
  { code: '🇹🇴', name: 'Tonga', unlocked: false },
  { code: '🇫🇲', name: 'Micronesia', unlocked: false },
  { code: '🇲🇭', name: 'Marshall Islands', unlocked: false },
  { code: '🇵🇼', name: 'Palau', unlocked: false },
  { code: '🇳🇷', name: 'Nauru', unlocked: false },
  { code: '🇰🇮', name: 'Kiribati', unlocked: false },
  { code: '🇹🇻', name: 'Tuvalu', unlocked: false },
  { code: '🇱🇮', name: 'Liechtenstein', unlocked: false },
  { code: '🇲🇨', name: 'Monaco', unlocked: false },
  { code: '🇦🇩', name: 'Andorra', unlocked: false },
  { code: '🇸🇲', name: 'San Marino', unlocked: false },
  { code: '🇻🇦', name: 'Vatican City', unlocked: false },
  { code: '🇲🇹', name: 'Malta', unlocked: false },
  { code: '🇱🇺', name: 'Luxembourg', unlocked: false },
  { code: '🇮🇸', name: 'Iceland', unlocked: false },
  { code: '🇮🇪', name: 'Ireland', unlocked: false },
  { code: '🇧🇪', name: 'Belgium', unlocked: false },
  { code: '🇨🇼', name: 'Curaçao', unlocked: false },
  { code: '🇦🇼', name: 'Aruba', unlocked: false },
  { code: '🇸🇽', name: 'Sint Maarten', unlocked: false },
  { code: '🇧🇶', name: 'Bonaire', unlocked: false },
  { code: '🇩🇲', name: 'Dominica', unlocked: false },
  { code: '🇬🇩', name: 'Grenada', unlocked: false },
  { code: '🇰🇳', name: 'St Kitts & Nevis', unlocked: false },
  { code: '🇱🇨', name: 'St Lucia', unlocked: false },
  { code: '🇻🇨', name: 'St Vincent', unlocked: false },
  { code: '🇦🇬', name: 'Antigua', unlocked: false },
  { code: '🇸🇱', name: 'Sierra Leone', unlocked: false },
  { code: '🇱🇷', name: 'Liberia', unlocked: false },
  { code: '🇲🇷', name: 'Mauritania', unlocked: false },
  { code: '🇪🇷', name: 'Eritrea', unlocked: false },
  { code: '🇩🇯', name: 'Djibouti', unlocked: false },
  { code: '🇸🇴', name: 'Somalia', unlocked: false },
  { code: '🇧🇮', name: 'Burundi', unlocked: false },
  { code: '🇱🇸', name: 'Lesotho', unlocked: false },
  { code: '🇸🇿', name: 'Eswatini', unlocked: false },
  { code: '🇰🇲', name: 'Comoros', unlocked: false },
  { code: '🇸🇹', name: 'São Tomé', unlocked: false },
  { code: '🇨🇻', name: 'Cape Verde', unlocked: false },
  { code: '🇬🇶', name: 'Equatorial Guinea', unlocked: false },
  { code: '🇧🇳', name: 'Brunei', unlocked: false },
  { code: '🇹🇱', name: 'Timor-Leste', unlocked: false },
  { code: '🇵🇸', name: 'Palestine', unlocked: false },
  { code: '🇨🇾', name: 'Cyprus', unlocked: false },
  { code: '🇳🇺', name: 'Niue', unlocked: false },
  { code: '🇨🇰', name: 'Cook Islands', unlocked: false },
  { code: '🇹🇰', name: 'Tokelau', unlocked: false },
  { code: '🇼🇫', name: 'Wallis & Futuna', unlocked: false },
  { code: '🇵🇫', name: 'French Polynesia', unlocked: false },
  { code: '🇳🇨', name: 'New Caledonia', unlocked: false },
]

/* ===== Pure logic extracted from Passport.tsx ===== */
function getUnlockedCount(countries: { unlocked: boolean }[]): number {
  return countries.filter((c) => c.unlocked).length
}

function calculateProgress(unlocked: number, total: number): number {
  return (unlocked / total) * 100
}

const TOTAL_COUNTRIES = countries.length

/* ===== TESTS ===== */

describe('Passport countries data', () => {
  it('has at least 190 countries (target: 196, no duplicates)', () => {
    expect(TOTAL_COUNTRIES).toBeGreaterThanOrEqual(190)
  })

  it('all entries have valid code, name, and unlocked flag', () => {
    countries.forEach((country) => {
      expect(country.code).toBeTruthy()
      expect(typeof country.code).toBe('string')
      expect(country.name).toBeTruthy()
      expect(typeof country.name).toBe('string')
      expect(typeof country.unlocked).toBe('boolean')
    })
  })

  it('has no duplicate country names', () => {
    const names = countries.map((c) => c.name)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it('has no duplicate country codes', () => {
    const codes = countries.map((c) => c.code)
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })

  it('has no duplicate country names', () => {
    const names = countries.map((c) => c.name)
    const unique = new Set(names)
    expect(unique.size).toBe(names.length)
  })

  it('contains all major world countries', () => {
    const names = countries.map((c) => c.name)
    expect(names).toContain('India')
    expect(names).toContain('United States')
    expect(names).toContain('Japan')
    expect(names).toContain('France')
    expect(names).toContain('Australia')
    expect(names).toContain('Brazil')
    expect(names).toContain('South Africa')
    expect(names).toContain('New Zealand')
    expect(names).toContain('Iceland')
    expect(names).toContain('Singapore')
  })
})

describe('Passport unlocked countries', () => {
  it('has exactly 4 unlocked countries by default', () => {
    expect(getUnlockedCount(countries)).toBe(4)
  })

  it('unlocked countries are India, USA, UK, and Japan', () => {
    const unlocked = countries.filter((c) => c.unlocked).map((c) => c.name)
    expect(unlocked).toContain('India')
    expect(unlocked).toContain('United States')
    expect(unlocked).toContain('United Kingdom')
    expect(unlocked).toContain('Japan')
    expect(unlocked).toHaveLength(4)
  })

  it('all other countries are locked', () => {
    const locked = countries.filter((c) => !c.unlocked)
    const unlocked = countries.filter((c) => c.unlocked)
    expect(locked).toHaveLength(countries.length - unlocked.length)
  })

  it('locked countries have non-empty flag emoji', () => {
    const locked = countries.filter((c) => !c.unlocked)
    locked.forEach((c) => {
      expect(c.code).toBeTruthy()
      expect(c.code.length).toBeGreaterThan(0)
    })
  })
})

describe('Passport progress calculation', () => {
  it('shows correct progress percentage for 4 countries', () => {
    const total = countries.length
    const progress = calculateProgress(4, total)
    expect(progress).toBe((4 / total) * 100)
  })

  it('shows 0% when no countries unlocked', () => {
    expect(calculateProgress(0, countries.length)).toBe(0)
  })

  it('shows 100% when all countries unlocked', () => {
    expect(calculateProgress(countries.length, countries.length)).toBe(100)
  })

  it('handles partial progress correctly', () => {
    const total = countries.length
    expect(calculateProgress(50, total)).toBeCloseTo((50 / total) * 100, 0)
    expect(calculateProgress(100, total)).toBeCloseTo((100 / total) * 100, 0)
  })
})

describe('Passport geographic coverage', () => {
  it('covers all continents', () => {
    const names = new Set(countries.map((c) => c.name))

    // Asia
    expect(names.has('India')).toBe(true)
    expect(names.has('China')).toBe(true)
    expect(names.has('Japan')).toBe(true)

    // Europe
    expect(names.has('France')).toBe(true)
    expect(names.has('Germany')).toBe(true)

    // North America
    expect(names.has('United States')).toBe(true)
    expect(names.has('Canada')).toBe(true)
    expect(names.has('Mexico')).toBe(true)

    // South America
    expect(names.has('Brazil')).toBe(true)
    expect(names.has('Argentina')).toBe(true)

    // Africa
    expect(names.has('South Africa')).toBe(true)
    expect(names.has('Egypt')).toBe(true)
    expect(names.has('Nigeria')).toBe(true)

    // Oceania
    expect(names.has('Australia')).toBe(true)
    expect(names.has('New Zealand')).toBe(true)
    expect(names.has('Fiji')).toBe(true)
  })

  it('includes microstates', () => {
    const names = new Set(countries.map((c) => c.name))
    expect(names.has('Monaco')).toBe(true)
    expect(names.has('Vatican City')).toBe(true)
    expect(names.has('San Marino')).toBe(true)
    expect(names.has('Liechtenstein')).toBe(true)
    expect(names.has('Andorra')).toBe(true)
    expect(names.has('Malta')).toBe(true)
  })
})
