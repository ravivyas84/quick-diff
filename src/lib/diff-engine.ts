import DiffMatchPatch from 'diff-match-patch'

const dmp = new DiffMatchPatch()

export type DiffType = 'equal' | 'add' | 'delete' | 'modify'

export interface DiffSegment {
  type: 'equal' | 'insert' | 'delete'
  text: string
}

export interface DiffLine {
  type: DiffType
  leftText: string
  rightText: string
  leftNum: number | null
  rightNum: number | null
  wordDiff?: DiffSegment[]
  leftWordDiff?: DiffSegment[]
  rightWordDiff?: DiffSegment[]
}

export interface DiffHunk {
  id: string
  lines: DiffLine[]
  type: DiffType
}

export interface DiffOptions {
  ignoreWhitespace: boolean
  ignoreCase: boolean
  diffMode: 'line' | 'word' | 'char'
}

function normalizeText(text: string, options: DiffOptions): string {
  let result = text
  if (options.ignoreCase) result = result.toLowerCase()
  if (options.ignoreWhitespace) result = result.replace(/\s+/g, ' ').trim()
  return result
}

export function computeWordDiff(left: string, right: string): { leftSegments: DiffSegment[]; rightSegments: DiffSegment[] } {
  const diffs = dmp.diff_main(left, right)
  dmp.diff_cleanupSemantic(diffs)

  const leftSegments: DiffSegment[] = []
  const rightSegments: DiffSegment[] = []

  for (const [op, text] of diffs) {
    if (op === 0) {
      leftSegments.push({ type: 'equal', text })
      rightSegments.push({ type: 'equal', text })
    } else if (op === -1) {
      leftSegments.push({ type: 'delete', text })
    } else if (op === 1) {
      rightSegments.push({ type: 'insert', text })
    }
  }

  return { leftSegments, rightSegments }
}

export function computeCharDiff(left: string, right: string): DiffSegment[] {
  const diffs = dmp.diff_main(left, right)
  dmp.diff_cleanupSemantic(diffs)
  return diffs.map(([op, text]) => ({
    type: op === 0 ? 'equal' as const : op === -1 ? 'delete' as const : 'insert' as const,
    text,
  }))
}

export function computeLineDiff(left: string, right: string, options: DiffOptions): DiffHunk[] {
  const leftLines = left.split('\n')
  const rightLines = right.split('\n')

  const normalizedLeft = leftLines.map(l => normalizeText(l, options)).join('\n')
  const normalizedRight = rightLines.map(l => normalizeText(l, options)).join('\n')

  // Use diff-match-patch line mode
  const a = dmp.diff_linesToChars_(normalizedLeft, normalizedRight)
  const lineText1 = a.chars1
  const lineText2 = a.chars2
  const lineArray = a.lineArray

  const diffs = dmp.diff_main(lineText1, lineText2, false)
  dmp.diff_charsToLines_(diffs, lineArray)
  dmp.diff_cleanupSemantic(diffs)

  const diffLines: DiffLine[] = []
  let leftNum = 1
  let rightNum = 1

  for (const [op, text] of diffs) {
    const lines = text.replace(/\n$/, '').split('\n')

    if (op === 0) {
      for (const line of lines) {
        const origLeft = leftLines[leftNum - 1] ?? line
        const origRight = rightLines[rightNum - 1] ?? line
        diffLines.push({
          type: 'equal',
          leftText: origLeft,
          rightText: origRight,
          leftNum: leftNum++,
          rightNum: rightNum++,
        })
      }
    } else if (op === -1) {
      for (const _line of lines) {
        const origLeft = leftLines[leftNum - 1] ?? _line
        diffLines.push({
          type: 'delete',
          leftText: origLeft,
          rightText: '',
          leftNum: leftNum++,
          rightNum: null,
        })
      }
    } else if (op === 1) {
      for (const _line of lines) {
        const origRight = rightLines[rightNum - 1] ?? _line
        diffLines.push({
          type: 'add',
          leftText: '',
          rightText: origRight,
          leftNum: null,
          rightNum: rightNum++,
        })
      }
    }
  }

  // Post-process: pair adjacent delete+add into modify
  const processed: DiffLine[] = []
  let i = 0
  while (i < diffLines.length) {
    if (
      diffLines[i].type === 'delete' &&
      i + 1 < diffLines.length &&
      diffLines[i + 1].type === 'add'
    ) {
      // Collect consecutive deletes and adds
      const deletes: DiffLine[] = []
      const adds: DiffLine[] = []

      while (i < diffLines.length && diffLines[i].type === 'delete') {
        deletes.push(diffLines[i])
        i++
      }
      while (i < diffLines.length && diffLines[i].type === 'add') {
        adds.push(diffLines[i])
        i++
      }

      const pairCount = Math.min(deletes.length, adds.length)
      for (let j = 0; j < pairCount; j++) {
        const { leftSegments, rightSegments } = computeWordDiff(
          deletes[j].leftText,
          adds[j].rightText
        )
        processed.push({
          type: 'modify',
          leftText: deletes[j].leftText,
          rightText: adds[j].rightText,
          leftNum: deletes[j].leftNum,
          rightNum: adds[j].rightNum,
          leftWordDiff: leftSegments,
          rightWordDiff: rightSegments,
        })
      }
      // Remaining unpaired
      for (let j = pairCount; j < deletes.length; j++) {
        processed.push(deletes[j])
      }
      for (let j = pairCount; j < adds.length; j++) {
        processed.push(adds[j])
      }
    } else {
      processed.push(diffLines[i])
      i++
    }
  }

  // Group into hunks
  const hunks: DiffHunk[] = []
  let currentHunk: DiffLine[] = []
  let currentType: DiffType | null = null
  let hunkId = 0

  for (const line of processed) {
    const lineType = line.type === 'equal' ? 'equal' : 'modify'
    if (lineType !== currentType && currentHunk.length > 0) {
      hunks.push({
        id: `hunk-${hunkId++}`,
        lines: currentHunk,
        type: currentType!,
      })
      currentHunk = []
    }
    currentType = lineType === 'equal' ? 'equal' : currentHunk.length > 0 ? currentType! : line.type
    // Group all consecutive non-equal lines together
    if (line.type !== 'equal') {
      if (currentType === 'equal') {
        if (currentHunk.length > 0) {
          hunks.push({ id: `hunk-${hunkId++}`, lines: currentHunk, type: 'equal' })
          currentHunk = []
        }
        currentType = line.type
      }
      currentHunk.push(line)
    } else {
      if (currentType !== 'equal' && currentHunk.length > 0) {
        hunks.push({ id: `hunk-${hunkId++}`, lines: currentHunk, type: currentHunk[0].type })
        currentHunk = []
        currentType = 'equal'
      }
      currentHunk.push(line)
    }
  }

  if (currentHunk.length > 0) {
    hunks.push({
      id: `hunk-${hunkId++}`,
      lines: currentHunk,
      type: currentHunk[0].type === 'equal' ? 'equal' : currentHunk[0].type,
    })
  }

  return hunks
}

