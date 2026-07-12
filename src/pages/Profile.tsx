import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  MapPin,
  Compass,
  Camera,
  Award,
  Settings,
  LogOut,
  ChevronRight,
  Edit3,
  Globe,
  Sun,
  Mountain,
  Heart,
  Star,
  Users,
  Bell,
} from 'lucide-react'
import PolaroidCard from '../components/PolaroidCard'
import PushPin from '../components/PushPin'
import { useRoamie } from '../store/RoamieContext'

/* ===== SPRING ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== VIBE LABELS ===== */
const vibeLabels = ['Beach Bum', 'Mountain Soul', 'City Explorer', 'Road Tripper', 'Foodie', 'Culture Seeker']
const vibeIcons = [Sun, Mountain, Globe, MapPin, Heart, Star] as const

/* ===== STAT CARD ===== */
function StatCard({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  value: string | number
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className="flex flex-col items-center gap-1.5 bg-card-bg rounded-lg px-4 py-3 border border-[#2A2A3E]/40 shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
    >
      <Icon size={18} strokeWidth={1.5} className="text-brand-cyan" />
      <span className="text-lg font-display font-bold text-text-primary">{value}</span>
      <span className="text-[9px] font-body text-text-secondary uppercase tracking-widest">{label}</span>
    </motion.div>
  )
}

