import { useDiffStore } from '../store/diffStore'

interface HunkActionsProps {
  hunkId: string
}

export function HunkActions({ hunkId }: HunkActionsProps) {
  const { mergeDecisions, setMergeDecision, setActiveTab } = useDiffStore()
  const decision = mergeDecisions[hunkId]

  const handleDecision = (d: 'left' | 'right' | 'both') => {
    setMergeDecision(hunkId, d)
  }

  return (
    <div className="absolute -left-0 top-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg p-0.5 m-1">
        <button
          onClick={() => handleDecision('left')}
          className={`text-[10px] px-1.5 py-0.5 rounded ${
            decision === 'left'
              ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Use left side"
        >
          Left
        </button>
        <button
          onClick={() => handleDecision('right')}
          className={`text-[10px] px-1.5 py-0.5 rounded ${
            decision === 'right'
              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Use right side"
        >
          Right
        </button>
        <button
          onClick={() => handleDecision('both')}
          className={`text-[10px] px-1.5 py-0.5 rounded ${
            decision === 'both'
              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Use both sides"
        >
          Both
        </button>
        <button
          onClick={() => { handleDecision('right'); setActiveTab('merge') }}
          className="text-[10px] px-1.5 py-0.5 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Edit in merge view"
        >
          Edit
        </button>
      </div>
    </div>
  )
}
