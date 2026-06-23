/**
 * build_extended.js
 * Generates references/api-schema-extended.md from raw/api-schema.json
 *
 * Exclusion rules:
 *   1. Non-public types
 *   2. Assembly not starting with "Sandbox"
 *   3. IsAttribute types
 *   4. Types already in api-schema-core.md (CORE_EXCLUSIONS list)
 *   5. Component-derived types (already in components-builtin.md)
 *   6. Editor, Facepunch.ActionGraphs, internal namespaces
 *   7. Global-namespace nested types whose parent is a Component or editor class
 */

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '../raw/api-schema.json');
const OUTPUT_PATH = path.join(__dirname, '../references/api-schema-extended.md');

// Types to exclude entirely (core docs, other reference files, or low-value noise)
const CORE_EXCLUSIONS = new Set([
  'GameObject', 'Component', 'Scene', 'GameTransform', 'Vector3', 'Rotation',
  'Angles', 'Transform', 'Color', 'BBox', 'Ray', 'Capsule', 'Input', 'Time',
  'TimeSince', 'TimeUntil', 'Mouse', 'Screen', 'Model', 'Material', 'Sound',
  'SoundHandle', 'Logger', 'Http', 'SceneTrace', 'SceneTraceResult', 'Collision',
  'CollisionSource', 'PhysicsContact', 'CollisionStop', 'DamageInfo', 'ITagSet',
  'GameTags', 'TagSet', 'MathX', 'Curve', 'Game', 'Connection', 'Networking',
  'Surface', 'FileSystem', 'BaseFileSystem', 'SceneLoadOptions', 'ComponentList',
  'GameObjectDirectory', 'FindMode', 'GameObjectFlags', 'ComponentFlags',
  'NetworkMode', 'OwnerTransfer', 'NetworkOrphaned', 'SyncFlags', 'NetFlags',
  'InputAnalog',
  // Also covered in other reference files
  'PhysicsWorld', 'PhysicsBody', 'PhysicsShape', 'PhysicsJoint',
  'PhysicsContact', 'PhysicsPoint',
  // Extension/utility types not useful in game code
  'SandboxSystemExtensions', 'SandboxGameExtensions', 'SandboxToolExtensions',
]);

// Namespaces to skip entirely (editor-only, internal framework, not game dev)
const SKIP_NAMESPACES = new Set([
  'Editor', 'Facepunch.ActionGraphs', 'Facepunch.ActionGraphs.Compilation',
  'Facepunch.ActionGraphs.Nodes', 'Editor.MapEditor', 'Editor.MapDoc',
  'Editor.Graphic', 'Editor.ModelEditor', 'Editor.MeshEditor', 'Editor.Internal',
  'Sandbox.ModelEditor', 'Sandbox.ModelEditor.Nodes', 'Sandbox.ModelEditor.Internal',
  'Microsoft.AspNetCore.Components', 'NativeEngine', 'HalfEdgeMesh',
  'Sandbox.Internal',
  'Sandbox.MovieMaker', 'Sandbox.MovieMaker.Compiled', 'Sandbox.MovieMaker.Properties',
  'Sandbox.Engine', 'Sandbox.Engine.Settings', 'Sandbox.Engine.Shaders',
  'Sandbox.Engine.Utility.RayTrace', 'Sandbox.Engine.Resources',
  'System.Collections.ObjectModel',
]);