/* ===== SETTING ROW ===== */
function SettingRow({ icon: Icon, label, description, onClick, isLast = false }: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  description?: string
  onClick?: () => void
  isLast?: boolean
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-1 py-3.5 ${!isLast ? 'border-b border-[#2A2A3E]/30' : ''}`}
    >
      <div className="h-8 w-8 rounded-lg bg-card-bg flex items-center justify-center border border-[#2A2A3E]/40">
        <Icon size={15} strokeWidth={1.5} className="text-text-secondary" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-display font-medium text-text-primary">{label}</p>
        {description && <p className="text-[10px] text-text-secondary mt-0.5">{description}</p>}
      </div>
      <ChevronRight size={14} strokeWidth={2} className="text-text-secondary/40" />
    </motion.button>
  )
}

/* ===== MAIN PROFILE COMPONENT ===== */
export default function Profile() {
  const navigate = useNavigate()
  const { state } = useRoamie()
  const [showSettings, setShowSettings] = useState(false)

  const tripCount = state.trips.length
  const vibeCount = state.selectedVibes.length

  return (
    <div className="px-4 pt-5 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springGentle}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-xl font-display font-semibold text-text-primary">Profile</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(!showSettings)}
          className="h-9 w-9 rounded-lg bg-card-bg flex items-center justify-center border border-[#2A2A3E]/40"
          aria-label="Settings"
        >
          <Settings size={16} strokeWidth={1.8} className="text-text-secondary" />
        </motion.button>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <PolaroidCard rotate={1} className="w-full mb-6">
          <div className="flex flex-col items-center px-2 py-3">
            {/* Avatar */}
            <div className="relative mb-3">
              <div
                className="h-20 w-20 rounded-full bg-cover bg-center ring-2 ring-brand-cyan/20"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=85&fm=webp)',
                }}
                role="img"
                aria-label="Profile photo"
              />
              <PushPin className="absolute -top-1 -right-1" />
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #00D4C4, #2A6BFF)' }}
                aria-label="Edit profile"
              >
                <Edit3 size={12} strokeWidth={2.5} className="text-white" />
              </motion.div>
            </div>

            {/* Name */}
            <h2 className="text-lg font-display font-bold text-[#1A1A2E]">
              {state.name || 'Traveler'}
            </h2>
            <p className="text-[11px] text-text-secondary/70 font-body">
              {state.onboarded ? 'Adventure awaits' : 'New to ROAMIE'}
            </p>

            {/* Travel DNA */}
            {state.onboarded && (
              <div className="flex gap-4 mt-3">
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Mountain size={12} strokeWidth={2} className="text-brand-cyan" />
                    <span className="text-[10px] font-mono text-brand-cyan">{state.adventureLevel}/10</span>
                  </div>
                  <p className="text-[8px] text-text-secondary/50 uppercase tracking-wider mt-0.5">Adventure</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Users size={12} strokeWidth={2} className="text-brand-purple" />
                    <span className="text-[10px] font-mono text-brand-purple">{state.socialLevel}/10</span>
                  </div>
                  <p className="text-[8px] text-text-secondary/50 uppercase tracking-wider mt-0.5">Social</p>
                </div>
              </div>
            )}
          </div>

          {/* Vibe tags */}
          {state.selectedVibes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-2 pb-3 justify-center">
              {state.selectedVibes.map((vibeIdx) => {
                const VibeIcon = vibeIcons[vibeIdx]
                return (
                  <div
                    key={vibeIdx}
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-display font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0, 212, 196, 0.1), rgba(138, 43, 226, 0.1))',
                      border: '1px solid rgba(0, 212, 196, 0.2)',
                      color: '#00D4C4',
                    }}
                  >
                    {VibeIcon && <VibeIcon size={10} strokeWidth={2} />}
                    {vibeLabels[vibeIdx]}
                  </div>
                )
              })}
            </div>
          )}
        </PolaroidCard>
      </motion.div>

      {/* Stats */}
      {showSettings ? (
        /* Settings Panel */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springGentle}
        >
          <h3 className="text-[10px] font-display font-semibold text-text-secondary uppercase tracking-widest mb-2 px-1">
            Settings
          </h3>
          <div className="bg-card-bg rounded-lg px-4 border border-[#2A2A3E]/40 shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
            <SettingRow icon={User} label="Edit Profile" description="Name, avatar, travel vibe" />
            <SettingRow icon={Bell} label="Notifications" description="Trip alerts, community updates" />
            <SettingRow icon={Globe} label="Language" description="English (US)" />
            <SettingRow icon={Star} label="Rate ROAMIE" description="Share your feedback" />
            <SettingRow icon={LogOut} label="Reset Onboarding" description="Start fresh with ROAMIE" onClick={() => {
              localStorage.removeItem('roamie_state')
              window.location.href = '/onboarding'
            }} isLast />
          </div>
        </motion.div>
      ) : (
        /* Stats Panel */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-[10px] font-display font-semibold text-text-secondary uppercase tracking-widest mb-3 px-1">
            Travel Stats
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard icon={MapPin} label="Trips" value={tripCount} />
            <StatCard icon={Compass} label="Vibes" value={vibeCount} />
            <StatCard icon={Camera} label="Memories" value={tripCount * 3 || '—'} />
          </div>

          {/* Recent Trips */}
          <h3 className="text-[10px] font-display font-semibold text-text-secondary uppercase tracking-widest mb-3 px-1">
            Recent Trips
          </h3>
          {state.trips.length > 0 ? (
            <div className="space-y-2">
              {state.trips.slice(0, 3).map((trip) => (
                <motion.div
                  key={trip.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 bg-card-bg rounded-lg px-3 py-2.5 border border-[#2A2A3E]/40 cursor-pointer"
                  onClick={() => navigate('/trips')}
                >
                  <div className="h-10 w-10 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
                    <MapPin size={16} strokeWidth={1.5} className="text-brand-cyan" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-display font-medium text-text-primary">{trip.destination}</p>
                    <p className="text-[10px] text-text-secondary">
                      {new Date(trip.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <ChevronRight size={14} strokeWidth={2} className="text-text-secondary/40" />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <div className="mb-3">
                <Compass size={32} strokeWidth={1.5} className="mx-auto text-brand-cyan/40"
                  style={{ filter: 'drop-shadow(0 0 15px rgba(0, 212, 196, 0.1))' }}
                />
              </div>
              <p className="font-handwritten text-sm gradient-text">
                No trips yet. Time to wander! 🌍
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/plan')}
                className="mt-3 px-5 py-2 rounded-full text-[10px] font-display font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #00D4C4, #2A6BFF)',
                  boxShadow: '0 0 15px rgba(0, 212, 196, 0.2)',
                }}
              >
                Plan Your First Trip
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}


