import { type DiffHunk } from '../lib/diff-engine'

interface DiffMinimapProps {
  hunks: DiffHunk[]
}

export function DiffMinimap({ hunks }: DiffMinimapProps) {
  const totalLines = hunks.reduce((acc, h) => acc + h.lines.length, 0)
  if (totalLines === 0) return null

  const markers: { top: number; height: number; color: string }[] = []
  let lineOffset = 0

  for (const hunk of hunks) {
    if (hunk.type !== 'equal') {
      const top = (lineOffset / totalLines) * 100
      const height = Math.max((hunk.lines.length / totalLines) * 100, 1)
      const color = hunk.lines.some(l => l.type === 'modify')
        ? 'bg-yellow-400 dark:bg-yellow-600'
        : hunk.lines.some(l => l.type === 'add')
        ? 'bg-green-400 dark:bg-green-600'
        : 'bg-red-400 dark:bg-red-600'
      markers.push({ top, height, color })
    }
    lineOffset += hunk.lines.length
  }

  const scrollToHunk = (hunk: DiffHunk) => {
    const el = document.getElementById(hunk.id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  let markerIdx = 0

  return (
    <div className="w-3 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 relative shrink-0">
      {hunks.map((hunk) => {
        if (hunk.type === 'equal') return null
        const marker = markers[markerIdx++]
        if (!marker) return null
        return (
          <button
            key={hunk.id}
            onClick={() => scrollToHunk(hunk)}
            className={`absolute w-full ${marker.color} hover:opacity-80 transition-opacity cursor-pointer`}
            style={{ top: `${marker.top}%`, height: `${Math.max(marker.height, 0.5)}%`, minHeight: '3px' }}
            title="Click to scroll to change"
          />
        )
      })}
    </div>
  )
}
