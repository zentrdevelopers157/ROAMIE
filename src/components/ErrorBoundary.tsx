import { Component, type ReactNode, type ErrorInfo } from 'react'
import NoiseTexture from './NoiseTexture'

/* ===== PROPS & STATE ===== */
interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/* ===== ERROR BOUNDARY ===== */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Roamie ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center relative"
          style={{ background: '#0A0A12' }}
        >
          <NoiseTexture />

          <div className="relative z-10 text-center px-6">
            {/* Decorative compass icon */}
            <div className="mb-5">
              <svg
                width="48"
                height="48"
                viewBox="0 0 80 80"
                fill="none"
                className="mx-auto"
                style={{ filter: 'drop-shadow(0 0 20px rgba(0,212,196,0.2))' }}
              >
                <path
                  d="M40 6 C50 5 62 10 68 18 C74 26 76 38 74 48 C72 58 66 68 56 72 C46 76 34 76 24 72 C14 68 8 58 6 48 C4 38 6 26 12 18 C18 10 30 7 40 6Z"
                  stroke="#00D4C4"
                  strokeWidth="1.8"
                  fill="none"
                  opacity="0.6"
                  strokeDasharray="2 3"
                />
                <path
                  d="M40 12 L44 28 L42 30 L40 34 L38 30 L36 28 Z"
                  fill="#00D4C4"
                  opacity="0.8"
                />
                <path
                  d="M40 68 L44 52 L42 50 L40 46 L38 50 L36 52 Z"
                  fill="#2A6BFF"
                  opacity="0.4"
                />
                <circle cx="40" cy="40" r="3" fill="#00D4C4" />
              </svg>
            </div>

            <p
              className="font-handwritten text-2xl gradient-text font-medium mb-2"
              style={{ backgroundSize: '200% 200%' }}
            >
              Roamie tripped. Restarting...
            </p>
            <p className="text-xs font-body text-text-secondary mb-6">
              Something went wrong on our end. Don't worry — your trips are safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full text-sm font-display font-semibold text-white tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #00D4C4, #2A6BFF, #8A2BE2)',
                backgroundSize: '200% 200%',
                boxShadow: '0 0 20px rgba(0, 212, 196, 0.2), 0 4px 12px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 212, 196, 0.35), 0 4px 15px rgba(0,0,0,0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 212, 196, 0.2), 0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
