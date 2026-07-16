import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Map, Plus, Users, User, Coins } from 'lucide-react'
import { useRoamie } from '../store/RoamieContext'

interface NavItem {
  path: string
  icon: typeof Home
  label: string
  isCenter?: boolean
}

const navItems: NavItem[] = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/trips', icon: Map, label: 'Trips' },
  { path: '/plan', icon: Plus, label: 'Plan', isCenter: true },
  { path: '/feed', icon: Users, label: 'Feed' },
  { path: '/profile', icon: User, label: 'Profile' },
]

/* ===== JELLY TAP (reusable) ===== */
const jellyTap = {
  scale: 0.92,
  transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
}

/* ===== SPRING ===== */
const springPop = { type: 'spring' as const, stiffness: 400, damping: 12 }

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const { state } = useRoamie()
  const [coinBounce, setCoinBounce] = useState(false)

  // Trigger coin bounce on mount
  useEffect(() => {
    setCoinBounce(true)
    const timer = setTimeout(() => setCoinBounce(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Background with glass effect */}
      <div className="absolute inset-0 bg-[#14141F]/90 backdrop-blur-xl border-t border-[#2A2A3E]/60" />

      {/* Navigation items */}
      <div className="relative flex items-center justify-center gap-1 px-2 pb-[calc(env(safe-area-inset-bottom,8px)+4px)] pt-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const isHovered = hoveredPath === item.path
          const Icon = item.icon

          if (item.isCenter) {
            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                onMouseEnter={() => setHoveredPath(item.path)}
                onMouseLeave={() => setHoveredPath(null)}
                className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                  boxShadow: isActive || isHovered
                    ? '0 0 25px rgba(0, 212, 196, 0.4), 0 0 50px rgba(42, 107, 255, 0.2), 0 0 70px rgba(138, 43, 226, 0.15)'
                    : '0 4px 15px rgba(0, 0, 0, 0.4)',
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={jellyTap}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                <Icon size={24} className="text-white" strokeWidth={2.5} />
              </motion.button>
            )
          }

          return (
            <motion.button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              onMouseEnter={() => setHoveredPath(item.path)}
              onMouseLeave={() => setHoveredPath(null)}
              className="relative flex flex-col items-center gap-1 px-5 py-1 flex-shrink-0"
              whileTap={jellyTap}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <div className="relative">
                {/* Active icon with pop effect */}
                <motion.div
                  animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={isActive ? { ...springPop, delay: 0.05 } : { duration: 0.2 }}
                >
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={isActive ? 'text-brand-cyan' : 'text-text-secondary'}
                    style={{
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(0, 212, 196, 0.4))' : 'none',
                    }}
                  />
                </motion.div>
                {isActive && (
                  <motion.div
                    layoutId="navDot"
                    className="absolute -bottom-1.5 left-1/2 h-1 w-1 rounded-full bg-brand-cyan"
                    style={{ x: '-50%', boxShadow: '0 0 6px rgba(0, 212, 196, 0.6)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-wide whitespace-nowrap ${
                  isActive ? 'text-brand-cyan' : 'text-text-secondary'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          )
        })}

        {/* RoamCoin counter */}
        <motion.div
          className="absolute -top-2 right-4 flex items-center gap-1 px-2 py-1 rounded-full"
          style={{
            background: 'rgba(0, 212, 196, 0.08)',
            border: '1px solid rgba(0, 212, 196, 0.12)',
          }}
          animate={coinBounce ? { scale: [1, 1.3, 0.9, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <Coins size={12} style={{ color: '#FFD700' }} />
          <span className="text-[9px] font-semibold" style={{ color: '#00D4C4' }}>
            {(state.roamCoins ?? 100).toLocaleString()}
          </span>
        </motion.div>
      </div>
    </nav>
  )
}
