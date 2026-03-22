import { useState } from 'react'

interface UrlFetcherProps {
  label: string
  onContent: (content: string) => void
}

export function UrlFetcher({ label, onContent }: UrlFetcherProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetch = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url.trim())
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const text = await response.text()
      onContent(text)
      setUrl('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fetch failed (possibly CORS)')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900">
      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label} URL:</span>
      <input
        type="url"
        value={url}
        onChange={(e) => { setUrl(e.target.value); setError(null) }}
        onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
        placeholder="https://..."
        className="flex-1 text-xs px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <button
        onClick={handleFetch}
        disabled={!url.trim() || loading}
        className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-40 transition-colors"
      >
        {loading ? '...' : 'Fetch'}
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
