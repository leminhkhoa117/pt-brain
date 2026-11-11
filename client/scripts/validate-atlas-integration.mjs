/**
 * Validate the repacked Human Atlas assets and the PT Brain metadata bridge.
 * Run with: node scripts/validate-atlas-integration.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const modelsDir = path.resolve(here, '..', 'public', 'models', 'human-atlas');
const atlas = JSON.parse(fs.readFileSync(path.join(modelsDir, 'atlas.json'), 'utf8'));

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(atlas.parts.length === 2234, `Expected 2,234 parts, got ${atlas.parts.length}`);
assert(atlas.concepts.length === 3432, `Expected 3,432 concepts, got ${atlas.concepts.length}`);
assert(atlas.chunks.length === 15, `Expected 15 system chunks, got ${atlas.chunks.length}`);

const partIds = new Set();
const conceptsById = new Map(atlas.concepts.map((concept) => [concept.id, concept]));
const chunks = new Map();

for (const part of atlas.parts) {
  assert(!partIds.has(part.id), `Duplicate part id ${part.id}`);
  partIds.add(part.id);
  assert(conceptsById.has(part.conceptId), `${part.id}: unknown concept ${part.conceptId}`);
  const chunk = atlas.chunks[part.chunk];
  assert(chunk, `${part.id}: unknown chunk ${part.chunk}`);
  if (!chunks.has(part.chunk)) {
    const gz = fs.readFileSync(path.join(modelsDir, path.basename(chunk.gzip)));
    const raw = zlib.gunzipSync(gz);
    assert(raw.length === chunk.bytes, `${part.chunk}: byte length mismatch`);
    chunks.set(part.chunk, raw);
  }
  const raw = chunks.get(part.chunk);
  assert(
    part.positions + part.vertexCount * 12 <= raw.length,
    `${part.id}: positions out of range`,
  );
  assert(part.normals + part.vertexCount * 6 <= raw.length, `${part.id}: normals out of range`);
  assert(part.indices + part.indexCount * 4 <= raw.length, `${part.id}: indices out of range`);
  const indices = new Uint32Array(raw.buffer, raw.byteOffset + part.indices, part.indexCount);
  for (const index of indices)
    assert(index < part.vertexCount, `${part.id}: invalid index ${index}`);
}

for (const concept of atlas.concepts) {
  assert(concept.elements.length > 0, `${concept.id}: empty concept`);
  for (const id of concept.elements) assert(partIds.has(id), `${concept.id}: missing part ${id}`);
}

const systems = [...new Set(atlas.parts.map((part) => part.system))].sort();
const counts = Object.fromEntries(
  systems.map((system) => [system, atlas.parts.filter((part) => part.system === system).length]),
);

const { ATLAS_MUSCLE_CONCEPTS, ATLAS_MUSCLE_KEYWORDS } =
  await import('../src/pages/atlas/atlasMuscleMap.js');
const { MUSCLES } = await import('../../shared/muscles/index.js');

const allPartNames = atlas.parts.map((part) => part.name.toLowerCase());
const missing = [];
for (const slug of Object.keys(MUSCLES)) {
  const conceptIds = ATLAS_MUSCLE_CONCEPTS[slug] ?? [];
  const keywordRow = ATLAS_MUSCLE_KEYWORDS.find((row) => row.slug === slug);
  const byConcept = conceptIds.some((id) => conceptsById.has(id));
  const byKeyword = (keywordRow?.keywords ?? []).some((keyword) =>
    allPartNames.some((name) => name.includes(keyword)),
  );
  if (!byConcept && !byKeyword) missing.push(slug);
}

assert(
  missing.length === 5,
  `Expected 5 source-unavailable muscles, got ${missing.length}: ${missing.join(', ')}`,
);

console.log(
  `Atlas OK: ${atlas.parts.length} meshes, ${atlas.concepts.length} concepts, ${atlas.chunks.length} gzip system chunks.`,
);
console.log(`Systems: ${systems.map((system) => `${system}=${counts[system]}`).join(', ')}`);
console.log(
  `Curated PT Brain muscles: ${Object.keys(MUSCLES).length}; mapped: ${Object.keys(MUSCLES).length - missing.length}; source-unavailable: ${missing.join(', ')}`,
);
