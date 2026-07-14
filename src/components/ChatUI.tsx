import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/* ===== SPRINGS ===== */
export const springBubble = { type: 'spring' as const, stiffness: 280, damping: 18 }

/* ===== ROAMIE BUBBLE (glass gradient, no torn tail) ===== */
export function RoamieBubble({
  children,
  delay = 0,
  nickname,
}: {
  children: ReactNode
  delay?: number
  nickname?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: 8 }}
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

      <div className="flex flex-col gap-0.5">
        {/* AI Nickname label */}
        {nickname && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (delay || 0) + 0.15 }}
            className="text-[10px] font-semibold ml-1"
            style={{ color: '#8B8CFA' }}
          >
            🤖 {nickname}
          </motion.span>
        )}

        {/* Modern glass bubble */}
        <div
          className="px-3.5 py-2.5 text-sm leading-relaxed shadow-[0_3px_14px_rgba(0,0,0,0.35)]"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '14px 14px 14px 4px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="font-sans text-[15px] text-white/90 font-medium leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ===== USER BUBBLE (solid indigo pill) ===== */
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
        className="px-3.5 py-2.5 text-sm text-white leading-relaxed"
        style={{
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          borderRadius: '16px 16px 4px 16px',
          boxShadow: '0 3px 14px rgba(99, 102, 241, 0.3)',
        }}
      >
        <p className="font-sans text-[15px] text-white/95 leading-relaxed">{children}</p>
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
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: '14px 14px 14px 4px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: '#818CF8' }}
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
