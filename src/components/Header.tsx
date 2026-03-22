import { useDiffStore, type AppTab } from '../store/diffStore'

const tabs: { id: AppTab; label: string }[] = [
  { id: 'input', label: 'Input' },
  { id: 'diff', label: 'Diff' },
  { id: 'merge', label: 'Merge' },
]

export function Header() {
  const { activeTab, setActiveTab, darkMode, setDarkMode, stats, hunks } = useDiffStore()
  const hasDiff = hunks.length > 0

  const effectiveDark = darkMode === null
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : darkMode

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Quick Diff
            </h1>
            <nav className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={tab.id !== 'input' && !hasDiff}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {tab.label}
                  {tab.id === 'diff' && hasDiff && (
                    <span className="ml-1.5 text-xs text-gray-500">
                      +{stats.additions} -{stats.deletions} ~{stats.modifications}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          <button
            onClick={() => setDarkMode(effectiveDark ? false : true)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={effectiveDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {effectiveDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
