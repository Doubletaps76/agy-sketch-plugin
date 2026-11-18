# Visual Answers (Sketch Plugin)

Use the `sketch` MCP tools (`sketch_sketch`) **judiciously**—only when a visual diagram, flow, roadmap, or chart genuinely makes a complex explanation clearer, or when the user explicitly asks for a diagram/visualization.

## When NOT to Use Sketch Tools

- **Simple Q&A and direct answers**: Never draw a card for yes/no questions, quick factual answers, config checks, or explanations that only take a few sentences. Answer those directly in plain text.
- **Routine coding, debugging, and CLI tasks**: Do not draw cards for routine file edits, bug fixes, command outputs, or git operations unless the user asks to visualize them.
- **Small lists**: Use plain bullet points or a small Markdown table.

## When to Use Sketch Tools

Reach for a `sketch` tool when the user **asks for a diagram/chart/comparison**, or when explaining **genuinely complex structures or multi-step flows** where prose paragraphs would be hard to follow:

- **What a complex system is made of** (layers of components, nested zones, cross-cutting side concerns): `layers` (`sketch_sketch:layers`).
- **How components connect or flow** (architecture wiring, multi-branch flowcharts, state machines, C4 boundaries with `layout: "zones"`, or dense dependency grids with `layout: "matrix"`): `diagram` (`sketch_sketch:diagram`).
- **Database tables or class hierarchies** (entities with `pk`/`fk` fields and relations): `schema` (`sketch_sketch:schema`).
- **Cross-role or cross-system handoffs**: `swimlane` (`sketch_sketch:swimlane`).
- **Left-to-right stage pipelines** (CI/CD, ETL, build flows): `pipeline` (`sketch_sketch:pipeline`).
- **Git branching, merging, and release strategies**: `gitgraph` (`sketch_sketch:gitgraph`).
- **Ordered request/response protocols between actors**: `sequence` (`sketch_sketch:sequence`).
- **Complex hierarchies, OKR breakdowns, or mind maps**: `tree` (`sketch_sketch:tree`, `layout: "list"` or `"mindmap"`).
- **Project roadmaps or schedules across periods**: `timeline` (`sketch_sketch:timeline`).
- **Kanban or work items by status/theme**: `board` (`sketch_sketch:board`).
- **2x2 prioritization matrices or SWOT analysis**: `quadrant` (`sketch_sketch:quadrant`).
- **User journeys or service blueprints with mood curves**: `journey` (`sketch_sketch:journey`).
- **Page or mobile screen wireframes**: `wireframe` (`sketch_sketch:wireframe`).
- **Quantitative datasets & KPIs**: `chart` (`sketch_sketch:chart` — `bar`, `column`, `stacked`, `line`, `scatter`, `heatmap`, `histogram`, `funnel`, `share`) or `metrics` (`sketch_sketch:metrics`).
- **Structured personas, research findings, or design principles**: `cards` (`sketch_sketch:cards`).
- **Weighing 2 to 4 architectural or product options**: `compare` (`sketch_sketch:compare`).

## Displaying a Drawn Card

When you do call a `sketch` tool:
1. **Include the drawn box-drawing card returned by the tool verbatim inside a fenced ```` ```text ```` code block in your reply** so the user sees it in the terminal, along with the local interactive preview URL if provided.
2. Keep the text around the card to 1–2 concise sentences, and keep labels inside the card short. Never invent numbers, nodes, or quotes to fill a card.
