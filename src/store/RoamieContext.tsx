import { createContext, useContext, useReducer, useEffect, type ReactNode, type Dispatch } from 'react'

/* ===== TYPES ===== */
export interface ItineraryItem {
  time: string
  title: string
  description: string
}

/* Raw AI day data for preserving day-grouped itineraries */
export interface RawActivity {
  time: string
  name: string
  type: 'food' | 'stay' | 'activity' | 'transport'
  cost: number
}

export interface RawDay {
  day: number
  activities: RawActivity[]
}

export interface SavedTrip {
  id: string
  destination: string
  preferences: string[]
  likedMoods: number[]
  itinerary: ItineraryItem[]
  rawDays?: RawDay[]
  createdAt: string
  startDate?: string
  endDate?: string
}

export interface BookedOption {
  type: string
  name: string
  price: number
  reason: string
}

export interface ConfirmedBooking {
  destination: string
  selectedOptions: BookedOption[]
  totalPaid: number
  paidAt: string
}

export interface RoamieState {
  name: string
  nickname: string
  selectedVibes: number[]
  adventureLevel: number
  socialLevel: number
  trips: SavedTrip[]
  onboarded: boolean
  roamCoins: number
  isPro: boolean
  proExpiresAt: string | null
  confirmedBookings: ConfirmedBooking[]
  selectedDestKinds: string[]
}

type Action =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_NICKNAME'; payload: string }
  | { type: 'SET_VIBES'; payload: number[] }
  | { type: 'SET_ADVENTURE_LEVEL'; payload: number }
  | { type: 'SET_SOCIAL_LEVEL'; payload: number }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'ADD_TRIP'; payload: SavedTrip }
  | { type: 'REMOVE_TRIP'; payload: string }
  | { type: 'UPDATE_TRIP_DATES'; payload: { id: string; startDate: string; endDate: string } }
  | { type: 'LOAD_STATE'; payload: RoamieState }
  | { type: 'ADD_COINS'; payload: number }
  | { type: 'SET_PRO'; payload: { isPro: boolean; expiresAt: string | null } }
  | { type: 'ADD_BOOKING'; payload: ConfirmedBooking }
  | { type: 'SET_DEST_KINDS'; payload: string[] }

/* ===== INITIAL STATE ===== */
export const initialState: RoamieState = {
  name: '',
  nickname: '',
  selectedVibes: [],
  adventureLevel: 5,
  socialLevel: 6,
  trips: [],
  onboarded: false,
  roamCoins: 100,
  isPro: false,
  proExpiresAt: null,
  confirmedBookings: [],
  selectedDestKinds: [],
}

/* ===== REDUCER ===== */
export function roamieReducer(state: RoamieState, action: Action): RoamieState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload }
    case 'SET_NICKNAME':
      return { ...state, nickname: action.payload }
    case 'SET_VIBES':
      return { ...state, selectedVibes: action.payload }
    case 'SET_ADVENTURE_LEVEL':
      return { ...state, adventureLevel: action.payload }
    case 'SET_SOCIAL_LEVEL':
      return { ...state, socialLevel: action.payload }
    case 'COMPLETE_ONBOARDING':
      return { ...state, onboarded: true }
    case 'ADD_TRIP':
      return { ...state, trips: [action.payload, ...state.trips] }
    case 'REMOVE_TRIP':
      return { ...state, trips: state.trips.filter(t => t.id !== action.payload) }
    case 'UPDATE_TRIP_DATES':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.id
            ? { ...t, startDate: action.payload.startDate, endDate: action.payload.endDate }
            : t,
        ),
      }
    case 'ADD_COINS':
      return { ...state, roamCoins: (state.roamCoins ?? 100) + action.payload }
    case 'SET_PRO':
      return { ...state, isPro: action.payload.isPro, proExpiresAt: action.payload.expiresAt }
    case 'ADD_BOOKING':
      return { ...state, confirmedBookings: [action.payload, ...state.confirmedBookings] }
    case 'SET_DEST_KINDS':
      return { ...state, selectedDestKinds: action.payload }
    case 'LOAD_STATE':
      return { ...action.payload }
    default:
      return state
  }
}

/* ===== CONTEXT ===== */
interface RoamieContextType {
  state: RoamieState
  dispatch: Dispatch<Action>
}

const RoamieContext = createContext<RoamieContextType | null>(null)

const STORAGE_KEY = 'roamie_state'

/* ===== PROVIDER ===== */
export function RoamieProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(roamieReducer, initialState, () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...initialState, ...parsed }
      }
    } catch {
      // ignore parse errors
    }
    return initialState
  })

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage might be full
    }
  }, [state])

  return (
    <RoamieContext.Provider value={{ state, dispatch }}>
      {children}
    </RoamieContext.Provider>
  )
}

/* ===== HOOK ===== */
export function useRoamie() {
  const ctx = useContext(RoamieContext)
  if (!ctx) throw new Error('useRoamie must be used within a RoamieProvider')
  return ctx
}

/* ===== UTILITY: Generate trip ID ===== */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
