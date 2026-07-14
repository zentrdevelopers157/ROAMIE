import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, CheckCircle, Loader2 } from 'lucide-react'
import NoiseTexture from '../components/NoiseTexture'
import WashiTape from '../components/WashiTape'
import { useRoamie } from '../store/RoamieContext'
import { openProCheckout, PRO_PLAN_DISPLAY } from '../lib/payments'

/* ===== SPRINGS ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== FEATURE ITEM ===== */
function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-1">
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
  const { state, dispatch } = useRoamie()
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Already Pro? Show a different UI
  if (state.isPro) {
    const expiresDate = state.proExpiresAt
      ? new Date(state.proExpiresAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null

    return (
      <div
        className="relative min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: '#0A0A12' }}
      >
        <NoiseTexture />

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...springGentle, delay: 0.1 }}
          className="relative w-full max-w-sm rounded-2xl px-6 py-8 text-center"
          style={{
            background: '#14141F',
            border: '2px solid rgba(0, 212, 196, 0.3)',
            boxShadow: '0 0 30px rgba(0, 212, 196, 0.1), 0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <WashiTape color="cyan" rotate={-1} className="-top-3 left-1/3" />
          <WashiTape color="cyan" rotate={2} className="-top-3 right-1/3" />

          <div className="mb-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Crown size={40} className="mx-auto" style={{ color: '#FFD23F' }}
                fill="#FFD23F"
              />
            </motion.div>
          </div>

          <h1 className="text-xl font-display font-bold tracking-wide gradient-text">
            You're ROAMIE Pro!
          </h1>
          <p className="text-[11px] font-body mt-1 mb-6" style={{ color: '#8888A0' }}>
            {expiresDate ? `Active until ${expiresDate}` : 'Lifetime access'}
          </p>

          <div className="space-y-2 mb-6">
            <FeatureItem>Unlimited AI Trip Generations</FeatureItem>
            <FeatureItem>Offline Maps & Journals</FeatureItem>
            <FeatureItem>Priority 24/7 Travel Support</FeatureItem>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="text-[10px] font-display font-medium uppercase tracking-widest transition-colors"
            style={{ color: '#8888A0' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#F0F0F5' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8888A0' }}
          >
            ← Back
          </button>
        </motion.div>
      </div>
    )
  }

  const handleStartCheckout = async () => {
    setCheckoutState('loading')
    setErrorMsg(null)

    const result = await openProCheckout({
      name: state.name || 'Roamer',
      email: undefined,
      onSuccess: () => {
        // Calculate expiry: 30 days from now
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

        dispatch({
          type: 'SET_PRO',
          payload: { isPro: true, expiresAt },
        })

        setCheckoutState('success')
      },
      onError: (error) => {
        setErrorMsg(error)
        setCheckoutState('error')
      },
    })

    if (!result.success && result.error !== 'Checkout cancelled') {
      setCheckoutState('error')
      setErrorMsg(result.error ?? 'Payment failed')
    } else if (!result.success) {
      // User cancelled — reset to idle
      setCheckoutState('idle')
    }
  }

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
          whileHover={checkoutState === 'idle' ? { scale: 1.03 } : {}}
          whileTap={checkoutState === 'idle' ? { scale: 0.97 } : {}}
          onClick={handleStartCheckout}
          disabled={checkoutState === 'loading' || checkoutState === 'success'}
          className="relative w-full py-3 rounded-full text-sm font-display font-semibold text-white tracking-wider overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: checkoutState === 'success'
              ? 'linear-gradient(135deg, #22C55E, #16A34A)'
              : 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
            backgroundSize: '200% 200%',
            boxShadow: checkoutState === 'success'
              ? '0 0 25px rgba(34, 197, 94, 0.3), 0 4px 20px rgba(0,0,0,0.3)'
              : '0 0 25px rgba(0, 212, 196, 0.25), 0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <AnimatePresence mode="wait">
            {checkoutState === 'loading' ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <Loader2 size={16} className="animate-spin" />
                Processing...
              </motion.span>
            ) : checkoutState === 'success' ? (
              <motion.span
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} strokeWidth={2.5} />
                You're Pro! 🎉
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                Subscribe — {PRO_PLAN_DISPLAY.amount}{PRO_PLAN_DISPLAY.interval}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Price info */}
        <p className="text-[11px] font-body mt-3" style={{ color: '#8888A0' }}>
          ₹299/month • Cancel anytime
        </p>

        {/* Powered by Razorpay badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 opacity-40">
          <span className="text-[8px] font-body uppercase tracking-widest" style={{ color: '#8888A0' }}>
            Powered by
          </span>
          <svg width="48" height="14" viewBox="0 0 96 28" fill="none" aria-label="Razorpay">
            <path d="M24 0L0 28h12L36 0H24z" fill="#00D4C4" opacity="0.6" />
            <path d="M48 0L36 28h12L60 0H48z" fill="#2A6BFF" opacity="0.6" />
            <path d="M72 0L60 28h12L84 0H72z" fill="#8A2BE2" opacity="0.6" />
          </svg>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {checkoutState === 'error' && errorMsg && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[10px] font-body mt-3"
              style={{ color: 'rgba(255, 107, 107, 0.8)' }}
            >
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-[10px] font-display font-medium uppercase tracking-widest transition-colors"
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
