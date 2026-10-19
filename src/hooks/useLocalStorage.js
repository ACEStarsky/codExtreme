import { useState, useEffect } from 'react'

/**
 * 与 localStorage 同步的状态 Hook
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 忽略存储失败（隐私模式等）
    }
  }, [key, value])

  return [value, setValue]
}