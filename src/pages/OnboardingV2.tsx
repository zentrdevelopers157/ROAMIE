import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import StickyNote from '../components/StickyNote'
import { useRoamie } from '../store/RoamieContext'

/* ===== SPRING ===== */
const springSnap = { type: 'spring' as const, stiffness: 300, damping: 20 }

/* ===== 28 DESTINATION KINDS ===== */
const destKinds = [
  { label: 'Beaches', emoji: '🏖️' },
  { label: 'Islands', emoji: '🏝️' },
  { label: 'Lakes', emoji: '🏞️' },
  { label: 'Rivers', emoji: '💧' },
  { label: 'Fjords', emoji: '🏔️' },
  { label: 'Glaciers', emoji: '🧊' },
  { label: 'Waterfalls', emoji: '🌊' },
  { label: 'Wetlands', emoji: '🌿' },
  { label: 'Mountain Ranges', emoji: '⛰️' },
  { label: 'Hill Stations', emoji: '🌲' },
  { label: 'Volcanoes', emoji: '🌋' },
  { label: 'Canyons', emoji: '🏜️' },
  { label: 'Gorges', emoji: '⛰️' },
  { label: 'Deserts', emoji: '🐪' },
  { label: 'Salt Flats', emoji: '🧂' },
  { label: 'Savannas', emoji: '🦁' },
  { label: 'Grasslands', emoji: '🌾' },
  { label: 'Plateaus', emoji: '🗻' },
  { label: 'Steppes', emoji: '🌄' },
  { label: 'Rainforests', emoji: '🌴' },
  { label: 'Jungles', emoji: '🦧' },
  { label: 'Forests', emoji: '🌳' },
  { label: 'National Parks', emoji: '🦌' },
  { label: 'Metropolises', emoji: '🌆' },
  { label: 'Heritage Cities', emoji: '🏛️' },
  { label: 'Pilgrimage Towns', emoji: '🕉️' },
  { label: 'Countryside', emoji: '🌻' },
  { label: 'Wine Region', emoji: '🍷' },
]

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

