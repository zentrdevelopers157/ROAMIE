import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Compass,
  MapPin,
  Sun,
  Moon,
  Mountain,
  Umbrella,
  Utensils,
  Calendar,
  Clock,
  IndianRupee,
  Star,
} from 'lucide-react'

/* ===== SPRING ===== */
const springBounce = { type: 'spring' as const, stiffness: 300, damping: 18 }
const springBub = { type: 'spring' as const, stiffness: 250, damping: 16 }

/* ===== TOPOGRAPHIC MAP CSS ===== */
const topoBg = {
  backgroundColor: '#0A0A12',
  backgroundImage: `
    radial-gradient(ellipse at 20% 50%, rgba(0, 212, 196, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(42, 107, 255, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(138, 43, 226, 0.03) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4C4' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
  `,
} as React.CSSProperties

/* ===== CHAT MESSAGE BUBBLES ===== */
function RoamieBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ ...springBub, delay }}
      className="flex items-start gap-2.5 max-w-[85%]"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-card-bg border border-brand-cyan/20"
          style={{ boxShadow: '0 0 10px rgba(0, 212, 196, 0.1)' }}>
          <svg width="14" height="14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="35" width="50" height="45" rx="8" fill="#00D4C4" opacity="0.9" />
            <path d="M25 50h50v3H25z" fill="#0A0A12" opacity="0.3" />
            <rect x="42" y="27" width="16" height="8" rx="4" fill="#2A6BFF" opacity="0.8" />
            <rect x="25" y="38" width="5" height="30" rx="2.5" fill="#8A2BE2" opacity="0.6" />
            <rect x="70" y="38" width="5" height="30" rx="2.5" fill="#8A2BE2" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Bubble with torn-paper tail */}
      <div className="relative">
        <div
          className="relative bg-card-bg rounded-lg px-3.5 py-2.5 text-sm text-text-primary leading-relaxed shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
          style={{
            clipPath: 'polygon(0% 8%, 6% 4%, 10% 8%, 14% 3%, 100% 0%, 100% 100%, 14% 100%, 10% 96%, 6% 100%, 0% 92%)',
            borderLeft: '1px solid rgba(0, 212, 196, 0.1)',
          }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  )
}

