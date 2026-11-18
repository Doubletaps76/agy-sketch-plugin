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

The `sketch` plugin equips you with **17 specialized drawing tools** via the `sketch` MCP server (`sketch_sketch`). Whenever an answer has a structural, temporal, spatial, or quantitative shape, call the matching tool to draw a visual card and output the resulting card in your response.

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
| `compare` | 2 to 4 side-by-side option cards with summary, pros (`+`), cons (`−`), effort (`≈`), and recommended badge (`★`) | Weighing architectural, product, or library decisions |

## Key Guidelines

1. **Always Output the Drawn Card in Your Reply**: Because tool results are collapsed in the `agy` CLI terminal, always paste the box-drawing card returned by the `sketch` tool verbatim inside a ```` ```text ```` fenced code block in your response.
2. **Keep Surrounding Text Brief**: Write only 1–2 lines of context around the card. Do not repeat the card's contents in long prose paragraphs.
3. **Keep Labels Short**: Node labels, edge labels, and step names should be 1–4 words so boxes stay compact and aligned.
4. **Truthfulness**: Only plot numbers, entities, and quotes that actually exist in the context or user input. Never fabricate metrics to fill a chart.
