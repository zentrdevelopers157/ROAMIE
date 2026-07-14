import { type ReactNode, useRef } from 'react'
import { motion } from 'framer-motion'

const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

export default function PolaroidCard({
  children,
  className = '',
  rotate = 0,
  style,
  enable3DTilt = false,
}: {
  children: ReactNode
  className?: string
  rotate?: number
  style?: React.CSSProperties
  enable3DTilt?: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!enable3DTilt || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    cardRef.current.style.setProperty('--tilt-x', `${-y * 12}deg`)
    cardRef.current.style.setProperty('--tilt-y', `${x * 12}deg`)
  }

  const handleMouseLeave = () => {
    if (!enable3DTilt || !cardRef.current) return
    cardRef.current.style.setProperty('--tilt-x', '0deg')
    cardRef.current.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, rotate: rotate - 2 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={springGentle}
      className={`rounded-sm bg-polaroid-border p-[6px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${className} ${enable3DTilt ? 'card-3d-tilt' : ''}`}
      style={{
        ...style,
        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
      }}
      whileHover={{ rotate: enable3DTilt ? undefined : rotate + 1, y: enable3DTilt ? undefined : -4 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  )
}
