import { useState } from 'react'
import { useDiffStore } from '../store/diffStore'
import { encodeShareUrl, canShare } from '../lib/sharing'

export function OutputToolbar() {
  const { mergedContent, leftContent, rightContent, saveToHistory, clearAll } = useDiffStore()
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mergedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([mergedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'merged-result.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    if (!canShare(leftContent, rightContent)) {
      alert('Content too large to share via URL. Try smaller inputs.')
      return
    }
    const url = encodeShareUrl({ left: leftContent, right: rightContent })
    navigator.clipboard.writeText(url)
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          disabled={!mergedContent}
          className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
        <button
          onClick={handleDownload}
          disabled={!mergedContent}
          className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          Download
        </button>
        <button
          onClick={handleShare}
          disabled={!leftContent && !rightContent}
          className="text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
        >
          {shared ? 'Link Copied!' : 'Share'}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={saveToHistory}
          className="text-sm px-3 py-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Save to History
        </button>
        <button
          onClick={clearAll}
          className="text-sm px-3 py-1.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}
