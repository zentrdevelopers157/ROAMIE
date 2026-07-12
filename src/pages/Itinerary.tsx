import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Compass } from 'lucide-react'
import { useRoamie } from '../store/RoamieContext'
import type { SavedTrip, RawDay } from '../store/RoamieContext'
import TripMap from '../components/TripMap'
import type { MapActivity } from '../components/TripMap'

/* ===== SPRINGS ===== */
/* ===== TOPOGRAPHIC BG (matches Plan page) ===== */
const topoBg: React.CSSProperties = {
  backgroundColor: '#0A0A12',
  backgroundImage: `
    radial-gradient(ellipse at 20% 30%, rgba(0, 212, 196, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(42, 107, 255, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(138, 43, 226, 0.03) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4C4' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
  `,
}

/* ===== COORDINATE LOOKUP ===== */
const destCoords: Record<string, [number, number]> = {
  Manali: [77.1891, 32.2430],
  Bali: [115.0920, -8.4095],
  Goa: [73.9060, 15.2993],
  Tokyo: [139.6917, 35.6895],
  Maldives: [73.2207, 3.2028],
  Paris: [2.3522, 48.8566],
  'New York': [-74.0060, 40.7128],
  London: [-0.1276, 51.5074],
  Sydney: [151.2093, -33.8688],
  Dubai: [55.2708, 25.2048],
  Bangkok: [100.5167, 13.7563],
  Singapore: [103.8198, 1.3521],
  Barcelona: [2.1734, 41.3851],
  Rome: [12.4964, 41.9028],
  Amsterdam: [4.9041, 52.3676],
  Istanbul: [28.9784, 41.0082],
  'Kuala Lumpur': [101.6869, 3.1390],
}

function getCoords(destination: string): [number, number] {
  return destCoords[destination] ?? [77.1891, 32.2430]
}

/* ===== TYPE BADGE HELPERS ===== */
function typeBadge(type: string) {
  const styles: Record<string, { label: string; color: string; bg: string }> = {
    food: { label: '🍽️ Food', color: '#00D4C4', bg: 'rgba(0, 212, 196, 0.08)' },
    stay: { label: '🏨 Stay', color: '#8A2BE2', bg: 'rgba(138, 43, 226, 0.08)' },
    activity: { label: '🎯 Activity', color: '#2A6BFF', bg: 'rgba(42, 107, 255, 0.08)' },
    transport: { label: '🚗 Transport', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.08)' },
  }
  return styles[type] ?? { label: type, color: '#8888A0', bg: 'rgba(136, 136, 160, 0.08)' }
}

