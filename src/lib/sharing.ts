import LZString from 'lz-string'

interface ShareData {
  left: string
  right: string
  base?: string
}

export function encodeShareUrl(data: ShareData): string {
  const json = JSON.stringify(data)
  const compressed = LZString.compressToEncodedURIComponent(json)
  return `${window.location.origin}${window.location.pathname}#share=${compressed}`
}

export function decodeShareUrl(): ShareData | null {
  const hash = window.location.hash
  if (!hash.startsWith('#share=')) return null

  try {
    const compressed = hash.slice(7)
    const json = LZString.decompressFromEncodedURIComponent(compressed)
    if (!json) return null
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function canShare(left: string, right: string): boolean {
  // Only allow sharing for small content (<5KB compressed)
  const json = JSON.stringify({ left, right })
  const compressed = LZString.compressToEncodedURIComponent(json)
  return compressed.length < 5000
}