function UserBubble({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ ...springBub, delay }}
      className="flex justify-end max-w-[80%] ml-auto"
    >
      <div
        className="px-3.5 py-2.5 rounded-lg text-sm text-white leading-relaxed shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
        style={{
          background: '#8A2BE2',
          borderBottomRightRadius: '4px',
          borderTopRightRadius: '12px 8px',
          borderBottomLeftRadius: '12px',
          borderTopLeftRadius: '12px 10px',
          boxShadow: '0 2px 15px rgba(138, 43, 226, 0.15)',
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}

/* ===== TYPING INDICATOR ===== */
function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-start gap-2.5 max-w-[60%]"
    >
      <div className="flex-shrink-0 mt-1">
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-card-bg border border-brand-cyan/20">
          <svg width="14" height="14" viewBox="0 0 100 100" fill="none">
            <rect x="25" y="35" width="50" height="45" rx="8" fill="#00D4C4" opacity="0.9" />
            <rect x="42" y="27" width="16" height="8" rx="4" fill="#2A6BFF" opacity="0.8" />
          </svg>
        </div>
      </div>
      <div className="bg-card-bg rounded-lg px-4 py-3 flex gap-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
        style={{ clipPath: 'polygon(0% 8%, 6% 4%, 10% 8%, 100% 0%, 100% 100%, 0% 92%)' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-brand-cyan"
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* ===== PIN-BACK BUTTON CHIPS ===== */
function PinChip({
  label,
  selected,
  onClick,
  icon: Icon,
}: {
  label: string
  selected: boolean
  onClick: () => void
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-display font-semibold tracking-wide transition-all duration-300"
      style={{
        background: selected
          ? 'linear-gradient(135deg, #00D4C4, #2A6BFF)'
          : 'transparent',
        color: selected ? '#0A0A12' : '#F0F0F5',
        border: selected
          ? '1.5px solid transparent'
          : '1.5px solid rgba(0, 212, 196, 0.3)',
        boxShadow: selected
          ? '0 0 15px rgba(0, 212, 196, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
          : '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      {Icon && <Icon size={14} strokeWidth={2} />}
      {label}
    </motion.button>
  )
}

/* ===== MOOD CARD (for Step 4) ===== */
function MoodCard({
  image,
  liked,
  onToggle,
  index,
}: {
  image: string
  liked: boolean
  onToggle: () => void
  index: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springBounce, delay: 0.1 + index * 0.08 }}
      onClick={onToggle}
      className={`relative rounded-sm overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.4)] ${index % 2 === 0 ? 'mt-0' : 'mt-3'}`}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="w-full h-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Hand-drawn star */}
      {liked && (
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 12 }}
          className="absolute top-1 right-1 z-10"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            style={{ filter: 'drop-shadow(0 0 6px rgba(0, 212, 196, 0.5))' }}>
            <defs>
              <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D4C4" />
                <stop offset="100%" stopColor="#8A2BE2" />
              </linearGradient>
            </defs>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="url(#starGrad)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  )
}

/* ===== NOTEBOOK PAPER ===== */
function NotebookPaper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-sm p-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      style={{
        backgroundColor: '#12121E',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(0, 212, 196, 0.06) 23px, rgba(0, 212, 196, 0.06) 24px)',
        borderLeft: '2px solid rgba(0, 212, 196, 0.15)',
      }}
    >
      {children}
    </div>
  )
}

/* ===== ITINERARY ITEM ===== */
function ItineraryItem({
  time,
  title,
  description,
  icon: Icon,
  isLast = false,
}: {
  time: string
  title: string
  description: string
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  isLast?: boolean
}) {
  return (
    <div className="relative flex gap-3 pb-4">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[7px] top-5 bottom-0 w-[1.5px] bg-brand-cyan/20"
          style={{ background: 'repeating-linear-gradient(0deg, rgba(0, 212, 196, 0.3), rgba(0, 212, 196, 0.3) 3px, transparent 3px, transparent 6px)' }} />
      )}

      {/* Timeline dot */}
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-4 h-4 rounded-full border-2 border-brand-cyan bg-base-bg flex items-center justify-center"
          style={{ boxShadow: '0 0 8px rgba(0, 212, 196, 0.2)' }}>
          {Icon && <Icon size={8} strokeWidth={3} className="text-brand-cyan" />}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-card-bg/60 rounded-sm px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
        style={{ borderLeft: '1px solid rgba(0, 212, 196, 0.08)' }}>
        <span className="text-[10px] font-mono text-brand-cyan/70">{time}</span>
        <p className="text-sm font-display font-semibold text-text-primary mt-0.5">{title}</p>
        <p className="text-xs font-body text-text-secondary mt-0.5">{description}</p>
      </div>
    </div>
  )
}

