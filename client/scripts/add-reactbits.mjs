#!/usr/bin/env node
/**
 * Tải một component React Bits từ registry chính thức vào src/components/reactbits.
 *
 * Cách dùng:
 *   node scripts/add-reactbits.mjs CountUp
 *   node scripts/add-reactbits.mjs SplitText JS TW
 *   node scripts/add-reactbits.mjs SplitText TS TW
 *
 * React Bits phát hành component dưới dạng source, không phải package runtime.
 * Script này chỉ tải file; dependency (gsap, motion, ...) cài bằng npm.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [name, language = 'JS', styling = 'TW'] = process.argv.slice(2);

if (!name) {
  console.error('Usage: node scripts/add-reactbits.mjs <ComponentName> [JS|TS] [TW|CSS]');
  process.exit(1);
}

const lang = language.toUpperCase();
const style = styling.toUpperCase();
if (!['JS', 'TS'].includes(lang) || !['TW', 'CSS'].includes(style)) {
  console.error('Language must be JS or TS; styling must be TW or CSS.');
  process.exit(1);
}

const id = `${name}-${lang}-${style}`;
const registryUrl = `https://reactbits.dev/r/${id}.json`;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(root, 'src', 'components', 'reactbits');

const response = await fetch(registryUrl);
if (!response.ok) {
  console.error(`Registry returned ${response.status} for ${registryUrl}`);
  process.exit(1);
}

const item = await response.json();
for (const file of item.files || []) {
  const target = path.join(destination, file.path);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, file.content, 'utf8');
  console.log(`wrote ${path.relative(root, target)}`);
}

if (item.dependencies?.length) {
  console.log(`\nCài dependency:\n  npm install ${item.dependencies.join(' ')}`);
}
if (item.registryDependencies?.length) {
  console.log(`\nRegistry dependency (cần shadcn): ${item.registryDependencies.join(', ')}`);
}
