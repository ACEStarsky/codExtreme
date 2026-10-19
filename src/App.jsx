import { useState, useEffect } from 'react'
import Toolbar from './components/Toolbar'
import FileTree from './components/FileTree'
import CodeEditor from './components/CodeEditor'
import AIPanel from './components/AIPanel'
import Preview from './components/Preview'
import Console from './components/Console'
import SettingsModal from './components/SettingsModal'
import MobileTabs from './components/MobileTabs'
import { useFiles } from './hooks/useFiles'
import { useIsMobile } from './hooks/useIsMobile'

export default function App() {
  const isMobile = useIsMobile()
  // 这里解构的名字修改为 generatePreview
  const {
    files, activeFileId, setActiveFileId, updateFileContent,
    addFile, deleteFile, activeFile, generatePreview, 
  } = useFiles()

  const [showSettings, setShowSettings] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(true)
  const [mobileTab, setMobileTab] = useState('editor')
  const [consoleLogs, setConsoleLogs] = useState([])
  const [previewHtml, setPreviewHtml] = useState('')

  useEffect(() => {
    let isMounted = true
    const timer = setTimeout(async () => {
      // 这里调用的是 generatePreview
      const html = await generatePreview()
      if (isMounted) setPreviewHtml(html)
    }, 600)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [files, generatePreview])

  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'console') {
        setConsoleLogs((prev) => [...prev.slice(-99), { level: e.data.level, message: e.data.message }])
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const renderMobileContent = () => {
    switch (mobileTab) {
      case 'editor':
        return (
          <div className="flex flex-col h-full">
            <FileTree files={files} activeFileId={activeFileId} onSelect={setActiveFileId} onAdd={addFile} onDelete={deleteFile} isMobile />
            <div className="flex-1 overflow-hidden">
              <CodeEditor value={activeFile?.content || ''} language={activeFile?.language || 'javascript'} onChange={(val) => updateFileContent(activeFileId, val)} />
            </div>
          </div>
        )
      case 'preview':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              <Preview html={previewHtml} />
            </div>
            <Console logs={consoleLogs} isMobile onClear={() => setConsoleLogs([])} />
          </div>
        )
      case 'ai':
        return <AIPanel onClose={() => setMobileTab('editor')} isMobile />
      default:
        return null
    }
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
        <Toolbar onSettings={() => setShowSettings(true)} isMobile mobileTab={mobileTab} onTabChange={setMobileTab} />
        <div className="flex-1 overflow-hidden">{renderMobileContent()}</div>
        <MobileTabs activeTab={mobileTab} onChange={setMobileTab} />
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <Toolbar onSettings={() => setShowSettings(true)} onToggleAI={() => setShowAIPanel(!showAIPanel)} showAI={showAIPanel} />
      <div className="flex flex-1 overflow-hidden">
        <FileTree files={files} activeFileId={activeFileId} onSelect={setActiveFileId} onAdd={addFile} onDelete={deleteFile} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CodeEditor value={activeFile?.content || ''} language={activeFile?.language || 'javascript'} onChange={(val) => updateFileContent(activeFileId, val)} />
          </div>
          <div className="h-64 border-t border-gray-700 flex">
            <div className="flex-1 border-r border-gray-700">
              <Preview html={previewHtml} />
            </div>
            <div className="w-80">
              <Console logs={consoleLogs} onClear={() => setConsoleLogs([])} />
            </div>
          </div>
        </div>
        {showAIPanel && <AIPanel onClose={() => setShowAIPanel(false)} />}
      </div>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}