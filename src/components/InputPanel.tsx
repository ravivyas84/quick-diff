import { useCallback, useRef, useState } from 'react'
import { readFileAsText, formatFileSize } from '../lib/file-utils'

interface InputPanelProps {
  label: string
  value: string
  onChange: (value: string) => void
  filename: string
  onFilenameChange: (name: string) => void
  placeholder?: string
}

export function InputPanel({ label, value, onChange, filename, onFilenameChange, placeholder }: InputPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileInfo, setFileInfo] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    try {
      const { content, filename: fname } = await readFileAsText(file)
      onChange(content)
      onFilenameChange(fname)
      setFileInfo(`${fname} (${formatFileSize(file.size)})`)
    } catch {
      setFileInfo('Error reading file')
    }
  }, [onChange, onFilenameChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const lineCount = value ? value.split('\n').length : 0
  const charCount = value.length

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          {fileInfo && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{fileInfo}</span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {lineCount} lines, {charCount} chars
          </span>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Upload
          </button>
          {value && (
            <button
              onClick={() => { onChange(''); onFilenameChange(''); setFileInfo(null) }}
              className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div
        className={`relative flex-1 ${isDragging ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? `Paste ${label.toLowerCase()} content here, or drag & drop a file...`}
          className="w-full h-full min-h-[300px] p-3 text-sm font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none border-0 focus:outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-600"
          spellCheck={false}
        />
        {isDragging && (
          <div className="absolute inset-0 bg-blue-50/80 dark:bg-blue-900/30 flex items-center justify-center pointer-events-none">
            <p className="text-blue-600 dark:text-blue-400 font-medium">Drop file here</p>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
