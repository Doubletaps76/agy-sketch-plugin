#!/usr/bin/env node
import readline from 'node:readline'
import { getAppHtml } from './app-ui.mjs'
import { GUIDE, KINDS, renderCard } from './engine.mjs'

const APP_URI = 'ui://sketch/card.html'
const SERVER_INFO = {
  name: 'sketch',
  version: '0.2.2',
}

const TOOL_META = {
  ui: {
    resourceUri: APP_URI,
  },
}

export const handleRequest = async (req     )               => {
  const { id, method, params } = req

  if (method === 'initialize') {
    const clientVersion = typeof params?.protocolVersion === 'string' ? params.protocolVersion : '2025-03-26'
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: clientVersion,
        capabilities: {
          tools: { listChanged: false },
          resources: { subscribe: false, listChanged: false },
        },
        serverInfo: SERVER_INFO,
        instructions: GUIDE,
      },
    }
  }

  if (method === 'ping') {
    return {
      jsonrpc: '2.0',
      id,
      result: {},
    }
  }

  if (method === 'resources/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        resources: [
          {
            uri: APP_URI,
            name: 'Sketch Interactive Card UI',
            description: 'Interactive visual card renderer for architecture diagrams, charts, roadmaps, journeys, and wireframes',
            mimeType: 'text/html;profile=mcp-app',
            _meta: {
              ui: {
                prefersBorder: false,
              },
            },
          },
        ],
      },
    }
  }

  if (method === 'resources/read') {
    const uri = params?.uri
    if (uri !== APP_URI) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32602,
          message: `Resource not found: ${uri}`,
        },
      }
    }
    return {
      jsonrpc: '2.0',
      id,
      result: {
        contents: [
          {
            uri: APP_URI,
            mimeType: 'text/html;profile=mcp-app',
            text: getAppHtml(),
            _meta: {
              ui: {
                prefersBorder: false,
              },
            },
          },
        ],
      },
    }
  }

  if (method === 'tools/list') {
    const tools = KINDS.map(kind => ({
      name: kind.name,
      title: `Sketch ${kind.name}`,
      description: kind.description,
      inputSchema: kind.inputSchema,
      _meta: TOOL_META,
    }))
    return {
      jsonrpc: '2.0',
      id,
      result: { tools },
    }
  }

  if (method === 'tools/call') {
    const rawName = String(params?.name ?? '')
    const args = params?.arguments ?? {}
    const rendered = renderCard(rawName, args, {
      columns: Number(process.env.SKETCH_COLUMNS ?? 110),
      cardId: String(id ?? 'c'),
    })

    if (!rendered.ok) {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          isError: true,
          content: [
            {
              type: 'text',
              text: `sketch could not draw this ${rawName}: ${rendered.error}`,
            },
          ],
        },
      }
    }

    const drawn = `Drawn for the person: ${rendered.summary}. Do not repeat it in text.`
    const compareHint =
      rendered.tool === 'compare' && rendered.model?.isAsking !== false
        ? ' The options are shown side-by-side with an interactive selector.'
        : ''

    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [
          {
            type: 'text',
            text: `${drawn}${compareHint}`,
          },
        ],
        structuredContent: {
          tool: rendered.tool,
          title: rendered.title,
          summary: rendered.summary,
          isAnimated: rendered.isAnimated,
          input: args,
          lines: rendered.lines,
          details: rendered.details,
          ascii: rendered.ascii,
        },
        _meta: TOOL_META,
      },
    }
  }

  if (id !== undefined) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32601,
        message: `Method not found: ${method}`,
      },
    }
  }

  return null
}

export const startMcpServer = ()       => {
  const rl = readline.createInterface({
    input: process.stdin,
    terminal: false,
  })

  rl.on('line', async line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('Content-Length:')) return
    try {
      const msg = JSON.parse(trimmed)
      if (msg.id === undefined) {
        // Notification (e.g. notifications/initialized), no response needed
        return
      }
      const res = await handleRequest(msg)
      if (res) {
        process.stdout.write(JSON.stringify(res) + '\n')
      }
    } catch (err     ) {
      process.stderr.write(`[sketch-mcp] error processing line: ${err?.message ?? err}\n`)
    }
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startMcpServer()
}
