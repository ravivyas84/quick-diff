import { type DiffLine as DiffLineType, type DiffSegment } from '../lib/diff-engine'

interface DiffLineProps {
  line: DiffLineType
  side: 'left' | 'right'
}

function renderSegments(segments: DiffSegment[] | undefined, highlightType: 'delete' | 'insert') {
  if (!segments) return null
  return segments.map((seg, i) => {
    if (seg.type === 'equal') {
      return <span key={i}>{seg.text}</span>
    }
    const bg = highlightType === 'delete'
      ? 'bg-red-300/50 dark:bg-red-500/30'
      : 'bg-green-300/50 dark:bg-green-500/30'
    return (
      <span key={i} className={`${bg} rounded-sm`}>
        {seg.text}
      </span>
    )
  })
}

export function DiffLineSideBySide({ line }: { line: DiffLineType }) {
  const leftBg = line.type === 'delete' || line.type === 'modify'
    ? 'bg-red-50 dark:bg-red-950/30'
    : ''
  const rightBg = line.type === 'add' || line.type === 'modify'
    ? 'bg-green-50 dark:bg-green-950/30'
    : ''

  return (
    <>
      {/* Left side */}
      <div className={`flex ${leftBg} border-b border-gray-100 dark:border-gray-800`}>
        <div className="w-12 shrink-0 text-right pr-2 py-0.5 text-xs text-gray-400 dark:text-gray-600 select-none bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700">
          {line.leftNum ?? ''}
        </div>
        <div className="flex-1 px-2 py-0.5 text-sm whitespace-pre overflow-x-auto">
          {line.type === 'modify' && line.leftWordDiff
            ? renderSegments(line.leftWordDiff, 'delete')
            : line.leftText
          }
        </div>
      </div>

      {/* Right side */}
      <div className={`flex ${rightBg} border-b border-gray-100 dark:border-gray-800`}>
        <div className="w-12 shrink-0 text-right pr-2 py-0.5 text-xs text-gray-400 dark:text-gray-600 select-none bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700">
          {line.rightNum ?? ''}
        </div>
        <div className="flex-1 px-2 py-0.5 text-sm whitespace-pre overflow-x-auto">
          {line.type === 'modify' && line.rightWordDiff
            ? renderSegments(line.rightWordDiff, 'insert')
            : line.rightText
          }
        </div>
      </div>
    </>
  )
}

export function DiffLineUnified({ line }: DiffLineProps) {
  let bg = ''
  let prefix = ' '

  if (line.type === 'add') {
    bg = 'bg-green-50 dark:bg-green-950/30'
    prefix = '+'
  } else if (line.type === 'delete') {
    bg = 'bg-red-50 dark:bg-red-950/30'
    prefix = '-'
  } else if (line.type === 'modify') {
    bg = line.side === 'left'
      ? 'bg-red-50 dark:bg-red-950/30'
      : 'bg-green-50 dark:bg-green-950/30'
    prefix = line.side === 'left' ? '-' : '+'
  }

  const lineNum = line.side === 'left'
    ? line.leftNum
    : line.rightNum ?? line.leftNum
  const text = line.side === 'left' ? line.leftText : line.rightText

  return (
    <div className={`flex ${bg} border-b border-gray-100 dark:border-gray-800`}>
      <div className="w-12 shrink-0 text-right pr-2 py-0.5 text-xs text-gray-400 dark:text-gray-600 select-none bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700">
        {lineNum ?? ''}
      </div>
      <div className="w-6 shrink-0 text-center py-0.5 text-xs text-gray-500 dark:text-gray-500 select-none font-bold">
        {prefix}
      </div>
      <div className="flex-1 px-2 py-0.5 text-sm whitespace-pre overflow-x-auto">
        {text}
      </div>
    </div>
  )
}
