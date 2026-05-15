import { cn } from '../../lib/utils'

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-14 px-6 text-center', className)}>
      {Icon && (
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
          }}
        >
          <Icon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
        </div>
      )}
      <h3
        className="font-semibold text-sm mb-1.5"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm mb-5 max-w-xs leading-relaxed"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
