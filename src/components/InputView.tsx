import { useDiffStore } from '../store/diffStore'
import { InputPanel } from './InputPanel'
import { UrlFetcher } from './UrlFetcher'
import { HistoryPanel } from './HistoryPanel'

export function InputView() {
  const {
    leftContent, rightContent, baseContent, isThreeWay,
    leftFilename, rightFilename,
    setLeftContent, setRightContent, setBaseContent,
    setLeftFilename, setRightFilename,
    setIsThreeWay, computeDiff, loadSample, clearAll,
  } = useDiffStore()

  const canDiff = leftContent.length > 0 || rightContent.length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <button
            onClick={loadSample}
            className="text-sm px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Load Sample
          </button>
          <label className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={isThreeWay}
              onChange={(e) => setIsThreeWay(e.target.checked)}
              className="rounded"
            />
            Three-way merge
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            className="text-sm px-3 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={computeDiff}
            disabled={!canDiff}
            className="text-sm px-4 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Compare
          </button>
        </div>
      </div>

      {/* URL Fetchers */}
      <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
        <UrlFetcher label="Left" onContent={(c) => { setLeftContent(c) }} />
        <UrlFetcher label="Right" onContent={(c) => { setRightContent(c) }} />
      </div>

      {/* Three-way base input */}
      {isThreeWay && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="h-40">
            <InputPanel
              label="Base (Common Ancestor)"
              value={baseContent}
              onChange={setBaseContent}
              filename=""
              onFilenameChange={() => {}}
              placeholder="Paste the base/original content for three-way merge..."
            />
          </div>
        </div>
      )}

      {/* Input panels */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 min-h-0">
        <div className="bg-white dark:bg-gray-900">
          <InputPanel
            label="Left (Original)"
            value={leftContent}
            onChange={setLeftContent}
            filename={leftFilename}
            onFilenameChange={setLeftFilename}
          />
        </div>
        <div className="bg-white dark:bg-gray-900">
          <InputPanel
            label="Right (Modified)"
            value={rightContent}
            onChange={setRightContent}
            filename={rightFilename}
            onFilenameChange={setRightFilename}
          />
        </div>
      </div>

      {/* History */}
      <HistoryPanel />
    </div>
  )
}
