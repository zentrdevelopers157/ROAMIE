import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Globe, Award } from 'lucide-react'
import StickyNote from '../components/StickyNote'
import { useRoamie } from '../store/RoamieContext'

/* ===== SPRING ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== COUNTRY FLAGS (emoji) AND NAMES ===== */
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
]

const TOTAL_COUNTRIES = countries.length

/* ===== MAIN PASSPORT COMPONENT ===== */
export default function Passport() {
  const navigate = useNavigate()
  const { state } = useRoamie()

  const unlockedCount = useMemo(() => countries.filter(c => c.unlocked).length, [])

  const progressPercent = (unlockedCount / TOTAL_COUNTRIES) * 100

  return (
    <div className="relative min-h-dvh bg-base-bg flex flex-col">
      {/* ===== Background gradients ===== */}
      <div
        className="fixed top-40 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 212, 196, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ===== Header ===== */}
      <div
        className="relative z-10 flex-shrink-0 px-4 pt-3 pb-2.5"
        style={{
          borderBottom: '1px solid rgba(42, 42, 62, 0.4)',
          background: 'rgba(10, 10, 18, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-1 rounded-full transition-colors"
            style={{ color: '#8888A0' }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} strokeWidth={1.8} />
          </motion.button>
          <div>
            <h1 className="text-base font-display font-semibold gradient-text">
              Global Passport
            </h1>
            <p className="text-[10px] font-body tracking-wide" style={{ color: '#8888A0' }}>
              Collect every country 🌍
            </p>
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 pt-4 pb-6">
        {/* Passport Book Cover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springGentle}
          className="rounded-sm overflow-hidden mb-4"
          style={{
            background: '#0A1628',
            border: '2px solid #1A2A44',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          }}
        >
          {/* Cover */}
          <div className="px-5 py-6 text-center" style={{ background: '#0D1B33' }}>
            <Globe size={32} strokeWidth={1.5} className="mx-auto text-brand-cyan mb-2" />
            <h2 className="font-display text-lg font-bold text-white tracking-wider uppercase">
              Global Passport
            </h2>
            <p className="font-handwritten text-sm gradient-text mt-1">
              {state.name || 'Traveler'}'s Collection
            </p>
            <div className="mt-3 flex items-center justify-center gap-1">
              <Award size={14} strokeWidth={1.5} className="text-brand-cyan" />
              <span className="text-[10px] font-display font-semibold text-brand-cyan">
                {unlockedCount} / {TOTAL_COUNTRIES} Collected
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-4 py-3" style={{ background: '#0D1B33', borderTop: '1px solid rgba(0, 212, 196, 0.1)' }}>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1A2A44' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #00D4C4, #2A6BFF, #8A2BE2)',
                  boxShadow: '0 0 10px rgba(0, 212, 196, 0.3)',
                }}
              />
            </div>
            <p className="text-[9px] font-body text-center mt-1.5" style={{ color: '#555570' }}>
              {progressPercent.toFixed(1)}% of the world explored
            </p>
          </div>

          {/* Sticky Note Banner */}
          <div className="px-3 pb-4 pt-2" style={{ background: '#0A1628' }}>
            <StickyNote rotate={0.5}>
              <p className="font-handwritten text-xs gradient-text text-center">
                Visit all {TOTAL_COUNTRIES} to unlock a Hypercar from the Founders 🏎️
              </p>
            </StickyNote>
          </div>
        </motion.div>

        {/* Country Grid */}
        <div className="grid grid-cols-4 gap-2">
          {countries.map((country, i) => (
            <motion.div
              key={country.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.003 }}
              className="relative flex flex-col items-center justify-center p-1.5 rounded-sm cursor-default"
              style={{
                background: country.unlocked
                  ? 'rgba(0, 212, 196, 0.06)'
                  : 'rgba(20, 20, 31, 0.5)',
                border: country.unlocked
                  ? '1px solid rgba(0, 212, 196, 0.15)'
                  : '1px solid rgba(42, 42, 62, 0.2)',
                filter: country.unlocked ? 'none' : 'grayscale(100%)',
                opacity: country.unlocked ? 1 : 0.4,
                transition: 'all 0.3s ease',
              }}
              whileHover={country.unlocked ? { scale: 1.1, y: -2 } : undefined}
            >
              <span className="text-lg leading-none">{country.code}</span>
              <span
                className="text-[6px] font-body text-center mt-0.5 leading-tight truncate w-full"
                style={{ color: country.unlocked ? '#8888A0' : '#555570' }}
              >
                {country.unlocked ? country.name : '???'}
              </span>
              {!country.unlocked && (
                <Lock
                  size={8}
                  strokeWidth={2}
                  className="absolute top-1 right-1"
                  style={{ color: '#555570' }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
