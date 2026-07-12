import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/* ===== TYPEWRITER HOOK ===== */
function useTypewriter(text: string, speed: number = 80) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(interval)
    // Re-run if text changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed])

  return { displayed, done }
}

/* ===== CURSOR BLINK ===== */
function Cursor() {
  return (
    <motion.span
      className="inline-block w-[3px] h-[1.1em] bg-text-primary ml-0.5 align-middle"
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/* ===== BACKPACK ICON SVG ===== */
function BackpackIcon({ size = 80, sketched = false }: { size?: number; sketched?: boolean }) {
  const strokeW = sketched ? 1.8 : 2

  if (sketched) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sketchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4C4" />
            <stop offset="50%" stopColor="#2A6BFF" />
            <stop offset="100%" stopColor="#8A2BE2" />
          </linearGradient>
        </defs>
        {/* Backpack body - hand-sketched style with multiple strokes */}
        <path d="M24 36h52v44a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4V36z"
          stroke="url(#sketchGrad)" strokeWidth={strokeW} fill="none" opacity="0.9"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="3 1.5" />
        <path d="M26 38h48v40a3 3 0 0 1-3 3H29a3 3 0 0 1-3-3V38z"
          stroke="url(#sketchGrad)" strokeWidth={0.8} fill="none" opacity="0.4"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* Top handle */}
        <path d="M42 28h16c3 0 4 2 4 4v4H38v-4c0-2 1-4 4-4z"
          stroke="url(#sketchGrad)" strokeWidth={strokeW} fill="none"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="2 1" />
        {/* Straps */}
        <path d="M24 38l-4 30" stroke="url(#sketchGrad)" strokeWidth={strokeW} fill="none" opacity="0.7"
          strokeLinecap="round" strokeDasharray="3 2" />
        <path d="M76 38l4 30" stroke="url(#sketchGrad)" strokeWidth={strokeW} fill="none" opacity="0.7"
          strokeLinecap="round" strokeDasharray="3 2" />
        {/* Front pocket */}
        <path d="M34 46h32v22a2 2 0 0 1-2 2H36a2 2 0 0 1-2-2V46z"
          stroke="url(#sketchGrad)" strokeWidth={strokeW - 0.3} fill="none" opacity="0.6"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="2 1.5" />
        {/* Buckle details */}
        <circle cx="40" cy="54" r="3" stroke="url(#sketchGrad)" strokeWidth={1}
          fill="none" strokeDasharray="1.5 1" />
        <circle cx="60" cy="54" r="3" stroke="url(#sketchGrad)" strokeWidth={1}
          fill="none" strokeDasharray="1.5 1" />
        {/* Compass */}
        <circle cx="68" cy="40" r="5" stroke="url(#sketchGrad)" strokeWidth={1}
          fill="none" strokeDasharray="1.5 1" />
        <line x1="68" y1="37" x2="68" y2="43" stroke="url(#sketchGrad)" strokeWidth={0.8}
          strokeDasharray="1 1" />
        <line x1="65" y1="40" x2="71" y2="40" stroke="url(#sketchGrad)" strokeWidth={0.8}
          strokeDasharray="1 1" />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4C4" />
          <stop offset="50%" stopColor="#2A6BFF" />
          <stop offset="100%" stopColor="#8A2BE2" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Backpack body */}
      <rect x="22" y="32" width="56" height="50" rx="10" fill="url(#iconGrad)" opacity="0.9" />
      {/* Backpack flap */}
      <path d="M22 48h56v4H22z" fill="#0A0A12" opacity="0.3" />
      {/* Backpack top handle */}
      <rect x="40" y="24" width="20" height="10" rx="5" fill="url(#iconGrad)" opacity="0.8" />
      {/* Straps */}
      <rect x="22" y="35" width="6" height="35" rx="3" fill="url(#iconGrad)" opacity="0.6" />
      <rect x="72" y="35" width="6" height="35" rx="3" fill="url(#iconGrad)" opacity="0.6" />
      {/* Front pocket */}
      <rect x="32" y="42" width="36" height="30" rx="6" fill="#0A0A12" opacity="0.25" />
      {/* Buckle */}
      <circle cx="38" cy="52" r="3" fill="#00D4C4" opacity="0.8" />
      <circle cx="62" cy="52" r="3" fill="#00D4C4" opacity="0.8" />
      {/* Compass */}
      <circle cx="68" cy="38" r="5" fill="none" stroke="#00D4C4" strokeWidth="1.5" opacity="0.7" />
      <line x1="68" y1="34" x2="68" y2="42" stroke="#00D4C4" strokeWidth="0.8" opacity="0.7" />
      <line x1="64" y1="38" x2="72" y2="38" stroke="#00D4C4" strokeWidth="0.8" opacity="0.7" />
    </svg>
  )
}

