import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, Compass } from 'lucide-react'
import PolaroidCard from '../components/PolaroidCard'
import StickyNote from '../components/StickyNote'
import { useRoamie } from '../store/RoamieContext'

/* ===== SPRING ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== 50 DESTINATIONS ===== */
const destinations = [
  "Torres del Paine", "Mount Fitz Roy", "Swiss Alps", "Dolomites", "Mount Fuji",
  "Banff", "Yosemite", "Zhangjiajie", "Ha Long Bay", "Milford Sound",
  "Bora Bora", "Maldives", "Santorini", "Amalfi Coast", "Plitvice Lakes",
  "Iguazu Falls", "Na Pali Coast", "Seychelles", "Raja Ampat", "Whitehaven Beach",
  "Salar de Uyuni", "Grand Canyon", "Namib Desert", "Cappadocia", "Wadi Rum",
  "Antelope Canyon", "Pamukkale", "Iceland Black Sand", "The Wave Arizona", "Socotra Island",
  "Machu Picchu", "Petra", "Taj Mahal", "Angkor Wat", "Bagan",
  "Alhambra", "Kyoto", "Venice", "Chefchaouen", "Meteora",
  "Amazon", "Serengeti", "Galapagos", "Bamboo Grove", "Jiuzhaigou",
  "Hallerbos", "Snaefellsnes", "Okavango", "Tsingy", "Valley of Flowers",
]

const SLICE_COUNT = destinations.length
const SLICE_DEG = 360 / SLICE_COUNT

/* ===== 3D CONFETTI ===== */
function ConfettiBurst() {
  const colors = ['#00D4C4', '#2A6BFF', '#8A2BE2', '#FFD23F', '#FF6B6B', '#22C55E']
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    color: colors[i % colors.length],
    size: Math.random() * 6 + 4,
    duration: `${Math.random() * 1.5 + 2}s`,
    shape: Math.random() > 0.5 ? '50%' : '2px',
  }))

  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: p.left,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: p.shape,
            animationDelay: p.delay,
            animationDuration: p.duration,
            boxShadow: `0 0 6px ${p.color}`,
          }}
        />
      ))}
    </>
  )
}

