import { motion } from 'framer-motion'
import { User } from 'lucide-react'

export default function Profile() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center"
      >
        <div className="mb-6">
          <User size={48} strokeWidth={1.5} className="mx-auto text-brand-cyan"
            style={{ filter: 'drop-shadow(0 0 20px rgba(0, 212, 196, 0.2))' }}
          />
        </div>
        <h2 className="font-display text-xl font-semibold text-text-primary mb-2">
          Your Profile
        </h2>
        <p className="font-handwritten text-base gradient-text">
          Your travel soulmate awaits. 🎒
        </p>
      </motion.div>
    </div>
  )
}
