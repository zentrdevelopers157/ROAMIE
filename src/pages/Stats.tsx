import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, MapPin, Wallet } from 'lucide-react'
import StickyNote from '../components/StickyNote'
import { useRoamie } from '../store/RoamieContext'
import type { SavedTrip } from '../store/RoamieContext'

/* ===== TOPOGRAPHIC BG ===== */
const topoBg: React.CSSProperties = {
  backgroundColor: '#0A0A12',
  backgroundImage: `
    radial-gradient(ellipse at 20% 30%, rgba(0, 212, 196, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(42, 107, 255, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(138, 43, 226, 0.03) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4C4' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
  `,
}

/* ===== SPRING ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }
const springBounce = { type: 'spring' as const, stiffness: 300, damping: 18 }

/* ===== STAT CARD ===== */
function StatCard({
  icon: Icon,
  value,
  label,
  color,
  delay = 0,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  value: string
  label: string
  color: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springBounce, delay }}
      className="flex-1 rounded-2xl px-3 py-4 flex flex-col items-center gap-1.5"
      style={{ background: '#14141F' }}
    >
      <div style={{ color }}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <span className="text-lg font-display font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-[10px] font-body tracking-wide" style={{ color: '#8888A0' }}>
        {label}
      </span>
    </motion.div>
  )
}

/* ===== TRAVEL DNA HELPERS ===== */
function generateDNASummary(trips: SavedTrip[], state: { name: string; selectedVibes: number[]; adventureLevel: number; socialLevel: number }): string {
  const adventureLevel = state.adventureLevel ?? 5
  const socialLevel = state.socialLevel ?? 6
  const selectedVibes = state.selectedVibes ?? []
  const tripCount = trips.length

  const vibeLabels = ['Unknown', 'Foodie 🍜', 'Nature 🌿', 'Party 🎉', 'Culture 🏛️', 'Relaxation 🧘']

  // Determine primary vibe
  let primaryVibe = 'Explorer'
  if (selectedVibes.length > 0) {
    primaryVibe = vibeLabels[selectedVibes[0]] || 'Explorer'
  }

  const advPercent = Math.round((adventureLevel / 10) * 100)
  const socPercent = Math.round((socialLevel / 10) * 100)

  let personality = 'a Balanced Explorer'
  if (advPercent > 70 && socPercent > 70) personality = 'a Thrill-Seeking Socialite'
  else if (advPercent > 70) personality = 'an Adrenaline Junkie'
  else if (socPercent > 70) personality = 'a Social Butterfly'
  else if (advPercent < 30 && socPercent < 30) personality = 'a Cozy Solo Traveller'

  const tripRef = tripCount > 0 ? `${tripCount} trip${tripCount > 1 ? 's' : ''} under your belt, ` : ''

  return `${tripRef}You're a ${primaryVibe}-First Adventurer. ${advPercent}% of your adventures revolve around ${selectedVibes.includes(0) ? 'local cuisine' : selectedVibes.includes(1) ? 'nature escapes' : selectedVibes.includes(2) ? 'nightlife' : selectedVibes.includes(3) ? 'cultural spots' : 'hidden gems'}. You're ${personality} — love ${advPercent > 50 ? 'pushing limits' : 'taking it easy'} with ${socPercent > 50 ? 'a crew' : 'your own rhythm'}.`
}

function formatCoinHistory(trips: SavedTrip[]): { label: string }[] {
  const history: { label: string }[] = []

  trips.forEach((trip) => {
    if (trip.createdAt) {
      history.push({
        label: `+50 Planned ${trip.destination}`,
      })
    }
  })

  // Add completed markers (every trip is potentially completed)
  trips.slice(0, Math.min(trips.length, 3)).forEach((trip) => {
    history.push({
      label: `+500 Completed ${trip.destination} 🎉`,
    })
  })

  // Welcome bonus
  history.unshift({ label: '🎁 Welcome bonus +100' })

  return history
}

/* ===== ROAMCOIN HISTORY ITEM ===== */
function CoinHistoryItem({ label, index }: { label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className="relative flex items-center gap-3 py-2"
    >
      {/* Timeline dot */}
      <div className="flex-shrink-0 relative z-10">
        <div
          className="w-[10px] h-[10px] rounded-full flex items-center justify-center"
          style={{
            background: '#0A0A12',
            border: '1.5px solid rgba(255, 210, 63, 0.4)',
            boxShadow: '0 0 6px rgba(255, 210, 63, 0.1)',
          }}
        >
          <div className="w-[4px] h-[4px] rounded-full" style={{ background: '#FFD23F' }} />
        </div>
      </div>

      {/* Content */}
      <span className="font-handwritten text-sm" style={{ color: '#D0D0E0' }}>
        {label}
      </span>
    </motion.div>
  )
}

