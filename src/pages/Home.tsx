import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin,
  Compass,
  Camera,
  Users,
  MessageCircle,
  BarChart3,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import NotificationBell from '../components/NotificationBell'
import { useRoamie } from '../store/RoamieContext'
import { generateReminders, dismissReminder, sendBrowserNotification, getBrowserNotificationStatus } from '../lib/reminders'

/* ===== SPRING TRANSITIONS ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== TRENDING DESTINATIONS DATA ===== */
const trendingDestinations = [
  { name: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=60&fm=webp' },
  { name: 'Manali', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=60&fm=webp' },
  { name: 'Kerala', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=60&fm=webp' },
  { name: 'Rishikesh', image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&q=60&fm=webp' },
  { name: 'Udaipur', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=60&fm=webp' },
  { name: 'Leh', image: 'https://images.unsplash.com/photo-1628157588550-b9e051c6af3e?w=800&q=60&fm=webp' },
]

/* ===== MAIN HOME COMPONENT ===== */
export default function Home() {
  const navigate = useNavigate()
  const { state } = useRoamie()
  const [reminderKey, setReminderKey] = useState(0)

  // Generate reminders from state
  const reminders = useMemo(() => generateReminders({
    trips: state.trips,
    name: state.name,
    roamCoins: state.roamCoins,
    hasOnboarded: state.onboarded,
  }), [state.trips, state.name, state.roamCoins, state.onboarded, reminderKey])

  // Show a browser notification on first load if there are reminders
  useEffect(() => {
    if (reminders.length > 0 && getBrowserNotificationStatus() === 'granted') {
      const shown = sessionStorage.getItem('roamie_notif_shown')
      if (!shown) {
        sendBrowserNotification('ROAMIE', {
          body: `You have ${reminders.length} reminder${reminders.length > 1 ? 's' : ''} waiting ✨`,
        })
        sessionStorage.setItem('roamie_notif_shown', 'true')
      }
    }
  }, [reminders])

  const handleDismissCard = (id: string) => {
    dismissReminder(id)
    setReminderKey((k) => k + 1)
  }

  const greetingName = state.name || 'Wanderer'

  const quickActions = [
    { icon: MapPin, label: 'Explore', color: '#6366F1', path: '/trips' },
    { icon: Compass, label: 'Plan Trip', color: '#8B5CF6', path: '/plan' },
    { icon: Camera, label: 'Memories', color: '#EC4899', path: '/feed' },
    { icon: Users, label: 'Profile', color: '#F59E0B', path: '/profile' },
    { icon: MessageCircle, label: 'Ask Roamie', color: '#10B981', path: '/chat' },
    { icon: BarChart3, label: 'My Stats', color: '#00D4C4', path: '/stats' },
  ]

  return (
    <div className="relative px-4 pt-6 pb-6 space-y-6 overflow-x-hidden">
      {/* ===== TOP BAR ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springGentle}
        className="relative flex items-center justify-between z-10"
      >
        <div>
          <h1 className="text-xl font-[Nunito] font-bold text-text-primary">
            Hey, {greetingName} <span className="inline-block" style={{ animation: 'float 4s ease-in-out infinite' }} aria-hidden="true">👋</span>
          </h1>
          <p className="text-xs text-text-secondary font-sans -mt-0.5">Ready to roam?</p>
        </div>

        <NotificationBell reminders={reminders} />
      </motion.div>

      {/* ===== GRADIENT HERO CARD ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springGentle, delay: 0.1 }}
        className="relative z-10 overflow-hidden rounded-3xl"
        style={{
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3), 0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />

        <div className="relative p-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-yellow-300" fill="#FCD34D" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">Explore</span>
          </div>
          <h2 className="text-2xl font-[Nunito] font-extrabold text-white mb-1">
            Where to next? 👋
          </h2>
          <p className="text-sm text-white/70 font-sans mb-4">
            Plan your dream adventure in seconds
          </p>
          <motion.button
            whileHover={{ scale: 1.03, x: 3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/plan')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
            style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            Start Planning
            <ArrowRight size={16} strokeWidth={2.5} />
          </motion.button>
        </div>
      </motion.div>

      {/* ===== REMINDER CARDS ===== */}
      {reminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative space-y-2 z-10"
        >
          {reminders.slice(0, 2).map((reminder) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="relative rounded-xl px-3.5 py-2.5 flex items-start gap-3"
              style={{
                background: 'rgba(20, 20, 31, 0.7)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Left accent bar */}
              <div
                className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                style={{
                  background: 'linear-gradient(180deg, #6366F1, #8B5CF6)',
                  opacity: 0.5,
                }}
              />

              <span className="flex-shrink-0 text-lg mt-0.5">{reminder.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary leading-tight">
                  {reminder.title}
                </p>
                <p className="text-[10px] font-sans mt-0.5 leading-relaxed" style={{ color: '#8888A0' }}>
                  {reminder.message}
                </p>
                <div className="flex items-center gap-2.5 mt-1.5">
                  {reminder.actionLabel && reminder.actionPath && (() => {
                    const path = reminder.actionPath
                    return (
                      <button
                        onClick={() => {
                          dismissReminder(reminder.id)
                          navigate(path)
                        }}
                        className="text-[9px] font-semibold tracking-wide transition-colors duration-200"
                        style={{ color: '#818CF8' }}
                      >
                        {reminder.actionLabel} →
                      </button>
                    )
                  })()}
                  <button
                    onClick={() => handleDismissCard(reminder.id)}
                    className="text-[9px] font-sans transition-colors duration-200"
                    style={{ color: '#555570' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ===== QUICK ACTIONS — 2x3 grid ===== */}
      <section aria-label="Quick actions" className="relative z-10">
        <h2 className="text-xs font-semibold tracking-widest uppercase mb-3 ml-1"
          style={{ color: '#8888A0' }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.1 + i * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-2 rounded-2xl py-4 px-2"
              style={{
                background: '#1A1A2E',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${action.color}15` }}
              >
                <action.icon size={20} strokeWidth={1.8} style={{ color: action.color }} />
              </div>
              <span className="text-[11px] font-semibold tracking-wide text-text-secondary">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ===== ROAMIE SAYS — glass card ===== */}
      <section aria-label="Roamie's tip" className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.25 }}
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                <Compass size={16} strokeWidth={1.8} style={{ color: '#818CF8' }} />
              </div>
            </div>
            <div>
              <p className="text-sm font-sans font-medium text-white/80 leading-relaxed">
                Hmm, you've been staring at your screen for 20 mins. Your bag is packed. <span style={{ color: '#818CF8' }}>Goa</span> is calling. ☀️
              </p>
              <p className="text-[10px] font-sans mt-2" style={{ color: '#8888A0' }}>
                — ROAMIE, your travel soulmate
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== TRENDING DESTINATIONS — modern cards ===== */}
      <section aria-label="Trending destinations" className="relative z-10">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: '#8888A0' }}
          >
            Trending Now
          </h2>
          <span className="text-[10px] font-semibold" style={{ color: '#818CF8' }}>See all →</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {trendingDestinations.map((dest, i) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="w-[140px] rounded-2xl overflow-hidden"
              style={{
                scrollSnapAlign: 'center',
                flexShrink: 0,
                background: '#1A1A2E',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              }}
            >
              <div
                className="h-28 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${dest.image})` }}
                role="img"
                aria-label={`Photo of ${dest.name}`}
              />
              <div className="p-2.5">
                <p className="text-xs font-semibold text-text-primary">{dest.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={10} strokeWidth={1.5} style={{ color: '#818CF8' }} />
                  <span className="text-[9px] font-sans" style={{ color: '#8888A0' }}>Popular</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
