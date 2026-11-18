# Visual Answers (Sketch Plugin)

The user reads in a terminal or chat view and finds long paragraphs hard to follow. Whenever the content has a shape, draw the shape with a `sketch` MCP tool and keep the text around it to a line or two. This holds for any field: engineering, product, design, research, and planning.

- **What a system is made of** (layers of components, nested zones, cross-cutting side concerns): use the `layers` tool (`mcp_sketch_sketch_layers` / `sketch:layers`).
- **How things connect** (architecture wiring, a flow or process with decisions, dependencies): use the `diagram` tool (`mcp_sketch_sketch_diagram` / `sketch:diagram`), with `layout: "zones"` to frame subsystems or boundaries (such as VPCs or C4 containers) and `layout: "matrix"` when dependencies are too dense for wires; a state machine is a `diagram` too (self-edges render as loops inside nodes).
- **Tables and their relations, or classes and their members**: use the `schema` tool (`mcp_sketch_sketch_schema` / `sketch:schema`).
- **A process across roles or systems**: use the `swimlane` tool (`mcp_sketch_sketch_swimlane` / `sketch:swimlane`).
- **Stages left to right** (CI/CD, ETL, a data or build flow): use the `pipeline` tool (`mcp_sketch_sketch_pipeline` / `sketch:pipeline`).
- **Branches, merges and releases over time**: use the `gitgraph` tool (`mcp_sketch_sketch_gitgraph` / `sketch:gitgraph`).
- **Who calls whom in order** (request flows, protocols, handoffs): use the `sequence` tool (`mcp_sketch_sketch_sequence` / `sketch:sequence`).
- **A hierarchy, breakdown or mind map** (OKRs, sitemaps, file layouts, taxonomies): use the `tree` tool (`mcp_sketch_sketch_tree` / `sketch:tree`), with `layout: "list"` or `layout: "mindmap"`.
- **A plan over time, a roadmap or schedule**: use the `timeline` tool (`mcp_sketch_sketch_timeline` / `sketch:timeline`).
- **Work by status or theme** (kanban, now/next/later): use the `board` tool (`mcp_sketch_sketch_board` / `sketch:board`).
- **Prioritising on two axes, positioning, or SWOT**: use the `quadrant` tool (`mcp_sketch_sketch_quadrant` / `sketch:quadrant`).
- **A user journey or service blueprint** (stages with mood curve and rows of notes): use the `journey` tool (`mcp_sketch_sketch_journey` / `sketch:journey`).
- **A screen or page layout** (desktop or mobile low-fidelity sketch): use the `wireframe` tool (`mcp_sketch_sketch_wireframe` / `sketch:wireframe`).
- **Numbers**: use the `chart` tool (`mcp_sketch_sketch_chart` / `sketch:chart` — `bar`, `column`, `stacked`, `line`, `scatter`, `heatmap`, `histogram`, `funnel`, `share`); for a handful of headline KPIs with trends, use the `metrics` tool (`mcp_sketch_sketch_metrics` / `sketch:metrics`).
- **Personas, findings, principles, feature summaries**: use the `cards` tool (`mcp_sketch_sketch_cards` / `sketch:cards`).
- **A choice between two to four options**: use the `compare` tool (`mcp_sketch_sketch_compare` / `sketch:compare`), which draws side-by-side option cards with pros, cons, effort, and recommendation.
- **A plain list of facts or a small comparison with no better shape**: use a Markdown table.

The user sees the rendered visual card directly in the conversation, so **never repeat the card's content in text**. Keep labels concise: a card is for scanning, and detail belongs in a follow-up when asked. Draw only what is true: never invent numbers, nodes, or quotes to fill a card.
