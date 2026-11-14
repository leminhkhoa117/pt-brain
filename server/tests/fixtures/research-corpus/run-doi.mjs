import fs from 'node:fs';
import path from 'node:path';
import { resolveWorkByDoi } from '../../../src/services/research/metadata.js';
import { extractFigureHints } from '../../../src/services/research/figures.js';
import { summarizePaper } from '../../../src/services/ai/paperSummarizer.js';

const doi = process.argv[2];
const slug = process.argv[3] || doi?.replace(/[^a-z0-9]+/gi, '-').slice(0, 60);
if (!doi) {
  console.error('Cách dùng: node run-doi.mjs <DOI> [slug]');
  process.exit(1);
}

console.log('Resolving DOI:', doi);
const resolved = await resolveWorkByDoi(doi);
console.log('Nguồn:', resolved.basedOn, '| chars:', resolved.text.length);
console.log('Title:', resolved.paper.title);

const result = await summarizePaper({
  paper: resolved.paper,
  text: resolved.text,
  basedOn: resolved.basedOn,
  figureHints: extractFigureHints(resolved.text),
  onProgress: (message) => console.log('PROGRESS:', message),
});

const out = path.join(process.cwd(), `${slug}-summary.json`);
fs.writeFileSync(out, JSON.stringify(result, null, 2));
console.log('Đã ghi:', out);
console.log('Verification:', JSON.stringify(result.content.verification, null, 2));
