import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Mic, Send, Clock, MapPin } from 'lucide-react'
import { RoamieBubble, UserBubble, TypingDots } from '../components/ChatUI'
import { chatWithRoamie } from '../lib/ai'

/* ===== TOPOGRAPHIC BG ===== */
const topoBg: React.CSSProperties = {
  backgroundColor: '#0A0A12',
  backgroundImage: `
    radial-gradient(ellipse at 20% 30%, rgba(0, 212, 196, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(42, 107, 255, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(138, 43, 226, 0.03) 0%, transparent 50%),
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4C4' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")
  `,
}

/* ===== SUGGESTION CHIPS ===== */
const suggestionChips = [
  'Best street food in Delhi? 🍜',
  'How to negotiate auto fares? 🛺',
  'Hidden gems in Goa?',
]

/* ===== SPRING ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

/* ===== AI PLACE CARD (rendered when AI returns JSON) ===== */
function AIPlaceCard({ data }: { data: { name: string; description: string; openTime: string; imageUrl: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className="rounded-sm overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)] max-w-[260px]"
      style={{
        background: '#14141F',
        border: '1px solid rgba(0, 212, 196, 0.1)',
      }}
    >
      {/* Image */}
      <div
        className="h-28 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${data.imageUrl})` }}
      />

      {/* Content */}
      <div className="p-2.5">
        <div className="flex items-center gap-1.5 mb-1">
          <MapPin size={10} strokeWidth={2} className="text-brand-cyan" />
          <p className="font-handwritten text-sm gradient-text font-medium leading-tight">
            {data.name}
          </p>
        </div>

        <p className="text-[10px] font-body leading-relaxed" style={{ color: '#8888A0' }}>
          {data.description}
        </p>

        <div className="flex items-center gap-1 mt-1.5">
          <Clock size={9} strokeWidth={2} className="text-brand-cyan/60" />
          <span className="text-[9px] font-mono" style={{ color: 'rgba(0, 212, 196, 0.5)' }}>
            {data.openTime}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/* ===== JSON EXTRACTOR: handles both raw and markdown-wrapped JSON ===== */
function tryExtractPlaceData(text: string): {
  name: string; description: string; openTime: string; imageUrl: string; rawJson: string
} | null {
  // Step 1: Strip markdown code fences
  const stripped = text.replace(/```(?:json)?\n?/g, '').trim()

  // Step 2: Try to find JSON with "type": "place" in the stripped text
  const jsonMatch = stripped.match(/\{[\s\S]*"type"\s*:\s*"place"[\s\S]*\}/)
  if (!jsonMatch) return null

  try {
    const parsed = JSON.parse(jsonMatch[0])
    if (parsed.type === 'place' && parsed.name) {
      return {
        name: parsed.name,
        description: parsed.description || '',
        openTime: parsed.openTime || '',
        imageUrl: parsed.imageUrl || '',
        rawJson: jsonMatch[0],
      }
    }
  } catch {
    // JSON parse failed — not valid JSON
  }

  return null
}

/* ===== MESSAGE TYPE ===== */
interface Message {
  role: 'user' | 'roamie'
  content: string
  isPlace?: boolean
  placeData?: { name: string; description: string; openTime: string; imageUrl: string }
}

/* ===== MAIN CHAT COMPONENT ===== */
export default function Chat() {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }

  useEffect(() => { scrollToBottom() }, [messages, isTyping])

  const handleSend = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInputText('')
    setIsTyping(true)
    setError(null)

    try {
      const history = messages.map((m) => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      }))

      const reply = await chatWithRoamie(trimmed, history)

      // Check if AI returned JSON (place card) — handle markdown-wrapped JSON
      const placeData = tryExtractPlaceData(reply)
      if (placeData) {
        setMessages((prev) => [...prev, {
          role: 'roamie',
          content: reply.replace(placeData.rawJson, '').replace(/```(?:json)?\n?/g, '').trim(),
          isPlace: true,
          placeData: {
            name: placeData.name,
            description: placeData.description,
            openTime: placeData.openTime,
            imageUrl: placeData.imageUrl || `https://source.unsplash.com/800x600/?${encodeURIComponent(placeData.name)}`,
          },
        }])
        return
      }

      // Normal text response
      setMessages((prev) => [...prev, { role: 'roamie', content: reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputText)
    }
  }

  const handleChipClick = (text: string) => {
    handleSend(text)
  }

  const isChatEmpty = messages.length === 0 && !isTyping

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
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)}
              className="p-1 rounded-full transition-colors duration-200"
              style={{ color: '#8888A0' }}
              whileHover={{ color: '#00D4C4' }}
            >
              <ArrowLeft size={18} strokeWidth={2} />
            </motion.button>
            <div>
              <h1 className="text-base font-display font-semibold gradient-text">
                Ask Roamie
              </h1>
              <p className="text-[10px] font-body tracking-wide" style={{ color: '#8888A0' }}>
                Your travel soulmate 💬
              </p>
            </div>
          </div>

          <svg width="22" height="22" viewBox="0 0 100 100" fill="none">
            <rect x="22" y="32" width="56" height="48" rx="8" fill="#00D4C4" opacity="0.9" />
            <path d="M22 48h56v3H22z" fill="#0A0A12" opacity="0.25" />
            <rect x="40" y="24" width="20" height="10" rx="5" fill="#2A6BFF" opacity="0.8" />
            <rect x="22" y="36" width="6" height="32" rx="3" fill="#8A2BE2" opacity="0.6" />
            <rect x="72" y="36" width="6" height="32" rx="3" fill="#8A2BE2" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* ===== Message List ===== */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-none"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Empty state */}
        {isChatEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <RoamieBubble delay={0.1}>
              Hey wanderer! 👋 Ask me anything about travel — food, hidden gems, how to save money, or just shoot the breeze!
            </RoamieBubble>

            <div className="flex flex-wrap gap-2 pt-1">
              {suggestionChips.map((chip, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...springGentle, delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleChipClick(chip)}
                  className="relative px-4 py-2.5 rounded-full text-sm font-display font-semibold tracking-wide transition-shadow duration-300"
                  style={{
                    background: 'rgba(20, 20, 31, 0.85)',
                    backdropFilter: 'blur(8px)',
                    border: '1.5px solid rgba(0, 212, 196, 0.25)',
                    color: '#F0F0F5',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.25), 0 0 20px rgba(0, 212, 196, 0.04)',
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ boxShadow: '0 0 18px rgba(0, 212, 196, 0.12), inset 0 0 18px rgba(0, 212, 196, 0.04)' }}
                  />
                  {chip}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          msg.role === 'user' ? (
            <UserBubble key={i} delay={0}>
              {msg.content}
            </UserBubble>
          ) : (
            <div key={i} className="space-y-2">
              {msg.content && (
                <RoamieBubble delay={0}>
                  {msg.content}
                </RoamieBubble>
              )}
              {msg.isPlace && msg.placeData && (
                <div className="flex justify-start max-w-[88%] ml-9">
                  <AIPlaceCard data={msg.placeData} />
                </div>
              )}
            </div>
          )
        ))}

        {/* Typing dots */}
        {isTyping && <TypingDots />}

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-2"
          >
            <p className="font-handwritten text-xs" style={{ color: 'rgba(255, 107, 107, 0.6)' }}>
              Oops, my brain fuzzed out. Try again? 🫠
            </p>
          </motion.div>
        )}
      </div>

      {/* ===== Suggestion chips when chat has history ===== */}
      {!isChatEmpty && !isTyping && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 px-3 pb-1.5"
          style={{
            background: 'rgba(10, 10, 18, 0.85)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {suggestionChips.map((chip, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleChipClick(chip)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-display font-semibold tracking-wide transition-all duration-200"
                style={{
                  background: 'rgba(20, 20, 31, 0.7)',
                  border: '1px solid rgba(0, 212, 196, 0.15)',
                  color: '#C0C0D5',
                }}
              >
                {chip}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ===== Input Bar ===== */}
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
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex-shrink-0 p-1 rounded-full transition-colors duration-200"
            style={{ color: 'rgba(136, 136, 160, 0.6)' }}
            whileHover={{ color: '#00D4C4' }}
          >
            <Mic size={16} strokeWidth={1.8} />
          </motion.button>

          <motion.div
            className="flex-1 relative"
            animate={{
              boxShadow: isFocused ? '0 0 20px rgba(99, 102, 241, 0.2)' : 'none',
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.input
              id="roamie-chat-input"
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask Roamie anything..."
              className="w-full bg-transparent text-sm text-text-primary placeholder-text-secondary/50 font-body outline-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
              disabled={isTyping}
              animate={{
                height: isFocused ? 30 : 20,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
            <div
              className="absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-300"
              style={{
                background: inputText.trim()
                  ? 'linear-gradient(90deg, transparent, #00D4C4, transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(0, 212, 196, 0.1), transparent)',
                opacity: inputText.trim() ? 0.8 : 0.3,
                boxShadow: inputText.trim() ? '0 0 8px rgba(0, 212, 196, 0.3)' : 'none',
              }}
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSend(inputText)}
            disabled={!inputText.trim() || isTyping}
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
    </div>
  )
}
