import { useDiffStore } from '../store/diffStore'

export function DiffToolbar() {
  const {
    viewMode, setViewMode,
    options, setOptions,
    navigateChange, computeDiff,
    stats,
  } = useDiffStore()

  const totalChanges = stats.additions + stats.deletions + stats.modifications

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-wrap gap-2">
      {/* View mode */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setViewMode('side-by-side')}
          className={`text-xs px-2.5 py-1 rounded-l-md border ${
            viewMode === 'side-by-side'
              ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
          }`}
        >
          Side by Side
        </button>
        <button
          onClick={() => setViewMode('unified')}
          className={`text-xs px-2.5 py-1 rounded-r-md border-t border-r border-b ${
            viewMode === 'unified'
              ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
          }`}
        >
          Unified
        </button>
      </div>

      {/* Diff options */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={options.ignoreWhitespace}
            onChange={(e) => { setOptions({ ignoreWhitespace: e.target.checked }); setTimeout(computeDiff, 0) }}
            className="rounded"
          />
          Ignore whitespace
        </label>
        <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={options.ignoreCase}
            onChange={(e) => { setOptions({ ignoreCase: e.target.checked }); setTimeout(computeDiff, 0) }}
            className="rounded"
          />
          Ignore case
        </label>

        <select
          value={options.diffMode}
          onChange={(e) => { setOptions({ diffMode: e.target.value as 'line' | 'word' | 'char' }); setTimeout(computeDiff, 0) }}
          className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
        >
          <option value="line">Line diff</option>
          <option value="word">Word diff</option>
          <option value="char">Char diff</option>
        </select>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigateChange('prev')}
          disabled={totalChanges === 0}
          className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
          title="Previous change (Alt+Up)"
        >
          Prev
        </button>
        <button
          onClick={() => navigateChange('next')}
          disabled={totalChanges === 0}
          className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
          title="Next change (Alt+Down)"
        >
          Next
        </button>
      </div>
    </div>
  )
}
