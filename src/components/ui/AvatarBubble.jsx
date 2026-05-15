export function AvatarBubble({ user, size = 'md', showName = true }) {
  const sizes = { sm: 40, md: 56, lg: 72 }
  const px = sizes[size] || 56
  const fontSize = size === 'lg' ? '1.5rem' : size === 'sm' ? '0.85rem' : '1.1rem'

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ width: px + 6 }}>
      <div className="relative">
        {/* Special "LIVE" circle */}
        {user.hasLive ? (
          <div
            className="rounded-full flex flex-col items-center justify-center"
            style={{ width: px, height: px, background: '#1C1C1C', border: '2px solid #333' }}
          >
            <span
              style={{
                color: '#00D4C8',
                fontSize: size === 'md' ? '0.58rem' : '0.5rem',
                fontWeight: 900,
                lineHeight: 1.2,
                fontFamily: 'Anton, sans-serif',
                textAlign: 'center',
                letterSpacing: '0.01em',
              }}
            >
              80<br />IN 08
            </span>
          </div>
        ) : (
          /* Normal avatar */
          <div
            className="rounded-full flex items-center justify-center overflow-hidden"
            style={{ width: px, height: px, background: user.avatarColor || '#555555' }}
          >
            {user.profileImage
              ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              : (
                <span style={{ color: '#fff', fontSize, fontWeight: 900, fontFamily: 'Anton, sans-serif' }}>
                  {user.avatarLetter || user.name?.[0]?.toUpperCase() || 'U'}
                </span>
              )
            }
          </div>
        )}

        {/* Online yellow dot */}
        {user.isOnline && !user.hasLive && (
          <span
            className="absolute top-0 right-0 w-3 h-3 rounded-full"
            style={{ background: '#FFD700', border: '2px solid #000' }}
          />
        )}

        {/* LIVE badge */}
        {user.hasLive && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-full px-1.5 py-0.5"
            style={{ background: '#EF4444', whiteSpace: 'nowrap' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
            <span style={{ color: '#fff', fontSize: '0.48rem', fontWeight: 800, letterSpacing: '0.06em' }}>LIVE</span>
          </div>
        )}
      </div>

      {showName && (
        <span
          className="w-full text-center truncate"
          style={{ color: '#888888', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}
        >
          {user.isCurrentUser ? 'YOU' : user.name}
        </span>
      )}
    </div>
  )
}
