import { useState, useRef, useEffect } from 'react'
import { useAIChat } from '../hooks/useAIChat'
import { useLocalStorage } from '../hooks/useLocalStorage'

/**
 * AI 对话面板
 * 支持流式输出、错误提示、选中代码操作
 */
export default function AIPanel({ onClose, isMobile, selectedCode, onApplyCode }) {
  const [apiKey] = useLocalStorage('kimi-api-key', '')
  const [model] = useLocalStorage('kimi-model', 'kimi-k2.6')
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const { messages, isLoading, error, sendMessage, clearMessages, abort } =
    useAIChat(apiKey, model)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    sendMessage(text, selectedCode)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 快捷操作
  const quickActions = [
    { label: '解释选中代码', prompt: '请解释以下代码的功能和逻辑。' },
    { label: '优化代码', prompt: '请优化以下代码，提高可读性和性能。' },
    { label: '修复错误', prompt: '以下代码有错误，请帮我修复。' },
    { label: '添加注释', prompt: '请为以下代码添加清晰的中文注释。' },
  ]

  const handleQuickAction = (prompt) => {
    if (!selectedCode) {
      setInput('请先选中一段代码，然后点击快捷操作。')
      return
    }
    sendMessage(prompt, selectedCode)
  }

  return (
    <div
      className={`${
        isMobile ? 'fixed inset-0 z-50' : 'w-96 border-l border-gray-700'
      } flex flex-col bg-gray-800`}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 shrink-0">
        <h2 className="font-semibold text-sm">AI 助手</h2>
        <div className="flex gap-2">
          {isLoading && (
            <button
              onClick={abort}
              className="px-3 py-2 text-xs bg-red-600 hover:bg-red-500 rounded min-h-[44px]"
            >
              停止
            </button>
          )}
          <button
            onClick={clearMessages}
            className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded min-h-[44px]"
          >
            清空
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 rounded min-h-[44px]"
            >
              关闭
            </button>
          )}
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="px-4 py-2 border-b border-gray-700 shrink-0">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.prompt)}
              disabled={!selectedCode}
              className="px-3 py-2 text-xs bg-gray-700 hover:bg-indigo-600 disabled:opacity-40 rounded min-h-[44px]"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!apiKey && (
          <div className="text-center text-yellow-400 text-sm py-8">
            请先在设置中配置 Kimi API Key
          </div>
        )}
        {messages.length === 0 && apiKey && (
          <div className="text-center text-gray-500 text-sm py-8">
            选中代码后提问，或直接输入问题。
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {msg.content || (isLoading && i === messages.length - 1 ? '思考中...' : '')}
            </div>
          </div>
        ))}
        {error && (
          <div className="text-red-400 text-xs bg-red-900/30 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区 */}
      <div className="p-4 border-t border-gray-700 shrink-0">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入问题... (Enter 发送，Shift+Enter 换行)"
            rows={2}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !apiKey}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg text-sm min-w-[44px] min-h-[44px]"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  )
}