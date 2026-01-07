export default function NoteCardSkeleton() {
  return (
    <div className="p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title skeleton */}
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>

          {/* Content skeleton lines */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>

          {/* Date skeleton */}
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-3"></div>
        </div>

        {/* Delete button skeleton */}
        <div className="ml-2 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  )
}
