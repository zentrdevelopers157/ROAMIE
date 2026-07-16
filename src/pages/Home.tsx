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
  Coins,
  TrendingUp,
  Star,
} from 'lucide-react'
import NotificationBell from '../components/NotificationBell'
import { useRoamie } from '../store/RoamieContext'
import { generateReminders, dismissReminder, sendBrowserNotification, getBrowserNotificationStatus } from '../lib/reminders'

/* ===== SPRING PHYSICS (premium, bouncy) ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }
const springElastic = { type: 'spring' as const, stiffness: 300, damping: 20 }

/* ===== TRENDING DESTINATIONS DATA ===== */
const trendingDestinations = [
  { name: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=60&fm=webp' },
  { name: 'Manali', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=60&fm=webp' },
  { name: 'Kerala', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=60&fm=webp' },
  { name: 'Rishikesh', image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&q=60&fm=webp' },
  { name: 'Udaipur', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=60&fm=webp' },
  { name: 'Leh', image: 'https://images.unsplash.com/photo-1628157588550-b9e051c6af3e?w=800&q=60&fm=webp' },
  { name: 'Jaipur', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=60&fm=webp' },
  { name: 'Varanasi', image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&q=60&fm=webp' },
]

/* ===== JELLY TAP (reusable for all clickables) ===== */
const jellyTap = {
  scale: 0.92,
  transition: { type: 'spring' as const, stiffness: 400, damping: 15 },
}

/* ===== ELASTIC HOVER (3D tilt) ===== */
const elasticHover = {
  y: -8,
  rotateX: 2,
  rotateY: -2,
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
}

/* ===== STAGGERED ITEM ANIMATION ===== */
const staggerItem = (index: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring' as const, stiffness: 260, damping: 20, delay: index * 0.05 },
})

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
    { icon: MapPin, label: 'Explore', color: '#6366F1', path: '/trips', description: 'Discover new places' },
    { icon: Compass, label: 'Plan Trip', color: '#8B5CF6', path: '/plan', description: 'AI-powered itinerary' },
    { icon: Camera, label: 'Memories', color: '#EC4899', path: '/feed', description: 'Your travel moments' },
    { icon: Users, label: 'Profile', color: '#F59E0B', path: '/profile', description: 'Manage your journey' },
    { icon: MessageCircle, label: 'Ask Roamie', color: '#10B981', path: '/chat', description: 'Travel advice 24/7' },
    { icon: BarChart3, label: 'My Stats', color: '#00D4C4', path: '/stats', description: 'Track your adventures' },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A12]">
      {/* ===== FULL-WIDTH HERO SECTION (40vh) ===== */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[40vh] overflow-hidden"
      >
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80&fm=webp)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(10,10,18,0.3) 0%, rgba(10,10,18,0.6) 50%, rgba(10,10,18,1) 100%)',
          }}
        />
        {/* Gradient accent glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.4) 0%, transparent 70%)',
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 h-full flex flex-col justify-between px-6 md:px-12 py-8">
          {/* Top bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springGentle}
            className="flex items-start justify-between"
          >
            <div>
              <motion.h1
                className="text-3xl md:text-5xl font-[Nunito] font-bold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springGentle, delay: 0.1 }}
              >
                Hey, {greetingName} <span className="inline-block animate-float" aria-hidden="true">👋</span>
              </motion.h1>
              <motion.p
                className="text-sm md:text-base text-white/60 font-sans mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...springGentle, delay: 0.2 }}
              >
                Ready to roam? Your next adventure awaits.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...springElastic, delay: 0.3 }}
            >
              <NotificationBell reminders={reminders} />
            </motion.div>
          </motion.div>

          {/* Hero CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springGentle, delay: 0.4 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-yellow-300" fill="#FCD34D" />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/70">Explore</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-[Nunito] font-extrabold text-white mb-2 leading-tight">
              Where to next? 👋
            </h2>
            <p className="text-base md:text-lg text-white/60 font-sans mb-5 max-w-xl">
              Plan your dream adventure in seconds with AI-powered recommendations
            </p>
            <motion.button
              whileHover={{ ...elasticHover, y: -4, rotateX: 1, rotateY: 1 }}
              whileTap={jellyTap}
              onClick={() => navigate('/plan')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.35)',
                color: 'white',
              }}
            >
              Start Planning
              <ArrowRight size={18} strokeWidth={2.5} />
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-16 relative z-20 pb-8">
        {/* ===== GRID: 3-column on desktop, single on mobile ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ===== LEFT COLUMN (span 2) - Quick Actions ===== */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reminder Cards */}
            {reminders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                {reminders.slice(0, 2).map((reminder, idx) => (
                  <motion.div
                    key={reminder.id}
                    {...staggerItem(idx)}
                    layout
                    layoutId={`reminder-${reminder.id}`}
                    className="relative rounded-xl px-4 py-3 flex items-start gap-3"
                    style={{
                      background: 'rgba(20, 20, 31, 0.7)',
                      border: '1px solid rgba(99, 102, 241, 0.1)',
                      backdropFilter: 'blur(8px)',
                      transformStyle: 'preserve-3d',
                    }}
                    whileHover={{ y: -4, scale: 1.01, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                  >
                    <div
                      className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, #6366F1, #8B5CF6)',
                        opacity: 0.5,
                      }}
                    />
                    <span className="flex-shrink-0 text-lg mt-0.5">{reminder.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary leading-tight">{reminder.title}</p>
                      <p className="text-[10px] font-sans mt-0.5 leading-relaxed" style={{ color: '#8888A0' }}>{reminder.message}</p>
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

            {/* Quick Actions - Wide Cards */}
            <section aria-label="Quick actions">
              <motion.h2
                className="text-xs font-semibold tracking-widest uppercase mb-4 ml-1"
                style={{ color: '#8888A0' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Quick Actions
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {quickActions.map((action, i) => (
                  <motion.button
                    key={action.label}
                    {...staggerItem(i + 0.1)}
                    layout
                    layoutId={`quick-action-${action.label}`}
                    whileHover={{ y: -8, rotateX: 2, rotateY: -2, boxShadow: `0 20px 40px ${action.color}25, 0 0 60px ${action.color}10`, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                    whileTap={jellyTap}
                    onClick={() => navigate(action.path)}
                    className="flex items-center gap-4 rounded-2xl p-5 text-left w-full"
                    style={{
                      background: 'linear-gradient(135deg, #1A1A2E, #1E1E32)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${action.color}18` }}
                    >
                      <action.icon size={22} strokeWidth={1.8} style={{ color: action.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-text-primary block">{action.label}</span>
                      <span className="text-[10px] font-sans mt-0.5 block" style={{ color: '#8888A0' }}>{action.description}</span>
                    </div>
                    <ArrowRight size={16} style={{ color: '#555570' }} className="flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </section>
          </div>

          {/* ===== RIGHT COLUMN (span 1) - Roamie Says + RoamCoin Balance ===== */}
          <div className="space-y-5">
            {/* Roamie Says - Glass Card */}
            <section aria-label="Roamie's tip">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.35 }}
                className="rounded-2xl p-5 h-full"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transformStyle: 'preserve-3d',
                }}
                whileHover={{ y: -6, rotateX: 1, rotateY: 1, boxShadow: '0 16px 40px rgba(0,0,0,0.3)', transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                      <Compass size={18} strokeWidth={1.8} style={{ color: '#818CF8' }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#8888A0' }}>Roamie Says</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-sans font-medium text-white/80 leading-relaxed">
                    Hmm, you've been staring at your screen for 20 mins. Your bag is packed. <span style={{ color: '#818CF8' }}>Goa</span> is calling. ☀️
                  </p>
                  <p className="text-[10px] font-sans mt-3" style={{ color: '#8888A0' }}>
                    — ROAMIE, your travel soulmate
                  </p>
                </div>
              </motion.div>
            </section>

            {/* RoamCoin Balance Card */}
            <section aria-label="RoamCoin balance">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.45 }}
                className="rounded-2xl p-5 overflow-hidden relative"
                style={{
                  background: 'linear-gradient(135deg, #1A1A2E, #1E1E32)',
                  border: '1px solid rgba(0, 212, 196, 0.1)',
                  transformStyle: 'preserve-3d',
                }}
                whileHover={{ y: -6, rotateX: 1, rotateY: 1, boxShadow: '0 16px 40px rgba(0,0,0,0.4)', transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              >
                {/* Glow accents */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #00D4C4, transparent)' }} />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }} />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Coins size={18} style={{ color: '#FFD700' }} />
                    <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#8888A0' }}>RoamCoin Balance</span>
                  </div>

                  <motion.div
                    className="text-3xl font-[Nunito] font-extrabold gradient-text"
                    animate={{ scale: [1, 1.3, 0.9, 1.05, 1] }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  >
                    🪙 {(state.roamCoins ?? 100).toLocaleString()}
                  </motion.div>

                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp size={12} className="text-green-400" />
                    <span className="text-[10px] font-sans font-medium text-green-400">+50 this week</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Star size={12} style={{ color: '#FFD700' }} />
                      <span className="text-[10px] font-sans" style={{ color: '#8888A0' }}>Complete trips to earn more</span>
                    </div>
                    <motion.button
                      whileTap={jellyTap}
                      onClick={() => navigate('/spin')}
                      className="mt-3 w-full py-2 rounded-full text-[10px] font-semibold tracking-wider transition-all duration-200"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,212,196,0.15), rgba(42,107,255,0.15))',
                        border: '1px solid rgba(0,212,196,0.2)',
                        color: '#00D4C4',
                      }}
                    >
                      🎰 Spin to Earn More
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </section>
          </div>
        </div>

        {/* ===== TRENDING DESTINATIONS — 4-column grid ===== */}
        <section aria-label="Trending destinations" className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between mb-4 px-1"
          >
            <h2 className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#8888A0' }}>
              Trending Now
            </h2>
            <span className="text-[10px] font-semibold" style={{ color: '#818CF8' }}>See all →</span>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trendingDestinations.map((dest, i) => (
              <motion.div
                key={dest.name}
                {...staggerItem(i)}
                layout
                layoutId={`destination-${dest.name}`}
                whileHover={{
                  y: -8,
                  rotateX: 2,
                  rotateY: -2,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                className="rounded-2xl overflow-hidden cursor-pointer group"
                style={{
                  background: '#1A1A2E',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                  transformStyle: 'preserve-3d',
                }}
                onClick={() => navigate(`/plan`)}
              >
                <div
                  className="h-36 w-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url(${dest.image})` }}
                  role="img"
                  aria-label={`Photo of ${dest.name}`}
                />
                <div className="p-3">
                  <p className="text-sm font-semibold text-text-primary">{dest.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={10} strokeWidth={1.5} style={{ color: '#818CF8' }} />
                    <span className="text-[10px] font-sans" style={{ color: '#8888A0' }}>Popular</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
