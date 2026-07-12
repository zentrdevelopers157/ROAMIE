import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import WashiTape from './WashiTape'

export default function StickyNote({
  children,
  rotate = -1,
  className = '',
  delay = 0.2,
}: {
  children: ReactNode
  rotate?: number
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay }}
      className={`relative bg-sticky-note rounded-sm p-4 shadow-[0_8px_25px_rgba(0,0,0,0.4)] ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        borderLeft: '2px solid rgba(0, 212, 196, 0.15)',
        borderTop: '2px solid rgba(0, 212, 196, 0.08)',
      }}
    >
      <WashiTape color="purple" rotate={2} className="-top-3 left-1/2 -translate-x-1/2" />
      {children}
    </motion.div>
  )
}
