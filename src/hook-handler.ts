import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { KINDS, renderCard } from './engine.ts'

const SKETCH_TOOLS = new Set(KINDS.map(k => k.name))

const extractSketchCall = (toolCall: any): { name: string; args: unknown } | null => {
  if (!toolCall || typeof toolCall !== 'object') return null
  const rawName = String(toolCall.name ?? '')
  const args = toolCall.args ?? {}

  if (rawName === 'call_mcp_tool') {
    const serverName = String(args?.ServerName ?? '')
    const toolName = String(args?.ToolName ?? '')
    if (serverName.includes('sketch') && SKETCH_TOOLS.has(toolName)) {
      return { name: toolName, args: args?.Arguments ?? {} }
    }
    return null
  }

  // Matches mcp_sketch_diagram, mcp_sketch_sketch_diagram, mcp__sketch__diagram, sketch_diagram
  const m = rawName.match(/^(?:mcp_.*sketch.*_|mcp__sketch__|sketch_)([a-z]+)$/)
  if (m && m[1] && SKETCH_TOOLS.has(m[1])) {
    return { name: m[1], args }
  }

  if (SKETCH_TOOLS.has(rawName)) {
    return { name: rawName, args }
  }

  return null
}

const queueFileFor = (conversationId: string): string => {
  const baseDir = process.env.PLUGIN_DATA || os.tmpdir()
  try {
    fs.mkdirSync(baseDir, { recursive: true })
  } catch {
    // ignore
  }
  const safeId = (conversationId || 'default').replace(/[^a-zA-Z0-9_-]/g, '_')
  return path.join(baseDir, `sketch-queue-${safeId}.json`)
}

export const runHook = async (): Promise<void> => {
  let raw = ''
  for await (const chunk of process.stdin) {
    raw += chunk
  }
  if (!raw.trim()) {
    process.stdout.write('{}\n')
    return
  }

  let payload: any
  try {
    payload = JSON.parse(raw)
  } catch {
    process.stdout.write('{}\n')
    return
  }

  const eventName = String(payload.hookEventName ?? '')
  const convId = String(payload.conversationId ?? 'default')
  const qFile = queueFileFor(convId)

  if (eventName === 'PostToolUse') {
    if (payload.error) {
      process.stdout.write('{}\n')
      return
    }
    const call = extractSketchCall(payload.toolCall)
    if (call) {
      const rendered = renderCard(call.name, call.args, {
        columns: Number(process.env.SKETCH_COLUMNS ?? 100),
        cardId: String(payload.toolCall?.id ?? 'h'),
      })
      if (rendered.ok) {
        let existing: string[] = []
        try {
          existing = JSON.parse(fs.readFileSync(qFile, 'utf8'))
          if (!Array.isArray(existing)) existing = []
        } catch {
          existing = []
        }
        existing.push(rendered.ascii)
        try {
          fs.writeFileSync(qFile, JSON.stringify(existing), 'utf8')
        } catch {
          // ignore write error
        }
      }
    }
    process.stdout.write('{}\n')
    return
  }

  if (eventName === 'PreInvocation' || eventName === 'PostInvocation') {
    if (process.env.SKETCH_INLINE_MARKDOWN === '0') {
      process.stdout.write('{}\n')
      return
    }
    let cards: string[] = []
    try {
      if (fs.existsSync(qFile)) {
        cards = JSON.parse(fs.readFileSync(qFile, 'utf8'))
        fs.unlinkSync(qFile)
      }
    } catch {
      cards = []
    }
    if (Array.isArray(cards) && cards.length > 0) {
      const md = cards.map(ascii => '```text\n' + ascii + '\n```').join('\n\n')
      process.stdout.write(
        JSON.stringify({
          injectSteps: [
            {
              systemMessage: {
                systemMessage: '',
                metadata: {
                  user_markdown: md,
                },
              },
            },
          ],
        }) + '\n',
      )
      return
    }
    process.stdout.write('{}\n')
    return
  }

  process.stdout.write('{}\n')
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runHook()
}
