import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { RoamieProvider } from './store/RoamieContext'
import { AuthProvider } from './store/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RoamieProvider>
          <App />
        </RoamieProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
