# Quick Diff — Implementation Plan

A client-side web app to diff two pieces of content and interactively merge them.

**Stack:** React + Vite + Tailwind CSS + diff-match-patch

---

## Architecture

```
src/
├── components/
│   ├── Layout/
│   │   ├── Header.tsx              # App title, theme toggle
│   │   └── Footer.tsx              # Links, credits
│   ├── Input/
│   │   ├── InputPanel.tsx          # Single input pane (textarea + file upload)
│   │   ├── InputPanelPair.tsx      # Left/Right input container
│   │   ├── FileUploader.tsx        # Drag-and-drop + file picker
│   │   └── UrlFetcher.tsx          # Fetch content from URL (Phase 3)
│   ├── Diff/
│   │   ├── DiffView.tsx            # Main diff display (switches between modes)
│   │   ├── SideBySideDiff.tsx      # Two-column diff view
│   │   ├── UnifiedDiff.tsx         # Single-column unified view
│   │   ├── DiffLine.tsx            # Single diff line with highlighting
│   │   ├── DiffHunk.tsx            # Group of changed lines with accept/reject
│   │   ├── DiffMinimap.tsx         # Scrollbar change markers (Phase 2)
│   │   └── DiffSummary.tsx         # Stats: additions, deletions, modifications
│   ├── Merge/
│   │   ├── MergePanel.tsx          # Editable merged result
│   │   ├── MergeControls.tsx       # Accept all left/right, bulk actions
│   │   └── ThreeWayMerge.tsx       # Base + Left + Right merge (Phase 3)
│   ├── Output/
│   │   ├── OutputToolbar.tsx       # Copy, download, clear buttons
│   │   └── OutputPreview.tsx       # Preview of merged content
│   └── shared/
│       ├── CodeEditor.tsx          # Wrapper around textarea with line numbers + syntax highlighting
│       ├── ToggleGroup.tsx         # Reusable toggle button group
│       └── Modal.tsx               # Generic modal component
├── hooks/
│   ├── useDiff.ts                  # Core diff computation logic
│   ├── useMerge.ts                 # Merge state management
│   ├── useFileUpload.ts            # File reading logic
│   ├── useHistory.ts              # LocalStorage history (Phase 3)
│   └── useKeyboardShortcuts.ts    # Nav shortcuts (Phase 2)
├── lib/
│   ├── diff-engine.ts             # diff-match-patch wrapper with line/word/char modes
│   ├── syntax.ts                  # Language detection + Prism.js integration
│   ├── file-utils.ts              # File type detection, encoding, JSON normalize
│   └── sharing.ts                 # URL encode/decode for sharing (Phase 3)
├── store/
│   └── diffStore.ts               # Zustand store for app state
├── App.tsx
├── main.tsx
└── index.css                      # Tailwind directives + custom diff styles
```

---

## Phase 1: MVP

### Step 1 — Project Setup
- `npm create vite@latest . -- --template react-ts`
- Install dependencies: `tailwindcss`, `diff-match-patch`, `@types/diff-match-patch`, `zustand`, `prismjs`
- Configure Tailwind, set up base layout

### Step 2 — Input Panels
- **InputPanel.tsx**: Textarea with placeholder, character/line count
- **InputPanelPair.tsx**: Side-by-side layout (responsive: stacked on mobile)
- **FileUploader.tsx**: Drag-and-drop zone overlaying each textarea, reads file as text
- "Load Sample" button with example content

### Step 3 — Diff Engine
- **diff-engine.ts**: Wraps `diff-match-patch`
  - `computeLineDiff(left, right)` — splits by line, diffs, returns array of `{type: 'equal'|'add'|'delete'|'modify', leftLine, rightLine, leftNum, rightNum}`
  - `computeWordDiff(leftLine, rightLine)` — for modified lines, highlights changed words
  - Groups consecutive changes into "hunks"
- **useDiff.ts**: Hook that calls diff engine reactively when inputs change (debounced)

### Step 4 — Diff View
- **DiffView.tsx**: Container with toggle for side-by-side vs unified
- **SideBySideDiff.tsx**: Two scroll-synced columns with line numbers
  - Green background for additions (right side)
  - Red background for deletions (left side)
  - Yellow background for modifications (both sides) with word-level inline highlights
- **UnifiedDiff.tsx**: Single column, `+`/`-` prefixed lines
- **DiffLine.tsx**: Renders a single line with appropriate background color and inline word highlights
- **DiffSummary.tsx**: Shows count of changes at the top

