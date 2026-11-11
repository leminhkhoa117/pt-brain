/**
 * Repack the Human Atlas geometry from the upstream mixed batches into one
 * compressed chunk per anatomical system. This is what makes system-level
 * lazy loading useful: opening the muscle page only downloads muscle/skeleton
 * geometry instead of the whole body.
 *
 * Usage:
 *   node scripts/split-atlas-by-system.mjs <source-models-dir> <output-dir>
 *
 * Source files are the upstream `atlas.json` plus body-0.bin ... body-N.bin.
 * Output is `atlas.json` plus one `.bin.gz` per system (no uncompressed bins).
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const SYSTEM_ORDER = [
  'muscular',
  'skeletal',
  'connective',
  'nervous',
  'sensory',
  'cardiac',
  'arterial',
  'venous',
  'respiratory',
  'digestive',
  'urinary',
  'lymphatic',
  'endocrine',
  'reproductive',
  'integumentary',
];

const sourceDir = process.argv[2];
const outputDir = process.argv[3];

if (!sourceDir || !outputDir) {
  console.error('Usage: node scripts/split-atlas-by-system.mjs <source-models-dir> <output-dir>');
  process.exit(1);
}

const sourceAtlasPath = path.resolve(sourceDir, 'atlas.json');
const atlas = JSON.parse(fs.readFileSync(sourceAtlasPath, 'utf8'));
const sourceBuffers = atlas.chunks.map((chunk) =>
  Buffer.from(fs.readFileSync(path.resolve(sourceDir, path.basename(chunk.url)))),
);

// The upstream display-system grouping puts a handful of obvious muscles in
// the skeletal layer. Correct them before repacking so our muscle metadata,
// colors and filter behave consistently.
const MUSCLE_SYSTEM_OVERRIDES = new Set([
  'fibularis brevis',
  'fibularis longus',
  'fibularis tertius',
  'tibialis anterior',
  'tibialis posterior',
  'subscapularis',
  'levator scapulae',
]);
for (const part of atlas.parts) {
  const baseName = part.name.replace(/^(Left|Right) /, '').toLowerCase();
  if (MUSCLE_SYSTEM_OVERRIDES.has(baseName)) part.system = 'muscular';
}

const align = (value, boundary) => Math.ceil(value / boundary) * boundary;

const partsBySystem = new Map();
for (const part of atlas.parts) {
  const list = partsBySystem.get(part.system) ?? [];
  list.push(part);
  partsBySystem.set(part.system, list);
}

fs.mkdirSync(outputDir, { recursive: true });

const chunks = [];
const stats = [];

for (const [chunkIndex, system] of SYSTEM_ORDER.entries()) {
  const parts = partsBySystem.get(system);
  if (!parts?.length) continue;

  // First pass: calculate an aligned layout for this system's parts.
  let cursor = 0;
  const records = parts.map((part) => {
    const source = sourceBuffers[part.chunk];
    if (!source) throw new Error(`${part.id}: missing source chunk ${part.chunk}`);

    const positionBytes = part.vertexCount * 3 * 4;
    const normalBytes = part.vertexCount * 3 * 2;
    const indexBytes = part.indexCount * 4;

    cursor = align(cursor, 4);
    const positions = cursor;
    cursor += positionBytes;

    cursor = align(cursor, 2);
    const normals = cursor;
    cursor += normalBytes;

    cursor = align(cursor, 4);
    const indices = cursor;
    cursor += indexBytes;

    if (
      part.positions + positionBytes > source.length ||
      part.normals + normalBytes > source.length ||
      part.indices + indexBytes > source.length
    ) {
      throw new Error(`${part.id}: source data exceeds chunk ${part.chunk}`);
    }

    return { part, source, positions, normals, indices, positionBytes, normalBytes, indexBytes };
  });

  const raw = Buffer.allocUnsafe(cursor);
  for (const record of records) {
    const { part, source } = record;
    source.copy(raw, record.positions, part.positions, part.positions + record.positionBytes);
    source.copy(raw, record.normals, part.normals, part.normals + record.normalBytes);
    source.copy(raw, record.indices, part.indices, part.indices + record.indexBytes);

    const positionsView = new Float32Array(
      raw.buffer,
      raw.byteOffset + record.positions,
      part.vertexCount * 3,
    );
    for (const value of positionsView) {
      if (!Number.isFinite(value)) throw new Error(`${part.id}: invalid position`);
    }

    const indicesView = new Uint32Array(
      raw.buffer,
      raw.byteOffset + record.indices,
      part.indexCount,
    );
    for (const index of indicesView) {
      if (index >= part.vertexCount) throw new Error(`${part.id}: invalid vertex index ${index}`);
    }
  }

  const compressed = zlib.gzipSync(raw, { level: 9 });
  const filename = `${system}.bin`;
  fs.writeFileSync(path.join(outputDir, `${filename}.gz`), compressed);

  for (const record of records) {
    record.part.chunk = chunkIndex;
    record.part.positions = record.positions;
    record.part.normals = record.normals;
    record.part.indices = record.indices;
  }

  chunks[chunkIndex] = {
    url: `/models/human-atlas/${filename}`,
    gzip: `/models/human-atlas/${filename}.gz`,
    bytes: raw.length,
    gzipBytes: compressed.length,
  };

  stats.push({ system, parts: parts.length, raw, compressed });
}

// Preserve the upstream chunk indexes for any system not in our order list.
for (const [system, parts] of partsBySystem) {
  if (SYSTEM_ORDER.includes(system)) continue;
  throw new Error(
    `Unknown system "${system}" contains ${parts.length} parts; add it to SYSTEM_ORDER.`,
  );
}

atlas.chunks = chunks;
atlas.triangles = atlas.parts.reduce((sum, part) => sum + part.indexCount / 3, 0);

fs.writeFileSync(path.join(outputDir, 'atlas.json'), JSON.stringify(atlas));

const totalRaw = stats.reduce((sum, row) => sum + row.raw.length, 0);
const totalGzip = stats.reduce((sum, row) => sum + row.compressed.length, 0);
console.log(
  `Repacked ${atlas.parts.length} meshes into ${stats.length} system chunks — ${(
    totalRaw / 1048576
  ).toFixed(1)} MB raw / ${(totalGzip / 1048576).toFixed(1)} MB gzip`,
);
for (const row of stats) {
  console.log(
    `  ${row.system.padEnd(15)} ${String(row.parts).padStart(4)} meshes  ${(
      row.raw.length / 1048576
    ).toFixed(1)} MB → ${(row.compressed.length / 1048576).toFixed(1)} MB`,
  );
}
