export default function Toolbar({ onSettings, onToggleAI, showAI, isMobile, mobileTab, onTabChange }) {
  if (isMobile) {
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 shrink-0">
        <span className="font-semibold text-sm">CodExtreme</span>
        <button
          onClick={onSettings}
          className="px-4 py-2 text-sm bg-gray-700 rounded min-h-[44px]"
        >
          设置
        </button>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 shrink-0">
      <span className="font-semibold">CodExtreme</span>
      <div className="flex gap-2">
        <button
          onClick={onToggleAI}
          className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded min-h-[44px]"
        >
          {showAI ? '隐藏 AI' : '显示 AI'}
        </button>
        <button
          onClick={onSettings}
          className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded min-h-[44px]"
        >
          设置
        </button>
      </div>
    </div>
  )
}