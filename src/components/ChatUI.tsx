import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/* ===== SPRINGS ===== */
export const springBubble = { type: 'spring' as const, stiffness: 280, damping: 18 }

/* ===== ROAMIE BUBBLE (torn paper tail, gradient text) ===== */
export function RoamieBubble({
  children,
  delay = 0,
}: {
  children: ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ ...springBubble, delay }}
      className="flex items-start gap-2 max-w-[88%]"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            background: '#14141F',
            border: '1px solid rgba(0, 212, 196, 0.2)',
            boxShadow: '0 0 12px rgba(0, 212, 196, 0.08)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 100 100" fill="none">
            <rect x="22" y="32" width="56" height="48" rx="8" fill="#00D4C4" opacity="0.9" />
            <path d="M22 48h56v3H22z" fill="#0A0A12" opacity="0.25" />
            <rect x="40" y="24" width="20" height="10" rx="5" fill="#2A6BFF" opacity="0.8" />
            <rect x="22" y="36" width="6" height="32" rx="3" fill="#8A2BE2" opacity="0.6" />
            <rect x="72" y="36" width="6" height="32" rx="3" fill="#8A2BE2" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Bubble with torn paper tail SVG */}
      <div className="relative flex">
        {/* Torn edge tail SVG */}
        <svg
          width="14"
          height="32"
          viewBox="0 0 14 32"
          className="flex-shrink-0 -mr-[1px] relative z-10"
          style={{ filter: 'drop-shadow(-2px 2px 6px rgba(0,0,0,0.3))' }}
        >
          <path
            d="M14,0 C10,2 12,6 7,8 C4,9 6,12 3,14 C1,15 3,18 0,20 C3,22 1,25 5,27 C8,28 6,30 8,31 C10,31.5 12,32 14,32 Z"
            fill="#14141F"
          />
        </svg>

        {/* Content */}
        <div
          className="relative px-3.5 py-2.5 text-sm leading-relaxed shadow-[0_3px_14px_rgba(0,0,0,0.35)]"
          style={{
            background: '#14141F',
            borderTopRightRadius: '14px',
            borderBottomRightRadius: '14px',
            borderBottomLeftRadius: '4px',
            borderTopLeftRadius: '0',
            borderLeft: '1px solid rgba(0, 212, 196, 0.08)',
          }}
        >
          {/* Gradient text in Caveat */}
          <div className="font-handwritten text-[15px] gradient-text font-medium leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ===== USER BUBBLE (irregular border radius) ===== */
export function UserBubble({
  children,
  delay = 0,
}: {
  children: ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ ...springBubble, delay }}
      className="flex justify-end max-w-[78%] ml-auto"
    >
      <div
        className="px-3.5 py-2.5 text-sm text-white leading-relaxed shadow-[0_3px_14px_rgba(138,43,226,0.2)]"
        style={{
          background: '#8A2BE2',
          borderRadius: '16px 20px 18px 14px',
          boxShadow: '0 3px 14px rgba(138, 43, 226, 0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <p className="font-body text-[15px] text-white/95 leading-relaxed">{children}</p>
      </div>
    </motion.div>
  )
}

/* ===== TYPING INDICATOR (3 bouncing dots with spring) ===== */
export function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-2 max-w-[60%]"
    >
      <div className="flex-shrink-0 mt-0.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{
            background: '#14141F',
            border: '1px solid rgba(0, 212, 196, 0.15)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 100 100" fill="none">
            <rect x="22" y="32" width="56" height="48" rx="8" fill="#00D4C4" opacity="0.9" />
            <rect x="40" y="24" width="20" height="10" rx="5" fill="#2A6BFF" opacity="0.8" />
          </svg>
        </div>
      </div>

      <div
        className="flex items-center gap-1.5 px-4 py-3"
        style={{
          background: '#14141F',
          borderTopRightRadius: '14px',
          borderBottomRightRadius: '14px',
          borderBottomLeftRadius: '4px',
          borderTopLeftRadius: '0',
          borderLeft: '1px solid rgba(0, 212, 196, 0.08)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: '#00D4C4' }}
            animate={{ y: [0, -6, 0] }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 10,
              mass: 0.5,
              repeat: Infinity,
              repeatDelay: 0.15,
              delay: i * 0.18,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
