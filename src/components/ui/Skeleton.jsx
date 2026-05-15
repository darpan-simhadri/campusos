import { cn } from '../../lib/utils'

export function Skeleton({ className, ...props }) {
  return <div className={cn('skeleton', className)} {...props} />
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-2/5 rounded" />
          <Skeleton className="h-2.5 w-1/3 rounded" />
        </div>
      </div>
      <Skeleton className="h-2.5 w-full rounded" />
      <Skeleton className="h-2.5 w-4/5 rounded" />
      <div className="flex gap-2 pt-0.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3 rounded', i === lines - 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  )
}

export function SkeletonAvatar({ size = 8 }) {
  return <Skeleton className={`w-${size} h-${size} rounded-full flex-shrink-0`} />
}
