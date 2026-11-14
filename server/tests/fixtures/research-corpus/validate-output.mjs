import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(fs.readFileSync(path.join(here, 'manifest.json'), 'utf8'));

const file = process.argv[2];
if (!file) {
  console.error('Cách dùng: node validate-output.mjs <summary.json> [doi|id]');
  process.exit(1);
}
const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
const content = payload.content || payload;
const doi = process.argv[3] || content.metadata?.doi || '';
const paper =
  manifest.papers.find(
    (item) => item.doi.toLowerCase() === String(doi).toLowerCase() || item.id === doi,
  ) || null;

const flat = JSON.stringify(content);
const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail });

const meta = content.metadata || {};
check('Tiêu đề có', meta.title, meta.title);
check('Tiêu đề không phải mã file', !/\.pdf|\.indd|^[A-Z0-9 ._-]{3,24}$/i.test(meta.title || ''), meta.title);
check('Tác giả có', meta.authors?.length, (meta.authors || []).join(', '));
check('Năm có', meta.year, String(meta.year));
check('Tạp chí có', meta.journal, meta.journal);
check('Trang có', meta.pages, meta.pages);
check('DOI đúng dạng', /^10\.\d{4,9}\//i.test(meta.doi || ''), meta.doi);
check('Kết luận có nội dung', content.authorsView?.conclusion && !/không nêu trong bài/i.test(content.authorsView.conclusion), content.authorsView?.conclusion);
check('30 giây đủ 3 dòng', content.quickRead?.lines?.length === 3, String(content.quickRead?.lines?.length));
check('Có "Dùng được cho PT chưa?"', content.quickRead?.readyForPt);
check('Có vì sao', content.whyStudy);
check('Có 3 trục', ['design', 'certainty', 'relevance'].every((key) => content.evidenceAxes?.[key]?.rating && content.evidenceAxes?.[key]?.reason));
check('Có 3 câu tự kiểm tra', content.selfCheck?.length === 3, String(content.selfCheck?.length));
check('Có >=4 thuật ngữ', (content.glossary || []).length >= 4, String(content.glossary?.length));
check('Có mục lợi ích', content.benefitSignals?.statement, content.benefitSignals?.statement);
check('Có 4 nhóm ứng dụng', Boolean(content.application && ['supported', 'hypothesis', 'notYet', 'unanswered'].every((key) => Array.isArray(content.application[key]))));
check('Nhãn mọi kết quả', (content.mainResults || []).every((item) => /^\[(Dữ kiện|Tác giả diễn giải|Nhận xét của AI)\]/.test(item.finding) && item.claimType));
check('Không "không có khác biệt"', !/không có khác biệt/i.test(flat));
check('Không "mỏi"', !/\bmỏi\b/i.test(flat));
check('Không "nhanh nhất"', !/nhanh nhất/i.test(flat));
check('Tự kiểm tra đạt', content.verification?.passed === true, JSON.stringify(content.verification?.issues || []));

if (paper?.expected) {
  const expected = paper.expected;
  for (const part of expected.titleIncludes || []) {
    check(`Tiêu đề chứa "${part}"`, new RegExp(part, 'i').test(meta.title || ''));
  }
  for (const number of expected.numbers || []) {
    check(`Số ${number}`, flat.includes(number));
  }
  for (const flag of expected.benefitFlags || []) {
    const text = (content.benefitSignals?.flags || []).map((item) => item.text).join(' ');
    check(`Cờ lợi ích "${flag}"`, new RegExp(flag, 'i').test(text));
  }
}

for (const item of checks) {
  console.log(`${item.pass ? 'PASS' : 'FAIL'} | ${item.name}${item.detail ? ` | ${item.detail}` : ''}`);
}
const failed = checks.filter((item) => !item.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} đạt`);
process.exit(failed.length ? 1 : 0);
