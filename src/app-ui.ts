import fs from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

let cachedAppHtml: string | undefined

export const buildEngineBrowserJs = (): string => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const engineTsPath = path.join(__dirname, 'engine.ts')
  const rawTs = fs.readFileSync(engineTsPath, 'utf8')
  const stripped = stripTypeScriptTypes(rawTs)
  // Remove any top-level import statements (only `import type` was present, which stripTypeScriptTypes blanks out)
  return stripped.replace(/^\s*import\s+.*$/gm, '')
}

export const getAppHtml = (): string => {
  if (cachedAppHtml) return cachedAppHtml
  const engineJs = buildEngineBrowserJs()

  cachedAppHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sketch Card</title>
<style>
  :root {
    --sk-bg: #17191d;
    --sk-fg: #d2d4d9;
    --sk-border: rgba(255, 255, 255, 0.09);
    --sk-bar-bg: rgba(255, 255, 255, 0.05);
    --sk-accent: #d77757;
    --sk-success: #4eba65;
    --sk-muted: #999999;
  }
  html.light {
    --sk-bg: #fafafc;
    --sk-fg: #262930;
    --sk-border: rgba(0, 0, 0, 0.10);
    --sk-bar-bg: rgba(0, 0, 0, 0.04);
    --sk-accent: #c25433;
    --sk-success: #16a34a;
    --sk-muted: #6b7280;
  }
  * {
    box-sizing: border-box;
  }
  html, body {
    margin: 0;
    padding: 0;
    background: transparent;
    color: var(--sk-fg);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    overflow-x: hidden;
    overflow-y: hidden;
  }
  #root {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 2px 0;
    width: 100%;
  }
  .card-wrap {
    position: relative;
    display: inline-block;
    max-width: 100%;
    background: var(--sk-bg);
    border: 1px solid var(--sk-border);
    border-radius: 12px;
    overflow-x: auto;
    overflow-y: hidden;
  }
  canvas {
    display: block;
    user-select: none;
    -webkit-user-select: none;
  }
  .toolbar {
    position: absolute;
    top: 8px;
    right: 10px;
    display: flex;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
  }
  .card-wrap:hover .toolbar {
    opacity: 1;
    pointer-events: auto;
  }
  .tool-btn {
    background: var(--sk-bar-bg);
    color: var(--sk-fg);
    border: 1px solid var(--sk-border);
    border-radius: 6px;
    padding: 3px 8px;
    font-size: 11px;
    cursor: pointer;
    backdrop-filter: blur(6px);
    transition: background 0.12s, border-color 0.12s;
  }
  .tool-btn:hover {
    border-color: var(--sk-accent);
  }
  .detail-bar {
    min-height: 22px;
    padding: 2px 14px 8px 14px;
    font-size: 12px;
    font-family: "SF Mono", "Menlo", "Monaco", "Cascadia Mono", "PingFang TC", "Hiragino Sans GB", monospace;
    color: var(--sk-muted);
    display: none;
    align-items: center;
    gap: 6px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .detail-bar.visible {
    display: flex;
  }
  .detail-bar.active {
    color: var(--sk-fg);
  }
  .compare-dialog {
    display: none;
    flex-direction: column;
    gap: 8px;
    background: var(--sk-bg);
    border: 1px solid var(--sk-border);
    border-radius: 10px;
    padding: 10px 14px;
  }
  .compare-dialog.visible {
    display: flex;
  }
  .compare-header {
    font-size: 12px;
    font-weight: 600;
    color: var(--sk-muted);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .compare-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .compare-opt {
    background: var(--sk-bar-bg);
    color: var(--sk-fg);
    border: 1px solid var(--sk-border);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.12s ease;
  }
  .compare-opt:hover, .compare-opt.selected {
    border-color: var(--sk-accent);
    background: rgba(215, 119, 87, 0.14);
  }
  .compare-opt.rec {
    border-color: rgba(78, 186, 101, 0.45);
  }
  .compare-opt.rec:hover, .compare-opt.rec.selected {
    border-color: var(--sk-success);
    background: rgba(78, 186, 101, 0.15);
  }
  .compare-picked {
    font-size: 12px;
    color: var(--sk-success);
    font-weight: 500;
  }
</style>
</head>
<body>
<div id="root">
  <div class="card-wrap" id="cardWrap">
    <div class="toolbar">
      <button class="tool-btn" id="btnResetFocus" style="display:none">Reset Focus</button>
      <button class="tool-btn" id="btnCopy">Copy Text</button>
      <button class="tool-btn" id="btnPng">Save PNG</button>
    </div>
    <canvas id="canvas"></canvas>
    <div class="detail-bar" id="detailBar">⋯ Hover a truncated item to read in full, or click a node to focus its wires</div>
  </div>
  <div class="compare-dialog" id="compareDialog">
    <div class="compare-header">
      <span id="comparePrompt">Choose an option:</span>
      <span id="compareStatus" class="compare-picked"></span>
    </div>
    <div class="compare-options" id="compareOptions"></div>
  </div>
</div>

<script type="module">
${engineJs}

// ---------------------------------------------------------------- Theme & Canvas Painter (mirrors preview/paint.py)

const DARK_THEME = {
  BG: [23, 25, 29],
  FG: [210, 212, 217],
  COLORS: {
    text: [255, 255, 255],
    inverseText: [0, 0, 0],
    inactive: [153, 153, 153],
    subtle: [80, 80, 80],
    suggestion: [177, 185, 249],
    success: [78, 186, 101],
    error: [255, 107, 128],
    warning: [255, 193, 7],
    claude: [215, 119, 87],
    permission: [177, 185, 249],
    planMode: [72, 150, 140],
    ide: [71, 130, 200],
    bashBorder: [253, 93, 177],
    autoAccept: [175, 135, 255],
  }
};

const LIGHT_THEME = {
  BG: [250, 250, 252],
  FG: [38, 41, 48],
  COLORS: {
    text: [17, 24, 39],
    inverseText: [255, 255, 255],
    inactive: [115, 122, 135],
    subtle: [175, 180, 190],
    suggestion: [79, 70, 229],
    success: [22, 163, 74],
    error: [220, 38, 38],
    warning: [217, 119, 6],
    claude: [194, 84, 51],
    permission: [79, 70, 229],
    planMode: [13, 148, 136],
    ide: [37, 99, 235],
    bashBorder: [219, 39, 119],
    autoAccept: [124, 58, 237],
  }
};

let isLight = false;
const getTheme = () => (isLight ? LIGHT_THEME : DARK_THEME);
const rgb = (c) => \`rgb(\${c[0]}, \${c[1]}, \${c[2]})\`;
const blend = (color, toward, amount) => [
  Math.round(color[0] + (toward[0] - color[0]) * amount),
  Math.round(color[1] + (toward[1] - color[1]) * amount),
  Math.round(color[2] + (toward[2] - color[2]) * amount),
];

const CW = 9;
const CH = 19;
const PAD_X = 16;
const PAD_Y = 14;
const FONT_SIZE = 13.5;
const FONT_FAMILY = '"SF Mono", "Menlo", "Monaco", "Cascadia Mono", "Consolas", "PingFang TC", "Hiragino Sans GB", "Microsoft JhengHei", monospace';

const LIGHT_STROKES = { '─': 'LR', '│': 'UD', '┌': 'DR', '┐': 'DL', '└': 'UR', '┘': 'UL', '├': 'UDR', '┤': 'UDL', '┬': 'DLR', '┴': 'ULR', '┼': 'UDLR' };
const HEAVY_STROKES = { '━': 'LR', '┃': 'UD', '┏': 'DR', '┓': 'DL', '┗': 'UR', '┛': 'UL', '┣': 'UDR', '┫': 'UDL', '┳': 'DLR', '┻': 'ULR', '╋': 'UDLR' };
const ROUND_CORNERS = {
  '╭': [1, 1, Math.PI, 1.5 * Math.PI],
  '╮': [-1, 1, 1.5 * Math.PI, 2 * Math.PI],
  '╰': [1, -1, 0.5 * Math.PI, Math.PI],
  '╯': [-1, -1, 0, 0.5 * Math.PI],
};
const LEFT_PART = { '▉': 7, '▊': 6, '▋': 5, '▌': 4, '▍': 3, '▎': 2, '▏': 1 };
const LOW_PART = { '▁': 1, '▂': 2, '▃': 3, '▄': 4, '▅': 5, '▆': 6, '▇': 7 };
const SHADE = { '░': 0.72, '▒': 0.5, '▓': 0.25 };

function drawStrokes(ctx, sides, x, y, colorStr, t) {
  const cx = x + CW / 2;
  const cy = y + CH / 2;
  const h = t / 2;
  ctx.fillStyle = colorStr;
  if (sides.includes('L')) ctx.fillRect(x, cy - h, cx - x + h, t);
  if (sides.includes('R')) ctx.fillRect(cx - h, cy - h, x + CW - (cx - h), t);
  if (sides.includes('U')) ctx.fillRect(cx - h, y, t, cy - y + h);
  if (sides.includes('D')) ctx.fillRect(cx - h, cy - h, t, y + CH - (cy - h));
}

function drawShape(ctx, ch, x, y, colorArr, bgArr) {
  const colorStr = rgb(colorArr);
  const cx = x + CW / 2;
  const cy = y + CH / 2;
  const code = ch.codePointAt(0) || 0;

  // Braille characters (U+2800 .. U+28FF)
  if (code >= 0x2800 && code <= 0x28ff) {
    const bits = code - 0x2800;
    if (bits === 0) return true;
    ctx.fillStyle = colorStr;
    const dx = [x + CW * 0.28, x + CW * 0.72];
    const dy = [y + CH * 0.18, y + CH * 0.39, y + CH * 0.61, y + CH * 0.82];
    const dotMap = [
      [0, 0, 0x01], [0, 1, 0x02], [0, 2, 0x04],
      [1, 0, 0x08], [1, 1, 0x10], [1, 2, 0x20],
      [0, 3, 0x40], [1, 3, 0x80],
    ];
    for (const [colIdx, rowIdx, mask] of dotMap) {
      if (bits & mask) {
        ctx.beginPath();
        ctx.arc(dx[colIdx], dy[rowIdx], 1.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return true;
  }

  if (ch in LIGHT_STROKES) {
    drawStrokes(ctx, LIGHT_STROKES[ch], x, y, colorStr, 1.35);
    return true;
  }
  if (ch in HEAVY_STROKES) {
    drawStrokes(ctx, HEAVY_STROKES[ch], x, y, colorStr, 2.7);
    return true;
  }
  if (ch in ROUND_CORNERS) {
    const [sx, sy, start, end] = ROUND_CORNERS[ch];
    const r = CW / 2;
    const ox = cx + sx * r;
    const oy = cy + sy * r;
    ctx.strokeStyle = colorStr;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.arc(ox, oy, r, start, end);
    ctx.stroke();
    ctx.fillStyle = colorStr;
    const y0 = Math.min(cy + sy * r, sy > 0 ? y + CH : y);
    const y1 = Math.max(cy + sy * r, sy > 0 ? y + CH : y);
    ctx.fillRect(cx - 0.675, y0, 1.35, y1 - y0);
    return true;
  }
  if ('═║╔╗╚╝╤╧'.includes(ch)) {
    const o = 1.8;
    ctx.fillStyle = colorStr;
    if ('═╤╧'.includes(ch)) {
      ctx.fillRect(x, cy - o - 0.6, CW, 1.2);
      ctx.fillRect(x, cy + o - 0.6, CW, 1.2);
      if (ch === '╤') ctx.fillRect(cx - 0.6, cy + o, 1.2, y + CH - (cy + o));
      if (ch === '╧') ctx.fillRect(cx - 0.6, y, 1.2, cy - o - y);
    } else if (ch === '║') {
      ctx.fillRect(cx - o - 0.6, y, 1.2, CH);
      ctx.fillRect(cx + o - 0.6, y, 1.2, CH);
    } else {
      const sx = '╔╚'.includes(ch) ? 1 : -1;
      const sy = '╔╗'.includes(ch) ? 1 : -1;
      for (const k of [-o, o]) {
        const vx = cx + k * -sx;
        const hy = cy + k * -sy;
        const vy0 = Math.min(hy - 0.6, sy > 0 ? y + CH : y);
        const vy1 = Math.max(hy + 0.6, sy > 0 ? y + CH : y);
        ctx.fillRect(vx - 0.6, vy0, 1.2, vy1 - vy0);
        const hx0 = Math.min(vx - 0.6, sx > 0 ? x + CW : x);
        const hx1 = Math.max(vx + 0.6, sx > 0 ? x + CW : x);
        ctx.fillRect(hx0, hy - 0.6, hx1 - hx0, 1.2);
      }
    }
    return true;
  }
  if (ch === '┄' || ch === '╌') {
    ctx.fillStyle = colorStr;
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(x + 0.5 + i * 3, cy - 0.65, 1.8, 1.3);
    }
    return true;
  }
  if (ch === '┆') {
    ctx.fillStyle = colorStr;
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(cx - 0.65, y + 1.5 + i * 6, 1.3, 3.6);
    }
    return true;
  }
  if (ch === '╱' || ch === '╲') {
    ctx.strokeStyle = colorStr;
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    if (ch === '╱') {
      ctx.moveTo(x, y + CH);
      ctx.lineTo(x + CW, y);
    } else {
      ctx.moveTo(x, y);
      ctx.lineTo(x + CW, y + CH);
    }
    ctx.stroke();
    return true;
  }
  if (ch === '█') {
    ctx.fillStyle = colorStr;
    ctx.fillRect(x, y, CW + 0.4, CH + 0.4);
    return true;
  }
  if (ch in LEFT_PART) {
    ctx.fillStyle = colorStr;
    ctx.fillRect(x, y, (CW * LEFT_PART[ch]) / 8, CH);
    return true;
  }
  if (ch in LOW_PART) {
    ctx.fillStyle = colorStr;
    const h = (CH * LOW_PART[ch]) / 8;
    ctx.fillRect(x, y + CH - h, CW + 0.3, h);
    return true;
  }
  if (ch in SHADE) {
    ctx.fillStyle = rgb(blend(colorArr, bgArr, SHADE[ch]));
    ctx.fillRect(x, y, CW + 0.3, CH);
    return true;
  }
  if ('▼▲▶◀'.includes(ch)) {
    const a = 3.6;
    ctx.fillStyle = colorStr;
    ctx.beginPath();
    if (ch === '▼') {
      ctx.moveTo(cx - a, cy - 2.5);
      ctx.lineTo(cx + a, cy - 2.5);
      ctx.lineTo(cx, cy + 3.6);
    } else if (ch === '▲') {
      ctx.moveTo(cx - a, cy + 2.5);
      ctx.lineTo(cx + a, cy + 2.5);
      ctx.lineTo(cx, cy - 3.6);
    } else if (ch === '▶') {
      ctx.moveTo(x + 1.2, cy - a);
      ctx.lineTo(x + 1.2, cy + a);
      ctx.lineTo(x + CW - 1.2, cy);
    } else {
      ctx.moveTo(x + CW - 1.2, cy - a);
      ctx.lineTo(x + CW - 1.2, cy + a);
      ctx.lineTo(x + 1.2, cy);
    }
    ctx.closePath();
    ctx.fill();
    return true;
  }
  if (ch === '●') {
    ctx.fillStyle = colorStr;
    ctx.beginPath();
    ctx.arc(cx, cy, 3.3, 0, Math.PI * 2);
    ctx.fill();
    return true;
  }
  if (ch === '○') {
    ctx.strokeStyle = colorStr;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, 3.1, 0, Math.PI * 2);
    ctx.stroke();
    return true;
  }
  if (ch === '◆') {
    ctx.fillStyle = colorStr;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 4.5);
    ctx.lineTo(cx + 4, cy);
    ctx.lineTo(cx, cy + 4.5);
    ctx.lineTo(cx - 4, cy);
    ctx.closePath();
    ctx.fill();
    return true;
  }
  if (ch === '■') {
    ctx.fillStyle = colorStr;
    ctx.fillRect(cx - 3.2, cy - 3.2, 6.4, 6.4);
    return true;
  }
  if (ch === '•') {
    ctx.fillStyle = colorStr;
    ctx.beginPath();
    ctx.arc(cx, cy, 1.8, 0, Math.PI * 2);
    ctx.fill();
    return true;
  }
  if (ch === '·') {
    ctx.fillStyle = colorStr;
    ctx.beginPath();
    ctx.arc(cx, cy, 1.1, 0, Math.PI * 2);
    ctx.fill();
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- Interactive Card State

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const detailBar = document.getElementById('detailBar');
const btnResetFocus = document.getElementById('btnResetFocus');
const btnCopy = document.getElementById('btnCopy');
const btnPng = document.getElementById('btnPng');
const compareDialog = document.getElementById('compareDialog');
const comparePrompt = document.getElementById('comparePrompt');
const compareOptions = document.getElementById('compareOptions');
const compareStatus = document.getElementById('compareStatus');

let currentTool = '';
let currentInput = null;
let currentCard = null;
let hoveredScope = '';
let uiFocusedNode = undefined;
let uiFlowPhase = undefined;
let flowTimer = null;
let entranceTimer = null;
let lastClickAt = 0;
let cellGridMap = []; // [row][col] -> { scope, press }

function stopFlowTimer() {
  if (flowTimer) {
    clearInterval(flowTimer);
    flowTimer = null;
  }
}

function startFlowTimer() {
  stopFlowTimer();
  uiFlowPhase = 0;
  lastClickAt = Date.now();
  flowTimer = setInterval(() => {
    if (uiFocusedNode === undefined || Date.now() - lastClickAt > 30000) {
      uiFlowPhase = undefined;
      stopFlowTimer();
      rerenderEngine(1);
      return;
    }
    uiFlowPhase = ((uiFlowPhase || 0) + 1) % 600;
    rerenderEngine(1);
  }, 140);
}

function rerenderEngine(played = 1) {
  if (!currentTool || !currentInput) return;
  const res = renderCard(currentTool, currentInput, {
    columns: 110,
    cardId: 'app',
    focusedNode: uiFocusedNode,
    flowPhase: uiFlowPhase,
    played,
  });
  if (res.ok) {
    currentCard = res;
    paintCard(res, hoveredScope);
    updateDetailBar();
    btnResetFocus.style.display = uiFocusedNode !== undefined ? 'inline-block' : 'none';
  }
}

function updateDetailBar() {
  if (!currentCard) return;
  const hasDetails = Object.keys(currentCard.details || {}).length > 0;
  const isInteractiveDiagram = currentCard.tool === 'diagram' || currentCard.tool === 'schema';
  if (!hasDetails && !isInteractiveDiagram) {
    detailBar.classList.remove('visible', 'active');
    return;
  }
  detailBar.classList.add('visible');
  const fullText = hoveredScope && currentCard.details ? currentCard.details[hoveredScope] : undefined;
  if (fullText) {
    detailBar.textContent = \`⋯ \${fullText}\`;
    detailBar.classList.add('active');
  } else if (uiFocusedNode !== undefined) {
    const nodeName = currentCard.model?.nodes?.[uiFocusedNode]?.label || \`Node #\${uiFocusedNode + 1}\`;
    detailBar.textContent = \`▶ Focused on "\${nodeName}" — click again to clear, or click another node\`;
    detailBar.classList.add('active');
  } else if (isInteractiveDiagram) {
    detailBar.textContent = '⋯ Hover a node to trace its wires • Click a node name to focus & pulse';
    detailBar.classList.remove('active');
  } else {
    detailBar.textContent = '⋯ Hover a truncated item to read in full';
    detailBar.classList.remove('active');
  }
}

function paintCard(card, litScope = '') {
  const lines = card.lines || [];
  let maxCols = 1;
  cellGridMap = [];

  for (let r = 0; r < lines.length; r++) {
    const line = lines[r];
    let col = 0;
    const rowMap = [];
    for (const cell of line) {
      const w = cell[1] || 1;
      const sc = cell[4] || '';
      const press = cell.length > 5 ? cell[5] : undefined;
      for (let k = 0; k < w; k++) {
        rowMap[col + k] = { scope: sc, press };
      }
      col += w;
    }
    cellGridMap[r] = rowMap;
    if (col > maxCols) maxCols = col;
  }

  const cssWidth = maxCols * CW + PAD_X * 2;
  const cssHeight = lines.length * CH + PAD_Y * 2;
  const dpr = Math.min(window.devicePixelRatio || 2, 3);

  if (canvas.width !== Math.round(cssWidth * dpr) || canvas.height !== Math.round(cssHeight * dpr)) {
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.width = \`\${cssWidth}px\`;
    canvas.style.height = \`\${cssHeight}px\`;
    notifySizeChanged();
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  const theme = getTheme();
  ctx.fillStyle = rgb(theme.BG);
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  ctx.textBaseline = 'alphabetic';

  for (let row = 0; row < lines.length; row++) {
    const line = lines[row];
    let col = 0;
    const y = PAD_Y + row * CH;
    for (const cell of line) {
      const ch = cell[0];
      const wide = cell[1] || 1;
      let fg = cell[2] || '';
      let flags = cell[3] || 0;
      const sc = cell[4] || '';

      const x = PAD_X + col * CW;
      col += wide;

      if (litScope && sc && sc === litScope) {
        fg = 'text';
        flags = (flags | 1) & ~2;
      }

      let colorArr = (fg && theme.COLORS[fg]) ? theme.COLORS[fg] : theme.FG;
      if (flags & 2) {
        colorArr = blend(colorArr, theme.BG, 0.45);
      }
      if (flags & 4) {
        ctx.fillStyle = rgb(colorArr);
        ctx.fillRect(x, y + 1.5, wide * CW, CH - 3);
        colorArr = theme.BG;
      }

      if (ch === ' ') continue;

      if (!drawShape(ctx, ch, x, y, colorArr, theme.BG)) {
        const isBold = Boolean(flags & 1);
        ctx.font = \`\${isBold ? '600' : '400'} \${FONT_SIZE}px \${FONT_FAMILY}\`;
        ctx.fillStyle = rgb(colorArr);
        const metrics = ctx.measureText(ch);
        const advance = metrics.width;
        const drawX = x + Math.max(0, (wide * CW - advance) / 2);
        const drawY = y + Math.round(CH * 0.74);
        ctx.fillText(ch, drawX, drawY);
      }

      if (flags & 8) {
        ctx.fillStyle = rgb(colorArr);
        ctx.fillRect(x, y + CH - 2.5, wide * CW, 1.2);
      }
    }
  }

  ctx.restore();
}

// ---------------------------------------------------------------- Pointer & Keyboard Events

canvas.addEventListener('mousemove', (e) => {
  if (!currentCard) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - PAD_X;
  const y = e.clientY - rect.top - PAD_Y;
  const col = Math.floor(x / CW);
  const row = Math.floor(y / CH);
  const info = cellGridMap[row]?.[col];
  const nextScope = info?.scope || '';
  const hasPress = info?.press !== undefined;

  canvas.style.cursor = hasPress ? 'pointer' : 'default';

  if (nextScope !== hoveredScope) {
    hoveredScope = nextScope;
    paintCard(currentCard, hoveredScope);
    updateDetailBar();
  }
});

canvas.addEventListener('mouseleave', () => {
  if (hoveredScope !== '') {
    hoveredScope = '';
    if (currentCard) {
      paintCard(currentCard, '');
      updateDetailBar();
    }
  }
});

canvas.addEventListener('click', (e) => {
  if (!currentCard) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left - PAD_X;
  const y = e.clientY - rect.top - PAD_Y;
  const col = Math.floor(x / CW);
  const row = Math.floor(y / CH);
  const info = cellGridMap[row]?.[col];
  if (info?.press !== undefined) {
    if (uiFocusedNode === info.press) {
      uiFocusedNode = undefined;
      uiFlowPhase = undefined;
      stopFlowTimer();
      rerenderEngine(1);
    } else {
      uiFocusedNode = info.press;
      startFlowTimer();
      rerenderEngine(1);
    }
  }
});

btnResetFocus.addEventListener('click', () => {
  uiFocusedNode = undefined;
  uiFlowPhase = undefined;
  stopFlowTimer();
  rerenderEngine(1);
});

btnCopy.addEventListener('click', async () => {
  if (!currentCard?.ascii) return;
  try {
    await navigator.clipboard.writeText(currentCard.ascii);
    btnCopy.textContent = 'Copied!';
    setTimeout(() => { btnCopy.textContent = 'Copy Text'; }, 1400);
  } catch {
    btnCopy.textContent = 'Copy Failed';
    setTimeout(() => { btnCopy.textContent = 'Copy Text'; }, 1400);
  }
});

btnPng.addEventListener('click', () => {
  if (!currentCard) return;
  const link = document.createElement('a');
  const slug = (currentCard.title || currentCard.tool || 'sketch').toLowerCase().replace(/[^a-z0-9\\u4e00-\\u9fa5]+/g, '-');
  link.download = \`\${slug}.png\`;
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// ---------------------------------------------------------------- Compare Options UI

function setupCompareDialog(card) {
  if (card.tool !== 'compare' || card.model?.isAsking === false) {
    compareDialog.classList.remove('visible');
    return;
  }
  const options = card.model?.options || [];
  if (options.length === 0) {
    compareDialog.classList.remove('visible');
    return;
  }
  compareDialog.classList.add('visible');
  comparePrompt.textContent = card.title || 'Choose an option:';
  compareStatus.textContent = '';
  compareOptions.innerHTML = '';

  const ordered = [
    ...options.filter(o => o.isRecommended),
    ...options.filter(o => !o.isRecommended),
  ];

  ordered.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'compare-opt' + (opt.isRecommended ? ' rec' : '');
    btn.textContent = opt.isRecommended ? \`★ \${opt.name}\` : opt.name;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.compare-opt').forEach(el => el.classList.remove('selected'));
      btn.classList.add('selected');
      compareStatus.textContent = \`Selected: \${opt.name}\`;
      sendMcpMessage(\`I choose "\${opt.name}" for "\${card.title}".\`);
    });
    compareOptions.appendChild(btn);
  });
  notifySizeChanged();
}

// ---------------------------------------------------------------- Load Card & Entrance Animation

function loadCardPayload(payload) {
  if (!payload) return;
  const tool = payload.tool || currentTool;
  const input = payload.input || payload;
  currentTool = tool;
  currentInput = input;
  uiFocusedNode = undefined;
  uiFlowPhase = undefined;
  stopFlowTimer();
  if (entranceTimer) {
    clearInterval(entranceTimer);
    entranceTimer = null;
  }

  const initial = renderCard(tool, input, { columns: 110, cardId: 'app', played: 1 });
  if (!initial.ok) return;

  setupCompareDialog(initial);

  if (initial.isAnimated) {
    const STEPS = 12;
    let frame = 1;
    rerenderEngine(0.06);
    entranceTimer = setInterval(() => {
      if (frame > STEPS) {
        clearInterval(entranceTimer);
        entranceTimer = null;
        rerenderEngine(1);
        return;
      }
      const at = frame / (STEPS + 1);
      const played = 1 - (1 - at) * (1 - at);
      rerenderEngine(played);
      frame++;
    }, 80);
  } else {
    currentCard = initial;
    paintCard(initial, hoveredScope);
    updateDetailBar();
  }
}

// ---------------------------------------------------------------- MCP Apps JSON-RPC Bridge (SEP-1865)

let rpcId = 1;
const pendingRpc = new Map();

function postRpc(msg) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(msg, '*');
  }
}

function requestRpc(method, params) {
  const id = rpcId++;
  postRpc({ jsonrpc: '2.0', id, method, params });
  return new Promise((resolve, reject) => {
    pendingRpc.set(id, { resolve, reject });
  });
}

function notifyRpc(method, params) {
  postRpc({ jsonrpc: '2.0', method, params });
}

function sendMcpMessage(text) {
  requestRpc('ui/message', {
    role: 'user',
    content: [{ type: 'text', text }],
  }).catch(() => {});
}

let lastReportedHeight = 0;
function notifySizeChanged() {
  requestAnimationFrame(() => {
    const root = document.getElementById('root');
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const h = Math.ceil(rect.height) + 4;
    const w = Math.ceil(rect.width);
    if (Math.abs(h - lastReportedHeight) > 1) {
      lastReportedHeight = h;
      notifyRpc('ui/notifications/size-changed', { width: w, height: h });
    }
  });
}

function applyHostContext(ctx) {
  if (!ctx) return;
  if (ctx.theme === 'light') {
    isLight = true;
    document.documentElement.classList.add('light');
  } else if (ctx.theme === 'dark') {
    isLight = false;
    document.documentElement.classList.remove('light');
  }
  if (currentCard) {
    paintCard(currentCard, hoveredScope);
  }
}

window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object' || data.jsonrpc !== '2.0') return;

  // Handle response to our request
  if (data.id !== undefined && (data.result !== undefined || data.error !== undefined)) {
    const pending = pendingRpc.get(data.id);
    if (pending) {
      pendingRpc.delete(data.id);
      if (data.error) pending.reject(data.error);
      else pending.resolve(data.result);
    }
    return;
  }

  // Handle incoming requests from Host
  if (data.id !== undefined && data.method) {
    if (data.method === 'ping') {
      postRpc({ jsonrpc: '2.0', id: data.id, result: {} });
    }
    return;
  }

  // Handle notifications from Host
  if (data.method === 'ui/notifications/host-context-changed') {
    applyHostContext(data.params);
  } else if (data.method === 'ui/notifications/tool-input' || data.method === 'ui/notifications/tool-input-partial') {
    const args = data.params?.arguments;
    if (args && args.tool && args.input) {
      loadCardPayload(args);
    }
  } else if (data.method === 'ui/notifications/tool-result') {
    const sc = data.params?.structuredContent;
    if (sc) {
      loadCardPayload(sc);
    }
  }
});

// Connect to MCP App Host on startup
(async () => {
  try {
    const res = await requestRpc('ui/initialize', {
      protocolVersion: '2025-06-18',
      appInfo: { name: 'sketch', version: '0.2.2' },
      appCapabilities: {},
    });
    if (res?.hostContext) {
      applyHostContext(res.hostContext);
    }
    notifyRpc('ui/notifications/initialized', {});
  } catch {
    // Running standalone outside MCP host
  }
})();

const ro = new ResizeObserver(() => notifySizeChanged());
ro.observe(document.getElementById('root'));
</script>
</body>
</html>`

  return cachedAppHtml
}
