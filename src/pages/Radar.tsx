import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, Globe } from 'lucide-react'
import TripMap from '../components/TripMap'
import type { MapActivity } from '../components/TripMap'
import StickyNote from '../components/StickyNote'
import WashiTape from '../components/WashiTape'

/* ===== SPRING ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== TOPOGRAPHIC BG ===== */
const topoBg: React.CSSProperties = {
  backgroundColor: '#0A0A12',
  backgroundImage: `
    radial-gradient(ellipse at 20% 30%, rgba(0, 212, 196, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(42, 107, 255, 0.03) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4C4' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")
  `,
}

/* ===== MOCK USERS ON MAP ===== */
const mockUsers = [
  { name: 'Rahul', city: 'Paris', coords: [2.3522, 48.8566] as [number, number], avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=60&fm=webp', exploring: 'Louvre Museum' },
  { name: 'Priya', city: 'Tokyo', coords: [139.6917, 35.6895] as [number, number], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=60&fm=webp', exploring: 'Shibuya Crossing' },
  { name: 'Arjun', city: 'Bali', coords: [115.0920, -8.4095] as [number, number], avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=60&fm=webp', exploring: 'Ubud Rice Terraces' },
  { name: 'Ananya', city: 'New York', coords: [-74.0060, 40.7128] as [number, number], avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=60&fm=webp', exploring: 'Central Park' },
  { name: 'Zara', city: 'Barcelona', coords: [2.1734, 41.3851] as [number, number], avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=60&fm=webp', exploring: 'Sagrada Familia' },
  { name: 'Vikram', city: 'Sydney', coords: [151.2093, -33.8688] as [number, number], avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=60&fm=webp', exploring: 'Bondi Beach' },
]

/* ===== MAP ACTIVITIES FROM USERS ===== */
const mapActivities: MapActivity[] = mockUsers.map(u => ({
  name: `${u.name} in ${u.city}`,
  coordinates: u.coords,
}))

/* ===== USER PIN CARD ===== */
function UserPinCard({
  user,
  index,
  onSayHi,
}: {
  user: typeof mockUsers[0]
  index: number
  onSayHi: (name: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay: index * 0.1 }}
      className="rounded-sm p-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
      style={{
        background: '#14141F',
        border: '1px solid rgba(0, 212, 196, 0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="h-12 w-12 rounded-full bg-cover bg-center ring-2 ring-brand-cyan/20 flex-shrink-0"
          style={{ backgroundImage: `url(${user.avatar})` }}
          role="img"
          aria-label={user.name}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-display font-semibold text-text-primary">{user.name}</p>
          <p className="text-[11px] font-body" style={{ color: '#8888A0' }}>
            Exploring <span className="text-brand-cyan">{user.exploring}</span> in {user.city}
          </p>

          {/* Pulsing dot */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-breathe"
                style={{ background: '#00D4C4' }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-cyan" />
            </span>
            <span className="text-[9px] font-mono text-brand-cyan/60">Live now</span>
          </div>
        </div>
      </div>

      {/* Say Hi button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSayHi(user.name)}
        className="mt-2.5 w-full py-2 rounded-full text-[10px] font-display font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200"
        style={{
          background: 'rgba(0, 212, 196, 0.08)',
          border: '1px solid rgba(0, 212, 196, 0.2)',
          color: '#00D4C4',
        }}
      >
        <MessageCircle size={12} strokeWidth={2} />
        Say Hi 👋
      </motion.button>
    </motion.div>
  )
}

/* ===== MAIN RADAR COMPONENT ===== */
export default function Radar() {
  const navigate = useNavigate()
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatSent, setChatSent] = useState(false)

  const handleSayHi = (name: string) => {
    setSelectedUser(name)
    setChatSent(false)
    setChatInput('')
  }

  const handleSendHi = () => {
    if (chatInput.trim()) {
      setChatSent(true)
      setTimeout(() => {
        setSelectedUser(null)
        setChatSent(false)
      }, 2000)
    }
  }

  return (
    <div className="relative h-dvh flex flex-col" style={topoBg}>
      {/* ===== Header ===== */}
      <div
        className="flex-shrink-0 z-20 px-4 pt-3 pb-2.5"
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
              Social Radar
            </h1>
            <p className="text-[10px] font-body tracking-wide" style={{ color: '#8888A0' }}>
              See who's exploring nearby 🌍
            </p>
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {/* Map */}
        <div className="px-4 pt-3">
          <TripMap activities={mapActivities} />
        </div>

        {/* User count */}
        <div className="flex items-center gap-2 px-4 mt-3 mb-2">
          <Globe size={12} strokeWidth={1.8} className="text-brand-cyan" />
          <p className="text-[10px] font-display font-semibold tracking-wide" style={{ color: '#8888A0' }}>
            {mockUsers.length} travelers online now
          </p>
        </div>

        {/* User cards */}
        <div className="px-4 pb-4 space-y-2.5">
          {mockUsers.map((user, i) => (
            <UserPinCard
              key={user.name}
              user={user}
              index={i}
              onSayHi={handleSayHi}
            />
          ))}
        </div>
      </div>

      {/* ===== Say Hi Chat Modal ===== */}
      {selectedUser && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSelectedUser(null)}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl px-4 pt-5 pb-8"
            style={{
              background: '#14141F',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.4)',
            }}
          >
            <WashiTape color="purple" rotate={2} className="-top-3 left-1/2 -translate-x-1/2" />

            <h3 className="font-handwritten text-base gradient-text font-medium mb-3 text-center">
              Say Hi to {selectedUser} 👋
            </h3>

            {chatSent ? (
              <StickyNote rotate={0.5} delay={0.1}>
                <p className="font-handwritten text-sm gradient-text text-center">
                  Message sent! 🌟
                </p>
              </StickyNote>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendHi()}
                  placeholder={`Write a message to ${selectedUser}...`}
                  className="flex-1 px-3 py-2.5 rounded-full text-sm outline-none"
                  style={{
                    background: 'rgba(10, 10, 18, 0.6)',
                    color: '#F0F0F5',
                    border: '1px solid rgba(0, 212, 196, 0.15)',
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendHi}
                  disabled={!chatInput.trim()}
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, #00D4C4, #2A6BFF)',
                    boxShadow: '0 0 15px rgba(0, 212, 196, 0.2)',
                  }}
                >
                  <MessageCircle size={16} strokeWidth={2.5} className="text-white" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}
