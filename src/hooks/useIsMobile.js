import { useState, useEffect } from 'react'

/**
 * 检测是否为移动端（<768px）
 * 使用 Tailwind 默认的 md 断点作为阈值
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return isMobile
}