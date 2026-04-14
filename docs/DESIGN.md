# CLAUDE.md — s&box Skill Builder

## Project Purpose

You are building a Claude Skill for s&box game development. The skill will give Claude full context on s&box's API, architecture, and patterns so it can write idiomatic s&box C# components, Razor UI, and networking code without hallucinating.

## Source Material

- `raw/sbox-docs/` — Official s&box documentation (markdown files from Facepunch/sbox-docs GitHub repo). Covers concepts, scene system, components, UI, networking, etc.
- `raw/api-schema.json` — Complete JSON schema of every public type, method, property, and field in the s&box engine. This is the ground truth for API signatures.

## Target Output Structure

```
SKILL.md                          # Entry point and ROUTER ONLY (~300-500 lines)
references/
├── core-concepts.md              # Scene system, GameObjects, Components, lifecycle, Properties, Prefabs
├── components-builtin.md         # Built-in components: ModelRenderer, CharacterController, Colliders, etc
├── ui-razor.md                   # Razor panels, SCSS styling, Panel lifecycle, data binding, events
├── networking.md                 # RPCs, [Sync], authority, host vs client, replication
├── input-and-physics.md          # Input system, SceneTrace (raycasting), physics, collision
├── api-schema-core.md            # Curated: ~50 most-used classes with full signatures
├── api-schema-extended.md        # Everything else, organized by namespace for lookup
└── patterns-and-examples.md      # Complete working component examples showing idiomatic s&box code
```

The `raw/` folder is working material only — it does NOT ship with the skill.

## Key Context

- s&box is built on Source 2 with a C# scripting layer. The scene system uses GameObjects + Components, similar to Unity but with a different API surface.
- All gameplay code is C# extending `Component`. UI is Razor (HTML + CSS + C#). Both hot-reload in the editor.
- s&box C# is NOT Unity C#. No `MonoBehaviour`, no `void Start()`, no `void Update()`. The lifecycle methods, networking model, and API are completely different. This distinction is critical — the whole point of this skill is to prevent Claude from falling back on Unity patterns.
- The API schema JSON is the single source of truth for method signatures. If the docs and schema disagree, the schema wins.
- s&box restricts certain .NET namespaces (e.g., `System.IO.File` is blocked). Note these restrictions in the skill.

---

## SKILL.md Design Rules

### The SKILL.md is a ROUTER, not a reference

SKILL.md should contain:
- A compact architecture overview (just enough to orient)
- Key conventions and anti-patterns as a quick-reference table
- Clear routing: "writing a component? → read `core-concepts.md`", "writing UI? → read `ui-razor.md`"
- Project structure conventions

SKILL.md should NOT contain:
- Detailed API signatures (that's what reference files are for)
- Long explanations of concepts
- Anything that would let Claude skip reading the reference files

If Claude can answer an s&box question using only SKILL.md without opening a reference file, the SKILL.md has too much detail in it.

### Frontmatter Description = Triggers Only

The `description` field in SKILL.md frontmatter controls when Claude triggers the skill. Rules:
- Start with "Use when..."
- List only triggering conditions and keywords, NOT workflow summary
- Include synonyms: "s&box", "sbox", "sandbox game", "Source 2 game", "Facepunch engine"
- Third person: "Writes idiomatic s&box components..." not "I can help you..."
- If the description summarizes the workflow, Claude will shortcut and follow the description instead of reading the full skill.

### Anti-Pattern Tables

Structure Unity-vs-s&box differences as explicit lookup tables, not prose. Claude follows tables reliably:

```markdown
| Unity Pattern (WRONG) | s&box Pattern (CORRECT) |
|---|---|
| `void Start()` | `protected override void OnStart()` |
| `void Update()` | `protected override void OnUpdate()` |
| `GetComponent<T>()` | `Components.Get<T>()` |
```

(These are illustrative — build the real table from the API schema. Verify every entry.)

---

## Quality Bar for Reference Files

- **Density over length.** Every line should teach something. No filler. The audience is Claude — it already knows C# and game dev concepts, it just doesn't know s&box's specific API.
- **Signatures must be exact.** Method names, parameter types, return types — all from the API schema. If you can't verify a signature, don't include it.
- **One great example > many mediocre ones.** A single complete, working 20-line component teaches more than five fragments.
- **Anti-patterns matter.** Explicitly call out what NOT to do. Format as "If you're tempted to write X, the s&box equivalent is Y."

---

## Curation Strategy for api-schema.json

The API schema is too large to include raw. Approach:
1. Parse the JSON and identify the most important classes (GameObject, Component, Scene, GameTransform, Vector3, Rotation, ModelRenderer, CharacterController, SceneTrace, Input, etc.)
2. Write `api-schema-core.md` with full detail on ~50 most-used classes: every public method, property, with signatures and brief descriptions
3. Write `api-schema-extended.md` as a namespace-organized index of everything else — class name, brief purpose, key methods only
4. For each topical reference file (ui-razor.md, networking.md, etc), include the relevant API signatures inline alongside the conceptual content

---

## Workflow

### Build Order

Work file by file. Write SKILL.md LAST — you need to know what's in all the references before you can write a good router.

1. `core-concepts.md` — the foundation everything else builds on
2. `components-builtin.md`
3. `ui-razor.md`
4. `networking.md`
5. `input-and-physics.md`
6. `api-schema-core.md`
7. `api-schema-extended.md`
8. `patterns-and-examples.md`
9. `SKILL.md` — write the router last

### Verification Per File

After completing each reference file:
1. Verify every API signature against `api-schema.json`
2. Write a short sample component using only the reference file
3. Cross-check every method call in that sample against the schema
4. If any call doesn't exist in the schema, fix the reference file

This is automated — no domain expertise required, just schema lookup.

---

## Task Management

1. Plan First: Write plan to `tasks/todo.md` with checkable items per reference file
2. Work file by file: Complete one reference file, review it, then move to the next
3. Track Progress: Mark items complete as you go
4. Document Results: Note any gaps in the raw docs or schema that couldn't be resolved
5. Capture Lessons: Update `tasks/lessons.md` after corrections

## Workflow Orchestration

### Plan Mode Default
- Enter plan mode for each reference file before writing — survey the relevant raw docs first
- If the raw docs are unclear or contradictory, check the API schema as ground truth
- If something doesn't add up, flag it and move on rather than guessing

### Subagent Strategy
- Use subagents to parse and analyze `api-schema.json` (it's large)
- Use subagents to grep through `raw/sbox-docs/` for specific topics
- One reference file per focused work block

### Self-Improvement Loop
- After any correction: update `tasks/lessons.md` with the pattern
- Pay special attention to Unity pattern leakage — document as anti-patterns in the skill

## Core Principles

- **Schema is truth.** Never guess at an API signature. Verify against the JSON.
- **Density over length.** Write for Claude, not for a tutorial reader.
- **Anti-Unity vigilance.** Every reference file should preempt Unity muscle memory.
- **Progressive disclosure.** SKILL.md routes. Reference files teach. Never duplicate.