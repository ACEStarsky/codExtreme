import { useState, useCallback, useMemo } from 'react'
import { buildProject } from '../services/bundler'

const DEFAULT_FILES = [
  {
    id: 'index.html',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Preview</title>
</head>
<body>
  <h1>Hello, Web IDE!</h1>
  <div id="app"></div>
  <script type="module" src="./app.js"><\/script>
</body>
</html>`,
  },
  {
    id: 'app.js',
    name: 'app.js',
    language: 'javascript',
    content: `import { greet } from './utils.js';

console.log(greet('Developer'));
document.getElementById('app').innerText = greet('Web IDE');`,
  },
  {
    id: 'utils.js',
    name: 'utils.js',
    language: 'javascript',
    content: `export function greet(name) {
  return \`Hello, \${name}! 测试 import 成功。\`;
}`,
  }
]

function detectLanguage(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const map = {
    js: 'javascript', jsx: 'javascript', ts: 'javascript', tsx: 'javascript',
    py: 'python', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', h: 'cpp', hpp: 'cpp',
    html: 'html', htm: 'html', css: 'css', json: 'json',
  }
  return map[ext] || 'javascript'
}

export function useFiles() {
  const [files, setFiles] = useState(DEFAULT_FILES)
  const [activeFileId, setActiveFileId] = useState(DEFAULT_FILES[0].id)

  const activeFile = useMemo(
    () => files.find((f) => f.id === activeFileId),
    [files, activeFileId]
  )

  const updateFileContent = useCallback((id, content) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, content } : f)))
  }, [])

  const addFile = useCallback((name) => {
    const id = name || `file-${Date.now()}.js`
    setFiles((prev) => [...prev, { id, name: id, language: detectLanguage(id), content: '' }])
    setActiveFileId(id)
  }, [])

  const deleteFile = useCallback((id) => {
    if (files.length <= 1) return
    setFiles((prev) => prev.filter((f) => f.id !== id))
    if (activeFileId === id) {
      setActiveFileId(files.find((f) => f.id !== id)?.id)
    }
  }, [files, activeFileId])

  // 注意：这里改名为 generatePreview
  const generatePreview = useCallback(async () => {
    const htmlFile = files.find((f) => f.language === 'html')
    let html = htmlFile?.content || '<!DOCTYPE html><html><body></body></html>'

    const consoleScript = `<script>
      ['log','warn','error','info'].forEach(m => {
        const orig = console[m];
        console[m] = (...args) => {
          orig.apply(console, args);
          window.parent.postMessage({
            type: 'console',
            level: m,
            message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
          }, '*');
        };
      });
      window.addEventListener('error', (e) => {
         window.parent.postMessage({ type: 'console', level: 'error', message: e.message }, '*');
      });
    <\/script>`

    html = html.replace(/<script.*?>.*?<\/script>/gi, '')
    html = html.replace(/<link[^>]*>/gi, '')

    const cssFiles = files.filter(f => f.language === 'css')
    const cssContent = cssFiles.map(f => f.content).join('\n')
    html = html.replace('</head>', `<style>${cssContent}</style></head>`)

    const { code, error } = await buildProject(files)
    
    if (error) {
      html = html.replace('</body>', `${consoleScript}<script>console.error(${JSON.stringify(error)})<\/script></body>`)
    } else {
      html = html.replace('</body>', `${consoleScript}<script>${code}<\/script></body>`)
    }

    return html
  }, [files])

  // 导出的名字要和 App.jsx 里解构的名字一致
  return {
    files, activeFileId, activeFile,
    setActiveFileId, updateFileContent, addFile, deleteFile, 
    generatePreview // <-- 这里必须是 generatePreview
  }
}