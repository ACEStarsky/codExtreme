import { useState } from 'react'

export default function FileTree({ files, activeFileId, onSelect, onAdd, onDelete, isMobile }) {
  const [newFileName, setNewFileName] = useState('')

  return (
    <div className={`${isMobile ? 'h-32' : 'w-56 border-r'} border-gray-700 bg-gray-850 flex flex-col shrink-0`}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-xs font-medium text-gray-400">文件</span>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (newFileName.trim()) {
              onAdd(newFileName.trim())
              setNewFileName('')
            }
          }}
          className="flex"
        >
          <input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="新建..."
            className="w-20 bg-gray-700 text-xs px-2 py-1 rounded-l"
          />
          <button type="submit" className="bg-indigo-600 text-xs px-2 rounded-r">+</button>
        </form>
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => onSelect(file.id)}
            className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer ${
              file.id === activeFileId ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-gray-700'
            }`}
          >
            <span className="truncate">{file.name}</span>
            {files.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(file.id) }}
                className="text-gray-500 hover:text-red-400 text-xs ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}