// For global-namespace types, skip these FullName prefixes (nested types of internal classes)
const SKIP_FULLNAME_PREFIXES = [
  'Editor.',                        // editor nested types
  'Sandbox.Doo.',                   // internal scripting graph engine
  'Sandbox.Json.',                  // JSON patch internals
  'Sandbox.SerializedObject.',      // editor serialization internals
  'Sandbox.SerializedProperty.',
  'Sandbox.VideoWriter.',
  'Sandbox.GpuBuffer.',
  'Sandbox.Rendering.RenderTargetHandle.',
  'Sandbox.Shader.',
  'Sandbox.TextRendering.',
  'Sandbox.Gradient.',              // internal gradient nested types
  'Sandbox.Spline.',
  'Sandbox.PartyRoom.',
  'Sandbox.Package.',               // package/marketplace marketplace nested types
  'Sandbox.Storage.',
  'Sandbox.Diagnostics.',           // performance/allocation internals
  'Sandbox.EnvmapProbe.',           // component nested types
  'Sandbox.AmbientOcclusion.',
  'Sandbox.ColorGrading.',
  'Sandbox.Tonemapping.',
  'Sandbox.IndirectLightVolume.',
  'Sandbox.ParticleEffect.',
  'Sandbox.ParticleFloat.',
  'Sandbox.ParticleGradient.',
  'Sandbox.ParticleSpriteRenderer.',
  'Sandbox.ParticleBillboard.',
  'Sandbox.SceneSkyBox.',
  'Sandbox.CameraComponent.',
  'Sandbox.WorldPanel.',
  'Sandbox.TextRenderer.',
  'Sandbox.PhysicsGroupDescription.',
  'Sandbox.Terrain.',
  'Sandbox.GameObjectUndoFlags',    // undo internals
  'Sandbox.PolygonMesh.',
  'Sandbox.ModelPhysics.',
  'Sandbox.UI.KeyFrames.',
  'Sandbox.UI.PanelTransform.',
  'Sandbox.UI.Transitions.',
  'Sandbox.Soundscape.',
  'Sandbox.Services.Stats.',
  'Sandbox.Services.Leaderboards.',
  'Sandbox.Services.ServerList.',
  'Sandbox.Helpers.UndoSystem.',
  'Sandbox.Component.IPressable.',
  'Sandbox.GameObjectSystem.',      // internal stage
  'Sandbox.PhysicsBodyBuilder.',
  'Sandbox.Audio.DspProcessor.',    // audio DSP nested states
  'Sandbox.Audio.DelayProcessor.',
  'Sandbox.Audio.HighPassProcessor.',
  'Sandbox.Audio.LowPassProcessor.',
  'Sandbox.Audio.PitchProcessor.',
  'Sandbox.VideoPlayer.',           // video player delegate types
  'Sandbox.WebSurface.',            // web surface delegate types
  'Sandbox.Engine.Shaders.',        // shader compile internals
  'Sandbox.CompileGroup.',          // compile internals
];

// Explicit keep list for global types that are genuinely useful game-dev types
// (root-level types or important nested types not caught by the prefix rules)
const GLOBAL_KEEPLIST = new Set([
  'Vector2', 'Vector2Int', 'Vector3Int', 'Vector4',
  'Matrix', 'Cone', 'Line', 'RangedFloat', 'RangeType',
  'SmoothDamped', 'SpringDamped',
  'ICollisionListener', 'IDamageable', 'IHasBounds', 'IPressable',
  'INetworkListener', 'INetworkSpawn', 'INetworkSnapshot', 'INetworkVisible',
  'DontExecuteOnServer', 'ExecuteInEditor',
  'IColorProvider', 'ITintable', 'ITriggerListener', 'ITemporaryEffect',
  'ISceneStage', 'ITraceProvider',
  'IEvents',
  'NetworkAccessor',
  'GizmoControls', 'GizmoDraw', 'Colors',
  // Animation types
  'BroadcastEvent', 'BroadcastEventType', 'LoopMode', 'AnimationState', 'Animation',
  'FootstepEvent', 'GenericEvent', 'SoundEvent', 'AnimTagEvent', 'AnimTagStatus',
  'BoneVelocity', 'MorphAccessor', 'ParameterAccessor', 'SequenceAccessor',
  // Physics nested types
  'ImpactEffectData', 'ScrapeEffectData', 'SurfacePrefabCollection',
  // Gizmo
  'BeamInstance',
  // Clothing
  'ClothingCategory', 'Slots', 'BodyGroups', 'ClothingEntry',
  // Services
  'PackageUsageStats', 'Organization',
  'WebSocket',
  // Serialization
  'VariableCollection',
]);

