import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import NoiseTexture from '../components/NoiseTexture'
import WashiTape from '../components/WashiTape'

/* ===== SPRINGS ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== FEATURE ITEM ===== */
function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-1">
      {/* Hand-drawn checkmark SVG */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        className="flex-shrink-0"
      >
        <path
          d="M4 14 L9 19 L20 6"
          stroke="#FFD23F"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(255, 210, 63, 0.4))',
          }}
        />
      </svg>
      <span className="font-handwritten text-base gradient-text font-medium">
        {children}
      </span>
    </div>
  )
}

/* ===== PRO PAYWALL COMPONENT ===== */
export default function ProPaywall() {
  const navigate = useNavigate()

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#0A0A12' }}
    >
      <NoiseTexture />

      {/* Decorative background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 210, 63, 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Golden Ticket Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...springGentle, delay: 0.1 }}
        className="relative w-full max-w-sm rounded-2xl px-6 py-8 text-center"
        style={{
          background: '#14141F',
          border: '2px solid #FFD23F',
          boxShadow: '0 0 30px rgba(255, 210, 63, 0.15), 0 0 60px rgba(255, 210, 63, 0.05), 0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <WashiTape color="purple" rotate={-1} className="-top-3 left-1/3" />
        <WashiTape color="cyan" rotate={2} className="-top-3 right-1/3" />

        {/* Crown icon */}
        <div className="mb-4">
          <svg
            width="40"
            height="40"
            viewBox="0 0 100 100"
            fill="none"
            className="mx-auto"
            style={{ filter: 'drop-shadow(0 0 15px rgba(255, 210, 63, 0.3))' }}
          >
            <path
              d="M20 75 L10 25 L30 45 L50 20 L70 45 L90 25 L80 75 Z"
              fill="#FFD23F"
              opacity="0.9"
            />
            <circle cx="50" cy="75" r="8" fill="#FFD23F" opacity="0.7" />
            <circle cx="30" cy="45" r="4" fill="#0A0A12" opacity="0.3" />
            <circle cx="70" cy="45" r="4" fill="#0A0A12" opacity="0.3" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-display font-bold tracking-wide" style={{ color: '#FFD23F' }}>
          Unlock ROAMIE Pro
        </h1>
        <p className="text-[11px] font-body mt-1 mb-6" style={{ color: '#8888A0' }}>
          The premium travel companion
        </p>

        {/* Features */}
        <div className="mb-6 text-left max-w-[220px] mx-auto">
          <FeatureItem>Unlimited AI Trip Generations</FeatureItem>
          <FeatureItem>Offline Maps &amp; Journals</FeatureItem>
          <FeatureItem>Priority 24/7 Travel Support</FeatureItem>
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            // TODO: Connect to payment processor
            alert('Pro trial started! 🎉')
          }}
          className="relative w-full py-3 rounded-full text-sm font-display font-semibold text-white tracking-wider overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
            backgroundSize: '200% 200%',
            boxShadow: '0 0 25px rgba(0, 212, 196, 0.25), 0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          Start Free Trial
        </motion.button>

        {/* Price */}
        <p className="text-[11px] font-body mt-3" style={{ color: '#8888A0' }}>
          ₹299/month • Cancel anytime
        </p>

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="mt-5 text-[10px] font-display font-medium uppercase tracking-widest transition-colors"
          style={{ color: '#8888A0' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#F0F0F5' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#8888A0' }}
        >
          ← Not now
        </button>
      </motion.div>
    </div>
  )
}
