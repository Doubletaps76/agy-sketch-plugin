// Runs the plugin's hooks/engine and writes every sample card as a grid of
// styled cells (JSON), for paint.py to turn into images.
// usage: node preview/render.ts src/engine.ts 110 preview/cards.json ./samples.en.ts

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  h,
  Fragment,
  layout,
  serializeCells as cellsOf,
  stateFor,
} from '../src/engine.ts'

export { h, Fragment, layout, cellsOf, stateFor }

const g = globalThis as any
g.h = h
g.Fragment = Fragment

// Loads the mod against a stand-in engine; answers its hooks.
export const loadMod = async (modPath: string) => {
  const hooks: { event: string; matcher: any; fn: any }[] = []
  const on = (event: string, a: any, b?: any) => {
    hooks.push({ event, matcher: b ? a : undefined, fn: b ?? a })
    return { catch: () => undefined }
  }
  const resolved = path.isAbsolute(modPath) ? modPath : path.resolve(process.cwd(), modPath)
  const mod = await import(resolved)
  mod.register(on)
  return hooks
}

export const engine = {
  ui: {
    resolve: () => ({ Box: 'Box', Text: 'Text', Button: 'Button' }),
    invalidate: () => undefined,
  },
  state: {
    get: async () => ({}),
    set: async () => ({}),
  },
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  const modArg = process.argv[2] ?? 'src/engine.ts'
  const columns = Number(process.argv[3] ?? 110)
  const outArg = process.argv[4] ?? 'cards.json'
  const samplesArg = process.argv[5] ?? './samples.en.ts'
  const samplesPath = path.isAbsolute(samplesArg)
    ? samplesArg
    : path.resolve(path.dirname(fileURLToPath(import.meta.url)), samplesArg)

  const hooks = await loadMod(modArg)
  const $ = engine
  const samples: Record<string, any[]> = (await import(samplesPath)).samples
  const render = hooks.find(hook => hook.event === 'ui.render' && hook.matcher?.component === 'ToolUse')!.fn
  const out: any[] = []

  for (const [name, inputs] of Object.entries(samples)) {
    let index = 0
    for (const input of inputs) {
      // A sample made for an animation is drawn by frames.ts instead.
      if (input.demo !== undefined) continue
      const tool = `mcp__sketch__${name.split('#')[0]}`
      const tree = await render($, { props: { tool, input, isRunning: false, tool_use_id: 't' }, viewport: { columns } }, async () => undefined)
      if (!tree) continue
      const block = layout(tree, columns)
      const lines = block.lines.slice(block.lines[0]?.length === 0 ? 1 : 0)
      out.push({
        key: inputs.length === 1 ? name.replace('#', '-') : `${name.replace('#', '-')}-${input.kind ?? input.layout ?? ++index}`,
        tool: name.split('#')[0],
        kind: input.kind ?? input.layout ?? '',
        title: input.title ?? input.question ?? '',
        lines: cellsOf(lines),
      })
    }
  }

  await fs.writeFile(outArg, JSON.stringify(out))
  console.log(`${out.length} cards → ${outArg}`)
}
