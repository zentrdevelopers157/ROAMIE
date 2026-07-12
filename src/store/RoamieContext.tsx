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
}

export interface RoamieState {
  name: string
  selectedVibes: number[]
  adventureLevel: number
  socialLevel: number
  trips: SavedTrip[]
  onboarded: boolean
}

type Action =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_VIBES'; payload: number[] }
  | { type: 'SET_ADVENTURE_LEVEL'; payload: number }
  | { type: 'SET_SOCIAL_LEVEL'; payload: number }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'ADD_TRIP'; payload: SavedTrip }
  | { type: 'REMOVE_TRIP'; payload: string }
  | { type: 'LOAD_STATE'; payload: RoamieState }

/* ===== INITIAL STATE ===== */
const initialState: RoamieState = {
  name: '',
  selectedVibes: [],
  adventureLevel: 5,
  socialLevel: 6,
  trips: [],
  onboarded: false,
}

/* ===== REDUCER ===== */
function roamieReducer(state: RoamieState, action: Action): RoamieState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload }
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
