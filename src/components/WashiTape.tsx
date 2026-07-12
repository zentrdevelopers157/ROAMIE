export default function WashiTape({
  color = 'cyan',
  rotate = 0,
  className = '',
  size = 'md',
}: {
  color?: 'cyan' | 'purple'
  rotate?: number
  className?: string
  size?: 'sm' | 'md'
}) {
  const tapeColor = color === 'cyan'
    ? (size === 'sm' ? 'rgba(0, 212, 196, 0.2)' : 'rgba(0, 212, 196, 0.15)')
    : (size === 'sm' ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.15)')
  const borderColor = color === 'cyan'
    ? (size === 'sm' ? 'rgba(0, 212, 196, 0.3)' : 'rgba(0, 212, 196, 0.25)')
    : (size === 'sm' ? 'rgba(138, 43, 226, 0.3)' : 'rgba(138, 43, 226, 0.25)')
  const width = size === 'sm' ? '60px' : '80px'
  const height = size === 'sm' ? '20px' : '24px'

  return (
    <div
      className={`absolute ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        width,
        height,
        background: tapeColor,
        border: `1px dashed ${borderColor}`,
        borderRadius: '1px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        clipPath: 'polygon(0% 0%, 100% 0%, 96% 100%, 4% 100%)',
        opacity: 0.85,
      }}
    />
  )
}