/* ===== DEST KIND CARD (torn notebook scrap) ===== */
function DestKindCard({
  label,
  emoji,
  selected,
  onToggle,
  index,
}: {
  label: string
  emoji: string
  selected: boolean
  onToggle: () => void
  index: number
}) {
  const rotations = [-2, 1, -1, 2, -0.5, 1.5, -1.5, 0.5]
  const topMargins = [0, 12, -4, 8, 4, -2, 14, 6]

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springSnap, delay: 0.02 * index }}
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      className="relative break-inside-avoid cursor-pointer text-left"
      style={{
        marginTop: `${topMargins[index % topMargins.length]}px`,
        transform: `rotate(${rotations[index % rotations.length]}deg)`,
      }}
    >
      <div
        className="relative px-2.5 py-2 rounded-sm shadow-[0_3px_12px_rgba(0,0,0,0.3)]"
        style={{
          background: selected
            ? 'linear-gradient(135deg, rgba(0, 212, 196, 0.15), rgba(42, 107, 255, 0.1))'
            : '#14141F',
          border: selected
            ? '1px solid rgba(0, 212, 196, 0.4)'
            : '1px solid rgba(42, 42, 62, 0.3)',
          clipPath: 'polygon(0% 0%, 98% 0%, 100% 4%, 100% 96%, 96% 100%, 0% 100%)',
        }}
      >
        {/* Torn edge effect */}
        <div className="absolute right-0 top-0 w-[4px] h-full pointer-events-none">
          <svg width="4" height="100%" viewBox="0 0 4 200" preserveAspectRatio="none" className="h-full w-full">
            <path d="M4,0 C2,2 3,5 1,8 C0,10 2,13 0,16 C2,19 1,22 3,25 L4,200 L0,200 L0,0 Z" fill={selected ? 'rgba(0,212,196,0.15)' : '#14141F'} />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span
            className="text-[11px] font-display font-semibold leading-tight"
            style={{ color: selected ? '#00D4C4' : '#C0C0D5' }}
          >
            {label}
          </span>
          {selected && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto text-brand-cyan text-xs"
            >
              ✓
            </motion.span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

/* ===== STEP 3: CINEMATIC INTRO ===== */
function CinematicIntro({ onDone }: { onDone: () => void }) {
  const [showLogo, setShowLogo] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowLogo(true), 3000)
    const t2 = setTimeout(() => {
      setFadeOut(true)
      setTimeout(onDone, 800)
    }, 5000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
    >
      {/* CSS 3D Earth */}
      <div
        className="absolute w-72 h-72 rounded-full"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&q=60&fm=webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'spinEarth 20s linear infinite',
          transformStyle: 'preserve-3d',
          perspective: '800px',
          boxShadow: '0 0 60px rgba(0, 212, 196, 0.15), inset 0 0 80px rgba(0,0,0,0.5)',
        }}
      />
      <style>{`
        @keyframes spinEarth {
          from { transform: rotateY(0deg) rotateX(10deg); }
          to { transform: rotateY(360deg) rotateX(10deg); }
        }
        @keyframes flyPath {
          0% { left: -10%; top: 30%; transform: rotate(0deg) scale(0.8); opacity: 0; }
          10% { opacity: 1; }
          30% { left: 30%; top: 20%; transform: rotate(-10deg) scale(1); }
          50% { left: 50%; top: 35%; transform: rotate(5deg) scale(1); }
          70% { left: 70%; top: 25%; transform: rotate(-5deg) scale(1); }
          90% { opacity: 1; }
          100% { left: 110%; top: 40%; transform: rotate(10deg) scale(0.8); opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(0, 212, 196, 0.3), 0 0 60px rgba(42, 107, 255, 0.15); }
          50% { box-shadow: 0 0 50px rgba(0, 212, 196, 0.5), 0 0 100px rgba(42, 107, 255, 0.3), 0 0 150px rgba(138, 43, 226, 0.15); }
        }
      `}</style>

      {/* Flying Airplane */}
      <div
        className="absolute text-2xl z-10"
        style={{
          animation: 'flyPath 4s ease-in-out infinite',
          filter: 'drop-shadow(0 0 10px rgba(0, 212, 196, 0.5))',
        }}
      >
        ✈️
      </div>

      {/* ROAMIE Logo */}
      <AnimatePresence>
        {showLogo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 150, damping: 15 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                animation: 'glowPulse 2s ease-in-out infinite',
              }}
            >
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                <rect x="22" y="32" width="56" height="48" rx="8" fill="#0A0A12" opacity="0.9" />
                <path d="M22 48h56v3H22z" fill="#00D4C4" opacity="0.25" />
                <rect x="40" y="24" width="20" height="10" rx="5" fill="#0A0A12" opacity="0.8" />
                <rect x="22" y="36" width="6" height="32" rx="3" fill="#0A0A12" opacity="0.6" />
                <rect x="72" y="36" width="6" height="32" rx="3" fill="#0A0A12" opacity="0.6" />
              </svg>
            </div>
            <h1
              className="font-display font-bold text-4xl tracking-wider text-white"
              style={{ textShadow: '0 0 30px rgba(0, 212, 196, 0.3)' }}
            >
              ROAMIE
            </h1>
            <p className="font-handwritten text-lg gradient-text mt-2">
              Let the journey begin
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ===== MAIN ONBOARDING V2 ===== */
export default function OnboardingV2() {
  const navigate = useNavigate()
  const { dispatch, state } = useRoamie()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [selectedKinds, setSelectedKinds] = useState<string[]>(state.selectedDestKinds || [])
  const [userName, setUserName] = useState(state.name || '')
  const [aiNickname, setAiNickname] = useState(state.nickname || '')
  const [nameFocused, setNameFocused] = useState(false)
  const [nicknameFocused, setNicknameFocused] = useState(false)
  const [showCinematic, setShowCinematic] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState(false)

  const toggleKind = (label: string) => {
    setSelectedKinds((prev) =>
      prev.includes(label) ? prev.filter((k) => k !== label) : [...prev, label],
    )
  }

  const goNext = () => {
    if (step < 2) {
      setDirection(1)
      setStep((s) => s + 1)
    } else {
      // Save all onboarding data
      dispatch({ type: 'SET_NAME', payload: userName })
      dispatch({ type: 'SET_NICKNAME', payload: aiNickname })
      dispatch({ type: 'SET_DEST_KINDS', payload: selectedKinds })
      dispatch({ type: 'COMPLETE_ONBOARDING' })
      setShowCinematic(true)
    }
  }

  const handleCinematicDone = () => {
    setOnboardingDone(true)
    navigate('/home')
  }

  const goBack = () => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  const canProceed =
    step === 0 ? selectedKinds.length > 0 :
    step === 1 ? userName.trim().length > 0 && aiNickname.trim().length > 0 :
    true

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 120, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -120, opacity: 0 }),
  }

  return (
    <div className="relative min-h-screen bg-base-bg flex flex-col px-4 pt-8 pb-8">
      {/* Cinematic overlay */}
      {showCinematic && !onboardingDone && <CinematicIntro onDone={handleCinematicDone} />}

      {/* Skip button */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/home')}
          className="text-[9px] font-display text-[#555570] underline tracking-wider hover:text-text-primary transition-colors"
        >
          Skip Onboarding →
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/home')}
          className="text-[11px] font-display text-text-secondary tracking-wider uppercase hover:text-text-primary transition-colors"
        >
          Skip
        </motion.button>
      </div>

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
        <StepIndicator current={step} total={2} />
        <div className="w-5" />
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
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
            {/* ===== STEP 1: Destination Kinds ===== */}
            {step === 0 && (
              <div>
                <h2 className="font-display text-xl font-bold text-text-primary mb-1">
                  What calls to your <span className="gradient-text">soul</span>?
                </h2>
                <p className="font-body text-xs text-text-secondary mb-4">
                  Pick the kinds of places you dream about
                </p>

                <div
                  className="overflow-y-auto pb-4"
                  style={{
                    columnCount: 2,
                    columnGap: '10px',
                  }}
                >
                  {destKinds.map((kind, i) => (
                    <DestKindCard
                      key={kind.label}
                      label={kind.label}
                      emoji={kind.emoji}
                      selected={selectedKinds.includes(kind.label)}
                      onToggle={() => toggleKind(kind.label)}
                      index={i}
                    />
                  ))}
                </div>

                {selectedKinds.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-handwritten text-sm gradient-text text-center mt-2"
                  >
                    {selectedKinds.length} kind{selectedKinds.length > 1 ? 's' : ''} selected ✨
                  </motion.p>
                )}
              </div>
            )}

            {/* ===== STEP 2: Names ===== */}
            {step === 1 && (
              <div className="flex flex-col justify-center min-h-[50vh]">
                <h2 className="font-display text-xl font-bold text-text-primary mb-1">
                  Let's get <span className="gradient-text">personal</span>
                </h2>
                <p className="font-body text-xs text-text-secondary mb-8">
                  I want to know you better
                </p>

                {/* Ruled paper background */}
                <div
                  className="relative rounded-sm p-5 mb-6"
                  style={{
                    background: '#12121E',
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(0, 212, 196, 0.06) 27px, rgba(0, 212, 196, 0.06) 28px)`,
                    borderLeft: '2px solid rgba(0, 212, 196, 0.12)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Input 1: User name */}
                  <div className="mb-8">
                    <p className="font-handwritten text-sm gradient-text mb-2">
                      What should I call you?
                    </p>
                    <div
                      className="relative"
                      style={{
                        borderBottom: nameFocused
                          ? '1.5px solid rgba(0, 212, 196, 0.6)'
                          : '1.5px solid rgba(0, 212, 196, 0.15)',
                        transition: 'border-color 0.3s ease',
                      }}
                    >
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
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                        placeholder="Your name..."
                        className="w-full bg-transparent px-2 py-2 text-base text-text-primary placeholder-text-secondary/60 outline-none"
                        style={{ fontFamily: "'Caveat', cursive", fontSize: '20px' }}
                      />
                    </div>
                  </div>

                  {/* Input 2: AI nickname */}
                  <div>
                    <p className="font-handwritten text-sm gradient-text mb-2">
                      What nickname will you give me?
                    </p>
                    <div
                      className="relative"
                      style={{
                        borderBottom: nicknameFocused
                          ? '1.5px solid rgba(0, 212, 196, 0.6)'
                          : '1.5px solid rgba(0, 212, 196, 0.15)',
                        transition: 'border-color 0.3s ease',
                      }}
                    >
                      {nicknameFocused && (
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
                        value={aiNickname}
                        onChange={(e) => setAiNickname(e.target.value)}
                        onFocus={() => setNicknameFocused(true)}
                        onBlur={() => setNicknameFocused(false)}
                        placeholder="e.g. Travel Buddy, Navigator, Roamie..."
                        className="w-full bg-transparent px-2 py-2 text-base text-text-primary placeholder-text-secondary/60 outline-none"
                        style={{ fontFamily: "'Caveat', cursive", fontSize: '20px' }}
                      />
                    </div>
                  </div>
                </div>

                <StickyNote rotate={1} className="max-w-xs mx-auto">
                  <p className="font-handwritten text-sm gradient-text text-center">
                    These names will be our secret code 🤫
                  </p>
                </StickyNote>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action */}
      <div className="mt-auto pt-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={goNext}
          disabled={!canProceed}
          className="relative w-full py-3.5 rounded-full text-white font-display font-semibold text-sm tracking-wider transition-all duration-300 overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
            boxShadow: step === 2
              ? '0 4px 25px rgba(0, 212, 196, 0.3), 0 0 40px rgba(42, 107, 255, 0.15)'
              : '0 4px 20px rgba(0, 212, 196, 0.2)',
          }}
        >
          {step === 2 ? (
            <span className="flex items-center justify-center gap-2">
              Begin Your Journey 🎒
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
