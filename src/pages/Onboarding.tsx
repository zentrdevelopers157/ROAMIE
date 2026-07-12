import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import WashiTape from '../components/WashiTape'
import StickyNote from '../components/StickyNote'
import { useRoamie } from '../store/RoamieContext'

/* ===== SPRING ===== */
const springSnap = { type: 'spring' as const, stiffness: 300, damping: 20 }

/* ===== SKETCHED BACKPACK (small) ===== */
function SketchedBackpack({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sketchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4C4" />
          <stop offset="50%" stopColor="#2A6BFF" />
          <stop offset="100%" stopColor="#8A2BE2" />
        </linearGradient>
      </defs>
      <path d="M24 36h52v44a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4V36z"
        stroke="url(#sketchGrad)" strokeWidth={1.8} fill="none" opacity="0.9"
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 1.5" />
      <path d="M42 28h16c3 0 4 2 4 4v4H38v-4c0-2 1-4 4-4z"
        stroke="url(#sketchGrad)" strokeWidth={1.5} fill="none"
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 1" />
      <path d="M24 38l-4 30" stroke="url(#sketchGrad)" strokeWidth={1.5} fill="none" opacity="0.7"
        strokeLinecap="round" strokeDasharray="3 2" />
      <path d="M76 38l4 30" stroke="url(#sketchGrad)" strokeWidth={1.5} fill="none" opacity="0.7"
        strokeLinecap="round" strokeDasharray="3 2" />
      <circle cx="68" cy="40" r="5" stroke="url(#sketchGrad)" strokeWidth={1}
        fill="none" strokeDasharray="1.5 1" />
      <line x1="68" y1="37" x2="68" y2="43" stroke="url(#sketchGrad)" strokeWidth={0.8}
        strokeDasharray="1 1" />
      <line x1="65" y1="40" x2="71" y2="40" stroke="url(#sketchGrad)" strokeWidth={0.8}
        strokeDasharray="1 1" />
    </svg>
  )
}

