import { type DiffHunk } from '../lib/diff-engine'
import { DiffLineSideBySide } from './DiffLine'
import { HunkActions } from './HunkActions'

interface SideBySideDiffProps {
  hunks: DiffHunk[]
}

export function SideBySideDiff({ hunks }: SideBySideDiffProps) {
  return (
    <div className="min-w-fit">
      {hunks.map((hunk) => (
        <div key={hunk.id} id={hunk.id} className="relative group">
          {hunk.type !== 'equal' && <HunkActions hunkId={hunk.id} />}
          <div className="grid grid-cols-2">
            {hunk.lines.map((line, i) => (
              <DiffLineSideBySide key={`${hunk.id}-${i}`} line={line} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
