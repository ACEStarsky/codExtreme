export default function Console({ logs, onClear, isMobile }) {
  return (
    <div className={`${isMobile ? 'h-24' : 'h-full'} flex flex-col bg-gray-900`}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-700 shrink-0">
        <span className="text-xs text-gray-400">控制台</span>
        <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-300 min-w-[44px] min-h-[32px]">
          清空
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {logs.length === 0 && <div className="text-gray-600">无输出</div>}
        {logs.map((log, i) => (
          <div
            key={i}
            className={
              log.level === 'error' ? 'text-red-400' :
              log.level === 'warn' ? 'text-yellow-400' : 'text-gray-300'
            }
          >
            {log.message}
          </div>
        ))}
      </div>
    </div>
  )
}