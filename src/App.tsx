import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import NoiseTexture from './components/NoiseTexture'
import BottomNav from './components/BottomNav'

/* ===== EAGER IMPORTS (critical path — always loaded) ===== */
import Splash from './pages/Splash'
import Home from './pages/Home'

/* ===== LAZY IMPORTS (code-split — loaded on demand) ===== */
const Onboarding = lazy(() => import('./pages/Onboarding'))
const OnboardingV2 = lazy(() => import('./pages/OnboardingV2'))
const Trips = lazy(() => import('./pages/Trips'))
const Plan = lazy(() => import('./pages/Plan'))
const Itinerary = lazy(() => import('./pages/Itinerary'))
const Feed = lazy(() => import('./pages/Feed'))
const Profile = lazy(() => import('./pages/Profile'))
const Auth = lazy(() => import('./pages/Auth'))
const ProPaywall = lazy(() => import('./pages/ProPaywall'))
const Chat = lazy(() => import('./pages/Chat'))
const Stats = lazy(() => import('./pages/Stats'))
const Radar = lazy(() => import('./pages/Radar'))
const SpinWheel = lazy(() => import('./pages/SpinWheel'))
const Passport = lazy(() => import('./pages/Passport'))

/* ===== LOADING SPINNER (shown while lazy chunk loads) ===== */
function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <div
          className="w-10 h-10 mx-auto mb-3 rounded-full animate-spin"
          style={{
            border: '2px solid rgba(0, 212, 196, 0.1)',
            borderTopColor: '#00D4C4',
          }}
        />
        <p className="font-handwritten text-sm" style={{ color: 'rgba(0, 212, 196, 0.4)' }}>
          Loading... 🌍
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const hideNav = location.pathname === '/' || location.pathname === '/onboarding' || location.pathname === '/onboard-v2' || location.pathname === '/auth' || location.pathname === '/plan' || location.pathname.startsWith('/itinerary') || location.pathname === '/pro' || location.pathname === '/chat' || location.pathname === '/stats'

  // Preload frequently visited pages after initial render so chunks are cached
  // before the user clicks navigation
  useEffect(() => {
    const preload = async () => {
      // Defer until browser is idle or 2s have passed
      await new Promise<void>((resolve) => {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => resolve(), { timeout: 2000 })
        } else {
          setTimeout(resolve, 1000)
        }
      })
      // Trigger chunk loading for the most-visited pages
      // Home is already eagerly imported, so only Plan & Trips need preloading
      import('./pages/Plan').catch(() => {})
      import('./pages/Trips').catch(() => {})
    }
    preload()
  }, [])

  return (
    /* ===== DESKTOP FRAME: floating phone on large screens ===== */
    <div className="min-h-screen bg-[#050508] flex items-center justify-center">
      <div
        className="relative w-full max-w-md min-h-screen bg-[#0A0A12] overflow-y-auto overflow-x-hidden"
        style={{
          boxShadow: '0 0 80px rgba(42, 107, 255, 0.15), 0 0 160px rgba(0, 212, 196, 0.05)',
        }}
      >
        <NoiseTexture />

        <main className={`relative z-10 ${hideNav ? 'pb-0' : 'pb-24'}`}>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/home" element={<Home />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/plan" element={<Plan />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/itinerary/:tripId" element={<Itinerary />} />
              <Route path="/pro" element={<ProPaywall />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/onboard-v2" element={<OnboardingV2 />} />
              <Route path="/radar" element={<Radar />} />
              <Route path="/spin" element={<SpinWheel />} />
              <Route path="/passport" element={<Passport />} />
            </Routes>
          </Suspense>
        </main>

        {!hideNav && <BottomNav />}
      </div>
    </div>
  )
}
