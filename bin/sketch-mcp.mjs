#!/usr/bin/env node
import fs from 'node:fs'
import http from 'node:http'
import readline from 'node:readline'
import { getAppHtml } from './app-ui.mjs'
import { GUIDE, KINDS, renderCard } from './engine.mjs'

const cardHtmlStore = new Map                ()
let httpPort = 0

const ensureHttpServer = ()                  => {
  if (httpPort > 0) return Promise.resolve(httpPort)
  return new Promise(resolve => {
    const srv = http.createServer((req, res) => {
      const url = req.url ?? '/'
      const m = url.match(/^\/card\/([a-zA-Z0-9_-]+)/)
      const id = m?.[1]
      const html = id ? cardHtmlStore.get(id) : Array.from(cardHtmlStore.values()).pop()
      if (!html) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('Sketch card not found')
        return
      }
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      })
      res.end(html)
    })
    srv.on('error', () => {
      // Fallback to random port if 18923 is in use
      srv.listen(0, '127.0.0.1', () => {
        const addr = srv.address()
        httpPort = typeof addr === 'object' && addr ? addr.port : 0
        resolve(httpPort)
      })
    })
    srv.listen(18923, '127.0.0.1', () => {
      const addr = srv.address()
      httpPort = typeof addr === 'object' && addr ? addr.port : 18923
      resolve(httpPort)
    })
    srv.unref()
  })
}

const buildInteractiveHtml = (tool        , input         )         => {
  const payloadScript = `<script>window.__SKETCH_INITIAL_DATA__ = ${JSON.stringify({ tool, input }).replace(/</g, '\\u003c')};</script>\n`
  return getAppHtml().replace('</head>', `${payloadScript}</head>`)
}

const saveInteractiveCard = async (tool        , title        , input         )                                               => {
  const html = buildInteractiveHtml(tool, input)
  const cardId = `${ tool }-${ Date.now().toString(36) }`
  cardHtmlStore.set(cardId, html)
  const port = await ensureHttpServer()
  const url = port > 0 ? `http://127.0.0.1:${port}/card/${cardId}` : undefined

  let filePath                    
  try {
    const dir = '/tmp/sketch-cards'
    fs.mkdirSync(dir, { recursive: true })
    const slug = (title || tool || 'card')
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'card'
    filePath = `${dir}/${slug}.html`
    fs.writeFileSync(filePath, html, 'utf8')
  } catch {
    // ignore
  }
  return { url, filePath }
}

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

    const { url: interactiveUrl } = await saveInteractiveCard(rendered.tool, rendered.title, args)
    const linkLine = interactiveUrl ? `\n\n互動式圖卡預覽：${interactiveUrl}` : ''

    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [
          {
            type: 'text',
            text: `Drawn card (${rendered.summary}). Output the following card verbatim inside a \`\`\`text code block in your response${interactiveUrl ? ` and print the plain URL ${interactiveUrl} below the code block so the user can Cmd+Click it in the terminal` : ''}, keeping surrounding text to 1-2 lines:\n\n\`\`\`text\n${rendered.ascii}\n\`\`\`${linkLine}`,
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
