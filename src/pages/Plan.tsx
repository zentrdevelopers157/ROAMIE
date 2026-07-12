import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Mic, Send, MapPin } from 'lucide-react'
import { useRoamie, generateId } from '../store/RoamieContext'
import type { ItineraryItem } from '../store/RoamieContext'
import { generateTrip, type AIActivity, type AITripResponse } from '../lib/ai'
import { getAffiliateLinks } from '../lib/affiliates'
import StickyNote from '../components/StickyNote'
import WashiTape from '../components/WashiTape'

/* ===== SPRINGS ===== */
const springBubble = { type: 'spring' as const, stiffness: 280, damping: 18 }
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== TOPOGRAPHIC BG ===== */
const topoBg: React.CSSProperties = {
  backgroundColor: '#0A0A12',
  backgroundImage: `
    radial-gradient(ellipse at 20% 30%, rgba(0, 212, 196, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(42, 107, 255, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(138, 43, 226, 0.03) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4C4' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
  `,
}

/* ===== DESTINATION DATA ===== */
const quickReplies = [
  { label: 'Surprise me 🎲', key: 'surprise' },
  { label: 'Mountains 🏔️', key: 'mountains' },
  { label: 'Beaches 🌊', key: 'beaches' },
  { label: 'City Life 🏙️', key: 'city' },
] as const

type DestKey = (typeof quickReplies)[number]['key']

const destData: Record<DestKey, { name: string; month: string; emoji: string; moodDesc: string }> = {
  surprise: { name: 'Bali', month: 'May', emoji: '🌴', moodDesc: 'tropical paradise with hidden waterfall gems' },
  mountains: { name: 'Manali', month: 'February', emoji: '❄️', moodDesc: 'cozy mountain cafes and snow-covered pine trails' },
  beaches: { name: 'Goa', month: 'December', emoji: '☀️', moodDesc: 'golden sand beaches and lazy ocean sunsets' },
  city: { name: 'Tokyo', month: 'April', emoji: '🗼', moodDesc: 'neon-lit streets and hidden ramen shops' },
}

const moodImagesByDest: Record<DestKey, string[]> = {
  surprise: [
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=85&fm=webp',
    'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=85&fm=webp',
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=85&fm=webp',
    'https://images.unsplash.com/photo-1559644702-59f9e5a9e798?w=600&q=85&fm=webp',
  ],
  mountains: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=85&fm=webp',
    'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=600&q=85&fm=webp',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=85&fm=webp',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=85&fm=webp',
  ],
  beaches: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=85&fm=webp',
    'https://images.unsplash.com/photo-1590523741831-ab7e8b4f9c7f?w=600&q=85&fm=webp',
    'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=600&q=85&fm=webp',
    'https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=600&q=85&fm=webp',
  ],
  city: [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=85&fm=webp',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&q=85&fm=webp',
    'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&q=85&fm=webp',
    'https://images.unsplash.com/photo-1549693578-d683be217e58?w=600&q=85&fm=webp',
  ],
}

/* ===== MOCK ITINERARIES ===== */
const itineraries: Record<DestKey, { time: string; title: string; desc: string }[]> = {
  surprise: [
    { time: '06:30', title: 'Sunrise at Tanah Lot', desc: 'Watch the sun rise over the iconic sea temple' },
    { time: '09:00', title: 'Ubud Monkey Forest', desc: 'Wander through sacred jungle with curious macaques' },
    { time: '12:30', title: 'Rice Terrace Lunch', desc: 'Fresh nasi campur overlooking Tegallalang terraces' },
    { time: '15:00', title: 'Uluwatu Sunset', desc: 'Cliffside Kecak dance performance at dusk' },
  ],
  mountains: [
    { time: '07:00', title: 'Snowy Morning Chai', desc: 'Steaming masala chai with Himalayan mountain views' },
    { time: '09:30', title: 'Hadimba Temple Walk', desc: 'Explore the ancient temple surrounded by deodar forests' },
    { time: '13:00', title: 'Café Hopping in Old Manali', desc: 'Cozy cafés with wooden interiors and live acoustic music' },
    { time: '16:00', title: 'Solang Valley Snow Sports', desc: 'Skiing, snow tubing, and snowmobile adventures' },
  ],
  beaches: [
    { time: '07:30', title: 'Beachside Yoga', desc: 'Morning flow on the sand as the waves roll in' },
    { time: '10:00', title: 'Spice Plantation Tour', desc: 'Walk through aromatic spice gardens and try fresh pepper' },
    { time: '13:30', title: 'Shack Lunch on Anjuna', desc: 'Goan fish curry rice with a chilled coconut water' },
    { time: '17:00', title: 'Sunset Cruise', desc: 'Boating on the Mandovi river with live fado music' },
  ],
  city: [
    { time: '06:00', title: 'Tsukiji Outer Market', desc: 'Fresh sushi breakfast and wandering through seafood stalls' },
    { time: '09:30', title: 'Meiji Shrine Serenity', desc: 'Peaceful forest walk through the iconic Shinto shrine' },
    { time: '12:00', title: 'Shibuya & Ramen Alley', desc: 'Cross the scramble then slurp tonkotsu ramen' },
    { time: '15:30', title: 'Akihabara Arcade Hop', desc: 'Retro games, anime shops, and neon wonderland' },
  ],
}