/* ===== SPIN WHEEL ===== */
export default function SpinWheel() {
  const navigate = useNavigate()
  const { state, dispatch } = useRoamie()
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const canSpin = (state.roamCoins ?? 100) >= 1000000

  const handleSpin = () => {
    if (isSpinning || !canSpin) return

    setIsSpinning(true)
    setResult(null)
    setShowResult(false)
    setShowConfetti(false)

    // Random spin: 5-10 full rotations + random slice
    const extraRotations = (5 + Math.floor(Math.random() * 5)) * 360
    const randomSlice = Math.floor(Math.random() * SLICE_COUNT)
    const sliceOffset = randomSlice * SLICE_DEG
    const totalRotation = rotation + extraRotations + (360 - sliceOffset)

    setRotation(totalRotation)

    setTimeout(() => {
      setIsSpinning(false)
      setResult(destinations[randomSlice])
      setShowResult(true)
      setShowConfetti(true)

      // Deduct coins for the spin
      dispatch({ type: 'ADD_COINS', payload: -1000000 })

      // Reward with trip completion coins
      dispatch({ type: 'ADD_COINS', payload: 1000 })

      // Hide confetti after burst
      setTimeout(() => setShowConfetti(false), 3000)
    }, 4500)
  }

  return (
    <div className="relative min-h-dvh bg-base-bg flex flex-col">
      {/* ===== Background gradients ===== */}
      <div
        className="fixed top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0, 212, 196, 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="fixed bottom-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(138, 43, 226, 0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {showConfetti && <ConfettiBurst />}

      {/* ===== Header ===== */}
      <div
        className="relative z-10 flex-shrink-0 px-4 pt-3 pb-2.5"
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
              Spin & Win 🎰
            </h1>
            <p className="text-[10px] font-body tracking-wide" style={{ color: '#8888A0' }}>
              🪙 {(state.roamCoins ?? 100).toLocaleString()} RoamCoins
            </p>
          </div>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Insufficient coins notice */}
        {!canSpin && !isSpinning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <StickyNote rotate={-0.5}>
              <p className="font-handwritten text-sm gradient-text text-center">
                You need 🪙1,000,000 RoamCoins to spin! <br />
                Complete trips to earn more 🎒
              </p>
            </StickyNote>
          </motion.div>
        )}

        {/* ===== Spin Wheel with 3D perspective ===== */}
        <div className="relative mb-4" style={{ perspective: '800px' }}>
          {/* Outer glow */}
          <div
            className="absolute inset-[-20px] rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(0,212,196,0.06) 0%, transparent 70%)',
              animation: isSpinning ? 'pulse-glow 1s ease-in-out infinite' : 'none',
            }}
          />

          {/* Pointer / Indicator with 3D */}
          <div
            className="absolute top-[-12px] left-1/2 z-20"
            style={{ transform: 'translateX(-50%)' }}
          >
            <motion.div
              animate={isSpinning ? { y: [0, -4, 0] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22L4 4L12 8L20 4L12 22Z" fill="#00D4C4" />
                <path d="M12 22L4 4L12 8L20 4L12 22Z" stroke="#0A0A12" strokeWidth="1" fillOpacity="0.9" />
              </svg>
            </motion.div>
          </div>

          {/* The Wheel with 3D */}
          <motion.div
            className="relative w-72 h-72 rounded-full overflow-hidden shadow-[0_0_50px_rgba(0,212,196,0.1)] preserve-3d"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                : 'none',
            }}
            whileHover={!isSpinning ? { scale: 1.02 } : {}}
          >
            {/* SVG-based slices with proper text rendering */}
            <svg viewBox="0 0 288 288" className="absolute inset-0 w-full h-full">
              {destinations.map((dest, i) => {
                const angle = i * SLICE_DEG
                const midAngle = angle + SLICE_DEG / 2
                const isDark = i % 2 === 0
                const startAngle = (angle - 90) * Math.PI / 180
                const endAngle = (angle + SLICE_DEG - 90) * Math.PI / 180
                const cx = 144, cy = 144, r = 144

                const x1 = cx + r * Math.cos(startAngle)
                const y1 = cy + r * Math.sin(startAngle)
                const x2 = cx + r * Math.cos(endAngle)
                const y2 = cy + r * Math.sin(endAngle)

                const largeArc = SLICE_DEG > 180 ? 1 : 0

                const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`

                // Position text along the slice
                const textRadius = r * 0.7
                const textX = cx + textRadius * Math.cos((angle + SLICE_DEG / 2 - 90) * Math.PI / 180)
                const textY = cy + textRadius * Math.sin((angle + SLICE_DEG / 2 - 90) * Math.PI / 180)

                // For long names, use a narrower font or dynamically wrap
                const fontSize = dest.length > 16 ? 5 : dest.length > 12 ? 5.5 : 6

                return (
                  <g key={i}>
                    <path
                      d={path}
                      fill={isDark ? '#1A1A2E' : '#14141F'}
                      stroke="rgba(42,42,62,0.3)"
                      strokeWidth="0.5"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill="#8888A0"
                      fontSize={fontSize}
                      fontWeight="600"
                      fontFamily="'Outfit', sans-serif"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                      style={{ 
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {dest.length > 18 ? dest.slice(0, 16) + '…' : dest}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Center circle with 3D */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-16 h-16 rounded-full z-10 flex items-center justify-center cursor-pointer preserve-3d"
              style={{
                transform: 'translate(-50%, -50%)',
                background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                boxShadow: '0 0 30px rgba(0, 212, 196, 0.3)',
              }}
              onClick={handleSpin}
              whileHover={!isSpinning ? { 
                scale: 1.1,
                rotateX: [0, -10, 10, 0],
                transition: { duration: 0.4 },
                boxShadow: '0 0 50px rgba(0, 212, 196, 0.6)',
              } : {}}
              whileTap={{ scale: 0.9 }}
            >
              <motion.span 
                className="font-display font-bold text-sm text-white tracking-wider"
                animate={isSpinning ? { rotate: [0, 360] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                SPIN
              </motion.span>
            </motion.div>
          </motion.div>
        </div>

        {/* Info */}
        <p className="text-[10px] font-body tracking-wide text-center" style={{ color: '#555570' }}>
          Each spin costs 🪙1,000,000 RoamCoins
        </p>

        {/* ===== 3D Floating Home Button ===== */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ...springGentle }}
          whileHover={{ 
            scale: 1.05,
            rotateX: -5,
            rotateY: 5,
            boxShadow: '0 10px 30px rgba(0, 212, 196, 0.3)',
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/home')}
          className="mt-4 px-5 py-2.5 rounded-full text-[11px] font-display font-semibold tracking-wider flex items-center gap-2 transition-all duration-300 preserve-3d"
          style={{
            background: 'rgba(20, 20, 31, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 212, 196, 0.2)',
            color: '#00D4C4',
            transformStyle: 'preserve-3d',
          }}
        >
          <Home size={14} strokeWidth={2} />
          Back to Home
          <Compass size={14} strokeWidth={1.5} className="ml-1" style={{ color: 'rgba(0, 212, 196, 0.5)' }} />
        </motion.button>
      </div>

      {/* ===== Result Modal ===== */}
      {showResult && result && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(10, 10, 18, 0.9)' }}
            onClick={() => setShowResult(false)}
          />
          <motion.div
            initial={{ scale: 0.8, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={() => setShowResult(false)}
          >
            <div className="w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
              <PolaroidCard rotate={0.5} className="w-full">
                <div className="px-2 pt-2 pb-4 text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <h2 className="font-handwritten text-xl gradient-text font-medium mb-1">
                    You won a trip to
                  </h2>
                  <p className="font-display text-lg font-bold" style={{ color: '#1A1A2E' }}>
                    {result}!
                  </p>

                  {/* Mock destination image */}
                  <div
                    className="h-32 w-full rounded-sm mt-3 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(https://source.unsplash.com/800x600/?${encodeURIComponent(result)})`,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    }}
                  />

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowResult(false)
                      navigate('/plan')
                    }}
                    className="mt-4 w-full py-2.5 rounded-full text-xs font-display font-semibold text-white tracking-wider"
                    style={{
                      background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                      boxShadow: '0 0 20px rgba(0, 212, 196, 0.2)',
                    }}
                  >
                    Plan This Trip ✨
                  </motion.button>
                </div>
              </PolaroidCard>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
