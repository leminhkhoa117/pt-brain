/**
 * Kiểm tra độ phủ của knowledge base xương/mô liên kết trên toàn bộ atlas.
 * Chạy: npm --prefix client run validate:atlas-anatomy
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAtlasStructure } from '../../shared/anatomy/index.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const atlasPath = path.resolve(root, '../public/models/human-atlas/atlas.json');
const atlas = JSON.parse(fs.readFileSync(atlasPath, 'utf8'));
const conceptById = new Map(atlas.concepts.map((concept) => [concept.id, concept]));
const systems = new Set(['skeletal', 'connective']);
const unique = new Map();

for (const part of atlas.parts) {
  if (!systems.has(part.system)) continue;
  const concept = conceptById.get(part.conceptId);
  if (!concept) continue;
  const key = `${part.system}:${concept.id}`;
  if (unique.has(key)) continue;
  unique.set(key, {
    concept,
    system: part.system,
    resolved: resolveAtlasStructure({ id: concept.id, name: concept.name, system: part.system }),
  });
}

const items = [...unique.values()];
const missing = items.filter((item) => !item.resolved);
const generated = items.filter((item) => item.resolved?.generated);
const curated = items.filter((item) => item.resolved && !item.resolved.generated);
const byKind = items.reduce((acc, item) => {
  const key = item.resolved?.kind || 'missing';
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

console.log(`Atlas concepts (skeletal + connective): ${items.length}`);
console.log(`  curated metadata : ${curated.length}`);
console.log(`  generated fallback: ${generated.length}`);
console.log(`  missing           : ${missing.length}`);
console.log('By kind:', byKind);

if (missing.length) {
  console.error('\nMissing structures:');
  for (const item of missing) console.error(`- ${item.concept.id} ${item.concept.name} (${item.system})`);
  process.exitCode = 1;
}

if (generated.length) {
  console.log('\nGenerated (name-rule) examples:');
  for (const item of generated.slice(0, 12)) {
    console.log(`- ${item.concept.id} ${item.concept.name} -> ${item.resolved.vi}`);
  }
}