// Methods to always skip (noise)
const SKIP_METHODS = new Set([
  'GetHashCode', 'Equals', 'ToString', 'GetType', 'MemberwiseClone',
  'Finalize', 'ReferenceEquals', 'GetEnumerator', 'CompareTo',
  '.ctor', 'op_Equality', 'op_Inequality', 'op_Addition', 'op_Subtraction',
  'op_Multiply', 'op_Division', 'op_UnaryNegation', 'op_Implicit', 'op_Explicit',
  'op_LessThan', 'op_GreaterThan', 'op_LessThanOrEqual', 'op_GreaterThanOrEqual',
  '<Clone>$', 'Deconstruct',
]);

// Namespace ordering: core Sandbox namespaces first, then alphabetical
const NS_ORDER = [
  'Sandbox',
  '',        // global
  'Sandbox.UI',
  'Sandbox.UI.Construct',
  'Sandbox.UI.Navigation',
  'Sandbox.Network',
  'Sandbox.Physics',
  'Sandbox.Audio',
  'Sandbox.VR',
  'Sandbox.Movement',
  'Sandbox.Navigation',
  'Sandbox.Rendering',
  'Sandbox.Resources',
  'Sandbox.Services',
  'Sandbox.Services.Players',
  'Sandbox.Diagnostics',
  'Sandbox.Localization',
  'Sandbox.Utility',
  'Sandbox.Utility.Svg',
  'Sandbox.ActionGraphs',
  'Sandbox.Clutter',
  'Sandbox.Volumes',
  'Sandbox.Bind',
  'Sandbox.Compression',
  'Sandbox.DataModel',
  'Sandbox.Debug',
  'Sandbox.Html',
  'Sandbox.Helpers',
  'Sandbox.Menu',
  'Sandbox.Modals',
  'Sandbox.Mounting',
  'Sandbox.Razor',
  'Sandbox.Speech',
  'Sandbox.Tasks',
  'Sandbox.Citizen',
];

