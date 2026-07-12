import { motion } from 'framer-motion'
import { Hash } from 'lucide-react'

export default function Feed() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center"
      >
        <div className="mb-6">
          <Hash size={48} strokeWidth={1.5} className="mx-auto text-brand-blue"
            style={{ filter: 'drop-shadow(0 0 20px rgba(42, 107, 255, 0.2))' }}
          />
        </div>
        <h2 className="font-display text-xl font-semibold text-text-primary mb-2">
          Community Feed
        </h2>
        <p className="font-handwritten text-base gradient-text">
          Wanderers of the world, share your stories. 📸
        </p>
      </motion.div>
    </div>
  )
}