/* ===== DATA ===== */
const moodImages = [
  { image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=300&q=80' },
  { image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80' },
  { image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300&q=80' },
  { image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&q=80' },
]

const itineraryData = [
  { time: '08:00 AM', title: 'Breakfast at Café Bodega', description: 'Start your day with fresh croissants and local brew', icon: Utensils },
  { time: '10:30 AM', title: 'Explore the Old Quarter', description: 'Wander through colorful streets and hidden alleys', icon: MapPin },
  { time: '01:00 PM', title: 'Lunch by the Beach', description: 'Fresh seafood with ocean views', icon: Sun },
  { time: '04:00 PM', title: 'Sunset Kayaking', description: 'Paddle through calm waters as the sun sets', icon: Umbrella },
]

/* ===== MAIN CHAT COMPONENT ===== */
export default function Plan() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0) // 0=greeting, 1=input, 2=prefs, 3=mood, 4=generating, 5=reveal, 6=refinement
  const [destination, setDestination] = useState('')
  const [showChips, setShowChips] = useState(false)
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([])
  const [likedMoods, setLikedMoods] = useState<number[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReveal, setShowReveal] = useState(false)
  const [checked, setChecked] = useState(false)

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, 100)
  }

  // Auto-scroll on step change
  useEffect(() => { scrollToBottom() }, [step, showChips, showReveal])

  // Step 0: Initial greeting auto-advances
  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => {
      setStep(1)
      scrollToBottom()
      }, 2000)
      return () => clearTimeout(t)
    }
  }, [step])

  const handleDestinationSubmit = () => {
    if (!destination.trim()) return
    setStep(2)

    // Show chips after a beat
    setTimeout(() => {
      setShowChips(true)
      scrollToBottom()
    }, 800)
  }

  const togglePref = (pref: string) => {
    setSelectedPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    )
  }

  const handlePrefsDone = () => {
    if (selectedPrefs.length === 0) return
    setStep(3)
    scrollToBottom()
  }

  const toggleMood = (i: number) => {
    setLikedMoods((prev) =>
      prev.includes(i) ? prev.filter((m) => m !== i) : [...prev, i]
    )
  }

  const handleMoodDone = () => {
    setStep(4)
    setIsGenerating(true)
    scrollToBottom()

    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false)
      setStep(5)
      setTimeout(() => setShowReveal(true), 300)
      scrollToBottom()
    }, 2500)
  }

  const handleRefinement = () => {
    setChecked(true)
    setTimeout(() => {
      setStep(6)
      scrollToBottom()
    }, 600)
  }

  return (
    <div className="relative h-[calc(100dvh-80px)] flex flex-col" style={topoBg}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-[#2A2A3E]/40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-display font-semibold text-text-primary">
              Plan a Trip
            </h1>
            <p className="text-[10px] font-body text-text-secondary -mt-0.5">ROAMIE will build the perfect itinerary</p>
          </div>
          <button onClick={() => navigate('/home')} className="text-[10px] font-display text-text-secondary tracking-wider uppercase hover:text-text-primary transition-colors">
            Cancel
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none">
        {/* Step 0-1: Greeting */}
        {(step >= 0) && (
          <>
            <RoamieBubble delay={0.2}>
              <p className="font-handwritten text-base gradient-text font-medium">
                Where are you thinking? 🌍
              </p>
            </RoamieBubble>

            {/* Destination input bubble */}
            {step >= 1 && (
              <UserBubble delay={0.3}>
                {step === 1 ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleDestinationSubmit()}
                      placeholder="Type a destination..."
                      className="w-full bg-transparent text-sm text-white placeholder-white/40 font-body outline-none"
                      autoFocus
                      style={{ fontFamily: "'Caveat', cursive", fontSize: '16px', minWidth: '140px' }}
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDestinationSubmit}
                      className="flex-shrink-0"
                      disabled={!destination.trim()}
                      style={{ opacity: destination.trim() ? 1 : 0.4 }}
                    >
                      <ArrowRight size={18} strokeWidth={2.5} />
                    </motion.button>
                  </div>
                ) : (
                  <span style={{ fontFamily: "'Caveat', cursive", fontSize: '16px' }}>{destination} ✨</span>
                )}
              </UserBubble>
            )}
          </>
        )}

        {/* Step 2: Preferences */}
        {step >= 2 && (
          <>
            <RoamieBubble delay={0.2}>
              <div>
                <p className="font-handwritten text-sm gradient-text font-medium">
                  Ooh {destination}! Great pick! 🎉
                </p>
                <p className="font-body text-xs text-text-secondary mt-1">
                  What kind of trip are we talking?
                </p>
              </div>
            </RoamieBubble>

            {showChips && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2"
              >
                <PinChip label="Budget Friendly" icon={IndianRupee} selected={selectedPrefs.includes('budget')} onClick={() => togglePref('budget')} />
                <PinChip label="Moderate" icon={Clock} selected={selectedPrefs.includes('moderate')} onClick={() => togglePref('moderate')} />
                <PinChip label="Luxury" icon={Star} selected={selectedPrefs.includes('luxury')} onClick={() => togglePref('luxury')} />
                <PinChip label="3 Days" icon={Calendar} selected={selectedPrefs.includes('3days')} onClick={() => togglePref('3days')} />
                <PinChip label="5 Days" icon={Calendar} selected={selectedPrefs.includes('5days')} onClick={() => togglePref('5days')} />
                <PinChip label="7 Days" icon={Calendar} selected={selectedPrefs.includes('7days')} onClick={() => togglePref('7days')} />
                <PinChip label="Adventure" icon={Mountain} selected={selectedPrefs.includes('adventure')} onClick={() => togglePref('adventure')} />
                <PinChip label="Relaxation" icon={Umbrella} selected={selectedPrefs.includes('relax')} onClick={() => togglePref('relax')} />
                <PinChip label="Nightlife" icon={Moon} selected={selectedPrefs.includes('nightlife')} onClick={() => togglePref('nightlife')} />
              </motion.div>
            )}

            {selectedPrefs.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePrefsDone}
                className="self-end flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-display font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #00D4C4, #2A6BFF)',
                  boxShadow: '0 0 15px rgba(0, 212, 196, 0.2)',
                }}
              >
                Got it!
                <ArrowRight size={14} strokeWidth={2.5} />
              </motion.button>
            )}
          </>
        )}

        {/* Step 3: Mood Board */}
        {step >= 3 && (
          <>
            <RoamieBubble delay={0.2}>
              <p className="font-handwritten text-sm gradient-text font-medium">
                Love the choices! Now show me what speaks to your soul ✨
              </p>
              <p className="font-body text-xs text-text-secondary mt-1">Tap the ones that give you wanderlust</p>
            </RoamieBubble>

            <div className="grid grid-cols-2 gap-2.5 max-w-sm">
              {moodImages.map((m, i) => (
                <MoodCard key={i} {...m} index={i} liked={likedMoods.includes(i)} onToggle={() => toggleMood(i)} />
              ))}
            </div>

            {likedMoods.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMoodDone}
                className="self-end flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-display font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #00D4C4, #2A6BFF)',
                  boxShadow: '0 0 15px rgba(0, 212, 196, 0.2)',
                }}
              >
                Build my trip!
                <Compass size={14} strokeWidth={2.5} />
              </motion.button>
            )}
          </>
        )}

        {/* Step 4: Generating */}
        {step >= 4 && (
          <>
            {isGenerating && (
              <>
                <RoamieBubble delay={0.1}>
                  <p className="font-handwritten text-sm gradient-text">Give me a sec... I'm weaving magic for you 🪄</p>
                </RoamieBubble>
                <TypingDots />
                {/* Spinning compass */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center py-4"
                >
                  <div className="relative">
                    <div className="absolute inset-0 animate-pulse-glow rounded-full"
                      style={{ transform: 'scale(1.3)' }} />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Compass size={40} strokeWidth={1.5} className="text-brand-cyan"
                        style={{ filter: 'drop-shadow(0 0 15px rgba(0, 212, 196, 0.3))' }} />
                    </motion.div>
                  </div>
                </motion.div>
              </>
            )}

            {/* Step 5: Reveal */}
            {showReveal && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <RoamieBubble delay={0.1}>
                  <p className="font-handwritten text-base gradient-text font-medium mb-1">
                    Your {destination} adventure awaits! 🎉
                  </p>
                  <p className="text-[10px] font-body text-text-secondary">Here's your custom itinerary</p>
                </RoamieBubble>

                {/* Itinerary on notebook paper */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <NotebookPaper>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-handwritten text-base gradient-text font-medium">{destination} Itinerary</h3>
                      <span className="font-handwritten text-xs gradient-text">Day 1</span>
                    </div>
                    {itineraryData.map((item, i) => (
                      <ItineraryItem key={i} {...item} isLast={i === itineraryData.length - 1} />
                    ))}
                  </NotebookPaper>
                </motion.div>

                {/* Step 6: Refinement checkbox */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-3 flex items-center justify-center"
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefinement}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-card-bg border border-brand-cyan/20 shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                  >
                    <div className="w-5 h-5 rounded-sm flex items-center justify-center"
                      style={{
                        border: checked ? 'none' : '1.5px solid rgba(0, 212, 196, 0.4)',
                        background: checked ? 'linear-gradient(135deg, #00D4C4, #2A6BFF)' : 'transparent',
                      }}>
                      {checked && (
                        <motion.svg
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3 }}
                          width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </motion.svg>
                      )}
                    </div>
                    <span className="text-xs font-display font-semibold text-text-primary tracking-wide">
                      Looks great!
                    </span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Completion */}
            {step === 6 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-3"
              >
                <RoamieBubble delay={0.1}>
                  <p className="font-handwritten text-sm gradient-text">
                    Amazing! Your trip is saved. Ready to explore more? 🎒
                  </p>
                </RoamieBubble>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/trips')}
                  className="mt-3 px-6 py-2.5 rounded-full text-xs font-display font-semibold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                    boxShadow: '0 0 20px rgba(0, 212, 196, 0.3), 0 4px 15px rgba(0,0,0,0.3)',
                  }}
                >
                  View My Trips
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