/* ===== ICON MAP ===== */
const iconForTime = (time: string) => {
  const h = parseInt(time.split(':')[0], 10)
  if (h < 8) return '🌅'
  if (h < 12) return '☕'
  if (h < 15) return '🍽️'
  if (h < 18) return '🎯'
  return '🌆'
}

/* ===== ROAMIE BUBBLE (torn paper tail, gradient text) ===== */
function RoamieBubble({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30, y: 8 }}
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

      {/* Bubble with torn paper tail SVG */}
      <div className="relative flex">
        {/* Torn edge tail SVG */}
        <svg
          width="14"
          height="32"
          viewBox="0 0 14 32"
          className="flex-shrink-0 -mr-[1px] relative z-10"
          style={{ filter: 'drop-shadow(-2px 2px 6px rgba(0,0,0,0.3))' }}
        >
          <path
            d="M14,0 C10,2 12,6 7,8 C4,9 6,12 3,14 C1,15 3,18 0,20 C3,22 1,25 5,27 C8,28 6,30 8,31 C10,31.5 12,32 14,32 Z"
            fill="#14141F"
          />
        </svg>

        {/* Content */}
        <div
          className="relative px-3.5 py-2.5 text-sm leading-relaxed shadow-[0_3px_14px_rgba(0,0,0,0.35)]"
          style={{
            background: '#14141F',
            borderTopRightRadius: '14px',
            borderBottomRightRadius: '14px',
            borderBottomLeftRadius: '4px',
            borderTopLeftRadius: '0',
            borderLeft: '1px solid rgba(0, 212, 196, 0.08)',
          }}
        >
          {/* Gradient text in Caveat */}
          <div className="font-handwritten text-[15px] gradient-text font-medium leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ===== USER BUBBLE (irregular border radius) ===== */