/* ===== SPLASH SCREEN ===== */
export default function Splash() {
  const navigate = useNavigate()
  const [showContent, setShowContent] = useState(false)
  const [showButton, setShowButton] = useState(false)

  const { displayed: titleText, done: titleDone } = useTypewriter('ROAMIE', 100)
  const { displayed: taglineText } = useTypewriter('You dream it. We Roam it.', 35)

  // Sequence: icon fades in -> title types -> tagline types -> button appears
  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 400)
    return () => clearTimeout(t1)
  }, [])

  // Watch for tagline completion
  useEffect(() => {
    if (taglineText.length >= 'You dream it. We Roam it.'.length) {
      const t = setTimeout(() => setShowButton(true), 600)
      return () => clearTimeout(t)
    }
  }, [taglineText])

  return (
    <div className="relative min-h-screen bg-base-bg flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Breathing gradient orbs in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-[0.04] animate-gradient-shift"
          style={{
            background: 'radial-gradient(circle, rgba(0, 212, 196, 0.3) 0%, transparent 70%)',
            backgroundSize: '200% 200%',
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-[0.04] animate-gradient-shift"
          style={{
            background: 'radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, transparent 70%)',
            backgroundSize: '200% 200%',
            animationDelay: '3s',
          }}
        />
      </div>

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="flex flex-col items-center"
          >
            {/* Backpack Icon with pulsing glow */}
            <div className="relative mb-8">
              <div
                className="absolute inset-0 animate-pulse-glow rounded-full"
                style={{ transform: 'scale(1.4)' }}
              />
              <BackpackIcon size={88} />
            </div>

            {/* ROAMIE title - typewriter */}
            <h1
              className="font-display font-bold text-4xl text-text-primary tracking-wider mb-2"
              style={{ minHeight: '1.2em' }}
            >
              {titleText}
              {!titleDone && <Cursor />}
            </h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: titleDone ? 1 : 0 }}
              className="font-handwritten text-lg gradient-text text-center mt-1"
              style={{ minHeight: '1.5em' }}
            >
              {titleDone && taglineText}
              {titleDone && taglineText.length < 'You dream it. We Roam it.'.length && <Cursor />}
            </motion.p>

            {/* Get Started button */}
            <AnimatePresence>
              {showButton && (
                <motion.button
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  onClick={() => navigate('/onboarding')}
                  className="relative mt-12 px-10 py-3.5 rounded-full text-white font-display font-semibold text-sm tracking-widest uppercase bg-transparent overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Gradient border via pseudo-element trick */}
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '1.5px solid transparent',
                      backgroundImage: 'linear-gradient(#0A0A12, #0A0A12), linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'padding-box, border-box',
                    }}
                  />
                  <span className="relative z-10">Get Started</span>
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: showButton ? 0.3 : 0 }}
        className="absolute bottom-10 text-text-secondary text-[10px] font-body tracking-widest uppercase"
      >
        You dream it. We Roam it.
      </motion.p>
    </div>
  )
}
