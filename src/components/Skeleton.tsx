import Spinner from './Spinner'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function NoteCardSkeleton() {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function EditorSkeleton() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading editor...</p>
      </div>
    </div>
  )
}

export function ButtonSkeleton({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <Skeleton className={`h-10 ${fullWidth ? 'w-full' : 'w-24'}`} />
  )
}