export function computeDiffStats(hunks: DiffHunk[]): { additions: number; deletions: number; modifications: number } {
  let additions = 0
  let deletions = 0
  let modifications = 0

  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.type === 'add') additions++
      else if (line.type === 'delete') deletions++
      else if (line.type === 'modify') modifications++
    }
  }

  return { additions, deletions, modifications }
}

// Three-way merge helpers
export interface MergeConflict {
  id: string
  baseLines: string[]
  leftLines: string[]
  rightLines: string[]
  resolved: boolean
  resolution?: string
}

export interface ThreeWayResult {
  merged: string
  conflicts: MergeConflict[]
  hasConflicts: boolean
}

export function threeWayMerge(base: string, left: string, right: string, options: DiffOptions): ThreeWayResult {
  const baseLines = base.split('\n')
  const leftLines = left.split('\n')
  const rightLines = right.split('\n')

  // Compute diffs from base
  const leftHunks = computeLineDiff(base, left, options)
  const rightHunks = computeLineDiff(base, right, options)

  // Simple approach: if only one side changed a region, take that change.
  // If both sides changed the same region, it's a conflict.
  const leftChanges = new Set<number>()
  const rightChanges = new Set<number>()

  for (const hunk of leftHunks) {
    for (const line of hunk.lines) {
      if (line.type !== 'equal' && line.leftNum !== null) {
        leftChanges.add(line.leftNum)
      }
    }
  }

  for (const hunk of rightHunks) {
    for (const line of hunk.lines) {
      if (line.type !== 'equal' && line.leftNum !== null) {
        rightChanges.add(line.leftNum)
      }
    }
  }

  // Find overlapping changes (conflicts)
  const conflictLines = new Set<number>()
  for (const lineNum of leftChanges) {
    if (rightChanges.has(lineNum)) {
      conflictLines.add(lineNum)
    }
  }

  const conflicts: MergeConflict[] = []
  const mergedLines: string[] = []
  let conflictId = 0

  // Build merged result line by line from base
  for (let i = 0; i < baseLines.length; i++) {
    const lineNum = i + 1
    if (conflictLines.has(lineNum)) {
      // Find the extent of this conflict in both sides
      const conflict: MergeConflict = {
        id: `conflict-${conflictId++}`,
        baseLines: [baseLines[i]],
        leftLines: [leftLines[i] ?? ''],
        rightLines: [rightLines[i] ?? ''],
        resolved: false,
      }
      conflicts.push(conflict)
      mergedLines.push(`<<<<<<< LEFT`)
      mergedLines.push(leftLines[i] ?? '')
      mergedLines.push(`=======`)
      mergedLines.push(rightLines[i] ?? '')
      mergedLines.push(`>>>>>>> RIGHT`)
    } else if (leftChanges.has(lineNum)) {
      // Only left changed
      const leftIdx = findCorrespondingLine(leftHunks, lineNum)
      mergedLines.push(leftIdx ?? baseLines[i])
    } else if (rightChanges.has(lineNum)) {
      // Only right changed
      const rightIdx = findCorrespondingLine(rightHunks, lineNum)
      mergedLines.push(rightIdx ?? baseLines[i])
    } else {
      mergedLines.push(baseLines[i])
    }
  }

  // Handle additions at the end from left
  if (leftLines.length > baseLines.length) {
    for (let i = baseLines.length; i < leftLines.length; i++) {
      mergedLines.push(leftLines[i])
    }
  }
  // Handle additions at the end from right
  if (rightLines.length > baseLines.length) {
    for (let i = baseLines.length; i < rightLines.length; i++) {
      mergedLines.push(rightLines[i])
    }
  }

  return {
    merged: mergedLines.join('\n'),
    conflicts,
    hasConflicts: conflicts.length > 0,
  }
}

function findCorrespondingLine(hunks: DiffHunk[], baseLineNum: number): string | null {
  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.leftNum === baseLineNum && line.type === 'modify') {
        return line.rightText
      }
    }
  }
  return null
}