/* ===== MAIN STATS COMPONENT ===== */
export default function Stats() {
  const navigate = useNavigate()
  const { state } = useRoamie()

  const trips = state.trips ?? []
  const coins = state.roamCoins ?? 100

  // Compute stats derived from trips
  const stats = useMemo(() => {
    // Count unique destinations
    const destinations = new Set<string>()
    trips.forEach((t) => destinations.add(t.destination))
    const cityCount = destinations.size

    // Estimate total spend from rawDays
    let totalSpend = 0
    trips.forEach((t) => {
      if (t.rawDays) {
        t.rawDays.forEach((day) => {
          day.activities.forEach((a) => {
            totalSpend += a.cost || 0
          })
        })
      } else {
        // Estimate 2000 per itinerary item
        totalSpend += (t.itinerary?.length ?? 0) * 2000
      }
    })

    return {
      tripCount: trips.length,
      cityCount,
      totalSpend,
    }
  }, [trips])

  const coinHistory = useMemo(() => formatCoinHistory(trips), [trips])
  const dnaSummary = useMemo(() => generateDNASummary(trips, state), [trips, state])

  // Format spend in Indian style
  const formatSpend = (amount: number): string => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
    return `₹${amount}`
  }

  return (
    <div className="relative min-h-dvh px-4 pt-4 pb-8" style={topoBg}>
      {/* ===== Header ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springGentle}
        className="flex items-center gap-3 mb-5"
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="p-1 rounded-full transition-colors duration-200"
          style={{ color: '#8888A0' }}
          whileHover={{ color: '#00D4C4' }}
        >
          <ArrowLeft size={18} strokeWidth={2} />
        </motion.button>
        <h1 className="text-lg font-display font-bold gradient-text">
          Your Travel Story
        </h1>
      </motion.div>

      {/* ===== Top Section: 3 Stat Cards ===== */}
      <div className="flex gap-3 mb-6">
        <StatCard
          icon={TrendingUp}
          value={`${stats.tripCount}`}
          label="Trips"
          color="#00D4C4"
          delay={0.1}
        />
        <StatCard
          icon={MapPin}
          value={`${stats.cityCount}`}
          label="Cities"
          color="#00D4C4"
          delay={0.15}
        />
        <StatCard
          icon={Wallet}
          value={formatSpend(stats.totalSpend)}
          label="Spent"
          color="#FFD23F"
          delay={0.2}
        />
      </div>

      {/* ===== Middle Section: Travel DNA ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.25 }}
        className="mb-6"
      >
        <StickyNote rotate={-0.3}>
          <div className="space-y-2">
            <h3 className="font-handwritten text-sm gradient-text font-medium">
              Your Travel DNA 🧬
            </h3>
            <p className="font-handwritten text-[15px] leading-relaxed" style={{ color: '#C0C0D5' }}>
              {dnaSummary}
            </p>
          </div>
        </StickyNote>
      </motion.div>

      {/* ===== Bottom Section: RoamCoin History ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xs font-semibold uppercase tracking-widest" style={{ color: '#8888A0' }}>
            RoamCoin History
          </h2>
          <span className="font-handwritten text-sm" style={{ color: '#FFD23F' }}>
            🪙 {coins}
          </span>
        </div>

        {/* Notebook paper style */}
        <div
          className="relative rounded-sm p-4 shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden"
          style={{
            backgroundColor: '#12121E',
          }}
        >
          {/* Ruled lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(255, 210, 63, 0.05) 23px, rgba(255, 210, 63, 0.05) 24px)',
            }}
          />

          {/* Wobbly dashed timeline SVG */}
          <div className="relative pl-5">
            <svg
              className="absolute left-[3px] top-1 bottom-1 pointer-events-none"
              width="8"
              height={(coinHistory.length * 38) + 20}
              viewBox={`0 0 8 ${(coinHistory.length * 38) + 20}`}
              preserveAspectRatio="none"
            >
              <path
                d={Array.from({ length: coinHistory.length + 3 }, (_, i) => {
                  const y = i * 20
                  return `M4,${y} C6,${y + 3} 2,${y + 7} 4,${y + 11}`
                }).join(' ')}
                stroke="#FFD23F"
                strokeWidth="1.5"
                strokeDasharray="2.5 3.5"
                fill="none"
                opacity="0.4"
              />
            </svg>

            {/* History items */}
            {coinHistory.map((item, i) => (
              <CoinHistoryItem key={i} label={item.label} index={i} />
            ))}

            {coinHistory.length === 0 && (
              <p className="font-handwritten text-sm text-center py-4" style={{ color: '#8888A0' }}>
                No coins earned yet. Plan a trip! ✨
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
