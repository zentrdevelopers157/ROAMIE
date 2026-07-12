import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Map,
  Plus,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  Compass,
  Sun,
  Moon,
  Mountain,
  Umbrella,
  Utensils,
} from 'lucide-react'
import PolaroidCard from '../components/PolaroidCard'
import StickyNote from '../components/StickyNote'
import PushPin from '../components/PushPin'
import TripMap from '../components/TripMap'
import type { MapActivity } from '../components/TripMap'
import { useRoamie } from '../store/RoamieContext'

/* ===== SPRING ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== ITINERARY ITEM (compact) ===== */
const iconMap = {
  Utensils, MapPin, Sun, Umbrella, Clock: Clock as React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>,
}

function ItineraryPreview({ time, title, icon: Icon, isLast = false }: {
  time: string
  title: string
  icon?: string
  isLast?: boolean
}) {
  const IconComponent = icon && icon in iconMap
    ? iconMap[icon as keyof typeof iconMap]
    : MapPin

  return (
    <div className="relative flex gap-2 pb-2.5">
      {!isLast && (
        <div className="absolute left-[5px] top-4 bottom-0 w-[1px] bg-brand-cyan/20" />
      )}
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-2.5 h-2.5 rounded-full border border-brand-cyan bg-base-bg" />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <span className="text-[9px] font-mono text-brand-cyan/60">{time}</span>
        <span className="text-[11px] font-display text-text-primary">{title}</span>
      </div>
    </div>
  )
}

/* ===== TRIP CARD ===== */
function TripCard({ trip, index, onDelete }: {
  trip: import('../store/RoamieContext').SavedTrip
  index: number
  onDelete: (id: string) => void
}) {
  const rotates = [-1, 0.8, -0.5, 1.2, -0.3, 0.5]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay: index * 0.08 }}
    >
      <PolaroidCard rotate={rotates[index % rotates.length]} className="w-full mb-4">
        {/* Destination header */}
        <div className="flex items-center justify-between px-0.5 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
              <MapPin size={15} strokeWidth={1.5} className="text-brand-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-[#1A1A2E]">{trip.destination}</h3>
              <div className="flex items-center gap-1.5">
                <Calendar size={9} strokeWidth={2} className="text-text-secondary/60" />
                <span className="text-[9px] text-text-secondary/70">
                  {new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(trip.id)
            }}
            className="h-7 w-7 rounded-full hover:bg-red-500/10 flex items-center justify-center transition-colors"
            aria-label={`Delete ${trip.destination} trip`}
          >
            <Trash2 size={13} strokeWidth={2} className="text-red-400/60 hover:text-red-400 transition-colors" />
          </motion.button>
        </div>

        {/* Hero image */}
        <div className="relative overflow-hidden rounded-sm mb-2">
          <div
            className="h-36 w-full bg-cover bg-center"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=85&fm=webp)`,
            }}
            role="img"
            aria-label={`Photo of ${trip.destination}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center gap-1">
              {trip.preferences.slice(0, 3).map((pref) => (
                <span key={pref}
                  className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white font-display font-medium"
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences tags */}
        {trip.preferences.length > 0 && (
          <div className="flex flex-wrap gap-1 px-0.5 pb-2">
            {trip.preferences.map((pref) => (
              <span key={pref}
                className="text-[8px] px-1.5 py-0.5 rounded-full font-display font-medium"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 212, 196, 0.1), rgba(138, 43, 226, 0.1))',
                  border: '1px solid rgba(0, 212, 196, 0.2)',
                  color: '#00D4C4',
                }}
              >
                #{pref}
              </span>
            ))}
          </div>
        )}

        {/* View toggle: Timeline / Map */}
        <div className="flex items-center gap-2 px-0.5 pb-2">
          {(['timeline', 'map'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="text-[9px] font-display font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all duration-200"
              style={{
                background: viewMode === mode
                  ? 'linear-gradient(135deg, #00D4C4, #2A6BFF)'
                  : 'transparent',
                color: viewMode === mode ? '#0A0A12' : '#8888A0',
                border: viewMode === mode
                  ? '1px solid transparent'
                  : '1px solid rgba(136, 136, 160, 0.2)',
                boxShadow: viewMode === mode
                  ? '0 0 12px rgba(0, 212, 196, 0.2)'
                  : 'none',
              }}
            >
              {mode === 'timeline' ? '📜 Timeline' : '🗺️ Map'}
            </button>
          ))}
        </div>

        {/* Map view */}
        {viewMode === 'map' && (
          <TripMap activities={demoMapActivities} />
        )}

        {/* Timeline / Itinerary preview */}
        {viewMode === 'timeline' && trip.itinerary.length > 0 ? (
          <div className="bg-base-bg/50 rounded-sm px-2.5 py-2">
            <p className="text-[9px] font-display font-semibold text-brand-cyan/70 uppercase tracking-wider mb-1.5">
              Day 1
            </p>
            {trip.itinerary.slice(0, 3).map((item, i) => (
              <ItineraryPreview
                key={i}
                time={item.time}
                title={item.title}
                isLast={i === Math.min(trip.itinerary.length, 3) - 1}
              />
            ))}
            {trip.itinerary.length > 3 && (
              <p className="text-[9px] text-text-secondary/50 mt-1">
                +{trip.itinerary.length - 3} more activities
              </p>
            )}
          </div>
        ) : viewMode === 'timeline' ? (
          <p className="text-[10px] font-handwritten text-text-secondary/60 px-0.5 pb-1">
            Itinerary brewing... ☕
          </p>
        ) : null}
      </PolaroidCard>
    </motion.div>
  )
}

