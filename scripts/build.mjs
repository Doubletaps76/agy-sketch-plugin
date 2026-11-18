import fs from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const srcDir = path.join(rootDir, 'src')
const binDir = path.join(rootDir, 'bin')

fs.mkdirSync(binDir, { recursive: true })

// 1. Build bin/engine.mjs
const engineTs = fs.readFileSync(path.join(srcDir, 'engine.ts'), 'utf8')
const engineJs = stripTypeScriptTypes(engineTs).replace(/^\s*import\s+.*index\.d\.ts.*$/gm, '')
fs.writeFileSync(path.join(binDir, 'engine.mjs'), engineJs, 'utf8')

// 2. Build bin/app-ui.mjs (uses bin/engine.mjs directly so no runtime stripTypeScriptTypes needed!)
const appUiTs = fs.readFileSync(path.join(srcDir, 'app-ui.ts'), 'utf8')
let appUiJs = stripTypeScriptTypes(appUiTs)
  .replace(/import\s+\{\s*stripTypeScriptTypes\s*\}\s+from\s+['"]node:module['"]\s*/g, '')
  .replace(
    /export const buildEngineBrowserJs = \(\)\s*=>\s*\{[\s\S]*?\n\}/,
    `export const buildEngineBrowserJs = () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const engineMjsPath = path.join(__dirname, 'engine.mjs')
  return fs.readFileSync(engineMjsPath, 'utf8')
}`,
  )
fs.writeFileSync(path.join(binDir, 'app-ui.mjs'), appUiJs, 'utf8')

// 3. Build bin/sketch-mcp.mjs
const mcpTs = fs.readFileSync(path.join(srcDir, 'mcp-server.ts'), 'utf8')
const mcpJs =
  '#!/usr/bin/env node\n' +
  stripTypeScriptTypes(mcpTs)
    .replace('./app-ui.ts', './app-ui.mjs')
    .replace('./engine.ts', './engine.mjs')
const mcpBinPath = path.join(binDir, 'sketch-mcp.mjs')
fs.writeFileSync(mcpBinPath, mcpJs, 'utf8')
fs.chmodSync(mcpBinPath, 0o755)

// 4. Build bin/sketch-hook.mjs
const hookTs = fs.readFileSync(path.join(srcDir, 'hook-handler.ts'), 'utf8')
const hookJs =
  '#!/usr/bin/env node\n' +
  stripTypeScriptTypes(hookTs).replace('./engine.ts', './engine.mjs')
const hookBinPath = path.join(binDir, 'sketch-hook.mjs')
fs.writeFileSync(hookBinPath, hookJs, 'utf8')
fs.chmodSync(hookBinPath, 0o755)

console.log('Built bin/engine.mjs, bin/app-ui.mjs, bin/sketch-mcp.mjs, bin/sketch-hook.mjs successfully.')
