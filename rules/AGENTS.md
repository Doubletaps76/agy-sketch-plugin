# Visual Answers (Sketch Plugin)

The user reads in a terminal or chat view and finds long paragraphs hard to follow. Whenever the content has a shape, draw the shape with a `sketch` MCP tool and keep the text around it to a line or two. This holds for any field: engineering, product, design, research, and planning.

- **What a system is made of** (layers of components, nested zones, cross-cutting side concerns): use the `layers` tool (`sketch_sketch:layers`).
- **How things connect** (architecture wiring, a flow or process with decisions, dependencies): use the `diagram` tool (`sketch_sketch:diagram`), with `layout: "zones"` to frame subsystems or boundaries (such as VPCs or C4 containers) and `layout: "matrix"` when dependencies are too dense for wires; a state machine is a `diagram` too (self-edges render as loops inside nodes).
- **Tables and their relations, or classes and their members**: use the `schema` tool (`sketch_sketch:schema`).
- **A process across roles or systems**: use the `swimlane` tool (`sketch_sketch:swimlane`).
- **Stages left to right** (CI/CD, ETL, a data or build flow): use the `pipeline` tool (`sketch_sketch:pipeline`).
- **Branches, merges and releases over time**: use the `gitgraph` tool (`sketch_sketch:gitgraph`).
- **Who calls whom in order** (request flows, protocols, handoffs): use the `sequence` tool (`sketch_sketch:sequence`).
- **A hierarchy, breakdown or mind map** (OKRs, sitemaps, file layouts, taxonomies): use the `tree` tool (`sketch_sketch:tree`), with `layout: "list"` or `layout: "mindmap"`.
- **A plan over time, a roadmap or schedule**: use the `timeline` tool (`sketch_sketch:timeline`).
- **Work by status or theme** (kanban, now/next/later): use the `board` tool (`sketch_sketch:board`).
- **Prioritising on two axes, positioning, or SWOT**: use the `quadrant` tool (`sketch_sketch:quadrant`).
- **A user journey or service blueprint** (stages with mood curve and rows of notes): use the `journey` tool (`sketch_sketch:journey`).
- **A screen or page layout** (desktop or mobile low-fidelity sketch): use the `wireframe` tool (`sketch_sketch:wireframe`).
- **Numbers**: use the `chart` tool (`sketch_sketch:chart` — `bar`, `column`, `stacked`, `line`, `scatter`, `heatmap`, `histogram`, `funnel`, `share`); for a handful of headline KPIs with trends, use the `metrics` tool (`sketch_sketch:metrics`).
- **Personas, findings, principles, feature summaries**: use the `cards` tool (`sketch_sketch:cards`).
- **A choice between two to four options**: use the `compare` tool (`sketch_sketch:compare`), which draws side-by-side option cards with pros, cons, effort, and recommendation.
- **A plain list of facts or a small comparison with no better shape**: use a Markdown table.

## Displaying the Drawn Card in the Conversation

In the `agy` CLI terminal, MCP tool call results are collapsed by default. Therefore, after calling any `sketch` tool:
1. **Always include the drawn box-drawing card returned by the tool verbatim inside a fenced ```` ```text ```` code block in your reply** so the user immediately sees the visual card in the terminal.
2. Keep the prose around the card to 1–2 concise sentences. Do not write long paragraphs repeating what is already inside the card.
3. Keep every label short: a card is for scanning, and detail belongs in a follow-up when asked. Draw only what is true: never invent numbers, nodes, or quotes to fill a card.
