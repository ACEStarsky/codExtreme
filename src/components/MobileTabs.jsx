/**
 * MobileTabs —— 移动端底部 Tab 切换栏
 *
 * 用途：小屏幕（<768px）下用于在「编辑器 / 预览 / AI 助手」之间切换。
 * 设计要点：
 *  - 固定底部、安全区适配（iPhone 刘海屏 home indicator）
 *  - 每个 Tab 触摸目标 ≥ 44×44px，符合移动端可点击标准
 *  - 当前 Tab 高亮，带图标 + 文字
 *  - 纯受控组件：状态由父组件（App）持有
 */

// 各 Tab 的图标（内联 SVG，避免引入图标库）
function EditorIcon({ active }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#818cf8' : '#9ca3af'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function PreviewIcon({ active }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#818cf8' : '#9ca3af'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function AIIcon({ active }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? '#818cf8' : '#9ca3af'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1 0 8v1a4 4 0 0 1-8 0v-1a4 4 0 0 1 0-8V6a4 4 0 0 1 4-4z" />
      <circle cx="9" cy="10" r="1" />
      <circle cx="15" cy="10" r="1" />
      <path d="M9 15h6" />
    </svg>
  )
}

// Tab 配置表
const TABS = [
  { key: 'editor', label: '编辑器', Icon: EditorIcon },
  { key: 'preview', label: '预览', Icon: PreviewIcon },
  { key: 'ai', label: 'AI 助手', Icon: AIIcon },
]

export default function MobileTabs({ activeTab, onChange }) {
  return (
    <nav
      className="flex items-stretch bg-gray-800 border-t border-gray-700 shrink-0"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} // 适配 iPhone 底部安全区
    >
      {TABS.map(({ key, label, Icon }) => {
        const active = activeTab === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            aria-current={active ? 'page' : undefined}
            aria-label={label}
            className={`
              flex-1 flex flex-col items-center justify-center gap-1
              min-h-[56px] py-2
              transition-colors
              ${active ? 'text-indigo-400' : 'text-gray-400 active:bg-gray-700'}
            `}
          >
            <Icon active={active} />
            <span className="text-[11px] leading-none">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}