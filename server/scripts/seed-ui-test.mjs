import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { connectDb } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Paper } from '../src/models/Paper.js';
import { Summary } from '../src/models/Summary.js';
import { parsePdfBuffer, savePdfBuffer } from '../src/services/research/pdf.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const goldenPath = path.join(
  root,
  'tests/fixtures/research-corpus/sample-garcia-lopez-2010.json',
);
const pdfPath = path.join(
  root,
  'uploads/papers/1556f5d073d78d2080884f6d80c7f18990358276a4f1d8c8d2ef2340a01aafb0.pdf',
);

const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
const buffer = fs.readFileSync(pdfPath);
const parsed = await parsePdfBuffer(buffer, { filename: 'JSC201360 2449..2455.pdf' });
await savePdfBuffer(buffer, parsed.hash);

await connectDb(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pt-brain');

const email = 'ui-test@example.com';
const password = 'TestPass123!';
const passwordHash = await bcrypt.hash(password, 10);

let user = await User.findOne({ email });
if (!user) {
  user = await User.create({ email, name: 'UI Test PT', passwordHash, role: 'user' });
} else {
  user.passwordHash = passwordHash;
  user.name = 'UI Test PT';
  await user.save();
}

await Summary.deleteMany({ userId: user._id });
await Paper.deleteMany({ userId: user._id });

const paper = await Paper.create({
  userId: user._id,
  title: golden.content.metadata.title,
  authors: golden.content.metadata.authors,
  year: golden.content.metadata.year,
  journal: golden.content.metadata.journal,
  volume: golden.content.metadata.volume,
  issue: golden.content.metadata.issue,
  pages: golden.content.metadata.pages,
  doi: golden.content.metadata.doi,
  url: `https://doi.org/${golden.content.metadata.doi}`,
  publicationTypes: ['journal-article'],
  evidenceLevel: 2,
  source: 'manual',
});

function summaryPayload({ cacheKey, needsReview }) {
  const content = structuredClone(golden.content);
  if (needsReview) {
    content.verification = {
      passed: false,
      issues: ['Số 0.157 xuất hiện lặp ở hai mục.'],
      factsWarnings: [],
      rounds: 2,
    };
  } else {
    content.verification = { passed: true, issues: [], factsWarnings: [], rounds: 1 };
  }
  return {
    userId: user._id,
    paperId: paper._id,
    inputType: 'pdf',
    basedOn: 'fulltext',
    content,
    facts: golden.facts,
    sourceText: parsed.text,
    sourceUrl: '',
    sourceKind: 'user_pdf',
    pdfHash: parsed.hash,
    pdfPages: parsed.pages,
    figureHints: parsed.figureHints,
    cacheKey,
    promptVersion: 'v3',
    status: 'ready',
    progress: '',
    error: '',
    needsReview,
    tags: ['ui-test'],
  };
}

const verified = await Summary.create(
  summaryPayload({ cacheKey: 'ui-test-verified-v3', needsReview: false }),
);
const review = await Summary.create(
  summaryPayload({ cacheKey: 'ui-test-review-v3', needsReview: true }),
);

console.log('Seeded user:', email, '/', password);
console.log('Verified summary:', verified._id.toString());
console.log('Needs-review summary:', review._id.toString());
process.exit(0);