/* ===== ITINERARY TIMELINE CARD ===== */
function TimelineCard({
  time,
  title,
  description,
  type,
  cost,
  index,
  total,
}: {
  time: string
  title: string
  description?: string
  type?: string
  cost?: number
  index: number
  total: number
}) {
  const badge = type ? typeBadge(type) : null
  const isLast = index === total - 1

  return (
    <div className="relative flex gap-3 pb-5 last:pb-1">
      {/* Wobbly dashed timeline line */}
      {!isLast && (
        <div
          className="absolute left-[7px] top-5 bottom-0 w-[1.5px]"
          style={{
            background: 'repeating-linear-gradient(0deg, rgba(0, 212, 196, 0.3), rgba(0, 212, 196, 0.3) 3px, transparent 3px, transparent 6px)',
          }}
        />
      )}

      {/* Timeline dot */}
      <div className="flex-shrink-0 mt-0.5 relative z-10">
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center"
          style={{
            background: '#12121E',
            border: '1.5px solid rgba(0, 212, 196, 0.5)',
            boxShadow: '0 0 8px rgba(0, 212, 196, 0.15)',
          }}
        >
          <div
            className="w-[5px] h-[5px] rounded-full"
            style={{ background: '#00D4C4' }}
          />
        </div>
      </div>

      {/* Content card */}
      <div
        className="flex-1 rounded-sm px-3 py-2"
        style={{
          background: 'rgba(20, 20, 31, 0.5)',
          borderLeft: '1px solid rgba(0, 212, 196, 0.06)',
        }}
      >
        {/* Time row */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-mono tracking-wider"
            style={{ color: 'rgba(0, 212, 196, 0.6)' }}
          >
            {time}
          </span>
          {badge && (
            <span
              className="text-[8px] px-1.5 py-0.5 rounded-full font-display font-medium tracking-wide"
              style={{
                background: badge.bg,
                border: `1px solid ${badge.color}20`,
                color: badge.color,
              }}
            >
              {badge.label}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-display font-semibold text-text-primary mt-0.5 leading-tight">
          {title}
        </p>

        {/* Description */}
        {description && (
          <p className="text-[10px] font-body leading-tight mt-0.5" style={{ color: '#8888A0' }}>
            {description}
          </p>
        )}

        {/* Cost */}
        {cost !== undefined && cost > 0 && (
          <p className="text-[10px] font-mono mt-1" style={{ color: 'rgba(0, 212, 196, 0.5)' }}>
            ₹{cost.toLocaleString('en-IN')}
          </p>
        )}
      </div>
    </div>
  )
}

/* ===== DAY SECTION ===== */
function DaySection({ day, activities }: { day: number; activities: RawDay['activities'] }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="px-2.5 py-1 rounded-sm"
          style={{
            background: 'rgba(0, 212, 196, 0.06)',
            border: '1px solid rgba(0, 212, 196, 0.1)',
          }}
        >
          <span className="font-handwritten text-sm gradient-text font-medium">Day {day}</span>
        </div>
        <div className="flex-1 h-[1px]" style={{ background: 'rgba(0, 212, 196, 0.08)' }} />
      </div>

      {activities.map((act, i) => (
        <TimelineCard
          key={i}
          time={act.time}
          title={act.name}
          type={act.type}
          cost={act.cost}
          index={i}
          total={activities.length}
        />
      ))}
    </div>
  )
}

/* ===== MAIN ITINERARY COMPONENT ===== */
export default function Itinerary() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { state } = useRoamie()

  // Find trip from context
  const trip: SavedTrip | undefined = state.trips.find((t) => t.id === tripId)

  // State
  const [selectedDay, setSelectedDay] = useState<number | 'all'>(1)
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('timeline')

  if (!trip) {
    return (
      <div className="relative h-dvh flex flex-col items-center justify-center" style={topoBg}>
        <p className="font-handwritten text-lg gradient-text">Trip not found 🗺️</p>
        <button
          onClick={() => navigate('/trips')}
          className="mt-4 px-5 py-2 rounded-full text-xs font-display font-semibold text-white"
          style={{
            background: 'linear-gradient(135deg, #00D4C4, #2A6BFF)',
            boxShadow: '0 0 15px rgba(0, 212, 196, 0.2)',
          }}
        >
          Back to Trips
        </button>
      </div>
    )
  }

  // Get days from rawDays or build from flat itinerary
  const rawDays = trip.rawDays
  const dayTabs = rawDays ? rawDays.map((d) => d.day) : [1]

  // Compute current activities based on selected day
  const currentActivities = (() => {
    if (rawDays) {
      if (selectedDay === 'all') {
        return rawDays.flatMap((d) => d.activities)
      }
      return rawDays.find((d) => d.day === selectedDay)?.activities ?? []
    }
    // Fallback: flatten itinerary items
    return trip.itinerary.map((i) => ({
      time: i.time,
      name: i.title,
      type: 'activity' as const,
      cost: 0,
    }))
  })()

  // Map activities for TripMap
  const mapActivities: MapActivity[] = (() => {
    const coords = getCoords(trip.destination)
    // Generate offset coordinates for each activity to show them spread out
    if (currentActivities.length <= 1) {
      return [{ name: trip.destination, coordinates: coords }]
    }
    return currentActivities.slice(0, 6).map((act, i) => {
      const offset = (i - (currentActivities.length - 1) / 2) * 0.005
      return {
        name: act.name,
        coordinates: [coords[0] + offset, coords[1] - offset * 0.7] as [number, number],
      }
    })
  })()

  // Destination header image
  const heroImage = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=85&fm=webp`

  return (
    <div className="relative h-dvh flex flex-col" style={topoBg}>
      {/* ===== Header ===== */}
      <div
        className="flex-shrink-0 z-20"
        style={{
          borderBottom: '1px solid rgba(42, 42, 62, 0.4)',
          background: 'rgba(10, 10, 18, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 pt-3 pb-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="flex-shrink-0 p-1 rounded-full transition-colors"
            style={{ color: '#8888A0' }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} strokeWidth={1.8} />
          </motion.button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-display font-semibold gradient-text truncate">
              {trip.destination}
            </h1>
            <p className="text-[10px] font-body tracking-wide" style={{ color: '#8888A0' }}>
              {new Date(trip.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Compass size={14} strokeWidth={1.5} className="text-brand-cyan" />
            <span className="text-[10px] font-display font-semibold gradient-text">{rawDays?.length ?? 1}-Day Plan</span>
          </div>
        </div>

        {/* Day selector tabs */}
        <div className="flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto scrollbar-none">
          <DayTab
            label="All"
            active={selectedDay === 'all'}
            onClick={() => setSelectedDay('all')}
          />
          {dayTabs.map((day) => (
            <DayTab
              key={day}
              label={`Day ${day}`}
              active={selectedDay === day}
              onClick={() => setSelectedDay(day)}
            />
          ))}
        </div>
      </div>

      {/* ===== Scrollable Content ===== */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {/* Hero image */}
        <div className="relative h-36 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A12]" />

          {/* View toggle overlay */}
          <div className="absolute bottom-3 left-4 z-10 flex items-center gap-1.5">
            {(['timeline', 'map'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="text-[9px] font-display font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all duration-200"
                style={{
                  background: viewMode === mode
                    ? 'linear-gradient(135deg, #00D4C4, #2A6BFF)'
                    : 'rgba(20, 20, 31, 0.7)',
                  color: viewMode === mode ? '#0A0A12' : '#F0F0F5',
                  border: viewMode === mode
                    ? '1px solid transparent'
                    : '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: viewMode === mode ? '0 0 12px rgba(0, 212, 196, 0.2)' : 'none',
                }}
              >
                {mode === 'timeline' ? '📜 Timeline' : '🗺️ Map'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-4 pb-6">
          {/* Map View */}
          {viewMode === 'map' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-3">
                <h3 className="font-handwritten text-sm gradient-text font-medium">
                  Route Map
                </h3>
                <p className="text-[10px] font-body" style={{ color: '#8888A0' }}>
                  {selectedDay === 'all'
                    ? `All ${currentActivities.length} activities across ${rawDays?.length ?? 1} days`
                    : `Day ${selectedDay} · ${currentActivities.length} activities`}
                </p>
              </div>
              <TripMap activities={mapActivities} />
            </motion.div>
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats bar */}
              <div className="flex items-center gap-4 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(42, 42, 62, 0.3)' }}>
                <div className="text-center">
                  <p className="font-handwritten text-sm gradient-text">{currentActivities.length}</p>
                  <p className="text-[8px] font-body uppercase tracking-wider" style={{ color: '#8888A0' }}>Activities</p>
                </div>
                <div className="text-center">
                  <p className="font-handwritten text-sm gradient-text">
                    ₹{currentActivities.reduce((sum, a) => sum + ('cost' in a ? (a as any).cost || 0 : 0), 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[8px] font-body uppercase tracking-wider" style={{ color: '#8888A0' }}>Est. Cost</p>
                </div>
                <div className="text-center">
                  <p className="font-handwritten text-sm gradient-text">
                    {currentActivities.filter((a) => 'type' in a && (a as any).type === 'food').length}
                  </p>
                  <p className="text-[8px] font-body uppercase tracking-wider" style={{ color: '#8888A0' }}>Food Stops</p>
                </div>
              </div>

              {/* Notebook paper background */}
              <div
                className="relative rounded-sm p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                style={{
                  backgroundColor: '#12121E',
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(0, 212, 196, 0.06) 23px, rgba(0, 212, 196, 0.06) 24px)',
                  borderLeft: '2px solid rgba(0, 212, 196, 0.12)',
                }}
              >
                {rawDays && selectedDay === 'all' ? (
                  // Show all days
                  rawDays.map((day) => (
                    <DaySection key={day.day} day={day.day} activities={day.activities} />
                  ))
                ) : (
                  // Show single day or flat itinerary
                  <div className="pl-4">
                    {/* Wobbly timeline SVG */}
                    <svg
                      className="absolute left-[7px] top-4 pointer-events-none"
                      width="6"
                      height="300"
                      viewBox="0 0 6 300"
                      preserveAspectRatio="none"
                      style={{ opacity: 0.4 }}
                    >
                      <path
                        d="M3,0 C5,3 1,7 3,11 C5,15 1,19 3,23 C5,27 1,31 3,35 C5,39 1,43 3,47 C5,51 1,55 3,59 C5,63 1,67 3,71 C5,75 1,79 3,83 C5,87 1,91 3,95 C5,99 1,103 3,107 C5,111 1,115 3,119 C5,123 1,127 3,131 C5,135 1,139 3,143 C5,147 1,151 3,155 C5,159 1,163 3,167 C5,171 1,175 3,179 C5,183 1,187 3,191 C5,195 1,199 3,203 C5,207 1,211 3,215 C5,219 1,223 3,227 C5,231 1,235 3,239 C5,243 1,247 3,251 C5,255 1,259 3,263 C5,267 1,271 3,275 C5,279 1,283 3,287 C5,291 1,295 3,299"
                        stroke="#00D4C4"
                        strokeWidth="1.5"
                        strokeDasharray="2.5 3.5"
                        fill="none"
                      />
                    </svg>

                    {currentActivities.map((act, i) => (
                      <TimelineCard
                        key={i}
                        time={act.time}
                        title={act.name}
                        description={''}
                        type={'type' in act ? (act as any).type : undefined}
                        cost={'cost' in act ? (act as any).cost : undefined}
                        index={i}
                        total={currentActivities.length}
                      />
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {currentActivities.length === 0 && (
                  <div className="text-center py-8">
                    <p className="font-handwritten text-sm" style={{ color: 'rgba(0, 212, 196, 0.4)' }}>
                      No activities for this day ✨
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ===== DAY TAB ===== */
function DayTab({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex-shrink-0 text-[10px] font-display font-semibold tracking-wider px-3 py-1.5 rounded-full transition-all duration-200"
      style={{
        background: active
          ? 'linear-gradient(135deg, #00D4C4, #2A6BFF)'
          : 'transparent',
        color: active ? '#0A0A12' : '#8888A0',
        border: active
          ? '1px solid transparent'
          : '1px solid rgba(136, 136, 160, 0.15)',
        boxShadow: active ? '0 0 12px rgba(0, 212, 196, 0.2)' : 'none',
      }}
    >
      {label}
    </motion.button>
  )
}
