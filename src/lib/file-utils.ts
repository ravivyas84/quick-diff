export function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    php: 'php',
    swift: 'swift',
    kt: 'kotlin',
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    md: 'markdown',
    txt: 'plaintext',
    csv: 'plaintext',
  }
  return map[ext] ?? 'plaintext'
}

export function detectLanguageFromContent(content: string): string {
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) return 'json'
  if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) return 'html'
  if (content.trim().startsWith('<?xml')) return 'xml'
  if (content.includes('def ') && content.includes(':')) return 'python'
  if (content.includes('function ') || content.includes('const ') || content.includes('import ')) return 'javascript'
  return 'plaintext'
}

export function normalizeJson(content: string): string {
  try {
    const parsed = JSON.parse(content)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return content
  }
}

export async function readFileAsText(file: File): Promise<{ content: string; filename: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ content: reader.result as string, filename: file.name })
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
