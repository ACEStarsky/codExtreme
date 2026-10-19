import * as esbuild from 'esbuild-wasm'

let initPromise = null

// 使用单例 Promise，确保只初始化一次
export async function initEsbuild() {
  if (initPromise) return initPromise

  initPromise = esbuild.initialize({
    // 严格匹配你 package.json 里安装的版本。推荐使用 0.19.11 版本
    wasmURL: '/esbuild.wasm',
  })
  
  return initPromise
}

const virtualFsPlugin = (files) => ({
  name: 'virtual-fs',
  setup(build) {
    build.onResolve({ filter: /.*/ }, (args) => {
      let path = args.path.replace(/^\.\//, '')
      if (!path.includes('.')) {
        const match = files.find(f => f.name.startsWith(path))
        if (match) path = match.name
      }
      return { path, namespace: 'virtual' }
    })

    build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => {
      const file = files.find((f) => f.name === args.path)
      if (!file) return { errors: [{ text: `找不到文件: ${args.path}` }] }

      let loader = 'js'
      if (file.name.endsWith('.css')) loader = 'css'

      return {
        contents: file.content,
        loader,
      }
    })
  },
})

export async function buildProject(files) {
  try {
    await initEsbuild()
  } catch (err) {
    return { code: '', error: `Esbuild 初始化失败: ${err.message}` }
  }
  
  const jsEntry = files.find(f => f.language === 'javascript' || f.name === 'app.js' || f.name === 'main.js')
  
  try {
    const result = await esbuild.build({
      entryPoints: [jsEntry ? jsEntry.name : 'app.js'],
      bundle: true,
      write: false,
      format: 'iife',
      plugins: [virtualFsPlugin(files)],
    })
    return { code: result.outputFiles[0].text, error: null }
  } catch (err) {
    return { code: '', error: err.message }
  }
}