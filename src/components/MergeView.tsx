import { useDiffStore } from '../store/diffStore'
import { OutputToolbar } from './OutputToolbar'

export function MergeView() {
  const {
    hunks, mergeDecisions, mergedContent,
    setMergeDecision, setMergedContent,
    acceptAllLeft, acceptAllRight,
    isThreeWay, threeWayResult,
  } = useDiffStore()

  const changeHunks = hunks.filter(h => h.type !== 'equal')
  const resolvedCount = changeHunks.filter(h => mergeDecisions[h.id]).length

  return (
    <div className="flex flex-col h-full">
      {/* Merge toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {resolvedCount}/{changeHunks.length} changes resolved
          </span>
          {isThreeWay && threeWayResult?.hasConflicts && (
            <span className="text-sm text-red-500">
              ({threeWayResult.conflicts.length} conflicts)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={acceptAllLeft}
            className="text-xs px-3 py-1.5 rounded-md border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            Accept All Left
          </button>
          <button
            onClick={acceptAllRight}
            className="text-xs px-3 py-1.5 rounded-md border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
          >
            Accept All Right
          </button>
        </div>
      </div>

      {/* Hunk list */}
      <div className="border-b border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
        {changeHunks.map((hunk) => {
          const decision = mergeDecisions[hunk.id]
          return (
            <div
              key={hunk.id}
              className="flex items-center justify-between px-4 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 dark:text-gray-400 w-20 shrink-0">
                  {hunk.lines[0]?.leftNum ? `Line ${hunk.lines[0].leftNum}` : 'New'}
                </span>
                <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">
                  {hunk.lines[0]?.leftText || hunk.lines[0]?.rightText || '(empty)'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {(['left', 'right', 'both'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setMergeDecision(hunk.id, d)}
                    className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                      decision === d
                        ? d === 'left'
                          ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                          : d === 'right'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                          : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    } transition-colors`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
        {changeHunks.length === 0 && (
          <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-600 text-center">
            No changes to merge — files are identical.
          </div>
        )}
      </div>

      {/* Merged content editor */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Merged Result</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {mergedContent.split('\n').length} lines
          </span>
        </div>
        <div className="flex-1 flex min-h-0">
          <div className="w-10 shrink-0 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
            {mergedContent.split('\n').map((_, i) => (
              <div key={i} className="text-right pr-2 text-xs text-gray-400 dark:text-gray-600 leading-5">
                {i + 1}
              </div>
            ))}
          </div>
          <textarea
            value={mergedContent}
            onChange={(e) => setMergedContent(e.target.value)}
            className="flex-1 p-2 text-sm font-mono leading-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none border-0 focus:outline-none focus:ring-0"
            spellCheck={false}
          />
        </div>
      </div>

      <OutputToolbar />
    </div>
  )
}