// Simplify type strings for readability
function simplifyType(t) {
  if (!t) return 'void';
  t = t.replace(/`\d+/g, '');
  t = t.replace(/System\.Collections\.Generic\.IEnumerable<([^>]+)>/g, 'IEnumerable<$1>');
  t = t.replace(/System\.Collections\.Generic\.List<([^>]+)>/g, 'List<$1>');
  t = t.replace(/System\.Collections\.Generic\.Dictionary<([^>,]+),([^>]+)>/g, 'Dictionary<$1,$2>');
  t = t.replace(/System\.Collections\.Generic\.IReadOnlyList<([^>]+)>/g, 'IReadOnlyList<$1>');
  t = t.replace(/System\.Collections\.Generic\.IReadOnlyDictionary<([^>,]+),([^>]+)>/g, 'IReadOnlyDictionary<$1,$2>');
  t = t.replace(/System\.Collections\.Generic\.HashSet<([^>]+)>/g, 'HashSet<$1>');
  t = t.replace(/System\.Collections\.Generic\.IEnumerable/g, 'IEnumerable');
  t = t.replace(/System\.Threading\.Tasks\.Task<([^>]+)>/g, 'Task<$1>');
  t = t.replace(/System\.Threading\.Tasks\.Task/g, 'Task');
  t = t.replace(/System\.Action<([^>]+)>/g, 'Action<$1>');
  t = t.replace(/System\.Action/g, 'Action');
  t = t.replace(/System\.Func<([^>]+)>/g, 'Func<$1>');
  t = t.replace(/System\.Nullable<([^>]+)>/g, '$1?');
  t = t.replace(/System\.Void/g, 'void');
  t = t.replace(/System\.Boolean/g, 'bool');
  t = t.replace(/System\.Int32/g, 'int');
  t = t.replace(/System\.Int64/g, 'long');
  t = t.replace(/System\.Single/g, 'float');
  t = t.replace(/System\.Double/g, 'double');
  t = t.replace(/System\.String/g, 'string');
  t = t.replace(/System\.Object/g, 'object');
  t = t.replace(/System\.Byte/g, 'byte');
  t = t.replace(/System\.UInt32/g, 'uint');
  t = t.replace(/System\.Guid/g, 'Guid');
  t = t.replace(/System\.Type/g, 'Type');
  t = t.replace(/\bSandbox\./g, '');
  t = t.replace(/\bSystem\./g, '');
  t = t.trim();
  return t;
}

function formatMethod(m) {
  const params = (m.Parameters || []).map(p => {
    const ptype = simplifyType(p.Type);
    return p.Name ? `${ptype} ${p.Name}` : ptype;
  }).join(', ');
  const ret = simplifyType(m.ReturnType);
  const staticPrefix = m.IsStatic ? 'static ' : '';
  return `${staticPrefix}${m.Name}( ${params} ) → ${ret}`;
}

function formatProperty(p) {
  return `${p.Name} : ${simplifyType(p.PropertyType)}`;
}

// Score a method by importance
function methodScore(m) {
  let score = 0;
  if (m.Documentation && m.Documentation.Summary) score += 3;
  if (m.IsStatic) score += 1;
  score -= (m.Parameters || []).length * 0.2;
  if (m.Name.startsWith('get_') || m.Name.startsWith('set_')) score -= 10;
  return score;
}

// Score a property by importance
function propScore(p) {
  let score = 0;
  if (p.Documentation && p.Documentation.Summary) score += 2;
  if (!simplifyType(p.PropertyType).includes('<')) score += 1;
  return score;
}

function getKeyMembers(type, maxCount) {
  const items = [];

  const methods = (type.Methods || [])
    .filter(m => m.IsPublic && !SKIP_METHODS.has(m.Name) && !m.Name.startsWith('get_') && !m.Name.startsWith('set_') && !m.Name.startsWith('<'))
    .sort((a, b) => methodScore(b) - methodScore(a));

  const props = (type.Properties || [])
    .filter(p => p.IsPublic)
    .sort((a, b) => propScore(b) - propScore(a));

  const hasMainlyMethods = methods.length > props.length * 2;

  if (hasMainlyMethods) {
    methods.slice(0, Math.ceil(maxCount * 0.7)).forEach(m => items.push('`' + formatMethod(m) + '`'));
    props.slice(0, maxCount - items.length).forEach(p => items.push('`' + formatProperty(p) + '`'));
  } else {
    const halfMax = Math.ceil(maxCount / 2);
    props.slice(0, halfMax).forEach(p => items.push('`' + formatProperty(p) + '`'));
    methods.slice(0, maxCount - items.length).forEach(m => items.push('`' + formatMethod(m) + '`'));
  }

  return items.slice(0, maxCount);
}

function formatEnumValues(type) {
  const fields = (type.Fields || []).filter(f => f.IsPublic && f.IsStatic);
  const values = fields.map(f => f.Name);
  if (values.length === 0) return '';
  if (values.length <= 10) return values.join(', ');
  return values.slice(0, 10).join(', ') + ` … (+${values.length - 10} more)`;
}

function crefShortName(cref) {
  // "T:Sandbox.PhysicsBody" → "PhysicsBody"
  // "M:Sandbox.Foo.Bar(System.Int32)" → "Foo.Bar"
  if (!cref) return '';
  let c = cref.replace(/^[A-Z]:/, '');       // strip T:/M:/P:/F:/E:
  c = c.replace(/\(.*$/, '');                 // strip method params
  c = c.replace(/^Sandbox\./, '');            // strip Sandbox. prefix
  c = c.replace(/^System\./, '');             // strip System. prefix
  const seg = c.split('.');
  // For methods keep last 2 segments, otherwise just the last
  return seg.length >= 2 && cref.startsWith('M:') ? seg.slice(-2).join('.') : seg[seg.length - 1];
}

function truncateSummary(summary, maxLen) {
  if (!summary) return '';
  // Replace <see cref="T:..." /> self-closing with short name
  summary = summary.replace(/<see\s+cref="([^"]*)"\s*\/>/g, (_, c) => '`' + crefShortName(c) + '`');
  // Replace <see cref="..."> text </see> with the inner text
  summary = summary.replace(/<see\s+cref="[^"]*">([^<]*)<\/see>/g, '$1');
  // Replace <paramref name="x"/> / <typeparamref>
  summary = summary.replace(/<(?:param|typeparam)ref\s+name="([^"]*)"\s*\/?>/g, '`$1`');
  // Strip any other XML tags
  summary = summary.replace(/<[^>]+>/g, '');
  summary = summary.replace(/\s+/g, ' ').trim();
  const firstSentence = summary.split(/[.\n]/)[0].trim();
  if (firstSentence.length <= maxLen) return firstSentence;
  return firstSentence.slice(0, maxLen - 1) + '…';
}

// ---------- MAIN ----------

const data = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const allTypes = data.Types;

// Build BaseType chain map for Component-derived detection
const typeMap = {};
for (const t of allTypes) {
  if (t.FullName) typeMap[t.FullName] = t.BaseType;
}

function isComponentDerived(fullName) {
  let current = fullName;
  const visited = new Set();
  while (current && !visited.has(current)) {
    visited.add(current);
    if (current === 'Sandbox.Component') return true;
    current = typeMap[current];
  }
  return false;
}

// Build a set of component FullNames for parent checks
const componentFullNames = new Set(
  allTypes
    .filter(t => t.FullName && isComponentDerived(t.FullName))
    .map(t => t.FullName)
);

function isGlobalTypeUseful(t) {
  if (!t.FullName) return false;
  // Always allow explicit keep list
  if (GLOBAL_KEEPLIST.has(t.Name)) return true;
  // Skip compiler-generated
  if (t.Name.includes('<') || t.Name.includes('>') || t.Name.includes('$')) return false;
  // Skip by FullName prefix
  for (const prefix of SKIP_FULLNAME_PREFIXES) {
    if (t.FullName.startsWith(prefix) || t.FullName === prefix.replace(/\.$/, '')) return false;
  }
  // Skip if nested inside a Component-derived type
  const parts = t.FullName.split('.');
  if (parts.length >= 2) {
    const parentFull = parts.slice(0, -1).join('.');
    if (componentFullNames.has(parentFull)) return false;
  }
  // Root-level types (no dot in FullName) are OK if not in core exclusions
  if (!t.FullName.includes('.')) return true;
  // Must be under Sandbox. prefix
  if (!t.FullName.startsWith('Sandbox.')) return false;
  return true;
}

// Filter types
const seenFullNames = new Set();
const filteredTypes = allTypes.filter(t => {
  if (!t.IsPublic) return false;
  if (!t.Assembly || !t.Assembly.startsWith('Sandbox')) return false;
  if (t.IsAttribute) return false;
  if (CORE_EXCLUSIONS.has(t.Name)) return false;
  if (SKIP_NAMESPACES.has(t.Namespace)) return false;
  if (t.FullName && isComponentDerived(t.FullName) && t.FullName !== 'Sandbox.Component') return false;

  // Deduplicate by FullName (same type can appear multiple times from different assemblies)
  if (t.FullName) {
    if (seenFullNames.has(t.FullName)) return false;
    seenFullNames.add(t.FullName);
  }

  // Special handling for global namespace
  if (t.Namespace === '') {
    return isGlobalTypeUseful(t);
  }

  return true;
});

console.log(`Filtered to ${filteredTypes.length} types`);

// Group by namespace
const byNamespace = {};
for (const t of filteredTypes) {
  const ns = t.Namespace || '(global)';
  if (!byNamespace[ns]) byNamespace[ns] = [];
  byNamespace[ns].push(t);
}

// Sort within each namespace alphabetically
for (const ns of Object.keys(byNamespace)) {
  byNamespace[ns].sort((a, b) => a.Name.localeCompare(b.Name));
}

// Build ordered namespace list
const orderedNs = [];
for (const ns of NS_ORDER) {
  const lookupKey = ns === '' ? '(global)' : ns;
  if (byNamespace[lookupKey]) {
    orderedNs.push({ key: lookupKey, label: ns === '' ? '(global)' : ns });
  }
}
const remaining = Object.keys(byNamespace)
  .filter(ns => !orderedNs.find(o => o.key === ns))
  .sort();
for (const ns of remaining) {
  orderedNs.push({ key: ns, label: ns });
}

// Build output
const lines = [];

lines.push('# API Schema — Extended Reference');
lines.push('');
lines.push('Namespace-organized index of public s\\&box types **not** already covered in:');
lines.push('- `api-schema-core.md` — full signatures for ~50 most-used classes');
lines.push('- `components-builtin.md` — all 144 built-in Component-derived types');
lines.push('- `ui-razor.md`, `networking.md`, `input-and-physics.md` — those files include inline API');
lines.push('');
lines.push('**Purpose:** Discovery. Use this to answer "does this exist?" and "what does it do?".');
lines.push('Format: `MethodName( args ) → ReturnType` or `PropertyName : Type`');
lines.push('');

// Summary table
lines.push('## Namespace Summary');
lines.push('');
lines.push('| Namespace | Types | Notes |');
lines.push('|---|---|---|');
const NS_NOTES = {
  'Sandbox': 'Core runtime: animation, assets, services, scene utilities',
  '(global)': 'Math types (Vector2, Matrix), interfaces (IDamageable, ICollisionListener), animation events',
  'Sandbox.UI': 'Styling enums (Align, FlexDirection, etc.), CSS value types (Length, Shadow)',
  'Sandbox.Network': 'Bandwidth stats, network message types',
  'Sandbox.Physics': 'Physics helpers, collision primitives',
  'Sandbox.Audio': 'DSP processors, audio graph nodes',
  'Sandbox.VR': 'VR input, hand tracking, controller data',
  'Sandbox.Rendering': 'Render targets, materials, post-processing API',
  'Sandbox.Resources': 'Resource loading, asset management',
  'Sandbox.Services': 'Leaderboards, achievements, stats, server browser',
  'Sandbox.Diagnostics': 'Performance profiling, allocations',
  'Sandbox.Utility': 'Noise, SVG, general utilities',
  'Sandbox.Navigation': 'NavMesh path, link, area types',
  'Sandbox.Movement': 'Movement helpers',
  'Sandbox.Clutter': 'Clutter/scatter system',
  'Sandbox.Volumes': 'Volume primitives',
  'Sandbox.ActionGraphs': 'Visual scripting graph types',
};
for (const { key, label } of orderedNs) {
  const note = NS_NOTES[label] || NS_NOTES[key] || '';
  lines.push(`| \`${label}\` | ${byNamespace[key].length} | ${note} |`);
}
lines.push('');
lines.push('---');
lines.push('');

