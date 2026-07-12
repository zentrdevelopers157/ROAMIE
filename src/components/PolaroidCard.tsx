import { type ReactNode } from 'react'
import { motion } from 'framer-motion'

const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

export default function PolaroidCard({
  children,
  className = '',
  rotate = 0,
  style,
}: {
  children: ReactNode
  className?: string
  rotate?: number
  style?: React.CSSProperties
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotate - 2 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={springGentle}
      className={`rounded-sm bg-polaroid-border p-[6px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${className}`}
      style={{
        ...style,
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
      }}
      whileHover={{ rotate: rotate + 1, y: -4 }}
    >
      {children}
    </motion.div>
  )
}