/* ===== VIBE CARD (for Step 2) ===== */
const vibeData = [
  { label: 'Beach Bum', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=85&fm=webp', tape: 'cyan' as const },
  { label: 'Mountain Soul', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=85&fm=webp', tape: 'purple' as const },
  { label: 'City Explorer', image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=85&fm=webp', tape: 'cyan' as const },
  { label: 'Road Tripper', image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=600&q=85&fm=webp', tape: 'purple' as const },
  { label: 'Foodie', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=85&fm=webp', tape: 'cyan' as const },
  { label: 'Culture Seeker', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=85&fm=webp', tape: 'purple' as const },
]

function VibeCard({
  label,
  image,
  tape,
  selected,
  onToggle,
  index,
}: {
  label: string
  image: string
  tape: 'cyan' | 'purple'
  selected: boolean
  onToggle: () => void
  index: number
}) {
  const rowOffset = index < 3 ? (index % 2 === 0 ? 0 : 6) : (index % 2 === 0 ? 4 : 0)

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springSnap, delay: 0.1 + index * 0.06 }}
      onClick={onToggle}
      className="relative rounded-sm overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.4)] focus:outline-none"
      style={{ marginTop: `${rowOffset}px` }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Photo */}
      <div
        className="w-full h-24 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Washi tape */}
      <WashiTape color={tape} rotate={tape === 'cyan' ? -2 : 1.5} className="-top-1 left-2" size="sm" />

      {/* Selection circle */}
      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0 pointer-events-none">
            <defs>
              <linearGradient id="circleStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00D4C4" />
                <stop offset="100%" stopColor="#8A2BE2" />
              </linearGradient>
              <filter id="circleGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle cx="50" cy="50" r="44" fill="none" stroke="url(#circleStroke)"
              strokeWidth="3" strokeDasharray="8 4"
              filter="url(#circleGlow)"
              style={{ opacity: 0.8 }} />
          </svg>
          {/* Checkmark */}
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                boxShadow: '0 0 15px rgba(0, 212, 196, 0.4)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Label */}
      <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
        <p className="text-[10px] font-display font-semibold text-white truncate drop-shadow-lg">
          {label}
        </p>
      </div>
    </motion.button>
  )
}

/* ===== RULER SLIDER (for Step 3) ===== */
function RulerSlider({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  const percent = ((value - min) / (max - min)) * 100
  const marks = Array.from({ length: max - min + 1 }, (_, i) => i + min)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-display font-semibold text-text-secondary">{label}</span>
        <motion.span
          key={value}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          className="text-sm font-handwritten gradient-text font-medium"
        >
          {value}/10
        </motion.span>
      </div>
      <div className="relative h-10">
        {/* Ruler track */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-card-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full animate-gradient-shift"
            style={{
              width: `${percent}%`,
              background: 'linear-gradient(90deg, #00D4C4, #2A6BFF, #8A2BE2)',
              backgroundSize: '200% 200%',
              boxShadow: '0 0 8px rgba(0, 212, 196, 0.3)',
            }}
          />
        </div>

        {/* Ruler markings */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-0.5 pointer-events-none">
          {marks.map((m) => {
            const isMajor = m % 2 === 0
            return (
              <div
                key={m}
                className="flex flex-col items-center"
                style={{ width: `${100 / (max - min)}%` }}
              >
                <div
                  className={`${isMajor ? 'h-3' : 'h-1.5'} w-[1px] bg-text-secondary/30`}
                  style={{ marginTop: isMajor ? '-6px' : '0' }}
                />
              </div>
            )
          })}
        </div>

        {/* Custom thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
          aria-label={label}
        />

        {/* Visual thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full z-20 pointer-events-none"
          style={{
            left: `calc(${percent}% - 8px)`,
            background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
            boxShadow: '0 0 12px rgba(0, 212, 196, 0.4), 0 2px 8px rgba(0,0,0,0.3)',
          }}
          animate={{ left: `calc(${percent}% - 8px)` }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
      </div>
    </div>
  )
}

/* ===== STEP INDICATOR ===== */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: total }, (_, i) => (
        <motion.div
          key={i}
          className="h-1 rounded-full"
          style={{
            width: i === current ? '24px' : '8px',
            background: i <= current
              ? 'linear-gradient(90deg, #00D4C4, #2A6BFF)'
              : '#2A2A3E',
            boxShadow: i <= current ? '0 0 6px rgba(0, 212, 196, 0.3)' : 'none',
          }}
          animate={{ width: i === current ? '24px' : '8px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      ))}
    </div>
  )
}

/* ===== ONBOARDING COMPONENT ===== */
export default function Onboarding() {
  const navigate = useNavigate()
  const { dispatch } = useRoamie()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [selectedVibes, setSelectedVibes] = useState<number[]>([])
  const [adventureLevel, setAdventureLevel] = useState(5)
  const [socialLevel, setSocialLevel] = useState(6)
  const [name, setName] = useState('')
  const [nameFocused, setNameFocused] = useState(false)

  const toggleVibe = (i: number) => {
    setSelectedVibes((prev) =>
      prev.includes(i) ? prev.filter((v) => v !== i) : [...prev, i]
    )
  }

  const goNext = () => {
    if (step < 2) {
      setDirection(1)
      setStep((s) => s + 1)
    } else {
      // Save all onboarding data to context
      dispatch({ type: 'SET_NAME', payload: name })
      dispatch({ type: 'SET_VIBES', payload: selectedVibes })
      dispatch({ type: 'SET_ADVENTURE_LEVEL', payload: adventureLevel })
      dispatch({ type: 'SET_SOCIAL_LEVEL', payload: socialLevel })
      dispatch({ type: 'COMPLETE_ONBOARDING' })
      navigate('/home')
    }
  }

  const goBack = () => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  const canProceed =
    step === 0 ? true :
    step === 1 ? selectedVibes.length > 0 :
    name.trim().length > 0

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 120, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -120, opacity: 0 }),
  }

  return (
    <div className="relative min-h-screen bg-base-bg flex flex-col px-5 pt-12 pb-8">
      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/home')}
        className="absolute top-4 right-4 z-20 text-[11px] font-display text-text-secondary tracking-wider uppercase hover:text-text-primary transition-colors"
      >
        Skip
      </motion.button>

      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-between">
        {step > 0 ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={goBack}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </motion.button>
        ) : (
          <div className="w-5" />
        )}
        <StepIndicator current={step} total={3} />
        <div className="w-5" />
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="w-full"
          >
            {/* ===== STEP 1: Meet ROAMIE ===== */}
            {step === 0 && (
              <div className="flex flex-col items-center px-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                  className="mb-6"
                >
                  <SketchedBackpack size={80} />
                </motion.div>

                <h2 className="font-display text-2xl font-bold text-text-primary text-left w-full mb-2">
                  Meet <span className="gradient-text">ROAMIE</span>
                </h2>

                <p className="font-body text-sm text-text-secondary leading-relaxed text-left w-full mb-6">
                  I'm not a planner. I'm your travel soulmate.
                </p>

                <StickyNote rotate={-1}>
                  <div className="flex items-start gap-2">
                    <span className="text-brand-cyan text-lg" aria-hidden="true">💭</span>
                    <p className="font-handwritten text-sm gradient-text leading-relaxed">
                      I remember the cafe you loved in Goa. Let's find more.
                    </p>
                  </div>
                </StickyNote>
              </div>
            )}

            {/* ===== STEP 2: Your Travel Vibe ===== */}
            {step === 1 && (
              <div className="px-1">
                <h2 className="font-display text-2xl font-bold text-text-primary mb-1">
                  Your Travel <span className="gradient-text">Vibe</span>
                </h2>
                <p className="font-body text-xs text-text-secondary mb-5">
                  Pick what speaks to your soul
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {vibeData.map((vibe, i) => (
                    <VibeCard
                      key={i}
                      {...vibe}
                      index={i}
                      selected={selectedVibes.includes(i)}
                      onToggle={() => toggleVibe(i)}
                    />
                  ))}
                </div>

                {selectedVibes.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-handwritten text-sm gradient-text text-center mt-4"
                  >
                    {selectedVibes.length} vibe{selectedVibes.length > 1 ? 's' : ''} selected ✨
                  </motion.p>
                )}
              </div>
            )}

            {/* ===== STEP 3: Your Travel DNA ===== */}
            {step === 2 && (
              <div className="px-1">
                <h2 className="font-display text-2xl font-bold text-text-primary mb-1">
                  Your Travel <span className="gradient-text">DNA</span>
                </h2>
                <p className="font-body text-xs text-text-secondary mb-7">
                  Help me know you better
                </p>

                {/* Adventure slider */}
                <div className="mb-6">
                  <RulerSlider
                    label="Adventure Level"
                    value={adventureLevel}
                    onChange={setAdventureLevel}
                  />
                </div>

                {/* Social slider */}
                <div className="mb-7">
                  <RulerSlider
                    label="Social Butterfly"
                    value={socialLevel}
                    onChange={setSocialLevel}
                  />
                </div>

                {/* Name input */}
                <div className="relative">
                  <label className="text-xs font-display font-semibold text-text-secondary mb-2 block">
                    What should I call you?
                  </label>
                  <div
                    className="relative bg-card-bg rounded-sm overflow-hidden transition-all duration-500"
                    style={{
                      borderBottom: nameFocused
                        ? '1.5px solid rgba(0, 212, 196, 0.6)'
                        : '1.5px solid rgba(0, 212, 196, 0.15)',
                      boxShadow: nameFocused
                        ? '0 2px 20px rgba(0, 212, 196, 0.08)'
                        : 'none',
                      transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    }}
                  >
                    {/* Ink spread underline */}
                    {nameFocused && (
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="absolute bottom-0 left-0 h-[1.5px]"
                        style={{
                          background: 'linear-gradient(90deg, #00D4C4, #2A6BFF, #8A2BE2)',
                          boxShadow: '0 0 8px rgba(0, 212, 196, 0.3)',
                        }}
                      />
                    )}
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                      placeholder="Your name..."
                      className="w-full bg-transparent px-3 py-3 text-sm text-text-primary placeholder-text-secondary/60 font-body outline-none"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: '18px' }}
                      aria-label="Your name"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action */}
      <div className="mt-auto pt-4">
        {/* Continue / Let's Roam button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={goNext}
          disabled={!canProceed}
          className="relative w-full py-3.5 rounded-full text-white font-display font-semibold text-sm tracking-wider transition-all duration-300 overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
          style={
            step === 2
              ? {
                  background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                  boxShadow: '0 4px 25px rgba(0, 212, 196, 0.3), 0 0 40px rgba(42, 107, 255, 0.15)',
                }
              : {
                  background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                  boxShadow: '0 4px 20px rgba(0, 212, 196, 0.2)',
                }
          }
        >
          {step === 2 ? (
            <span className="flex items-center justify-center gap-2">
              Let's Roam!
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                🎒
              </motion.span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Continue
              <ChevronRight size={16} strokeWidth={2.5} />
            </span>
          )}
        </motion.button>
      </div>
    </div>
  )
}
