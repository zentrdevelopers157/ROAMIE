import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Send, MapPin, Wallet, CheckCircle, X, Sparkles } from 'lucide-react'
import { RoamieBubble, UserBubble, TypingDots } from '../components/ChatUI'
import { useRoamie, generateId } from '../store/RoamieContext'
import type { ItineraryItem } from '../store/RoamieContext'
import { generateTrip, type AITripResponse, type AIRecommendationOption } from '../lib/ai'

/* ===== SPRINGS ===== */
const springGentle = { type: 'spring' as const, stiffness: 200, damping: 22 }

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

/* ===== PULSING DOTS LOADING ===== */
function PulsingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-[240px] mx-auto my-4"
    >
      <div
        className="rounded-2xl p-5 text-center"
        style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.15)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Glowing starburst gradient */}
        <div className="relative w-16 h-16 mx-auto mb-3 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <Sparkles size={24} style={{ color: '#818CF8' }} />
        </div>
        
        {/* 3 pulsing dots */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: '#818CF8' }}
              animate={{ scale: [0.7, 1.2, 0.7], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        <p className="text-sm font-semibold" style={{ color: '#C0C0F0' }}>Finding hidden gems...</p>
        <p className="text-[10px] font-sans mt-0.5" style={{ color: '#8888A0' }}>weaving your itinerary</p>
      </div>
    </motion.div>
  )
}

