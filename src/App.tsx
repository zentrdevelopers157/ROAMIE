import { Routes, Route, useLocation } from 'react-router-dom'
import NoiseTexture from './components/NoiseTexture'
import BottomNav from './components/BottomNav'
import Splash from './pages/Splash'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Trips from './pages/Trips'
import Plan from './pages/Plan'
import Feed from './pages/Feed'
import Profile from './pages/Profile'
import Auth from './pages/Auth'

export default function App() {
  const location = useLocation()
  const hideNav = location.pathname === '/' || location.pathname === '/onboarding' || location.pathname === '/auth'

  return (
    <div className="relative min-h-screen bg-base-bg">
      <NoiseTexture />

      <main className={`relative z-10 ${hideNav ? 'pb-0' : 'pb-24'}`}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>

      {!hideNav && <BottomNav />}
    </div>
  )
}
