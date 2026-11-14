import fs from 'node:fs';
import path from 'node:path';
import { parsePdfBuffer } from '../../../src/services/research/pdf.js';
import { enrichPaperMetadata } from '../../../src/services/research/metadata.js';
import { summarizePaper } from '../../../src/services/ai/paperSummarizer.js';

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error('Cách dùng: node run-sample.mjs <đường-dẫn-PDF> [tên-file-gốc.pdf]');
  process.exit(1);
}

const buffer = fs.readFileSync(pdfPath);
const originalName = process.argv[3] || path.basename(pdfPath);
const parsed = await parsePdfBuffer(buffer, { filename: originalName });
console.log('PDF title (chưa Crossref):', parsed.title);
console.log('Pages:', parsed.pages, 'Chars:', parsed.text.length);

const paper = await enrichPaperMetadata(
  {
    title: parsed.title,
    authors: [],
    url: '',
    publicationTypes: [],
    evidenceLevel: 5,
    source: 'manual',
  },
  { text: parsed.text, filename: originalName },
);
console.log('Crossref:', JSON.stringify({
  title: paper.title,
  authors: paper.authors,
  year: paper.year,
  journal: paper.journal,
  volume: paper.volume,
  issue: paper.issue,
  pages: paper.pages,
  doi: paper.doi,
}, null, 2));

const result = await summarizePaper({
  paper,
  text: parsed.text,
  basedOn: 'fulltext',
  figureHints: parsed.figureHints,
  onProgress: (message) => console.log('PROGRESS:', message),
});

const base = path.basename(pdfPath, path.extname(pdfPath));
const outPath = path.join(process.cwd(), `${base}-summary.json`);
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log('Đã ghi:', outPath);
console.log('Verification:', JSON.stringify(result.content.verification, null, 2));