### Step 5 — Merge
- **MergePanel.tsx**: Third panel (below diff or toggled) showing merged result
- Each **DiffHunk.tsx** has buttons: "Use Left" / "Use Right" / "Use Both"
  - Clicking updates the merge result in real-time
  - Equal lines auto-included
- **MergeControls.tsx**: "Accept All Left", "Accept All Right" bulk buttons
- Merged result is editable (textarea/code editor)

### Step 6 — Output
- **OutputToolbar.tsx**:
  - "Copy to Clipboard" button
  - "Download as File" button (prompts filename)
  - "Clear All" button (resets inputs + merge)

### Step 7 — State Management
- **diffStore.ts** (Zustand):
  ```ts
  {
    leftContent: string
    rightContent: string
    diffResult: DiffHunk[]
    mergeDecisions: Map<hunkId, 'left' | 'right' | 'both' | 'custom'>
    mergedContent: string
    viewMode: 'side-by-side' | 'unified'
    diffMode: 'line' | 'word' | 'char'
    options: { ignoreWhitespace, ignoreCase }
  }
  ```

---

## Phase 2: Enhanced Features

### Step 8 — Smart Diff Options
- Toggle buttons in a toolbar above the diff:
  - **Diff granularity**: Line / Word / Character
  - **Ignore whitespace**: strips trailing/leading whitespace before diff
  - **Ignore case**: lowercases both before diff
- Update `diff-engine.ts` to support `computeCharDiff()` and option flags

### Step 9 — Syntax Highlighting
- **syntax.ts**: Auto-detect language from file extension or content heuristics
- Integrate Prism.js to tokenize + highlight within DiffLine
- Language selector dropdown override

### Step 10 — File Handling
- Detect file type from extension/content
- JSON: pretty-print and normalize before diffing
- CSV: option to diff as table or as text
- Handle UTF-8/UTF-16 encoding detection
- Show file metadata (size, encoding, type) in input panel header

### Step 11 — Navigation
- **useKeyboardShortcuts.ts**: `Alt+↓` / `Alt+↑` to jump between changes
- "Next Change" / "Previous Change" buttons in toolbar
- **DiffMinimap.tsx**: Thin sidebar showing colored markers for change positions
- Scroll-to-change on marker click

---

## Phase 3: Power Features

### Step 12 — Three-Way Merge
- **ThreeWayMerge.tsx**: Adds a "Base" input panel
- Algorithm: diff base→left and base→right, auto-merge non-overlapping changes
- Conflict detection: overlapping changes highlighted with conflict markers
- Manual resolution UI for conflicts (choose left/right/both/custom per conflict)

### Step 13 — URL/API Input
- **UrlFetcher.tsx**: Input field to paste a URL, fetch button
- Fetches content client-side (CORS permitting) or shows CORS error with guidance
- Useful for comparing API responses, remote files

### Step 14 — History & Sharing
- **useHistory.ts**: Save last 10 diffs to localStorage with timestamp + preview
- History panel (sidebar or modal) to reload past diffs
- **sharing.ts**: Compress content with LZ-string, encode in URL hash
  - For small diffs (<~5KB compressed)
  - "Share" button generates URL
  - On load, check URL hash and restore content

### Step 15 — Polish
- Dark mode / light mode toggle (Tailwind `dark:` classes)
- Responsive layout: stacked panels on mobile
- Keyboard accessibility (tab navigation, ARIA labels)
- Loading states and error boundaries
- Empty states with helpful illustrations

---

## Dependencies

| Package | Purpose |
|---------|---------|
| react, react-dom | UI framework |
| vite, @vitejs/plugin-react | Build tool |
| typescript | Type safety |
| tailwindcss | Styling |
| diff-match-patch | Core diff algorithm |
| zustand | State management |
| prismjs | Syntax highlighting |
| lz-string | URL sharing compression (Phase 3) |

---

## Key Design Decisions

1. **Client-side only** — No server, no data leaves the browser, privacy-friendly
2. **diff-match-patch for everything** — Character-level precision, line diff built on top
3. **Zustand over Context** — Simpler API, better performance for frequent updates
4. **Scroll sync** — Both diff columns scroll together for easy comparison
5. **Hunks as merge units** — Users make decisions per hunk, not per line (simpler UX)
6. **Progressive disclosure** — Phase 1 features visible by default, Phase 2/3 behind toggles or settings
