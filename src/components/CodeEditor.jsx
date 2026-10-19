import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { cpp } from '@codemirror/lang-cpp'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'

/**
 * 根据语言标识获取 CodeMirror 语言扩展
 * 支持：javascript, cpp, html, css, json, python
 */
function getLanguageExtension(lang) {
  const map = {
    javascript: javascript,
    cpp: cpp,
    html: html,
    css: css,
    json: json,
    python: python,
  }
  return map[lang]?.() || javascript()
}

export default function CodeEditor({ value, language, onChange }) {
  // 缓存语言扩展，避免每次渲染重建
  const extensions = useMemo(
    () => [getLanguageExtension(language)],
    [language]
  )

  return (
    <CodeMirror
      value={value}
      height="100%"
      theme={oneDark}
      extensions={extensions}
      onChange={onChange}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        dropCursor: true,
        allowMultipleSelections: true,
        indentOnInput: true,
        bracketMatching: true,   // 括号匹配
        closeBrackets: true,     // 自动闭合括号
        autocompletion: true,    // 自动补全
        highlightActiveLine: true,
        highlightSelectionMatches: true,
      }}
      style={{ height: '100%', fontSize: '14px' }}
    />
  )
}