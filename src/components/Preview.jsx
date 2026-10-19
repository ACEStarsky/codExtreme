export default function Preview({ html }) {
  if (!html) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 text-gray-500 text-sm">
        正在编译代码...
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-1.5 text-xs text-gray-400 border-b border-gray-700 bg-gray-800 shrink-0">
        预览 (支持 ESM import)
      </div>
      <iframe
        title="preview"
        srcDoc={html}
        sandbox="allow-scripts"
        className="flex-1 w-full bg-white preview-iframe"
      />
    </div>
  )
}