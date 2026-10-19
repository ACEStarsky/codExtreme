/**
 * Kimi (Moonshot) API 封装
 * 文档：https://platform.kimi.ai/docs/api/chat
 */

const BASE_URL = 'https://api.moonshot.cn/v1'

/**
 * 非流式对话请求
 */
export async function chatCompletion(apiKey, messages, options = {}) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || 'kimi-k2.6',
      messages,
      stream: false,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new KimiError(response.status, error)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

/**
 * 流式对话请求（SSE）
 * 返回一个 AsyncGenerator，逐块 yield 内容
 */
export async function* chatCompletionStream(apiKey, messages, options = {}) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || 'kimi-k2.6',
      messages,
      stream: true,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new KimiError(response.status, error)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留未完成的行

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6) // 去掉 "data: "
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            yield content
          }
        } catch {
          // 忽略解析失败的行
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

/**
 * 自定义错误类，携带 HTTP 状态码便于分类处理
 */
export class KimiError extends Error {
  constructor(statusCode, body) {
    const message =
      body?.error?.message ||
      body?.message ||
      `Kimi API 请求失败 (${statusCode})`
    super(message)
    this.name = 'KimiError'
    this.statusCode = statusCode
    this.body = body
  }

  /**
   * 是否可重试（429 限流或 5xx 服务器错误）
   */
  get isRetryable() {
    return this.statusCode === 429 || this.statusCode >= 500
  }
}

/**
 * 带指数退避的重试包装
 */
export async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (err instanceof KimiError && err.isRetryable && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      throw err
    }
  }
}