/* ===== 3D CONFETTI ===== */
function ConfettiBurst() {
  const colors = ['#00D4C4', '#2A6BFF', '#8A2BE2', '#FFD23F', '#FF6B6B', '#22C55E']
  return (
    <>
      {Array.from({ length: 15 }, (_, i) => (
        <div
          key={i}
          className="confetti-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${Math.random() * 6 + 4}px`,
            height: `${Math.random() * 6 + 4}px`,
            background: colors[i % colors.length],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${Math.random() * 1.5 + 2}s`,
            boxShadow: `0 0 6px ${colors[i % colors.length]}`,
          }}
        />
      ))}
    </>
  )
}

/* ===== SELECTION CARD (modern glass card for booking options) ===== */
function SelectionCard({
  option,
  type,
  selected,
  onSelect,
  index,
}: {
  option: AIRecommendationOption
  type: string
  selected: boolean
  onSelect: () => void
  index: number
}) {
  const typeEmoji = type === 'hotels' ? '🏨' : type === 'flights' ? '✈️' : '🚂'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springGentle, delay: index * 0.1 }}
    >
      <div
        className="w-full mb-2 rounded-2xl overflow-hidden"
        style={{
          background: '#12121F',
          backdropFilter: 'blur(8px)',
          border: selected ? '1.5px solid #818CF8' : '1px solid rgba(255,255,255,0.06)',
          boxShadow: selected ? '0 0 20px rgba(99, 102, 241, 0.2)' : '0 4px 16px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          className="px-3 py-2.5 cursor-pointer"
          onClick={onSelect}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{typeEmoji}</span>
              <span className="text-[13px] font-semibold text-text-primary">{option.name}</span>
            </div>
            <span className="text-sm font-bold" style={{ color: '#818CF8' }}>₹{option.price.toLocaleString('en-IN')}</span>
          </div>

          <p className="text-[10px] font-sans leading-relaxed" style={{ color: '#8888A0' }}>
            {option.reason}
          </p>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onSelect() }}
            className="mt-2 w-full py-1.5 rounded-full text-[10px] font-semibold tracking-wider transition-all duration-200"
            style={{
              background: selected
                ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                : 'rgba(99, 102, 241, 0.08)',
              border: selected ? 'none' : '1px solid rgba(99, 102, 241, 0.2)',
              color: selected ? '#FFFFFF' : '#818CF8',
            }}
          >
            {selected ? '✓ Selected' : 'Select'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ===== MOCK PAYMENT SHEET ===== */
function MockPaymentSheet({
  totalAmount,
  onPay,
  onClose,
}: {
  totalAmount: number
  onPay: () => void
  onClose: () => void
}) {
  const [upiId, setUpiId] = useState('')
  const [isPaying, setIsPaying] = useState(false)
  const [paid, setPaid] = useState(false)

  const handlePay = () => {
    setIsPaying(true)
    setTimeout(() => {
      setIsPaying(false)
      setPaid(true)
      onPay()
    }, 2000)
  }

  if (paid) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl px-4 pt-6 pb-8 flex flex-col items-center"
          style={{
            background: '#14141F',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.4)',
          }}
        >
          <div className="rounded-2xl p-5 text-center max-w-xs mx-auto" style={{ background: '#12121F', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
            <span className="text-3xl block mb-2">✅</span>
            <p className="text-base font-bold" style={{ color: '#818CF8' }}>
              Payment Simulated!
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: '#A78BFA' }}>
              Booking Confirmed ✅
            </p>
            <p className="text-[10px] font-sans mt-2" style={{ color: '#8888A0' }}>
              ₹{totalAmount.toLocaleString('en-IN')} charged to {upiId || 'your UPI'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-4 px-6 py-2 rounded-full text-[11px] font-semibold tracking-wider"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              color: '#818CF8',
            }}
          >
            Done
          </motion.button>
        </motion.div>
      </>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold" style={{ color: '#818CF8' }}>
            💳 Complete Payment
          </h3>
          <button onClick={onClose} className="text-text-secondary text-xs">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Credit card terminal UI */}
        <div
          className="rounded-lg p-4 mb-3"
          style={{
            background: 'linear-gradient(135deg, #0A1628, #1A2A44)',
            border: '1px solid rgba(0, 212, 196, 0.1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {/* Card chip */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-6 rounded-sm"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
              }}
            />
            <span className="text-[9px] font-mono text-yellow-400/60 tracking-widest">•••• 4582</span>
          </div>

          {/* Amount */}
          <div className="text-center mb-3">
            <p className="text-[9px] font-body uppercase tracking-wider" style={{ color: '#8888A0' }}>Total Amount</p>
            <p className="font-display text-2xl font-bold text-white">
              ₹{totalAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* UPI Input */}
        <div className="mb-3">
          <p className="text-[10px] font-display font-semibold tracking-wide mb-1" style={{ color: '#8888A0' }}>
            UPI ID
          </p>
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
            style={{
              background: 'rgba(10, 10, 18, 0.6)',
              border: '1px solid rgba(0, 212, 196, 0.12)',
            }}
          >
            <Wallet size={14} strokeWidth={1.5} className="text-brand-cyan" />
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-secondary/60 outline-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePay}
          disabled={!upiId.trim() || isPaying}
          className="w-full py-3 rounded-full text-xs font-display font-semibold text-white tracking-wider flex items-center justify-center gap-2 disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #00D4C4, #2A6BFF)',
            boxShadow: '0 0 20px rgba(0, 212, 196, 0.2)',
          }}
        >
          {isPaying ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Processing...
            </>
          ) : (
            <>Pay ₹{totalAmount.toLocaleString('en-IN')}</>
          )}
        </motion.button>
      </motion.div>
    </>
  )
}

/* ===== MAIN PLAN COMPONENT ===== */
export default function Plan() {
  const navigate = useNavigate()
  const { state, dispatch } = useRoamie()
  const scrollRef = useRef<HTMLDivElement>(null)
  const nickname = state.nickname || 'Roamie'

  /* ---- Sequential Interview State ---- */
  const [interviewStep, setInterviewStep] = useState(0)
  // 0 = greeting
  // 1 = asked destination, waiting for user input
  // 2 = asked budget, waiting
  // 3 = asked date, waiting
  // 4 = loading (compass)
  // 5 = reveal results + booking

  const [destination, setDestination] = useState('')
  const [budget, setBudget] = useState('')
  const [tripDate, setTripDate] = useState('')
  const [inputText, setInputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const [aiResult, setAiResult] = useState<AITripResponse | null>(null)
  const [aiError, setAiError] = useState(false)
  const [currentTripId, setCurrentTripId] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // Booking selection state
  const [selectedHotel, setSelectedHotel] = useState<number | null>(null)
  const [selectedFlight, setSelectedFlight] = useState<number | null>(null)
  const [selectedTrain, setSelectedTrain] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }

  useEffect(() => { scrollToBottom() }, [interviewStep, isTyping, isProcessing])

  const handleUserInput = () => {
    const text = inputText.trim()
    if (!text || isProcessing) return

    setInputText('')
    setIsProcessing(true)

    if (interviewStep === 0) {
      // Step 1: Destination
      setDestination(text)
      setIsProcessing(false)
      setInterviewStep(1)
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        scrollToBottom()
      }, 1000)
    } else if (interviewStep === 1) {
      // Step 2: Budget
      setBudget(text)
      setIsProcessing(false)
      setInterviewStep(2)
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        scrollToBottom()
      }, 1000)
    } else if (interviewStep === 2) {
      // Step 3: Date -> trigger AI generation
      // Keep isProcessing=true until AI responds to prevent race conditions
      setTripDate(text)
      setInterviewStep(3)

      // Call AI
      const userInput = `I want to visit ${destination} with a budget of ${budget} around ${text}.`
      const travelDNA = {
        name: state.name,
        vibes: state.selectedVibes,
        adventureLevel: state.adventureLevel,
        socialLevel: state.socialLevel,
      }

      generateTrip(userInput, travelDNA)
        .then((result) => {
          setIsProcessing(false)
          setAiResult(result)
          setInterviewStep(4)

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
              preferences: [],
              likedMoods: [],
              itinerary,
              rawDays: result.itinerary,
              createdAt: new Date().toISOString(),
            },
          })

          dispatch({ type: 'ADD_COINS', payload: 50 })
          setIsSaved(true)
          scrollToBottom()
        })
        .catch((err) => {
          setIsProcessing(false)
          console.error('AI generation failed:', err)
          setAiError(true)
          setInterviewStep(4)
          scrollToBottom()
        })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleUserInput()
    }
  }

  const allSelected = selectedHotel !== null && selectedFlight !== null && selectedTrain !== null
  const totalAmount = allSelected && aiResult
    ? (aiResult.recommendations.hotels[selectedHotel!].price +
       aiResult.recommendations.flights[selectedFlight!].price +
       aiResult.recommendations.trains[selectedTrain!].price)
    : 0

  const handlePaymentDone = () => {
    if (aiResult && allSelected) {
      const selectedOptions = [
        { ...aiResult.recommendations.hotels[selectedHotel!], type: 'hotel' },
        { ...aiResult.recommendations.flights[selectedFlight!], type: 'flight' },
        { ...aiResult.recommendations.trains[selectedTrain!], type: 'train' },
      ]
      dispatch({
        type: 'ADD_BOOKING',
        payload: {
          destination: aiResult.destination,
          selectedOptions,
          totalPaid: totalAmount,
          paidAt: new Date().toISOString(),
        },
      })
    }
    setShowPayment(false)
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
              Plan with {nickname}
            </h1>
            <p className="text-[10px] font-body tracking-wide" style={{ color: '#8888A0' }}>
              Let's build your perfect trip ✨
            </p>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="text-[9px] font-display font-semibold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full transition-all duration-200"
            style={{ color: '#8888A0', border: '1px solid rgba(136, 136, 160, 0.15)' }}
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
        {/* --- GREETING --- */}
        {interviewStep >= 0 && (
          <RoamieBubble delay={0.15} nickname={nickname}>
            Hey <span className="gradient-text">{state.name || 'wanderer'}</span>! Where do you want to visit? 🌍
          </RoamieBubble>
        )}

        {/* --- USER DESTINATION --- */}
        {destination && (
          <UserBubble delay={0.1}>{destination}</UserBubble>
        )}

    {/* --- STEP 2: BUDGET QUESTION --- */}
        {interviewStep >= 1 && !isTyping && (
          <RoamieBubble delay={0.1} nickname={nickname}>
            {destination ? `Ooh ${destination}! 🎯 What's your budget for this trip?` : "What's your budget?"}
          </RoamieBubble>
        )}

        {/* --- USER BUDGET --- */}
        {budget && (
          <UserBubble delay={0.1}>{budget}</UserBubble>
        )}

        {/* --- STEP 3: DATE QUESTION --- */}
        {interviewStep >= 2 && !isTyping && (
          <RoamieBubble delay={0.1} nickname={nickname}>
            {budget ? `Got it! When exactly are you planning to go? (Give me the date 📅)` : "When exactly? Give me the date"}
          </RoamieBubble>
        )}

        {/* --- USER DATE --- */}
        {tripDate && (
          <UserBubble delay={0.1}>{tripDate}</UserBubble>
        )}

        {/* --- TYPING DOTS --- */}
        {isTyping && <TypingDots />}

        {/* --- LOADING (Step 3) --- */}
        {interviewStep === 3 && (
          <>
            <RoamieBubble delay={0.1} nickname={nickname}>
              Give me a moment, weaving something special for {destination}...
            </RoamieBubble>
            <PulsingDots />
            {aiError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-[250px] mx-auto rounded-xl p-3 text-center"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                }}
              >
                <p className="text-sm font-medium" style={{ color: '#F87171' }}>
                  Oops, my brain fuzzed out. Try again?
                </p>
              </motion.div>
            )}
          </>
        )}

        {/* --- STEP 4: REVEAL + BOOKING OPTIONS --- */}
        {interviewStep >= 4 && aiResult && (
          <>
            <RoamieBubble delay={0.1} nickname={nickname}>
              Your adventure is ready! 🎉 Here's everything for {aiResult.destination}.
            </RoamieBubble>

            {/* Recommendations: Hotels */}
            <div className="mb-2 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={12} strokeWidth={1.8} className="text-brand-cyan" />
                <p className="font-handwritten text-sm gradient-text font-medium">
                  Where to Stay 🏨
                </p>
              </div>
              {aiResult.recommendations.hotels.map((opt, i) => (
                <SelectionCard
                  key={i}
                  option={opt}
                  type="hotels"
                  selected={selectedHotel === i}
                  onSelect={() => setSelectedHotel(i)}
                  index={i}
                />
              ))}
            </div>

            {/* Recommendations: Flights */}
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={12} strokeWidth={1.8} className="text-brand-cyan" />
                <p className="font-handwritten text-sm gradient-text font-medium">
                  How to Get There ✈️
                </p>
              </div>
              {aiResult.recommendations.flights.map((opt, i) => (
                <SelectionCard
                  key={i}
                  option={opt}
                  type="flights"
                  selected={selectedFlight === i}
                  onSelect={() => setSelectedFlight(i)}
                  index={i}
                />
              ))}
            </div>

            {/* Recommendations: Trains */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={12} strokeWidth={1.8} className="text-brand-cyan" />
                <p className="font-handwritten text-sm gradient-text font-medium">
                  Train Options 🚂
                </p>
              </div>
              {aiResult.recommendations.trains.map((opt, i) => (
                <SelectionCard
                  key={i}
                  option={opt}
                  type="trains"
                  selected={selectedTrain === i}
                  onSelect={() => setSelectedTrain(i)}
                  index={i}
                />
              ))}
            </div>

            {/* Lock & Pay button */}
            {allSelected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-3"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPayment(true)}
                  className="w-full py-3 rounded-full text-xs font-display font-semibold text-white tracking-wider flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                    backgroundSize: '200% 200%',
                    boxShadow: '0 0 25px rgba(0, 212, 196, 0.3), 0 4px 15px rgba(0,0,0,0.3)',
                  }}
                >
                  <CheckCircle size={16} strokeWidth={2.5} />
                  Lock & Pay via Roamie — ₹{totalAmount.toLocaleString('en-IN')}
                </motion.button>
              </motion.div>
            )}

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

      {/* ===== Input Bar ===== */}
      {interviewStep < 4 && (
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
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            }}
          >
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  interviewStep === 0 ? 'Type a destination...' :
                  interviewStep === 1 ? 'Your budget...' :
                  'Enter a date...'
                }
                className="w-full bg-transparent text-sm text-text-primary placeholder-text-secondary/50 font-body outline-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
                disabled={isProcessing || isTyping}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-300"
                style={{
                  background: inputText.trim()
                    ? 'linear-gradient(90deg, transparent, #00D4C4, transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(0, 212, 196, 0.1), transparent)',
                  opacity: inputText.trim() ? 0.8 : 0.3,
                }}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleUserInput}
              disabled={!inputText.trim() || isProcessing || isTyping}
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
              <Send size={14} strokeWidth={2.5} style={{ color: inputText.trim() ? '#0A0A12' : 'rgba(136, 136, 160, 0.4)' }} />
            </motion.button>
          </div>
        </div>
      )}

      {/* ===== View Full Plan Button (after reveal) ===== */}
      {interviewStep >= 4 && isSaved && currentTripId && (
        <div className="flex-shrink-0 z-20 px-3 pb-3 pt-2">
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/itinerary/${currentTripId}`)}
            className="w-full py-2.5 rounded-full text-xs font-display font-semibold tracking-wider"
            style={{
              background: 'rgba(0, 212, 196, 0.08)',
              border: '1px solid rgba(0, 212, 196, 0.2)',
              color: '#00D4C4',
            }}
          >
            View Full Itinerary →
          </motion.button>
        </div>
      )}

      {/* ===== Payment Sheet ===== */}      {showPayment && (
        <MockPaymentSheet
          totalAmount={totalAmount}
          onPay={() => {
            handlePaymentDone()
            dispatch({ type: 'ADD_COINS', payload: 100 })
          }}
          onClose={() => setShowPayment(false)}
        />
      )}

      {isSaved && <ConfettiBurst />}
    </div>
  )
}
