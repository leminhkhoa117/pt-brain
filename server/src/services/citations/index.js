/**
 * Sinh trích dẫn từ metadata đã lưu — không gọi AI, không gọi API ngoài.
 * Hỗ trợ BibTeX, RIS và APA 7 ở mức đủ dùng cho PT viết bài/báo cáo.
 */

export const CITATION_STYLES = ['bibtex', 'ris', 'apa'];

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

const ascii = (value) =>
  clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim();

/**
 * Tách tên tác giả ở 2 dạng đang có trong dữ liệu:
 * - "Brad J Schoenfeld" (given + family, Crossref/OpenAlex)
 * - "Carvalho L" / "Schoenfeld BJ" (family + initials, Europe PMC/PubMed)
 */
export function splitAuthorName(name) {
  const parts = clean(name).split(' ').filter(Boolean);
  if (!parts.length) return { family: '', given: '' };
  if (parts.length === 1) return { family: parts[0], given: '' };

  const last = parts[parts.length - 1];
  if (/^[A-Z]{1,3}$/.test(last)) {
    return { family: parts.slice(0, -1).join(' '), given: last.split('').join(' ') };
  }
  return { family: last, given: parts.slice(0, -1).join(' ') };
}

function bibAuthor(name) {
  const { family, given } = splitAuthorName(name);
  if (!family) return '';
  return given ? `${family}, ${given}` : family;
}

function authorsOf(paper = {}) {
  return (Array.isArray(paper.authors) ? paper.authors : [])
    .map((author) => clean(author))
    .filter(Boolean);
}

function splitPages(value) {
  const raw = clean(value);
  if (!raw) return { start: '', end: '' };
  const match = raw.match(/^(.+?)\s*[–-]\s*(.+)$/);
  return match ? { start: match[1].trim(), end: match[2].trim() } : { start: raw, end: '' };
}

function yearOf(paper = {}) {
  const year = Number(paper.year);
  return Number.isFinite(year) && year > 0 ? String(year) : '';
}

function doiOf(paper = {}) {
  const doi = clean(paper.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  return doi.toLowerCase();
}

function escapeBib(value) {
  return clean(value)
    .replace(/\\/g, '')
    .replace(/([&%#$])/g, '\\$1');
}

function bibType(paper = {}) {
  const types = (paper.publicationTypes || []).join(' ').toLowerCase();
  if (/conference|proceedings/.test(types)) return 'inproceedings';
  if (/book|chapter/.test(types)) return 'book';
  return 'article';
}

function bibKey(paper = {}) {
  const { family } = splitAuthorName(authorsOf(paper)[0] || paper.title || 'paper');
  const keyFamily = ascii(family) || 'paper';
  const titleWord = ascii(paper.title || '')
    .split(' ')
    .filter((word) => word.length > 2)[0] || 'work';
  return `${keyFamily}${yearOf(paper) || 'nd'}${titleWord}`.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
}

export function toBibtex(paper = {}) {
  const authors = authorsOf(paper);
  const pages = splitPages(paper.pages);
  const fields = [];
  if (authors.length) fields.push(`  author = {${authors.map(bibAuthor).filter(Boolean).map(escapeBib).join(' and ')}}`);
  if (paper.title) fields.push(`  title = {${escapeBib(paper.title)}}`);
  if (paper.journal) fields.push(`  journal = {${escapeBib(paper.journal)}}`);
  if (yearOf(paper)) fields.push(`  year = {${yearOf(paper)}}`);
  if (paper.volume) fields.push(`  volume = {${escapeBib(paper.volume)}}`);
  if (paper.issue) fields.push(`  number = {${escapeBib(paper.issue)}}`);
  if (pages.start) fields.push(`  pages = {${escapeBib(pages.start)}${pages.end ? `--${escapeBib(pages.end)}` : ''}}`);
  if (doiOf(paper)) fields.push(`  doi = {${doiOf(paper)}}`);
  if (paper.url) fields.push(`  url = {${clean(paper.url)}}`);

  return `@${bibType(paper)}{${bibKey(paper)},\n${fields.join(',\n')}\n}\n`;
}

/** "Brad J Schoenfeld" -> "Schoenfeld, B. J."; "Carvalho L" -> "Carvalho, L." */
export function apaAuthor(name) {
  const { family, given } = splitAuthorName(name);
  if (!family) return '';
  if (!given) return family;
  const initials = given
    .split(' ')
    .map((part) => {
      const letters = part.replace(/[^A-Za-zÀ-ỹ]/g, '');
      return letters ? `${letters[0].toUpperCase()}.` : '';
    })
    .filter(Boolean)
    .join(' ');
  return `${family}, ${initials}`;
}

export function apaAuthors(names = []) {
  const list = names.map(apaAuthor).filter(Boolean);
  if (!list.length) return '';
  if (list.length === 1) return list[0];
  if (list.length <= 20) return `${list.slice(0, -1).join(', ')}, & ${list[list.length - 1]}`;
  return `${list.slice(0, 19).join(', ')}, … ${list[list.length - 1]}`;
}

export function toApa(paper = {}) {
  const authors = apaAuthors(authorsOf(paper));
  const year = yearOf(paper) || 'n.d.';
  const title = clean(paper.title).replace(/\.$/, '');
  const journal = clean(paper.journal);
  const volume = clean(paper.volume);
  const issue = clean(paper.issue);
  const pages = splitPages(paper.pages);
  const doi = doiOf(paper);

  const source = journal
    ? `${journal}${volume ? `, ${volume}` : ''}${issue ? `(${issue})` : ''}${
        pages.start ? `, ${pages.start}${pages.end ? `–${pages.end}` : ''}` : ''
      }.`
    : '';

  return [
    authors ? `${authors} ` : '',
    `(${year}). `,
    title ? `${title}. ` : '',
    source ? `${source} ` : '',
    doi ? `https://doi.org/${doi}` : clean(paper.url),
  ]
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toRis(paper = {}) {
  const lines = ['TY  - JOUR'];
  for (const author of authorsOf(paper)) lines.push(`AU  - ${bibAuthor(author)}`);
  if (paper.title) lines.push(`TI  - ${clean(paper.title)}`);
  if (paper.journal) lines.push(`JO  - ${clean(paper.journal)}`);
  if (yearOf(paper)) lines.push(`PY  - ${yearOf(paper)}`);
  if (paper.volume) lines.push(`VL  - ${clean(paper.volume)}`);
  if (paper.issue) lines.push(`IS  - ${clean(paper.issue)}`);
  const pages = splitPages(paper.pages);
  if (pages.start) lines.push(`SP  - ${pages.start}`);
  if (pages.end) lines.push(`EP  - ${pages.end}`);
  if (doiOf(paper)) lines.push(`DO  - ${doiOf(paper)}`);
  if (paper.url) lines.push(`UR  - ${clean(paper.url)}`);
  lines.push('ER  - ');
  return `${lines.join('\n')}\n`;
}

export function formatCitation(paper = {}, style = 'bibtex') {
  const normalized = String(style || '').toLowerCase();
  if (normalized === 'bibtex' || normalized === 'bib') return toBibtex(paper);
  if (normalized === 'ris') return toRis(paper);
  if (normalized === 'apa') return toApa(paper);
  throw new Error(`Định dạng trích dẫn không hỗ trợ: ${style}`);
}
