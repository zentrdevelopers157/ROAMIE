import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { useRoamie } from '../store/RoamieContext'

/* ===== BACKPACK ICON (mini) ===== */
function MiniBackpack() {
  return (
    <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="authGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4C4" />
          <stop offset="50%" stopColor="#2A6BFF" />
          <stop offset="100%" stopColor="#8A2BE2" />
        </linearGradient>
      </defs>
      <rect x="25" y="35" width="50" height="45" rx="10" fill="url(#authGrad)" opacity="0.9" />
      <path d="M25 50h50v3H25z" fill="#0A0A12" opacity="0.3" />
      <rect x="42" y="27" width="16" height="10" rx="5" fill="url(#authGrad)" opacity="0.8" />
      <rect x="25" y="38" width="5" height="30" rx="2.5" fill="url(#authGrad)" opacity="0.6" />
      <rect x="70" y="38" width="5" height="30" rx="2.5" fill="url(#authGrad)" opacity="0.6" />
    </svg>
  )
}

export default function Auth() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const { state } = useRoamie()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signedUp, setSignedUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const errorMsg = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password)

    if (errorMsg) {
      setError(errorMsg)
      setLoading(false)
    } else if (isSignUp) {
      // Sign-up success — show confirmation message (Supabase may require email confirmation)
      setSignedUp(true)
      setLoading(false)
    } else {
      // Sign-in success — redirect based on onboarding state
      navigate(state.onboarded ? '/home' : '/onboarding')
    }
  }

  return (
    <div className="relative min-h-screen bg-base-bg flex flex-col items-center justify-center px-6">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, rgba(0, 212, 196, 0.3) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, transparent 70%)' }} />
      </div>

      {/* Skip button */}
      <button
        onClick={() => navigate('/home')}
        className="absolute top-4 right-4 text-[11px] font-display text-text-secondary tracking-wider uppercase hover:text-text-primary transition-colors z-10"
      >
        Skip
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-sm"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse-glow rounded-full" style={{ transform: 'scale(1.3)' }} />
            <MiniBackpack />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-display font-bold text-text-primary text-center mb-1">
          Welcome to <span className="gradient-text">ROAMIE</span>
        </h1>
        <p className="text-sm text-text-secondary text-center font-body mb-8">
          {isSignUp ? 'Create your wanderer account' : 'Sign in to continue your journey'}
        </p>

        {/* Form */}
        {signedUp ? (
          /* ===== SIGN UP SUCCESS ===== */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00D4C4, #2A6BFF)',
                boxShadow: '0 0 20px rgba(0, 212, 196, 0.3)',
              }}
            >
              <CheckCircle size={32} strokeWidth={2.5} className="text-white" />
            </motion.div>
            <h2 className="text-lg font-display font-bold text-text-primary mb-2">Account Created!</h2>
            <p className="text-sm text-text-secondary font-body leading-relaxed">
              Check your email <span className="text-brand-cyan font-medium">{email}</span> for a confirmation link.
              <br />
              Once confirmed, sign in to start your journey!
            </p>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsSignUp(false)
                setSignedUp(false)
              }}
              className="mt-6 px-6 py-2.5 rounded-full text-xs font-display font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                boxShadow: '0 0 15px rgba(0, 212, 196, 0.2)',
              }}
            >
              Go to Sign In
            </motion.button>
          </motion.div>
        ) : (
          /* ===== FORM ===== */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50">
                <Mail size={16} strokeWidth={1.5} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full bg-card-bg border border-[#2A2A3E]/60 rounded-lg px-10 py-3 text-sm text-text-primary placeholder-text-secondary/40 font-body outline-none focus:border-brand-cyan/50 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50">
                <Lock size={16} strokeWidth={1.5} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full bg-card-bg border border-[#2A2A3E]/60 rounded-lg px-10 py-3 text-sm text-text-primary placeholder-text-secondary/40 font-body outline-none focus:border-brand-cyan/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/40 hover:text-text-secondary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-red-400/80 font-body text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="relative w-full py-3 rounded-full text-white font-display font-semibold text-sm tracking-wider disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                boxShadow: '0 4px 20px rgba(0, 212, 196, 0.3)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} strokeWidth={2.5} />
                </span>
              )}
            </motion.button>
          </form>
        )}

        {!signedUp && (
          <>
            {/* Toggle */}
            <div className="mt-6 text-center">
              <p className="text-xs text-text-secondary font-body">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError(null)
                  }}
                  className="gradient-text font-display font-semibold hover:opacity-80 transition-opacity"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Skip login hint */}
            <p className="mt-4 text-[10px] text-text-secondary/40 text-center font-body">
              Sign up is optional. You can skip and use the app locally.
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
