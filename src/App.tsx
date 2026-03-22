import { useEffect } from 'react'
import { useDiffStore } from './store/diffStore'
import { Header } from './components/Header'
import { InputView } from './components/InputView'
import { DiffView } from './components/DiffView'
import { MergeView } from './components/MergeView'
import { decodeShareUrl } from './lib/sharing'

function App() {
  const { activeTab, darkMode, setLeftContent, setRightContent, computeDiff, navigateChange } = useDiffStore()

  // Apply dark mode
  useEffect(() => {
    const isDark = darkMode === null
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : darkMode
    document.documentElement.classList.toggle('dark', isDark)
  }, [darkMode])

  // Load shared content from URL
  useEffect(() => {
    const shared = decodeShareUrl()
    if (shared) {
      setLeftContent(shared.left)
      setRightContent(shared.right)
      setTimeout(computeDiff, 100)
    }
  }, [setLeftContent, setRightContent, computeDiff])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault()
        navigateChange('next')
      }
      if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault()
        navigateChange('prev')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigateChange])

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'input' && <InputView />}
        {activeTab === 'diff' && <DiffView />}
        {activeTab === 'merge' && <MergeView />}
      </main>
    </div>
  )
}

export default App
