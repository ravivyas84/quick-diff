import { type DiffHunk } from '../lib/diff-engine'
import { DiffLineUnified } from './DiffLine'
import { HunkActions } from './HunkActions'

interface UnifiedDiffProps {
  hunks: DiffHunk[]
}

export function UnifiedDiff({ hunks }: UnifiedDiffProps) {
  return (
    <div className="min-w-fit">
      {hunks.map((hunk) => (
        <div key={hunk.id} id={hunk.id} className="relative group">
          {hunk.type !== 'equal' && <HunkActions hunkId={hunk.id} />}
          {hunk.lines.map((line, i) => {
            if (line.type === 'equal') {
              return (
                <DiffLineUnified key={`${hunk.id}-${i}`} line={line} side="left" />
              )
            }
            if (line.type === 'modify') {
              return (
                <div key={`${hunk.id}-${i}`}>
                  <DiffLineUnified line={{ ...line }} side="left" />
                  <DiffLineUnified line={{ ...line }} side="right" />
                </div>
              )
            }
            return (
              <DiffLineUnified
                key={`${hunk.id}-${i}`}
                line={line}
                side={line.type === 'delete' ? 'left' : 'right'}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
