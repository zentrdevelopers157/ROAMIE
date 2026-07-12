export default function PushPin({ className = '' }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className={className}
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
    >
      <defs>
        <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4C4" />
          <stop offset="100%" stopColor="#8A2BE2" />
        </linearGradient>
      </defs>
      <circle cx="10" cy="7" r="4.5" fill="url(#pinGrad)" />
      <line x1="10" y1="11" x2="10" y2="19" stroke="#8888A0" strokeWidth="1.2" />
      <circle cx="8.5" cy="5.5" r="1.5" fill="white" opacity="0.3" />
    </svg>
  )
}
