# Progress — s&box Skill Builder

## What This Project Is

Building a Claude Skill for s&box game development. The skill gives Claude full context on s&box's API, architecture, and patterns so it can write idiomatic s&box C# code without hallucinating Unity patterns.

Read `CLAUDE.md` for the full spec — it has all design rules, quality bars, and workflow instructions.

## Source Material

- `raw/sbox-docs/` — 204 markdown files of official s&box documentation
- `raw/api-schema.json` — 9.2MB JSON with 1,850 types (1,166 classes, 288 structs, 242 enums, 154 interfaces across 61 namespaces)

## Build Order (from CLAUDE.md)

| # | File | Status | Lines | Notes |
|---|------|--------|-------|-------|
| 1 | `references/core-concepts.md` | DONE | 575 | Scene system, GameObjects, Components, lifecycle, Properties, Prefabs, events, GameObjectSystem, async, Unity anti-pattern table, .NET restrictions |
| 2 | `references/components-builtin.md` | DONE | 729 | 144 built-in components across 15 categories. ModelRenderer, SkinnedModelRenderer, Rigidbody, Colliders, CharacterController, CameraComponent, Lights, Audio, UI panels, NavMeshAgent, PlayerController, particles, post-processing, etc. |
| 3 | `references/ui-razor.md` | DONE | 834 | Razor syntax, PanelComponent vs Panel, BuildHash, :bind, RenderFragment, SCSS, CSS classes API, flexbox layout, Length units, transitions, intro/outro, 10+ built-in controls, NavigationHost, events, localization, complete HUD example |
| 4 | `references/networking.md` | DONE | 672 | Lobbies, Connection, [Sync] with SyncFlags, RPCs ([Rpc.Broadcast/Host/Owner]), NetFlags, filtering, ownership model, IsProxy pattern, NetworkOrphaned, INetworkListener, INetworkSpawn, INetworkSnapshot, INetworkVisible, ISceneStartup, dedicated servers, complete player controller example |
| 5 | `references/input-and-physics.md` | DONE | 597 | Input actions/analog/controller/haptics/glyphs, SceneTrace builder API, SceneTraceResult, PhysicsWorld, collision system, Vector3/Rotation/Angles/Transform/BBox/Ray full API, TimeSince/TimeUntil, MathX not covered here (in api-schema-core), Gizmo debug drawing, FPS controller + hitscan weapon examples |
| 6 | `references/api-schema-core.md` | DONE | 930 | ~50 most-used classes with full method signatures. GameObject, Component, Scene, Vector3, Rotation, Color, BBox, Input, Time, Model, Material, Sound, SceneTrace, Collision, DamageInfo, Tags, MathX, Curve, Http, FileSystem, Connection, Networking, Game, Log, and all key enums |
| 7 | `references/api-schema-extended.md` | DONE | 2753 | 738 types across 32 namespaces. Generated via `scripts/build_extended.js` from raw/api-schema.json. Excludes the ~50 core types, all 144 Component-derived built-in components, attributes, editor/internal namespaces, and nested-types-of-components. One entry per type with Group label, one-line summary (cref refs resolved), and 3-5 key members. Spot-checked AnimationBuilder/PhysicsGroupDescription/StyleSelector/WebSocket/Plane against raw schema — exact match. |
| 8 | `references/patterns-and-examples.md` | DONE | 1056 | 10 complete runnable examples: Health+IDamageable, FirstPersonController, HitscanWeapon, GameManager (GameObjectSystem+INetworkListener+ISceneStartup), networked Player with Sync+RPCs, Razor HUD, Rigidbody Grenade with radius damage, NavMeshAgent enemy state machine, PrefabSpawner, HealthPickup trigger. Plus quick-reference idioms and anti-pattern table. All API calls schema-verified; fixed 5 bugs found during verification (Components.GetOrCreate→GetOrAddComponent, WithoutTags single-string, Game.Random.FromList required arg, ConVarAttribute ctor, missing Sandbox.Network using). |
| 9 | `SKILL.md` | DONE | 271 | Router file. Frontmatter uses "Use when..." with synonyms (s&box, sbox, sandbox game, Facepunch engine, Source 2 game) plus API-specific trigger keywords. Sections: architecture-in-30-seconds, routing table (every task → reference file), Unity→s&box translation table (40+ entries covering lifecycle, transforms, input, physics, math, coroutines, I/O, nav), the Ten Rules, project structure, shape-only reference component, gotchas list, verification loop. No detailed API signatures — all routing, as required by CLAUDE.md. |

## Project Complete

All 9 files shipped:

- `SKILL.md` (271)
- `references/core-concepts.md` (575)
- `references/components-builtin.md` (729)
- `references/ui-razor.md` (834)
- `references/networking.md` (672)
- `references/input-and-physics.md` (597)
- `references/api-schema-core.md` (930)
- `references/api-schema-extended.md` (2753)
- `references/patterns-and-examples.md` (1056)

**Total:** 8417 lines of curated, schema-verified reference material plus a 271-line router.

**Not shipped with the skill:** `raw/sbox-docs/`, `raw/api-schema.json`, `scripts/build_extended.js`, `progress.md`, `CLAUDE.md` — those are working materials.

## Verification Workflow (from CLAUDE.md)

After completing each reference file:
1. Verify every API signature against `raw/api-schema.json`
2. Write a short sample component using only the reference file
3. Cross-check every method call in that sample against the schema
4. If any call doesn't exist in the schema, fix the reference file

All 8 completed files have been through this verification process. Continue doing this for remaining files.

## Key Gotchas Discovered During Build

- `ICollisionListener` parameter names are `collision` not `other` (despite the raw docs using `other`)
- `Color` and `Capsule` are in the global namespace, not `Sandbox`
- There's no standalone `Log` class — it's `Sandbox.Diagnostics.Logger` (but the global `Log` instance works fine)
- `NavigationHost` is in `Sandbox.UI.Navigation`, needs explicit `@using`
- `PlayerController.TraceBody` has 4 params not 3 (4th is `heightScale`)
- s&box uses Z-up coordinate system: Forward=(1,0,0), Right=(0,-1,0), Up=(0,0,1)
- `Scene` extends `GameObject` — it IS the root GameObject
- Operators (like `Rotation * Rotation`) are not in the API schema — they're systematically excluded
- `FileSystem` is a static facade; actual methods are on `BaseFileSystem` (via `FileSystem.Data`, `FileSystem.Mounted`)
- `ComponentList.GetOrCreate<T>()` requires a `FindMode` arg — for "get or create on this GameObject", use `GameObject.GetOrAddComponent<T>()` / `Component.GetOrAddComponent<T>()` instead
- `SceneTrace.WithoutTags/WithAnyTags/WithAllTags` take `string[]` only (not `params`) — pass `new[] { "tag" }` or use `WithTag(string)` for the single-tag case
- `Game.Random.FromList(list, defVal)` (extension on `System.Random` via `SandboxSystemExtensions`) requires the default value — use `list[Game.Random.Next(list.Count)]` for the simple case
- `ConVarAttribute` ctors both require a `ConVarFlags` argument — no single-string overload
- `LobbyConfig` and `LobbyPrivacy` live in `Sandbox.Network`, not `Sandbox` — needs explicit `using Sandbox.Network;`
- Nested interfaces on `Component`: `Component.IDamageable`, `Component.ICollisionListener`, `Component.ITriggerListener`, `Component.INetworkSpawn`, `Component.INetworkListener`, `Component.INetworkVisible` — but `IGameObjectNetworkEvents` is top-level `Sandbox.IGameObjectNetworkEvents`