function UserBubble({
  children,
  delay = 0,
}: {
  children: React.ReactNode
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
        className="px-3.5 py-2.5 text-sm text-white leading-relaxed shadow-[0_3px_14px_rgba(138,43,226,0.2)]"
        style={{
          background: '#8A2BE2',
          borderRadius: '16px 20px 18px 14px',
          boxShadow: '0 3px 14px rgba(138, 43, 226, 0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <p className="font-body text-[15px] text-white/95 leading-relaxed">{children}</p>
      </div>
    </motion.div>
  )
}

/* ===== TYPING INDICATOR (3 bouncing dots with spring) ===== */
function TypingDots() {
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
          background: '#14141F',
          borderTopRightRadius: '14px',
          borderBottomRightRadius: '14px',
          borderBottomLeftRadius: '4px',
          borderTopLeftRadius: '0',
          borderLeft: '1px solid rgba(0, 212, 196, 0.08)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-1.5 h-1.5 rounded-full"
            style={{ background: '#00D4C4' }}
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

/* ===== QUICK REPLY CHIP ===== */
function QuickReplyChip({
  label,
  onClick,
  index,
}: {
  label: string
  onClick: () => void
  index: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay: 0.3 + index * 0.08 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="relative px-4 py-2.5 rounded-full text-sm font-display font-semibold tracking-wide transition-shadow duration-300"
      style={{
        background: 'rgba(20, 20, 31, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1.5px solid rgba(0, 212, 196, 0.25)',
        color: '#F0F0F5',
        boxShadow: '0 2px 10px rgba(0,0,0,0.25), 0 0 20px rgba(0, 212, 196, 0.04)',
      }}
    >
      {/* Cyan glow border on hover */}
      <div
        className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: '0 0 18px rgba(0, 212, 196, 0.12), inset 0 0 18px rgba(0, 212, 196, 0.04)',
        }}
      />
      {label}
    </motion.button>
  )
}

/* ===== MOOD IMAGE CARD (with heart overlay) ===== */
function MoodImageCard({
  src,
  liked,
  onToggle,
  index,
}: {
  src: string
  liked: boolean
  onToggle: () => void
  index: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...springGentle, delay: 0.1 + index * 0.06 }}
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      className="relative flex-shrink-0 w-28 h-32 rounded-sm overflow-hidden group cursor-pointer"
      style={{
        boxShadow: liked
          ? '0 0 18px rgba(0, 212, 196, 0.25), 0 4px 12px rgba(0,0,0,0.4)'
          : '0 4px 12px rgba(0,0,0,0.3)',
        border: liked ? '1.5px solid rgba(0, 212, 196, 0.4)' : '1px solid rgba(255,255,255,0.05)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${src})` }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: liked
            ? 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,212,196,0.15) 100%)'
            : 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 100%)',
        }}
      />

      {/* Heart overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart
            size={28}
            strokeWidth={2}
            style={{
              fill: liked ? '#00D4C4' : 'rgba(255,255,255,0)',
              stroke: liked ? '#00D4C4' : 'rgba(255,255,255,0.7)',
              filter: liked ? 'drop-shadow(0 0 8px rgba(0, 212, 196, 0.5))' : 'none',
              transition: 'all 0.3s ease',
            }}
          />
        </motion.div>
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 inset-x-0 p-1.5">
        <div
          className="text-[9px] font-display font-semibold text-center tracking-wider uppercase"
          style={{
            color: liked ? '#00D4C4' : 'rgba(255,255,255,0.6)',
            transition: 'color 0.3s ease',
          }}
        >
          {liked ? 'Liked' : 'Tap to ❤️'}
        </div>
      </div>
    </motion.button>
  )
}

/* ===== SPINNING COMPASS CARD ===== */
function LoadingCompass() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-[200px] mx-auto my-4"
    >
      <div
        className="relative rounded-sm p-4 text-center shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        style={{
          background: '#14141F',
          borderLeft: '2px solid rgba(0, 212, 196, 0.15)',
        }}
      >
        {/* Spinning compass */}
        <div className="relative w-16 h-16 mx-auto mb-3">
          {/* Outer glow rings */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ boxShadow: ['0 0 15px rgba(0,212,196,0.15)', '0 0 30px rgba(0,212,196,0.3)', '0 0 15px rgba(0,212,196,0.15)'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Additional trailing glow */}
          <motion.div
            className="absolute inset-[-8px] rounded-full"
            style={{
              background: 'radial-gradient(circle at center, rgba(0,212,196,0.06) 0%, transparent 70%)',
            }}
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Hand-drawn compass SVG */}
          <motion.div
            className="relative z-10 w-full h-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          >
            <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
              {/* Outer ring - slightly irregular hand-drawn look */}
              <path
                d="M40 6 C50 5 62 10 68 18 C74 26 76 38 74 48 C72 58 66 68 56 72 C46 76 34 76 24 72 C14 68 8 58 6 48 C4 38 6 26 12 18 C18 10 30 7 40 6Z"
                stroke="#00D4C4"
                strokeWidth="1.8"
                fill="none"
                opacity="0.8"
                strokeDasharray="2 3"
              />
              {/* Inner ring */}
              <path
                d="M40 18 C47 17 55 21 59 27 C63 33 64 41 62 48 C60 55 55 61 48 63 C41 65 33 64 27 59 C21 54 18 46 18 39 C18 32 22 25 29 21 C34 18.5 37 18 40 18Z"
                stroke="#00D4C4"
                strokeWidth="0.8"
                fill="none"
                opacity="0.4"
                strokeDasharray="1.5 2"
              />
              {/* Crosshairs - hand-drawn slightly angled */}
              <line x1="40" y1="10" x2="40" y2="30" stroke="#00D4C4" strokeWidth="1.2" opacity="0.5" />
              <line x1="40" y1="50" x2="40" y2="70" stroke="#2A6BFF" strokeWidth="1.2" opacity="0.5" />
              <line x1="10" y1="40" x2="30" y2="40" stroke="#8A2BE2" strokeWidth="1.2" opacity="0.5" />
              <line x1="50" y1="40" x2="70" y2="40" stroke="#8A2BE2" strokeWidth="1.2" opacity="0.5" />
              {/* North arrow - bold */}
              <path
                d="M40 12 L44 28 L42 30 L40 34 L38 30 L36 28 Z"
                fill="#00D4C4"
                opacity="0.9"
              />
              {/* South arrow */}
              <path
                d="M40 68 L44 52 L42 50 L40 46 L38 50 L36 52 Z"
                fill="#2A6BFF"
                opacity="0.5"
              />
              {/* East arrow */}
              <path
                d="M68 40 L52 36 L50 38 L46 40 L50 42 L52 44 Z"
                fill="#8A2BE2"
                opacity="0.5"
              />
              {/* West arrow */}
              <path
                d="M12 40 L28 44 L30 42 L34 40 L30 38 L28 36 Z"
                fill="#8A2BE2"
                opacity="0.5"
              />
              {/* Center dot */}
              <circle cx="40" cy="40" r="3" fill="#00D4C4" />
              <circle cx="40" cy="40" r="1.5" fill="#0A0A12" />
            </svg>
          </motion.div>
        </div>

        {/* Text */}
        <p
          className="font-handwritten text-sm gradient-text font-medium"
          style={{ backgroundSize: '200% 200%' }}
        >
          Finding hidden gems...
        </p>
        <p className="text-[10px] font-body text-text-secondary mt-1 opacity-60">
          weaving your itinerary
        </p>

        {/* Bottom decorative line */}
        <div
          className="mt-3 mx-auto w-12 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, #00D4C4, transparent)',
            opacity: 0.4,
          }}
        />
      </div>
    </motion.div>
  )
}

