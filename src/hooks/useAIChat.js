import { useState, useCallback, useRef } from 'react'
import { chatCompletionStream, KimiError } from '../services/kimiApi'

/**
 * AI 对话逻辑 Hook
 * 管理消息历史、流式输出、错误状态
 */
export function useAIChat(apiKey, model) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(false)

  const sendMessage = useCallback(
    async (content, context = null) => {
      if (!apiKey) {
        setError('请先在设置中配置 Kimi API Key')
        return
      }

      setError(null)
      abortRef.current = false

      // 构建用户消息
      const userMessage = { role: 'user', content }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setIsLoading(true)

      // 构建发送给 API 的消息列表
      const apiMessages = [...newMessages]
      if (context) {
        // 如果有选中的代码上下文，附加到系统提示中
        apiMessages.unshift({
          role: 'system',
          content: `你是一个专业的编程助手。当前用户选中的代码：\n\`\`\`\n${context}\n\`\`\`\n请根据用户的问题提供帮助。`,
        })
      }

      try {
        let assistantContent = ''
        // 先添加一条空的 assistant 消息用于流式更新
        setMessages([...apiMessages, { role: 'assistant', content: '' }])

        for await (const chunk of chatCompletionStream(apiKey, apiMessages, {
          model,
        })) {
          if (abortRef.current) break
          assistantContent += chunk
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: assistantContent,
            }
            return updated
          })
        }
      } catch (err) {
        if (err instanceof KimiError) {
          if (err.statusCode === 401) {
            setError('API Key 无效，请检查设置')
          } else if (err.statusCode === 429) {
            setError('请求过于频繁，请稍后重试')
          } else {
            setError(err.message)
          }
        } else {
          setError(err.message || '网络请求失败')
        }
        // 移除失败的空 assistant 消息
        setMessages((prev) => prev.filter((m) => m.content))
      } finally {
        setIsLoading(false)
      }
    },
    [apiKey, model, messages]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  const abort = useCallback(() => {
    abortRef.current = true
    setIsLoading(false)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    abort,
  }
}