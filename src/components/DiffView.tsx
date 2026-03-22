import { useDiffStore } from '../store/diffStore'
import { SideBySideDiff } from './SideBySideDiff'
import { UnifiedDiff } from './UnifiedDiff'
import { DiffToolbar } from './DiffToolbar'
import { DiffMinimap } from './DiffMinimap'

export function DiffView() {
  const { hunks, viewMode, stats } = useDiffStore()

  if (hunks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
        <p>No diff to display. Go to Input tab and click Compare.</p>
      </div>
    )
  }

  const totalChanges = stats.additions + stats.deletions + stats.modifications

  return (
    <div className="flex flex-col h-full">
      <DiffToolbar />

      {/* Summary */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-xs">
        <span className="text-gray-500 dark:text-gray-400">{totalChanges} changes</span>
        {stats.additions > 0 && (
          <span className="text-green-600 dark:text-green-400">+{stats.additions} additions</span>
        )}
        {stats.deletions > 0 && (
          <span className="text-red-600 dark:text-red-400">-{stats.deletions} deletions</span>
        )}
        {stats.modifications > 0 && (
          <span className="text-yellow-600 dark:text-yellow-400">~{stats.modifications} modifications</span>
        )}
      </div>

      {/* Diff content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="flex-1 overflow-auto diff-scroll-sync">
          {viewMode === 'side-by-side' ? (
            <SideBySideDiff hunks={hunks} />
          ) : (
            <UnifiedDiff hunks={hunks} />
          )}
        </div>
        <DiffMinimap hunks={hunks} />
      </div>
    </div>
  )
}
