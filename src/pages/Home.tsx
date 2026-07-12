import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin,
  Compass,
  Camera,
  Users,
  Search,
} from 'lucide-react'
import StickyNote from '../components/StickyNote'
import PolaroidCard from '../components/PolaroidCard'
import PushPin from '../components/PushPin'
import { useRoamie } from '../store/RoamieContext'

/* ===== SPRING TRANSITIONS ===== */
const springBounce = { type: 'spring' as const, stiffness: 300, damping: 18 }
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== QUICK ACTION BUTTON ===== */
function QuickActionBtn({
  icon: Icon,
  label,
  className = '',
  delay = 0,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  className?: string
  delay?: number
  onClick?: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 ${className}`}
      whileTap={{ scale: 0.9 }}
      aria-label={label}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full bg-card-bg border border-[#2A2A3E]/60 shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all duration-300"
        style={{
          boxShadow: isHovered
            ? '0 0 25px rgba(0, 212, 196, 0.3), 0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 15px rgba(0,0,0,0.3)',
          borderColor: isHovered ? 'rgba(0, 212, 196, 0.4)' : undefined,
        }}
      >
        <Icon size={22} strokeWidth={1.8} className="text-text-secondary" />
      </div>
      <span className="text-[10px] font-medium text-text-secondary tracking-wide">{label}</span>
    </motion.button>
  )
}

/* ===== DESTINATION CARD (for trending) ===== */
function DestinationCard({
  name,
  image,
  index = 0,
}: {
  name: string
  image: string
  index?: number
}) {
  const [liked, setLiked] = useState(false)
  const rotates = [-1.5, 0.5, -0.8, 1.2, -1.8, 0.3]

  return (
    <PolaroidCard rotate={rotates[index % rotates.length]} className="flex-shrink-0 w-36">
      <div className="relative overflow-hidden rounded-sm">
        <div
          className="h-36 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
          role="img"
          aria-label={`Photo of ${name}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="px-1 pt-2 pb-1">
        <p className="text-[11px] font-display font-semibold text-[#1A1A2E] truncate">{name}</p>
      </div>
      <button
        onClick={() => setLiked(!liked)}
        className="absolute bottom-7 right-3"
        aria-label={liked ? `Remove like for ${name}` : `Like ${name}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#00D4C4' : 'none'}
          stroke={liked ? '#00D4C4' : 'rgba(255,255,255,0.7)'}
          strokeWidth="2"
          style={{ filter: liked ? 'drop-shadow(0 0 6px rgba(0, 212, 196, 0.5))' : 'none' }}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </PolaroidCard>
  )
}

/* ===== TRENDING DESTINATIONS DATA ===== */
const trendingDestinations = [
  { name: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=85&fm=webp' },
  { name: 'Manali', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=85&fm=webp' },
  { name: 'Kerala', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=85&fm=webp' },
  { name: 'Rishikesh', image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&q=85&fm=webp' },
  { name: 'Udaipur', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=85&fm=webp' },
  { name: 'Leh', image: 'https://images.unsplash.com/photo-1628157588550-b9e051c6af3e?w=800&q=85&fm=webp' },
]

/* ===== COMMUNITY SPOTLIGHT DATA ===== */
const communityPosts = [
  { image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=85&fm=webp', height: 200, rotate: -1, caption: 'Island vibes in Thailand 🏝️', likes: 42 },
  { image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=85&fm=webp', height: 140, rotate: 1, caption: 'Mountain sunrise 🌄', likes: 28 },
  { image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=85&fm=webp', height: 180, rotate: -0.5, caption: 'Lost in Paris streets 🗼', likes: 35 },
  { image: 'https://images.unsplash.com/photo-1530789253388-582c4b48b1f0?w=900&q=85&fm=webp', height: 160, rotate: 0.8, caption: 'Bali rice terraces 🌾', likes: 51 },
]

/* ===== MAIN HOME COMPONENT ===== */
export default function Home() {
  const navigate = useNavigate()
  const { state } = useRoamie()
  const [searchFocused, setSearchFocused] = useState(false)
  const hasActiveTrip = state.trips.length > 0 // Check if user has trips

  const greetingName = state.name || 'Wanderer'

  return (
    <div className="px-4 pt-6 pb-6 space-y-6">
      {/* ===== TOP BAR ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springGentle}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-display font-semibold text-text-primary">
            Hey, {greetingName} <span className="inline-block animate-float" aria-hidden="true">👋</span>
          </h1>
          <p className="text-xs text-text-secondary font-body -mt-0.5">Ready to roam?</p>
        </div>

        <PolaroidCard rotate={-3} className="!p-[4px] flex-shrink-0">
          <div className="relative">
            <div
              className="h-10 w-10 rounded-sm bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=85&fm=webp)',
              }}
              role="img"
              aria-label="Your profile photo"
            />
            <PushPin className="absolute -top-2 -right-2" />
          </div>
        </PolaroidCard>
      </motion.div>

      {/* ===== HERO SECTION ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springBounce, delay: 0.1 }}
      >
        <PolaroidCard rotate={2} className="w-full">
          <div className="relative overflow-hidden rounded-sm">
            <div
              className="h-52 w-full bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=90&fm=webp)',
              }}
              role="img"
              aria-label="Beautiful travel destination"
            />
            {/* Breathing brand gradient overlay */}
            <div
              className="absolute inset-0 animate-gradient-shift pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 196, 0.08) 0%, rgba(42, 107, 255, 0.04) 50%, rgba(138, 43, 226, 0.08) 100%)',
                backgroundSize: '200% 200%',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Gradient text overlay */}
            <div className="absolute bottom-3 left-3">
              <p className="font-handwritten text-lg gradient-text font-medium">
                Where to next?
              </p>
            </div>

            {/* "LIVE" badge - only shows on active trip */}
            {hasActiveTrip && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-bg/80 backdrop-blur-sm border border-brand-cyan/30 animate-pulse-glow">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-breathe" />
                  <span className="text-[10px] font-semibold text-brand-cyan tracking-wider uppercase font-display">Live</span>
                </div>
              </div>
            )}
          </div>

          {/* Notebook-style input */}
          <div className="px-1 pt-2.5 pb-1">
            <div className="relative">
              <div
                className="relative bg-base-bg rounded-sm overflow-hidden"
                style={{
                  borderBottom: searchFocused
                    ? '1.5px solid rgba(0, 212, 196, 0.5)'
                    : '1.5px solid rgba(0, 212, 196, 0.15)',
                  boxShadow: searchFocused
                    ? '0 2px 20px rgba(0, 212, 196, 0.08), inset 0 -1px 0 rgba(0, 212, 196, 0.2)'
                    : 'none',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                {/* Ruled lines background */}
                <div className="absolute inset-0 opacity-[0.04]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 23px, #00D4C4 23px, #00D4C4 24px)',
                  }}
                />
                <label htmlFor="destination-search" className="sr-only">Dream a destination</label>
                <input
                  id="destination-search"
                  type="text"
                  placeholder="Dream a destination..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="relative w-full bg-transparent px-3 py-2.5 text-sm text-text-primary placeholder-text-secondary/60 font-body outline-none"
                  style={{ fontFamily: "'Caveat', cursive", fontSize: '16px' }}
                />
                <motion.div
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  animate={{ x: searchFocused ? 0 : 5, opacity: searchFocused ? 1 : 0.5 }}
                >
                  <Search size={16} className="text-brand-cyan" strokeWidth={2} />
                </motion.div>
              </div>
            </div>
          </div>
        </PolaroidCard>
      </motion.div>

      {/* ===== ROAMIE SAYS ===== */}
      <section aria-label="Roamie's personal note">
        <StickyNote rotate={-0.5}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Compass size={18} strokeWidth={1.8} className="text-brand-cyan"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0, 212, 196, 0.3))' }}
              />
            </div>
            <div>
              <p className="font-handwritten text-base gradient-text leading-relaxed">
                Hmm, you've been staring at your screen for 20 mins. Your bag is packed. <span className="text-brand-cyan">Goa</span> is calling. ☀️
              </p>
              <p className="font-body text-[11px] text-text-secondary mt-2 italic">
                — ROAMIE, your travel soulmate
              </p>
            </div>
          </div>
        </StickyNote>
      </section>

      {/* ===== QUICK ACTIONS ===== */}
      <section aria-label="Quick actions">
        <h2 className="text-xs font-display font-semibold text-text-secondary tracking-widest uppercase mb-4 ml-1">
          Quick Actions
        </h2>
        <div className="relative flex justify-between items-start px-2">
          <QuickActionBtn icon={MapPin} label="Explore" delay={0.1} className="mt-0" onClick={() => navigate('/trips')} />
          <QuickActionBtn icon={Compass} label="Plan Trip" delay={0.15} className="mt-2" onClick={() => navigate('/plan')} />
          <QuickActionBtn icon={Camera} label="Memories" delay={0.2} className="mt-0" onClick={() => navigate('/feed')} />
          <QuickActionBtn icon={Users} label="Profile" delay={0.25} className="mt-3" onClick={() => navigate('/profile')} />
        </div>
      </section>

      {/* ===== TRENDING DESTINATIONS ===== */}
      <section aria-label="Trending destinations">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-display font-semibold text-text-secondary tracking-widest uppercase">
            Trending Now
          </h2>
          <span className="text-[10px] font-handwritten gradient-text font-medium">See all →</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {trendingDestinations.map((dest, i) => (
            <DestinationCard key={dest.name} {...dest} index={i} />
          ))}
        </div>
      </section>

      {/* ===== COMMUNITY SPOTLIGHT ===== */}
      <section aria-label="Community travel photos">
        <h2 className="text-xs font-display font-semibold text-text-secondary tracking-widest uppercase mb-3 px-1">
          Community Spotlight
        </h2>
        <div className="columns-2 gap-3 space-y-3">
          {communityPosts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...springGentle, delay: 0.1 + i * 0.08 }}
              className="relative rounded-sm overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)] break-inside-avoid group cursor-pointer"
              style={{ transform: `rotate(${post.rotate}deg)` }}
              whileHover={{ scale: 1.02, rotate: post.rotate + 0.5 }}
            >
              <div
                className="w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url(${post.image})`, height: `${post.height}px`, minHeight: '8rem' }}
                role="img"
                aria-label="Travel community photo"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[11px] font-display font-medium text-white/90 truncate drop-shadow-lg">
                  {post.caption}
                </p>
                <p className="text-[9px] text-white/50 mt-0.5">❤️ {post.likes}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
