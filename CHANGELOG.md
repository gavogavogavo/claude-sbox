# Changelog

All notable changes to this skill are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/).

## [Unreleased]

## [0.1.2] — 2026-04-14

### Fixed

- Personal install command in `README.md` now creates `~/.claude/skills/` first. Previously the `git clone` command would fail on a fresh Claude Code install because `git clone` doesn't create intermediate parent directories and the `skills/` subdirectory is only created once you install your first personal skill.
- Documented the known Claude Code quirk that creating a top-level skills directory mid-session requires a restart so the file watcher registers the new directory.

## [0.1.1] — 2026-04-14

### Fixed

- `README.md` install commands now point at `github.com/gavogavogavo/claude-sbox` instead of the `YOUR-USER` placeholder. Copy-paste installs now work.

## [0.1.0] — 2026-04-14

Initial release.

### Added

- **`SKILL.md`** — 271-line router. Frontmatter description covers triggers across s&box / sbox / Facepunch / Source 2 keywords plus API-specific identifiers (`[Sync]`, `[Rpc.Broadcast]`, `SceneTrace`, `PanelComponent`, `NavMeshAgent`, etc.). Body contains the architecture overview, routing table, Unity→s&box translation table, project structure, and gotchas.
- **`references/core-concepts.md`** (575 lines) — scene system, GameObjects, Components, lifecycle, `[Property]` attributes, prefabs, scene events, `GameObjectSystem`, async, Unity anti-pattern table, .NET whitelist restrictions.
- **`references/components-builtin.md`** (729 lines) — 144 built-in components across 15 categories. Covers `ModelRenderer`, `SkinnedModelRenderer`, `Rigidbody`, all `Collider` types, `CharacterController`, `CameraComponent`, lights, audio components, UI panels, `NavMeshAgent`, `PlayerController`, particles, post-processing.
- **`references/ui-razor.md`** (834 lines) — Razor syntax, `PanelComponent` vs `Panel`, `BuildHash`, `:bind`, `RenderFragment`, SCSS, flexbox layout, `Length` units, `:intro`/`:outro` transitions, 10+ built-in controls, `NavigationHost`, events, localization, complete HUD example.
- **`references/networking.md`** (672 lines) — lobbies, `Connection`, `[Sync]` with all `SyncFlags`, RPCs (`[Rpc.Broadcast/Host/Owner]`), `NetFlags`, recipient filtering, ownership model, `IsProxy` pattern, `NetworkOrphaned` modes, `INetworkListener`, `INetworkSpawn`, `INetworkSnapshot`, `INetworkVisible`, `ISceneStartup`, dedicated servers.
- **`references/input-and-physics.md`** (597 lines) — input actions, analog input, controller haptics and glyphs, `SceneTrace` builder API, `SceneTraceResult`, `PhysicsWorld`, collision system, `Vector3`/`Rotation`/`Angles`/`Transform`/`BBox`/`Ray`/`Capsule` full APIs, `TimeSince`/`TimeUntil`, `Gizmo.Draw` debug drawing.
- **`references/api-schema-core.md`** (930 lines) — full public signatures for ~50 most-used classes (GameObject, Component, Scene, Vector3, Rotation, Color, BBox, Input, Time, Model, Material, Sound, SceneTrace, Collision, DamageInfo, Tags, MathX, Curve, Http, FileSystem, Connection, Networking, Game, Log, and all key enums).
- **`references/api-schema-extended.md`** (2753 lines) — namespace-organized index of 738 additional types across 32 namespaces. Auto-generated from `raw/api-schema.json` by `scripts/build_extended.js`.
- **`references/patterns-and-examples.md`** (1056 lines) — 10 complete runnable examples: Health + `IDamageable`, first-person `CharacterController`, hitscan weapon, `GameManager` as `GameObjectSystem` + `INetworkListener` + `ISceneStartup`, networked Player with `[Sync]` and RPCs, Razor HUD, rigidbody grenade with radius damage, NavMeshAgent enemy state machine, prefab spawner, health pickup trigger. Every API call schema-verified.
- **`scripts/build_extended.js`** — regenerates `references/api-schema-extended.md` from `raw/api-schema.json`.
- **`scripts/fetch-raw.sh`** — clones Facepunch/sbox-docs into `raw/sbox-docs/`.
- **`docs/DESIGN.md`** — original design spec (what this skill is, quality bars, workflow).
- **`docs/BUILD_LOG.md`** — build history and key gotchas discovered during construction.
- **`README.md`**, **`LICENSE`** (MIT), **`.gitignore`**.

### Source material

- Generated against `raw/sbox-docs/` (204 markdown files from the Facepunch/sbox-docs GitHub repo).
- Schema-verified against `raw/api-schema.json` (1,850 types across 61 namespaces).
- Raw material is gitignored — regenerate with `scripts/fetch-raw.sh` and follow `docs/DESIGN.md` for full rebuild instructions.
