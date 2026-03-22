import { useDiffStore } from '../store/diffStore'

export function HistoryPanel() {
  const { history, loadFromHistory, deleteFromHistory } = useDiffStore()

  if (history.length === 0) return null

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <details className="group">
        <summary className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
          History ({history.length})
        </summary>
        <div className="px-4 pb-3 space-y-1">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between py-1.5 px-3 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => loadFromHistory(entry.id)}
                className="flex-1 text-left text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 truncate"
              >
                <span className="text-gray-400 dark:text-gray-500">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                {' '}
                <span className="truncate">{entry.leftPreview.slice(0, 50)}...</span>
              </button>
              <button
                onClick={() => deleteFromHistory(entry.id)}
                className="ml-2 text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