/* ===== MAIN TRIPS COMPONENT ===== */
/* ===== HARDCODED MANALI COORDINATES ===== */
const demoMapActivities: MapActivity[] = [
  { name: 'Solang Valley', coordinates: [77.1891, 32.2430] },
  { name: 'Old Manali', coordinates: [77.1789, 32.2410] },
  { name: 'Hadimba Temple', coordinates: [77.1870, 32.2398] },
]

/* ===== MAIN TRIPS COMPONENT ===== */
export default function Trips() {
  const navigate = useNavigate()
  const { state, dispatch } = useRoamie()
  const [viewMode, setViewMode] = useState<'timeline' | 'map'>('timeline')

  const handleDeleteTrip = (id: string) => {
    dispatch({ type: 'REMOVE_TRIP', payload: id })
  }

  return (
    <div className="px-4 pt-5 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springGentle}
        className="flex items-center justify-between mb-5"
      >
        <div>
          <h1 className="text-xl font-display font-semibold text-text-primary">My Trips</h1>
          <p className="text-xs text-text-secondary font-body -mt-0.5">
            {state.trips.length > 0 ? `${state.trips.length} ${state.trips.length === 1 ? 'journey' : 'journeys'} planned` : 'Your adventures await'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/plan')}
          className="h-10 w-10 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
            boxShadow: '0 0 20px rgba(0, 212, 196, 0.3)',
          }}
          aria-label="Plan a new trip"
        >
          <Plus size={20} strokeWidth={2.5} className="text-white" />
        </motion.button>
      </motion.div>

      {/* Trips list */}
      {state.trips.length > 0 ? (
        <div>
          {state.trips.map((trip, i) => (
            <TripCard key={trip.id} trip={trip} index={i} onDelete={handleDeleteTrip} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[55vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="text-center"
          >
            {/* Empty state backpack */}
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-pulse-glow rounded-full" style={{ transform: 'scale(1.3)' }} />
              <div className="relative">
                <Map size={48} strokeWidth={1.2} className="mx-auto text-brand-cyan/40"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(0, 212, 196, 0.15))' }}
                />
              </div>
            </div>

            <h2 className="font-display text-xl font-semibold text-text-primary mb-2">
              No Journeys Yet
            </h2>
            <p className="font-handwritten text-base gradient-text mb-6">
              Every adventure starts with a dream ✨
            </p>

            <StickyNote rotate={0.5} className="max-w-xs mx-auto mb-6">
              <p className="font-handwritten text-sm gradient-text leading-relaxed text-center">
                Ready to chase the sunset? Let's plan your first trip! 🌅
              </p>
            </StickyNote>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/plan')}
              className="relative px-8 py-3 rounded-full text-white font-display font-semibold text-sm tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                boxShadow: '0 4px 25px rgba(0, 212, 196, 0.3), 0 0 40px rgba(42, 107, 255, 0.15)',
              }}
            >
              <span className="flex items-center gap-2">
                Plan Your First Trip
                <Compass size={16} strokeWidth={2.5} />
              </span>
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
