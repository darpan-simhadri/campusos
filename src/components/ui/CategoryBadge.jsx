export function CategoryBadge({ label, color }) {
  const isLight = color === '#C8F135' || color === '#4CAF50'
  return (
    <span
      className="rounded text-[10px] font-bold px-2 py-0.5 inline-block"
      style={{
        background: color,
        color: isLight ? '#000000' : '#ffffff',
        fontFamily: 'Anton, sans-serif',
        letterSpacing: '0.05em',
        lineHeight: 1.6,
      }}
    >
      {label}
    </span>
  )
}
