import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export default function SettingsModal({ onClose }) {
  const [apiKey, setApiKey] = useLocalStorage('kimi-api-key', '')
  const [model, setModel] = useLocalStorage('kimi-model', 'kimi-k2.6')

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">设置</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Kimi API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              在 platform.kimi.ai 创建，仅存储在本地浏览器。
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">模型</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="kimi-k2.6">kimi-k2.6</option>
              <option value="kimi-k2.5">kimi-k2.5</option>
              <option value="kimi-k3">kimi-k3</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm min-h-[44px]"
          >
            保存并关闭
          </button>
        </div>
      </div>
    </div>
  )
}