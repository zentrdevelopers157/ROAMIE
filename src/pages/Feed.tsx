import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  MapPin,
} from 'lucide-react'
import PolaroidCard from '../components/PolaroidCard'
import { getCommunityPosts } from '../lib/db'
import { useAuth } from '../store/AuthContext'

/* ===== SPRING ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== MOCK FALLBACK POSTS (used when Supabase is not configured) ===== */
const mockPosts = [
  {
    id: '1',
    user: { name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=85&fm=webp' },
    location: 'Goa, India',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900&q=85&fm=webp',
    caption: 'Found paradise in the sands of Goa. The waves have a way of washing away every worry. 🌊✨',
    likes: 234,
    comments: 18,
    time: '2h ago',
    tags: '#beachlife #goa #wanderlust',
  },
  {
    id: '2',
    user: { name: 'Arjun Mehta', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=85&fm=webp' },
    location: 'Manali, India',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=900&q=85&fm=webp',
    caption: 'Snow-capped peaks and endless pine forests. Manali feels like a painting come to life. 🏔️❄️',
    likes: 189,
    comments: 12,
    time: '5h ago',
    tags: '#mountains #manali #adventure',
  },
  {
    id: '3',
    user: { name: 'Ananya Patel', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=85&fm=webp' },
    location: 'Kerala, India',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=900&q=85&fm=webp',
    caption: 'God\'s Own Country indeed. Backwaters, coconut trees, and the most peaceful sunrise I\'ve ever witnessed. 🥥🌅',
    likes: 312,
    comments: 24,
    time: '8h ago',
    tags: '#kerala #backwaters #nature',
  },
  {
    id: '4',
    user: { name: 'Rohan Kapoor', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=85&fm=webp' },
    location: 'Rishikesh, India',
    image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=900&q=85&fm=webp',
    caption: 'Found my zen by the Ganges. Rishikesh isn\'t just a place — it\'s a feeling. 🧘🕉️',
    likes: 156,
    comments: 9,
    time: '12h ago',
    tags: '#rishikesh #yoga #spiritual',
  },
  {
    id: '5',
    user: { name: 'Zara Sheikh', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=85&fm=webp' },
    location: 'Udaipur, India',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=900&q=85&fm=webp',
    caption: 'The City of Lakes stole my heart. Every corner here is a postcard waiting to be captured. 📸💙',
    likes: 278,
    comments: 21,
    time: '1d ago',
    tags: '#udaipur #royal #travelgram',
  },
]

/* ===== POST COMPONENT ===== */
function FeedPost({ post, index }: { post: FeedPostData; index: number }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(prev => liked ? prev - 1 : prev + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springGentle, delay: index * 0.1 }}
    >
      <PolaroidCard rotate={index % 2 === 0 ? 0.5 : -0.5} className="w-full mb-4">
        {/* Header */}
        <div className="flex items-center justify-between px-1 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-cover bg-center ring-2 ring-brand-cyan/20"
              style={{ backgroundImage: `url(${post.user.avatar})` }}
              role="img"
              aria-label={post.user.name}
            />
            <div>
              <p className="text-[13px] font-display font-semibold text-[#1A1A2E] leading-tight">{post.user.name}</p>
              <div className="flex items-center gap-1">
                <MapPin size={9} strokeWidth={2} className="text-text-secondary/60" />
                <span className="text-[9px] text-text-secondary/70">{post.location}</span>
              </div>
            </div>
          </div>
          <button className="text-text-secondary/40 hover:text-text-secondary transition-colors" aria-label="More options">
            <MoreHorizontal size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Image */}
        <div className="relative overflow-hidden rounded-sm group">
          <div
            className="h-64 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url(${post.image})` }}
            role="img"
            aria-label={`Photo by ${post.user.name}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Time badge */}
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white/80 text-[9px] font-mono">
            {post.time}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between px-0.5 pt-2.5 pb-1">
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={handleLike}
              className="transition-colors"
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <Heart
                size={18}
                strokeWidth={liked ? 0 : 2}
                className={liked ? 'text-brand-cyan' : 'text-text-secondary/60'}
                fill={liked ? '#00D4C4' : 'none'}
                style={{ filter: liked ? 'drop-shadow(0 0 6px rgba(0, 212, 196, 0.4))' : 'none' }}
              />
            </motion.button>
            <button className="text-text-secondary/60 hover:text-text-primary transition-colors" aria-label="Comment">
              <MessageCircle size={17} strokeWidth={2} />
            </button>
            <button className="text-text-secondary/60 hover:text-text-primary transition-colors" aria-label="Share">
              <Share2 size={16} strokeWidth={2} />
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 1.2 }}
            onClick={() => setSaved(!saved)}
            aria-label={saved ? 'Unsave' : 'Save'}
          >
            <Bookmark
              size={16}
              strokeWidth={2}
              className={saved ? 'text-brand-purple' : 'text-text-secondary/60'}
              fill={saved ? '#8A2BE2' : 'none'}
              style={{ filter: saved ? 'drop-shadow(0 0 6px rgba(138, 43, 226, 0.4))' : 'none' }}
            />
          </motion.button>
        </div>

        {/* Likes */}
        <div className="px-0.5 pb-1">
          <p className="text-[12px] font-display font-semibold text-[#1A1A2E]">
            {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
          </p>
        </div>

        {/* Caption */}
        <div className="px-0.5 pb-1">
          <p className="text-[12px] text-text-secondary/90 leading-relaxed">
            <span className="font-display font-semibold text-[#1A1A2E]">{post.user.name}</span>{' '}
            {post.caption}
          </p>
          <p className="text-[10px] text-brand-blue/80 mt-0.5 font-medium">{post.tags}</p>
        </div>

        {/* Comments link */}
        <div className="px-0.5 pt-0.5 border-t border-gray-100">
          <button className="text-[10px] text-text-secondary/50 hover:text-text-secondary/80 transition-colors py-1.5">
            View all {post.comments} comments
          </button>
        </div>
      </PolaroidCard>
    </motion.div>
  )
}

/* ===== STORIES ROW ===== */
const stories = [
  { name: 'Priya', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=85&fm=webp' },
  { name: 'Arjun', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=85&fm=webp' },
  { name: 'Ananya', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=85&fm=webp' },
  { name: 'Rohan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=85&fm=webp' },
  { name: 'Zara', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=85&fm=webp' },
]

/* ===== POST TYPE (unified for mock + Supabase) ===== */
interface FeedPostData {
  id: string
  user: { name: string; avatar: string }
  location: string
  image: string
  caption: string
  likes: number
  comments: number
  time: string
  tags: string
}

/* ===== TIME HELPER ===== */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

/* ===== MAIN FEED COMPONENT ===== */
export default function Feed() {
  const [posts, setPosts] = useState<FeedPostData[]>([])
  const [loading, setLoading] = useState(true)
  useAuth() // access auth for future logged-in features

  useEffect(() => {
    async function fetchPosts() {
      const dbPosts = await getCommunityPosts()
      if (dbPosts && dbPosts.length > 0) {
        setPosts(
          dbPosts.map((p) => ({
            id: p.id,
            user: { name: p.user_name, avatar: p.user_avatar },
            location: p.location,
            image: p.image_url,
            caption: p.caption,
            likes: p.likes_count,
            comments: p.comments_count,
            time: timeAgo(p.created_at),
            tags: p.tags,
          })),
        )
      } else {
        // Fallback to mock data if Supabase not configured or no posts yet
        setPosts(mockPosts)
      }
      setLoading(false)
    }
    fetchPosts()
  }, [])

  return (
    <div className="px-4 pt-5 pb-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springGentle}
        className="mb-4"
      >
        <h1 className="text-xl font-display font-semibold text-text-primary">
          Community Feed
        </h1>
        <p className="text-xs text-text-secondary font-body -mt-0.5">
          Stories from fellow wanderers
        </p>
      </motion.div>

      {/* Stories row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none"
      >
        {stories.map((story, i) => (
          <motion.button
            key={story.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="flex flex-col items-center gap-1.5 flex-shrink-0"
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-cover bg-center ring-2 ring-brand-cyan/30 ring-offset-2 ring-offset-base-bg"
                style={{ backgroundImage: `url(${story.avatar})` }}
                role="img"
                aria-label={`${story.name}'s story`}
              />
              {i === 0 && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00D4C4, #2A6BFF)' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
              )}
            </div>
            <span className="text-[9px] font-display font-medium text-text-secondary truncate max-w-[60px]">
              {i === 0 ? 'Your Story' : story.name}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Feed Posts */}
      <div className="space-y-2 mt-1">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="font-handwritten text-sm" style={{ color: 'rgba(0, 212, 196, 0.4)' }}>
              Loading stories... 🌍
            </p>
          </motion.div>
        ) : (
          posts.map((post, i) => (
            <FeedPost key={post.id} post={post} index={i} />
          ))
        )}
      </div>
    </div>
  )
}
