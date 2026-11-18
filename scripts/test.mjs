import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { KINDS, renderCard } from '../bin/engine.mjs'
import { handleRequest } from '../bin/sketch-mcp.mjs'
import { samples as samplesEn } from '../preview/samples.en.ts'
import { samples as samplesZh } from '../preview/samples.zh-TW.ts'

console.log('1. Checking 17 tool definitions...')
assert.equal(KINDS.length, 17, 'Expected exactly 17 sketch tools')
const expectedTools = [
  'diagram', 'layers', 'schema', 'swimlane', 'pipeline',
  'gitgraph', 'sequence', 'tree', 'timeline', 'board',
  'quadrant', 'journey', 'wireframe', 'metrics', 'chart',
  'cards', 'compare',
]
assert.deepEqual(KINDS.map(k => k.name), expectedTools)
console.log('   ✓ All 17 tools present:', expectedTools.join(', '))

console.log('2. Rendering all English sample cards (samples.en.ts)...')
let enCount = 0
for (const [key, list] of Object.entries(samplesEn)) {
  const tool = key.split('#')[0]
  for (const input of list) {
    const res = renderCard(tool, input, { columns: 110 })
    assert.equal(res.ok, true, `Failed on EN sample ${key}: ${!res.ok && res.error}`)
    assert.ok(res.lines.length > 0, `Empty lines for EN sample ${key}`)
    assert.ok(res.ascii.includes('◆'), `Missing title diamond in EN sample ${key}`)
    enCount++
  }
}
console.log(`   ✓ Rendered ${enCount} English cards successfully`)

console.log('3. Rendering all Traditional Chinese sample cards (samples.zh-TW.ts)...')
let zhCount = 0
for (const [key, list] of Object.entries(samplesZh)) {
  const tool = key.split('#')[0]
  for (const input of list) {
    const res = renderCard(tool, input, { columns: 110 })
    assert.equal(res.ok, true, `Failed on zh-TW sample ${key}: ${!res.ok && res.error}`)
    assert.ok(res.lines.length > 0, `Empty lines for zh-TW sample ${key}`)
    assert.ok(res.ascii.includes('◆'), `Missing title diamond in zh-TW sample ${key}`)
    zhCount++
  }
}
console.log(`   ✓ Rendered ${zhCount} Traditional Chinese cards successfully`)

console.log('4. Testing interactive node focus, heavy wires, and pulse flow...')
const interactiveSample = samplesZh['diagram#interactive'][0]
const restCard = renderCard('diagram', interactiveSample, { columns: 110 })
assert.equal(restCard.ok, true)
const focusedCard = renderCard('diagram', interactiveSample, {
  columns: 110,
  focusedNode: 2,
  flowPhase: 1,
})
assert.equal(focusedCard.ok, true)
assert.ok(focusedCard.ascii.includes('━') || focusedCard.ascii.includes('┃'), 'Expected heavy wire strokes when a node is focused')
const hasPressCells = restCard.lines.some(line => line.some(cell => cell.length === 6 && typeof cell[5] === 'number'))
assert.ok(hasPressCells, 'Expected interactive press node indices on diagram node cells')
console.log('   ✓ Interactive node focus, heavy strokes, and press targets verified')

console.log('5. Testing MCP Server stdio JSON-RPC (initialize, tools/list, resources/read, tools/call)...')
const mcpRequests = [
  { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26' } },
  { jsonrpc: '2.0', id: 2, method: 'tools/list' },
  { jsonrpc: '2.0', id: 3, method: 'resources/list' },
  { jsonrpc: '2.0', id: 4, method: 'resources/read', params: { uri: 'ui://sketch/card.html' } },
  {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'layers',
      arguments: samplesZh.layers[0],
    },
  },
]
const mcpResponses = []
for (const req of mcpRequests) {
  mcpResponses.push(await handleRequest(req))
}
assert.equal(mcpResponses.length, 5)
assert.equal(mcpResponses[0].result.serverInfo.name, 'sketch')
assert.equal(mcpResponses[1].result.tools.length, 17)
assert.equal(mcpResponses[2].result.resources[0].uri, 'ui://sketch/card.html')
assert.equal(mcpResponses[3].result.contents[0].mimeType, 'text/html;profile=mcp-app')
assert.ok(mcpResponses[3].result.contents[0].text.includes('<!DOCTYPE html>'))
assert.equal(mcpResponses[4].result.structuredContent.tool, 'layers')
assert.ok(mcpResponses[4].result.structuredContent.ascii.includes('電商平台分層架構'))
console.log('   ✓ MCP Server protocol & UI resource verified')

console.log('6. Testing CLI Hook Handler (PostToolUse -> PreInvocation user_markdown injection)...')
const { runHook } = await import('../bin/sketch-hook.mjs')
const invokeHookWith = async (payload) => {
  const origStdin = process.stdin
  const origWrite = process.stdout.write.bind(process.stdout)
  let captured = ''
  Object.defineProperty(process, 'stdin', {
    value: Readable.from([JSON.stringify(payload)]),
    configurable: true,
  })
  process.stdout.write = (chunk) => {
    captured += String(chunk)
    return true
  }
  try {
    await runHook()
  } finally {
    Object.defineProperty(process, 'stdin', { value: origStdin, configurable: true })
    process.stdout.write = origWrite
  }
  return JSON.parse(captured.trim())
}

await invokeHookWith({
  hookEventName: 'PostToolUse',
  conversationId: 'test-conv-123',
  toolCall: {
    id: 'tc_1',
    name: 'mcp_sketch_sketch_board',
    args: samplesZh.board[0],
  },
})
const hookPreJson = await invokeHookWith({
  hookEventName: 'PreInvocation',
  conversationId: 'test-conv-123',
})
assert.ok(hookPreJson.injectSteps?.[0]?.systemMessage?.metadata?.user_markdown?.includes('本週看板'))
console.log('   ✓ Hook handler PostToolUse -> PreInvocation inline card injection verified')

console.log('\nAll tests passed!')