let totalTypes = 0;

for (const { key, label } of orderedNs) {
  const types = byNamespace[key];
  if (!types || types.length === 0) continue;

  totalTypes += types.length;

  const nsDisplay = label === '(global)' ? '(Global Namespace)' : label;
  lines.push(`## ${nsDisplay}`);
  lines.push('');

  for (const t of types) {
    const group = t.Group || 'class';
    lines.push(`### ${t.Name} (${group})`);

    const summary = t.Documentation && t.Documentation.Summary
      ? truncateSummary(t.Documentation.Summary, 120)
      : '';
    if (summary) {
      lines.push(summary);
    }

    if (group === 'enum') {
      const vals = formatEnumValues(t);
      if (vals) {
        lines.push(`Values: ${vals}`);
      }
    } else {
      const members = getKeyMembers(t, 5);
      if (members.length > 0) {
        lines.push('- ' + members.join(', '));
      }
    }

    lines.push('');
  }
}

lines.push('---');
lines.push('');
lines.push(`*Generated from raw/api-schema.json — ${totalTypes} types across ${orderedNs.length} namespaces.*`);

const output = lines.join('\n');
fs.writeFileSync(OUTPUT_PATH, output, 'utf8');

console.log(`\nWritten to ${OUTPUT_PATH}`);
console.log(`Total lines: ${lines.length}`);
console.log(`Total types: ${totalTypes}`);
console.log('\nNamespace breakdown:');
orderedNs.forEach(n => console.log(`  ${n.label || '(global)'}: ${byNamespace[n.key].length}`));
