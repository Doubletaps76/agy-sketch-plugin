---
name: sketch
description: >-
  Draws 17 types of interactive visual cards (layers, diagram, schema, swimlane,
  pipeline, gitgraph, sequence, tree, timeline, board, quadrant, journey,
  wireframe, metrics, chart, cards, compare) directly in the conversation
  instead of long text paragraphs. Activate when explaining system architecture,
  flows, data models, roadmaps, UI wireframes, metrics, charts, or option comparisons.
---

# Sketch Visual Cards Skill

The `sketch` plugin equips you with **17 specialized drawing tools** via the `sketch` MCP server (`sketch_sketch`). Whenever an answer has a structural, temporal, spatial, or quantitative shape, call the matching tool to draw a visual card and keep surrounding text to one or two sentences.

## Tool Selection Matrix

| Tool | What It Draws | Best Used For |
| :--- | :--- | :--- |
| `layers` | Stacked horizontal bands of components, nested `zones` (up to 3 deep), and cross-cutting `sides` | Tech stacks, platform capability maps, cloud deployment topologies (Region / AZ / Subnet) |
| `diagram` | Nodes and routed directional wires (`layout: "flow" \| "zones" \| "matrix"`, shapes: `box`, `round`, `decision`, `store`, `external`, `person`) | System wiring, flowcharts with branches, C4 container boundaries (`zones`), dense dependency grids (`matrix`), state machines (self-loops) |
| `schema` | Entity boxes with typed fields (`pk` / `fk`) and labelled relation wires (`1:1`, `1:N`, `N:N`, `extends`, `uses`) | ER database diagrams, domain models, class & interface hierarchies |
| `swimlane` | Process steps placed across horizontal lanes of roles, teams, or systems | Cross-team workflows, approval handoffs, distributed business processes |
| `pipeline` | Left-to-right stages, each holding a column of jobs with optional status (`done`, `doing`, `todo`, `risk`) | CI/CD pipelines, ETL data flows, build & release stages |
| `gitgraph` | Branch lanes over time showing forks, commits, merges, and version tags | Git branching strategies, release flows, feature history |
| `sequence` | Actors across the top and ordered messages between them (`isReply: true` for dashed return arrows) | API request/response flows, auth protocols, microservice handoffs |
| `tree` | Hierarchical tree (`layout: "list"` indented outline or `layout: "mindmap"` spreading right) | OKR goal breakdowns, sitemaps, directory layouts, taxonomies |
| `timeline` | Horizontal bars spanning ordered periods plus milestones and group headings | Product roadmaps, Gantt schedules, migration plans |
| `board` | Columns of cards with title and metadata tag | Kanban boards, Now / Next / Later plans, thematic backlogs |
| `quadrant` | 2x2 matrix: either `items` plotted on `[0..1]` X/Y axes, or 4 `areas` with bullet lists | Impact vs. Effort prioritization, market positioning, SWOT analysis |
| `journey` | Left-to-right stages with a `1..5` mood curve and multi-row annotations (`good`, `bad`, `warn`, `plain`) | User journeys, onboarding flows, service blueprints |
| `wireframe` | Low-fidelity screen (`desktop` or `mobile`) from nested `row`/`column` containers and UI leaves (`heading`, `text`, `image`, `button`, `input`, `nav`, `list`, `label`) | Page layouts, dashboard mocks, mobile app screens |
| `metrics` | KPI number tiles with headline value, delta badge, and Braille sparkline from `series` | KPI snapshots, A/B experiment results, performance summaries |
| `chart` | 9 chart kinds: `bar`, `column`, `stacked`, `line`, `scatter`, `heatmap`, `histogram`, `funnel`, `share` | Any quantitative dataset you already have (never invent numbers) |
| `cards` | Side-by-side cards with title, subtitle, tags, bullet lines, and verbatim quote | User personas, research findings, design principles, risk cards |
| `compare` | 2 to 4 side-by-side option cards with summary, pros (`+`), cons (`−`), effort (`≈`), recommended badge (`★`), and interactive picker | Weighing architectural, product, or library decisions |

## Key Guidelines

1. **Do Not Repeat the Card in Text**: The user sees the rendered card directly in the conversation (both as an interactive MCP App in Antigravity IDE / Desktop and as an inline box-drawing card in the `agy` CLI). Only write 1–2 lines of high-level context or takeaway around the tool call.
2. **Keep Labels Short**: Node labels, edge labels, and step names should be 1–4 words so boxes stay compact and scannable.
3. **Interactive Diagrams (`diagram` & `schema`)**:
   - Group related nodes with `group` so they share a theme color.
   - Use meaningful node shapes: `person` for users/actors, `decision` for branches, `store` for databases/queues, `external` for third-party systems, `round` for start/end/states.
   - Users can **hover** any node to highlight all its outgoing wires and **click** any node name to focus its wires in heavy strokes with an animated pulse flow.
4. **Truthfulness**: Only plot numbers, entities, and quotes that actually exist in the context or user input. Never fabricate metrics to fill a chart.