/* ===== TRIP REVEAL CARD (notebook paper) ===== */
function TripRevealCard({
  destKey,
  onViewPlan,
  aiActivities,
  aiDestination,
  onComparePrices,
}: {
  destKey: DestKey
  onViewPlan: () => void
  aiActivities?: AIActivity[]
  aiDestination?: string
  onComparePrices?: (type: string) => void
}) {
  const data = aiDestination ? { name: aiDestination, month: '', emoji: '' } : destData[destKey]
  const items = aiActivities
    ? aiActivities.map((a) => ({
        time: a.time,
        title: a.name,
        desc: a.type === 'stay' ? '🏨 Accommodation' : a.type === 'transport' ? '🚗 Transport' : a.type === 'food' ? '🍽️ Food & Drink' : '🎯 Activity',
        type: a.type,
      }))
    : itineraries[destKey].map((i) => ({ time: i.time, title: i.title, desc: i.desc, type: null }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springGentle, delay: 0.15 }}
      className="max-w-[95%] mx-auto"
    >
      <div
        className="relative rounded-sm p-4 shadow-[0_6px_30px_rgba(0,0,0,0.5)] overflow-hidden"
        style={{
          backgroundColor: '#12121E',
          clipPath: 'polygon(0% 0%, 98% 0%, 100% 4%, 100% 96%, 98% 100%, 0% 100%)',
          // Torn left edge via pseudo
        }}
      >
        {/* Torn left edge SVG */}
        <div className="absolute left-0 top-0 bottom-0 w-[6px] pointer-events-none">
          <svg
            width="6"
            height="100%"
            viewBox="0 0 6 200"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              d="M6,0 C3,2 5,6 2,8 C1,9 3,12 0,14 C3,16 1,19 4,21 C5,22 3,25 6,27 L6,200 L0,200 L0,0 Z"
              fill="#12121E"
            />
          </svg>
        </div>

        {/* Faint glowing blue ruled lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(0, 212, 196, 0.08) 23px, rgba(0, 212, 196, 0.08) 24px)',
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-3 pb-2">
          <div>
            <h3 className="font-handwritten text-base gradient-text font-medium">
              {data.name} Itinerary
            </h3>
            <p className="text-[10px] font-body text-text-secondary/60 flex items-center gap-1">
              <MapPin size={10} strokeWidth={2} /> {data.month} · 4 Days
            </p>
          </div>
          <div
            className="text-lg px-2 py-1 rounded-sm"
            style={{
              background: 'rgba(0, 212, 196, 0.06)',
              border: '1px solid rgba(0, 212, 196, 0.1)',
            }}
          >
            <span className="font-handwritten text-sm gradient-text">Day 1</span>
          </div>
        </div>

        {/* Timeline with wobbly hand-drawn dashed SVG line */}
        <div className="relative z-10 pl-5">
          {/* Wobbly dashed line SVG */}
          <svg
            className="absolute left-[3px] top-1 bottom-1 pointer-events-none"
            width="8"
            height="240"
            viewBox="0 0 8 240"
            preserveAspectRatio="none"
          >
            <path
              d="M4,0 C6,3 2,7 4,11 C6,15 2,19 4,23 C6,27 2,31 4,35 C6,39 2,43 4,47 C6,51 2,55 4,59 C6,63 2,67 4,71 C6,75 2,79 4,83 C6,87 2,91 4,95 C6,99 2,103 4,107 C6,111 2,115 4,119 C6,123 2,127 4,131 C6,135 2,139 4,143 C6,147 2,151 4,155 C6,159 2,163 4,167 C6,171 2,175 4,179 C6,183 2,187 4,191 C6,195 2,199 4,203 C6,207 2,211 4,215 C6,219 2,223 4,227 C6,231 2,235 4,239"
              stroke="#00D4C4"
              strokeWidth="1.5"
              strokeDasharray="2.5 3.5"
              fill="none"
              opacity="0.5"
              style={{ filter: 'drop-shadow(0 0 3px rgba(0, 212, 196, 0.2))' }}
            />
            {/* Glowing duplicate underneath */}
            <path
              d="M4,0 C6,3 2,7 4,11 C6,15 2,19 4,23 C6,27 2,31 4,35 C6,39 2,43 4,47 C6,51 2,55 4,59 C6,63 2,67 4,71 C6,75 2,79 4,83 C6,87 2,91 4,95 C6,99 2,103 4,107 C6,111 2,115 4,119 C6,123 2,127 4,131 C6,135 2,139 4,143 C6,147 2,151 4,155 C6,159 2,163 4,167 C6,171 2,175 4,179 C6,183 2,187 4,191 C6,195 2,199 4,203 C6,207 2,211 4,215 C6,219 2,223 4,227 C6,231 2,235 4,239"
              stroke="#00D4C4"
              strokeWidth="3"
              strokeDasharray="2.5 3.5"
              fill="none"
              opacity="0.1"
              style={{ filter: 'blur(4px)' }}
            />
          </svg>

          {/* Itinerary items */}
          {items.map((item, i) => (
            <div key={i} className="relative flex gap-2.5 pb-4 last:pb-1">
              {/* Timeline dot - hand-drawn circle */}
              <div className="flex-shrink-0 mt-0.5 relative z-10">
                <div
                  className="w-[10px] h-[10px] rounded-full flex items-center justify-center"
                  style={{
                    background: '#12121E',
                    border: '1.5px solid rgba(0, 212, 196, 0.5)',
                    boxShadow: '0 0 6px rgba(0, 212, 196, 0.15)',
                  }}
                >
                  <div
                    className="w-[4px] h-[4px] rounded-full"
                    style={{ background: '#00D4C4' }}
                  />
                </div>
              </div>

              {/* Content card */}
              <div
                className="flex-1 rounded-sm px-2.5 py-1.5"
                style={{
                  background: 'rgba(20, 20, 31, 0.5)',
                  borderLeft: '1px solid rgba(0, 212, 196, 0.06)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px]">{iconForTime(item.time)}</span>
                  <span
                    className="text-[10px] font-mono tracking-wider"
                    style={{ color: 'rgba(0, 212, 196, 0.6)' }}
                  >
                    {item.time}
                  </span>
                </div>
                <p className="text-sm font-display font-semibold text-text-primary mt-0.5 leading-tight">
                  {item.title}
                </p>
                <p className="text-[11px] font-body leading-tight mt-0.5" style={{ color: '#8888A0' }}>
                  {item.desc}
                </p>
                {item.type && (item.type === 'stay' || item.type === 'transport') && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onComparePrices?.(item.type!)}
                    className="mt-1 text-[9px] px-2 py-0.5 rounded-full font-display font-medium tracking-wide"
                    style={{
                      background: 'rgba(0, 212, 196, 0.08)',
                      border: '1px solid rgba(0, 212, 196, 0.2)',
                      color: '#00D4C4',
                    }}
                  >
                    🧾 Compare Prices
                  </motion.button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View Full Plan button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onViewPlan}
          className="relative z-10 mt-1 w-full py-2.5 rounded-full text-xs font-display font-semibold text-white tracking-wider overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 4s ease-in-out infinite',
            boxShadow: '0 0 20px rgba(0, 212, 196, 0.2), 0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          View Full Plan
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
            }}
          />
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ===== MAIN PLAN COMPONENT ===== */
export default function Plan() {
  const navigate = useNavigate()
  const { state, dispatch } = useRoamie()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* ---- State Machine ---- */
  const [step, setStep] = useState(0)
  // 0 = greeting + chips visible
  // 1 = user clicked chip, typing indicator
  // 2 = mood intro message + mood images
  // 3 = user liked mood, confirmation + loading
  // 4 = reveal itinerary card

  const [selectedKey, setSelectedKey] = useState<DestKey | null>(null)
  const [userMessage, setUserMessage] = useState('')
  const [likedMoods, setLikedMoods] = useState<number[]>([])
  const [inputText, setInputText] = useState('')
  const [showMoodImages, setShowMoodImages] = useState(false)
  const [showReveal, setShowReveal] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [aiError, setAiError] = useState(false)
  const [aiResult, setAiResult] = useState<AITripResponse | null>(null)
  const [bookingSheet, setBookingSheet] = useState<{ destination: string; type: string } | null>(null)
  const [currentTripId, setCurrentTripId] = useState<string | null>(null)

  /* ---- Effects ---- */
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }

  useEffect(() => { scrollToBottom() }, [step, showMoodImages, showReveal, likedMoods])

  // Step 0 → show chips (greeting is instant, no delay needed)

  // Handle chip click → transition to step 1
  const handleChipClick = (key: DestKey) => {
    setSelectedKey(key)
    setUserMessage(quickReplies.find((q) => q.key === key)?.label ?? '')
    setStep(1)

    // After 1.5s → show mood intro
    setTimeout(() => {
      setStep(2)
      setTimeout(() => setShowMoodImages(true), 200)
      scrollToBottom()
    }, 1500)
  }

  // Handle mood like → triggers AI generation
  const handleMoodToggle = (i: number) => {
    if (likedMoods.includes(i)) {
      setLikedMoods((prev) => prev.filter((m) => m !== i))
    } else {
      setLikedMoods([i]) // only one at a time for simplicity
      setAiError(false)
      setAiResult(null)

      // Transition to loading after a beat
      setTimeout(() => {
        setStep(3)
        scrollToBottom()

        // Call OpenAI for real trip generation
        const destInfo = destData[selectedKey!]
        const userInput = `I want to go to ${destInfo.name} in ${destInfo.month}. My vibe: ${destInfo.moodDesc}`
        const travelDNA = {
          name: state.name,
          vibes: state.selectedVibes,
          adventureLevel: state.adventureLevel,
          socialLevel: state.socialLevel,
        }

        generateTrip(userInput, travelDNA)
          .then((result) => {
            setAiResult(result)
            setStep(4)
            setIsSaved(true)

            // Save trip to context with raw days
            const tripId = generateId()
            setCurrentTripId(tripId)

            const itinerary: ItineraryItem[] = result.itinerary.flatMap((day) =>
              day.activities.map((a) => ({
                time: a.time,
                title: a.name,
                description: '',
              })),
            )

            dispatch({
              type: 'ADD_TRIP',
              payload: {
                id: tripId,
                destination: result.destination,
                preferences: [selectedKey!],
                likedMoods: [i],
                itinerary,
                rawDays: result.itinerary,
                createdAt: new Date().toISOString(),
              },
            })

            // Reward for planning
            dispatch({ type: 'ADD_COINS', payload: 50 })

            setTimeout(() => setShowReveal(true), 250)
            scrollToBottom()
          })
          .catch((err) => {
            console.error('AI generation failed:', err)
            setAiError(true)
            scrollToBottom()
          })
      }, 400)
    }
  }

  const handleViewPlan = () => {
    if (currentTripId) {
      navigate(`/itinerary/${currentTripId}`)
    } else {
      navigate('/trips')
    }
  }

  const handleInputSend = () => {
    if (!inputText.trim()) return
    // Just add as a user bubble for now
    // In a real app this would go to the AI
    setInputText('')
  }

  return (
    <div className="relative h-dvh flex flex-col" style={topoBg}>
      {/* ===== Header ===== */}
      <div
        className="flex-shrink-0 z-20 px-4 pt-3 pb-2.5"
        style={{
          borderBottom: '1px solid rgba(42, 42, 62, 0.4)',
          background: 'rgba(10, 10, 18, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-display font-semibold gradient-text">
              Plan with ROAMIE
            </h1>
            <p className="text-[10px] font-body tracking-wide" style={{ color: '#8888A0' }}>
              Let's build your perfect trip ✨
            </p>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="text-[9px] font-display font-semibold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              color: '#8888A0',
              border: '1px solid rgba(136, 136, 160, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#F0F0F5'
              e.currentTarget.style.borderColor = 'rgba(240, 240, 245, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#8888A0'
              e.currentTarget.style.borderColor = 'rgba(136, 136, 160, 0.15)'
            }}
          >
            Exit ✕
          </button>
        </div>
      </div>

      {/* ===== Chat Messages ===== */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* --- GREETING (step 0+) --- */}
        {step >= 0 && (
          <RoamieBubble delay={0.15}>
            Hey! Where are you thinking of going?
          </RoamieBubble>
        )}

        {/* --- QUICK REPLY CHIPS (step 0) --- */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2 pt-1 pb-2"
          >
            {quickReplies.map((reply, i) => (
              <QuickReplyChip
                key={reply.key}
                label={reply.label}
                index={i}
                onClick={() => handleChipClick(reply.key)}
              />
            ))}
          </motion.div>
        )}

        {/* --- USER MESSAGE (step 1+) --- */}
        {step >= 1 && selectedKey && (
          <UserBubble delay={0.1}>
            {userMessage}
          </UserBubble>
        )}

        {/* --- TYPING INDICATOR (step 1) --- */}
        {step === 1 && <TypingDots />}

        {/* --- MOOD INTRO (step 2+) --- */}
        {step >= 2 && selectedKey && (
          <>
            <RoamieBubble delay={0.1}>
              <span>
                Ooh, {destData[selectedKey].name} in {destData[selectedKey].month}!{' '}
                {destData[selectedKey].emoji} Before I build your trip — swipe through these
                and heart the ones that match your vibe.
              </span>
            </RoamieBubble>

            {/* Horizontal scroll of mood images */}
            {showMoodImages && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-0.5 -mx-0.5">
                  {moodImagesByDest[selectedKey].map((src, i) => (
                    <MoodImageCard
                      key={i}
                      src={src}
                      liked={likedMoods.includes(i)}
                      onToggle={() => handleMoodToggle(i)}
                      index={i}
                    />
                  ))}
                </div>
                <p
                  className="text-[10px] font-body text-center mt-1 tracking-wide"
                  style={{ color: 'rgba(136, 136, 160, 0.6)' }}
                >
                  {likedMoods.length === 0 ? 'Tap one to heart it ✨' : ''}
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* --- CONFIRMATION & LOADING (step 3) --- */}
        {step === 3 && selectedKey && (
          <>
            <RoamieBubble delay={0.1}>
              <span>
                Got it — {destData[selectedKey].moodDesc}. Give me 30 seconds...
              </span>
            </RoamieBubble>

            {/* Loading compass card */}
            <LoadingCompass />

            {/* AI error fallback */}
            {aiError && (
              <StickyNote rotate={0.5} className="max-w-[250px] mx-auto" delay={0.3}>
                <p className="font-handwritten text-sm gradient-text text-center">
                  Oops, my brain fuzzed out. Try again?
                </p>
              </StickyNote>
            )}
          </>
        )}

        {/* --- REVEAL (step 4) --- */}
        {step >= 4 && selectedKey && showReveal && (
          <>
            <RoamieBubble delay={0.1}>
              <span>
                Your adventure is ready! 🎉 Here's your custom {destData[selectedKey].name} itinerary.
              </span>
            </RoamieBubble>

            <TripRevealCard
              destKey={selectedKey}
              onViewPlan={handleViewPlan}
              aiActivities={aiResult?.itinerary[0]?.activities}
              aiDestination={aiResult?.destination}
              onComparePrices={(type) =>
                setBookingSheet({
                  destination: aiResult?.destination ?? destData[selectedKey].name,
                  type,
                })
              }
            />

            {/* Saved confirmation */}
            {isSaved && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center pb-2"
              >
                <p className="font-handwritten text-xs" style={{ color: 'rgba(0, 212, 196, 0.5)' }}>
                  ✦ Trip saved to your collection ✦
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* ===== Input Bar (Fixed at bottom) ===== */}
      <div
        className="flex-shrink-0 z-20 px-3 pb-3 pt-2"
        style={{
          background: 'rgba(10, 10, 18, 0.85)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(42, 42, 62, 0.3)',
        }}
      >
        <div
          className="relative flex items-center gap-2 rounded-full px-4 py-2.5"
          style={{
            background: 'rgba(20, 20, 31, 0.9)',
            border: '1px solid rgba(0, 212, 196, 0.08)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.02)',
          }}
        >
          {/* Mic icon */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 p-1 rounded-full transition-colors duration-200"
            style={{ color: 'rgba(136, 136, 160, 0.6)' }}
            whileHover={{ color: '#00D4C4' }}
          >
            <Mic size={16} strokeWidth={1.8} />
          </motion.button>

          {/* Input field */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInputSend()}
              placeholder="Type a message..."
              className="w-full bg-transparent text-sm text-text-primary placeholder-text-secondary/50 font-body outline-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            {/* Faint glowing blue underline */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-300"
              style={{
                background: inputText.trim()
                  ? 'linear-gradient(90deg, transparent, #00D4C4, transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(0, 212, 196, 0.1), transparent)',
                opacity: inputText.trim() ? 0.8 : 0.3,
                boxShadow: inputText.trim()
                  ? '0 0 8px rgba(0, 212, 196, 0.3)'
                  : 'none',
              }}
            />
          </div>

          {/* Send button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleInputSend}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: inputText.trim()
                ? 'linear-gradient(135deg, #00D4C4, #2A6BFF)'
                : 'rgba(42, 42, 62, 0.5)',
              boxShadow: inputText.trim()
                ? '0 0 16px rgba(0, 212, 196, 0.25), 0 2px 8px rgba(0,0,0,0.2)'
                : 'none',
            }}
          >
            <Send
              size={14}
              strokeWidth={2.5}
              style={{
                color: inputText.trim() ? '#0A0A12' : 'rgba(136, 136, 160, 0.4)',
                transition: 'color 0.3s ease',
              }}
            />
          </motion.button>
        </div>
      </div>

      {/* ===== Booking Sheet Overlay ===== */}
      {bookingSheet && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setBookingSheet(null)}
          />
          <BookingSheet
            destination={bookingSheet.destination}
            type={bookingSheet.type}
            onClose={() => setBookingSheet(null)}
          />
        </>
      )}
    </div>
  )
}

/* ===== BOOKING SHEET (affiliate links bottom sheet) ===== */
function BookingSheet({
  destination,
  type,
  onClose,
}: {
  destination: string
  type: string
  onClose: () => void
}) {
  const links = getAffiliateLinks(destination, type)

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl px-4 pt-5 pb-8"
      style={{
        background: '#14141F',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.4)',
      }}
    >
      <WashiTape color="purple" rotate={2} className="-top-3 left-1/2 -translate-x-1/2" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-handwritten text-base gradient-text font-medium">
          {type === 'stay' ? '🏨 Places to Stay' : '🚗 Getting There'}
        </h3>
        <button
          onClick={onClose}
          className="text-xs font-display font-medium uppercase tracking-wider"
          style={{ color: '#8888A0' }}
        >
          Close ✕
        </button>
      </div>

      <div className="space-y-2">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-left px-4 py-3 rounded-lg text-sm font-display font-medium transition-all duration-200"
            style={{
              background: 'rgba(0, 212, 196, 0.04)',
              border: '1px solid rgba(0, 212, 196, 0.08)',
              color: '#00D4C4',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 196, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(0, 212, 196, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 212, 196, 0.04)'
              e.currentTarget.style.borderColor = 'rgba(0, 212, 196, 0.08)'
            }}
          >
            <span className="flex items-center justify-between">
              {link.name}
              <span className="text-[10px] opacity-60">↗</span>
            </span>
          </a>
        ))}
      </div>
    </motion.div>
  )
}
