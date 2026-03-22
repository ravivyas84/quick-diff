import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type DiffHunk, type DiffOptions, computeLineDiff, computeDiffStats, threeWayMerge, type ThreeWayResult } from '../lib/diff-engine'

export type ViewMode = 'side-by-side' | 'unified'
export type MergeDecision = 'left' | 'right' | 'both' | 'custom'
export type AppTab = 'input' | 'diff' | 'merge'

interface HistoryEntry {
  id: string
  timestamp: number
  leftPreview: string
  rightPreview: string
  leftContent: string
  rightContent: string
}

interface DiffState {
  // Input
  leftContent: string
  rightContent: string
  baseContent: string
  leftFilename: string
  rightFilename: string

  // Diff
  hunks: DiffHunk[]
  stats: { additions: number; deletions: number; modifications: number }
  viewMode: ViewMode
  options: DiffOptions
  currentChangeIndex: number

  // Merge
  mergeDecisions: Record<string, MergeDecision>
  customMergeTexts: Record<string, string>
  mergedContent: string
  isThreeWay: boolean
  threeWayResult: ThreeWayResult | null

  // UI
  activeTab: AppTab
  darkMode: boolean | null // null = system preference

  // History
  history: HistoryEntry[]

  // Actions
  setLeftContent: (content: string) => void
  setRightContent: (content: string) => void
  setBaseContent: (content: string) => void
  setLeftFilename: (name: string) => void
  setRightFilename: (name: string) => void
  setViewMode: (mode: ViewMode) => void
  setOptions: (options: Partial<DiffOptions>) => void
  setActiveTab: (tab: AppTab) => void
  setDarkMode: (mode: boolean | null) => void
  setIsThreeWay: (enabled: boolean) => void
  computeDiff: () => void
  setMergeDecision: (hunkId: string, decision: MergeDecision) => void
  setCustomMergeText: (hunkId: string, text: string) => void
  acceptAllLeft: () => void
  acceptAllRight: () => void
  buildMergedContent: () => void
  setMergedContent: (content: string) => void
  clearAll: () => void
  navigateChange: (direction: 'next' | 'prev') => void
  loadSample: () => void
  saveToHistory: () => void
  loadFromHistory: (id: string) => void
  deleteFromHistory: (id: string) => void
}

const SAMPLE_LEFT = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

function add(a, b) {
  return a + b;
}

// Main
const result = add(1, 2);
greet("World");
console.log(result);`

const SAMPLE_RIGHT = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return true;
}

function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

// Main
const sum = add(1, 2);
const product = multiply(3, 4);
greet("World");
console.log(sum, product);`

