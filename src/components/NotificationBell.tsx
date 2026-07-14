import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import type { Reminder } from '../lib/reminders'
import { dismissReminder } from '../lib/reminders'

/* ===== SPRING ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== NOTIFICATION BELL ===== */
export default function NotificationBell({
  reminders,
}: {
  reminders: Reminder[]
}) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)

  const unreadCount = reminders.length

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        bellRef.current &&
        !bellRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    dismissReminder(id)
    // Re-render is handled by parent polling the reminders
  }

  const handleAction = (reminder: Reminder) => {
    if (reminder.actionPath) {
      navigate(reminder.actionPath)
    }
    dismissReminder(reminder.id)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <motion.button
        ref={bellRef}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-lg flex items-center justify-center transition-colors duration-200"
        style={{
          background: isOpen ? 'rgba(0, 212, 196, 0.1)' : 'transparent',
          border: '1px solid rgba(42, 42, 62, 0.4)',
        }}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell
          size={16}
          strokeWidth={1.8}
          style={{
            color: unreadCount > 0 ? '#00D4C4' : '#8888A0',
            transition: 'color 0.3s ease',
          }}
        />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center px-1"
            style={{
              background: 'linear-gradient(135deg, #00D4C4, #2A6BFF)',
              boxShadow: '0 0 8px rgba(0, 212, 196, 0.4)',
            }}
          >
            <span className="text-[8px] font-display font-bold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={springGentle}
            className="absolute right-0 top-full mt-2 w-[300px] max-h-[70vh] overflow-y-auto rounded-xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] z-50 scrollbar-none"
            style={{
              background: '#14141F',
              border: '1px solid rgba(42, 42, 62, 0.4)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2.5 border-b border-[#2A2A3E]/30"
              style={{ background: '#14141F' }}
            >
              <h3 className="text-xs font-display font-semibold gradient-text">
                Reminders
              </h3>
              {unreadCount > 0 && (
                <span className="text-[9px] font-body" style={{ color: '#8888A0' }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* Content */}
            {reminders.length > 0 ? (
              <div className="py-1">
                {reminders.map((reminder, i) => (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="px-3 py-2.5 cursor-pointer transition-colors duration-200"
                    style={{ borderBottom: i < reminders.length - 1 ? '1px solid rgba(42, 42, 62, 0.2)' : 'none' }}
                    onClick={() => handleAction(reminder)}
                    whileHover={{ background: 'rgba(0, 212, 196, 0.04)' }}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Emoji icon */}
                      <span className="flex-shrink-0 text-lg mt-0.5">{reminder.emoji}</span>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-display font-semibold text-text-primary leading-tight">
                          {reminder.title}
                        </p>
                        <p className="text-[10px] font-body leading-relaxed mt-0.5" style={{ color: '#8888A0' }}>
                          {reminder.message}
                        </p>

                        {/* Action button */}
                        {reminder.actionLabel && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className="text-[9px] font-display font-semibold tracking-wide"
                              style={{ color: '#00D4C4' }}
                            >
                              {reminder.actionLabel} →
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Dismiss X */}
                      <motion.button
                        onClick={(e) => handleDismiss(reminder.id, e)}
                        className="flex-shrink-0 p-0.5 rounded-full hover:text-[#8888A0] transition-colors duration-200"
                        style={{ color: '#555570' }}
                        whileHover={{ scale: 1.2 }}
                        aria-label="Dismiss reminder"
                      >
                        <X size={12} strokeWidth={2} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="font-handwritten text-sm" style={{ color: '#8888A0' }}>
                  All caught up! ✨
                </p>
                <p className="text-[10px] font-body mt-1" style={{ color: '#555570' }}>
                  No new reminders right now
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
