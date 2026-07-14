import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle, Globe } from 'lucide-react'
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
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4C4' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
  `,
}

/* ===== USER COORDINATES (lat/lng mapped to CSS positions) ===== */
interface RadarUser {
  name: string
  city: string
  lat: number
  lng: number
  avatar: string
  exploring: string
}

const mockUsers: RadarUser[] = [
  { name: 'Rahul', city: 'Paris', lat: 48.8566, lng: 2.3522, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=60&fm=webp', exploring: 'Louvre Museum' },
  { name: 'Priya', city: 'Tokyo', lat: 35.6895, lng: 139.6917, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=60&fm=webp', exploring: 'Shibuya Crossing' },
  { name: 'Arjun', city: 'Bali', lat: -8.4095, lng: 115.0920, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=60&fm=webp', exploring: 'Ubud Rice Terraces' },
  { name: 'Ananya', city: 'New York', lat: 40.7128, lng: -74.0060, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=60&fm=webp', exploring: 'Central Park' },
  { name: 'Zara', city: 'Barcelona', lat: 41.3851, lng: 2.1734, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=60&fm=webp', exploring: 'Sagrada Familia' },
  { name: 'Vikram', city: 'Sydney', lat: -33.8688, lng: 151.2093, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=60&fm=webp', exploring: 'Bondi Beach' },
]

/* ===== SVG WORLD MAP (simplified outline paths) ===== */
// Map lat/lng to x/y on the SVG (Mercator-like projection)
function toXY(lat: number, lng: number, w: number, h: number) {
  const x = ((lng + 180) / 360) * w
  const latRad = (lat * Math.PI) / 180
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
  const y = h / 2 - (mercN / Math.PI) * (h / 2)
  return { x, y }
}

/* ===== WORLD MAP SVG COMPONENT ===== */
function WorldMap({ users, onUserClick }: { users: RadarUser[]; onUserClick: (name: string) => void }) {
  const svgW = 340
  const svgH = 180
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Fallback opacity: after 2 seconds, force cards visible
    const timer = setTimeout(() => setVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative rounded-sm overflow-hidden" style={{ perspective: '800px' }}>
      <motion.div
        initial={{ opacity: 0, rotateX: 10 }}
        animate={{ opacity: 1, rotateX: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Map background */}
        <div
          className="w-full rounded-sm overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #0A1628 0%, #0D1B33 40%, #14141F 100%)',
            border: '1px solid rgba(0, 212, 196, 0.12)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.4), inset 0 0 60px rgba(0, 212, 196, 0.03)',
          }}
        >
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: `${svgH}px` }}>
            {/* Grid lines */}
            {[-120, -60, 0, 60, 120].map((lng) => {
              const { x } = toXY(0, lng, svgW, svgH)
              return (
                <line key={`vl-${lng}`} x1={x} y1={0} x2={x} y2={svgH}
                  stroke="rgba(0, 212, 196, 0.04)" strokeWidth="0.5" />
              )
            })}
            {[-60, -30, 0, 30, 60].map((lat) => {
              const { y } = toXY(lat, 0, svgW, svgH)
              return (
                <line key={`hl-${lat}`} x1={0} y1={y} x2={svgW} y2={y}
                  stroke="rgba(0, 212, 196, 0.04)" strokeWidth="0.5" />
              )
            })}

            {/* Continents (simplified polygons) */}
            {/* North America */}
            <path d="M40,30 L60,20 L85,25 L95,40 L90,55 L80,65 L70,70 L55,75 L45,65 L38,50 Z"
              fill="rgba(0, 212, 196, 0.06)" stroke="rgba(0, 212, 196, 0.15)" strokeWidth="0.8" />
            {/* South America */}
            <path d="M70,80 L80,78 L85,90 L82,110 L75,130 L68,135 L62,120 L60,100 L63,88 Z"
              fill="rgba(0, 212, 196, 0.06)" stroke="rgba(0, 212, 196, 0.15)" strokeWidth="0.8" />
            {/* Europe */}
            <path d="M152,30 L170,25 L185,28 L195,35 L190,45 L175,50 L160,48 L150,42 Z"
              fill="rgba(0, 212, 196, 0.06)" stroke="rgba(0, 212, 196, 0.15)" strokeWidth="0.8" />
            {/* Africa */}
            <path d="M155,55 L175,52 L185,60 L190,75 L185,95 L175,110 L160,115 L150,105 L145,85 L148,65 Z"
              fill="rgba(0, 212, 196, 0.06)" stroke="rgba(0, 212, 196, 0.15)" strokeWidth="0.8" />
            {/* Asia */}
            <path d="M195,28 L230,22 L260,25 L280,35 L290,45 L295,60 L285,70 L260,75 L235,70 L215,55 L200,45 L195,38 Z"
              fill="rgba(0, 212, 196, 0.06)" stroke="rgba(0, 212, 196, 0.15)" strokeWidth="0.8" />
            {/* Australia */}
            <path d="M260,100 L275,95 L290,100 L295,110 L290,120 L275,125 L260,120 L255,110 Z"
              fill="rgba(0, 212, 196, 0.06)" stroke="rgba(0, 212, 196, 0.15)" strokeWidth="0.8" />

            {/* Scan line overlay */}
            <defs>
              <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(0, 212, 196, 0)" />
                <stop offset="40%" stopColor="rgba(0, 212, 196, 0.1)" />
                <stop offset="50%" stopColor="rgba(0, 212, 196, 0.15)" />
                <stop offset="60%" stopColor="rgba(0, 212, 196, 0.1)" />
                <stop offset="100%" stopColor="rgba(0, 212, 196, 0)" />
              </linearGradient>
            </defs>
            <rect
              x="0" y="0" width={svgW} height={svgH}
              fill="url(#scanGrad)"
              className="animate-radar-scan"
              style={{ transformOrigin: 'center center' }}
            />

            {/* User pins as pulsing dots */}
            {users.map((user) => {
              const { x, y } = toXY(user.lat, user.lng, svgW, svgH)
              return (
                <g key={user.name}>
                  {/* Pulse ring */}
                  <circle cx={x} cy={y} r="6" fill="none" stroke="#00D4C4"
                    strokeWidth="1" opacity="0.4" className="animate-pulse-ring" />
                  {/* Dot */}
                  <circle cx={x} cy={y} r="3" fill="#00D4C4"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(0, 212, 196, 0.6))' }} />
                  {/* Label */}
                  <text x={x} y={y - 8} fill="rgba(240, 240, 245, 0.7)"
                    fontSize="4" textAnchor="middle"
                    fontFamily="'Outfit', sans-serif"
                    fontWeight="600"
                  >
                    {user.name}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* User pins as clickable overlays */}
        {users.map((user) => {
          const { x, y } = toXY(user.lat, user.lng, svgW, svgH)
          const pctX = (x / svgW) * 100
          const pctY = (y / svgH) * 100
          return (
            visible && (
              <motion.button
                key={user.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 15 }}
                whileHover={{ scale: 1.3, y: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onUserClick(user.name)}
                className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full z-10"
                style={{
                  left: `${pctX}%`,
                  top: `${pctY}%`,
                  background: '#00D4C4',
                  boxShadow: '0 0 8px rgba(0, 212, 196, 0.6), 0 0 20px rgba(0, 212, 196, 0.2)',
                }}
                aria-label={user.name}
              />
            )
          )
        })}

        {/* Map legend */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          <span className="w-2 h-2 rounded-full bg-brand-cyan animate-breathe" />
          <span className="text-[8px] font-mono text-brand-cyan/60">6 live</span>
        </div>
      </motion.div>
    </div>
  )
}

/* ===== USER PIN CARD with 3D tilt ===== */
function UserPinCard({
  user,
  index,
  onSayHi,
}: {
  user: RadarUser
  index: number
  onSayHi: (name: string) => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardVisible, setCardVisible] = useState(false)

  // Fallback opacity: ensure cards are always visible after 2s
  useEffect(() => {
    const timer = setTimeout(() => setCardVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.setProperty('--tilt-x', `${-y * 10}deg`)
    cardRef.current.style.setProperty('--tilt-y', `${x * 10}deg`)
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.setProperty('--tilt-x', '0deg')
    cardRef.current.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: cardVisible ? 1 : 0, y: 0 }}
      transition={{ ...springGentle, delay: index * 0.1 }}
      className="card-3d-tilt rounded-sm p-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
      style={{
        background: '#14141F',
        border: '1px solid rgba(0, 212, 196, 0.08)',
        backdropFilter: 'blur(12px)',
        opacity: cardVisible ? 1 : 1, // Always visible, animation handles it
      }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <motion.div
          className="h-12 w-12 rounded-full bg-cover bg-center ring-2 ring-brand-cyan/20 flex-shrink-0 preserve-3d"
          style={{ backgroundImage: `url(${user.avatar})` }}
          role="img"
          aria-label={user.name}
          whileHover={{ rotateY: 180, scale: 1.1 }}
          transition={{ duration: 0.6 }}
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
        {/* Map — SVG-based world map with scan line */}
        <div className="px-4 pt-3">
          <WorldMap users={mockUsers} onUserClick={handleSayHi} />
        </div>

        {/* User count */}
        <div className="flex items-center gap-2 px-4 mt-3 mb-2">
          <Globe size={12} strokeWidth={1.8} className="text-brand-cyan" />
          <p className="text-[10px] font-display font-semibold tracking-wide" style={{ color: '#8888A0' }}>
            {mockUsers.length} travelers online now
          </p>
        </div>

        {/* User cards with 3D tilt */}
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