export const useDiffStore = create<DiffState>()(
  persist(
    (set, get) => ({
      leftContent: '',
      rightContent: '',
      baseContent: '',
      leftFilename: '',
      rightFilename: '',
      hunks: [],
      stats: { additions: 0, deletions: 0, modifications: 0 },
      viewMode: 'side-by-side',
      options: { ignoreWhitespace: false, ignoreCase: false, diffMode: 'line' },
      currentChangeIndex: 0,
      mergeDecisions: {},
      customMergeTexts: {},
      mergedContent: '',
      isThreeWay: false,
      threeWayResult: null,
      activeTab: 'input',
      darkMode: null,
      history: [],

      setLeftContent: (content) => set({ leftContent: content }),
      setRightContent: (content) => set({ rightContent: content }),
      setBaseContent: (content) => set({ baseContent: content }),
      setLeftFilename: (name) => set({ leftFilename: name }),
      setRightFilename: (name) => set({ rightFilename: name }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setOptions: (opts) => set((state) => ({ options: { ...state.options, ...opts } })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setDarkMode: (mode) => set({ darkMode: mode }),
      setIsThreeWay: (enabled) => set({ isThreeWay: enabled }),

      computeDiff: () => {
        const { leftContent, rightContent, baseContent, options, isThreeWay } = get()
        if (!leftContent && !rightContent) {
          set({ hunks: [], stats: { additions: 0, deletions: 0, modifications: 0 }, threeWayResult: null })
          return
        }

        const hunks = computeLineDiff(leftContent, rightContent, options)
        const stats = computeDiffStats(hunks)

        let threeWayResult: ThreeWayResult | null = null
        if (isThreeWay && baseContent) {
          threeWayResult = threeWayMerge(baseContent, leftContent, rightContent, options)
        }

        set({
          hunks,
          stats,
          threeWayResult,
          mergeDecisions: {},
          customMergeTexts: {},
          currentChangeIndex: 0,
          activeTab: 'diff',
        })

        // Auto-build merged content
        setTimeout(() => get().buildMergedContent(), 0)
      },

      setMergeDecision: (hunkId, decision) => {
        set((state) => ({
          mergeDecisions: { ...state.mergeDecisions, [hunkId]: decision },
        }))
        setTimeout(() => get().buildMergedContent(), 0)
      },

      setCustomMergeText: (hunkId, text) => {
        set((state) => ({
          customMergeTexts: { ...state.customMergeTexts, [hunkId]: text },
          mergeDecisions: { ...state.mergeDecisions, [hunkId]: 'custom' },
        }))
        setTimeout(() => get().buildMergedContent(), 0)
      },

      acceptAllLeft: () => {
        const { hunks } = get()
        const decisions: Record<string, MergeDecision> = {}
        for (const hunk of hunks) {
          if (hunk.type !== 'equal') {
            decisions[hunk.id] = 'left'
          }
        }
        set({ mergeDecisions: decisions })
        setTimeout(() => get().buildMergedContent(), 0)
      },

      acceptAllRight: () => {
        const { hunks } = get()
        const decisions: Record<string, MergeDecision> = {}
        for (const hunk of hunks) {
          if (hunk.type !== 'equal') {
            decisions[hunk.id] = 'right'
          }
        }
        set({ mergeDecisions: decisions })
        setTimeout(() => get().buildMergedContent(), 0)
      },

      buildMergedContent: () => {
        const { hunks, mergeDecisions, customMergeTexts, isThreeWay, threeWayResult } = get()

        if (isThreeWay && threeWayResult) {
          set({ mergedContent: threeWayResult.merged })
          return
        }

        const lines: string[] = []
        for (const hunk of hunks) {
          if (hunk.type === 'equal') {
            for (const line of hunk.lines) {
              lines.push(line.leftText)
            }
          } else {
            const decision = mergeDecisions[hunk.id]
            if (decision === 'custom' && customMergeTexts[hunk.id] !== undefined) {
              lines.push(customMergeTexts[hunk.id])
            } else if (decision === 'left') {
              for (const line of hunk.lines) {
                if (line.leftText || line.type === 'delete' || line.type === 'modify') {
                  lines.push(line.leftText)
                }
              }
            } else if (decision === 'right') {
              for (const line of hunk.lines) {
                if (line.rightText || line.type === 'add' || line.type === 'modify') {
                  lines.push(line.rightText)
                }
              }
            } else if (decision === 'both') {
              for (const line of hunk.lines) {
                if (line.leftText) lines.push(line.leftText)
                if (line.rightText && line.rightText !== line.leftText) lines.push(line.rightText)
              }
            } else {
              // Default: take left side
              for (const line of hunk.lines) {
                if (line.leftText || line.type === 'delete' || line.type === 'modify') {
                  lines.push(line.leftText)
                }
              }
            }
          }
        }
        set({ mergedContent: lines.join('\n') })
      },

      setMergedContent: (content) => set({ mergedContent: content }),

      clearAll: () => set({
        leftContent: '',
        rightContent: '',
        baseContent: '',
        leftFilename: '',
        rightFilename: '',
        hunks: [],
        stats: { additions: 0, deletions: 0, modifications: 0 },
        mergeDecisions: {},
        customMergeTexts: {},
        mergedContent: '',
        threeWayResult: null,
        currentChangeIndex: 0,
        activeTab: 'input',
      }),

      navigateChange: (direction) => {
        const { hunks, currentChangeIndex } = get()
        const changeHunks = hunks.filter(h => h.type !== 'equal')
        if (changeHunks.length === 0) return

        let newIndex: number
        if (direction === 'next') {
          newIndex = (currentChangeIndex + 1) % changeHunks.length
        } else {
          newIndex = (currentChangeIndex - 1 + changeHunks.length) % changeHunks.length
        }
        set({ currentChangeIndex: newIndex })

        // Scroll to the hunk
        const el = document.getElementById(changeHunks[newIndex].id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      },

      loadSample: () => {
        set({
          leftContent: SAMPLE_LEFT,
          rightContent: SAMPLE_RIGHT,
          leftFilename: 'example.js',
          rightFilename: 'example.js',
        })
      },

      saveToHistory: () => {
        const { leftContent, rightContent, history } = get()
        if (!leftContent && !rightContent) return

        const entry: HistoryEntry = {
          id: `history-${Date.now()}`,
          timestamp: Date.now(),
          leftPreview: leftContent.slice(0, 100),
          rightPreview: rightContent.slice(0, 100),
          leftContent,
          rightContent,
        }

        const newHistory = [entry, ...history].slice(0, 10)
        set({ history: newHistory })
      },

      loadFromHistory: (id) => {
        const { history } = get()
        const entry = history.find(h => h.id === id)
        if (entry) {
          set({
            leftContent: entry.leftContent,
            rightContent: entry.rightContent,
            activeTab: 'input',
          })
        }
      },

      deleteFromHistory: (id) => {
        set((state) => ({
          history: state.history.filter(h => h.id !== id),
        }))
      },
    }),
    {
      name: 'quick-diff-storage',
      partialize: (state) => ({
        history: state.history,
        darkMode: state.darkMode,
        viewMode: state.viewMode,
        options: state.options,
      }),
    }
  )
)
