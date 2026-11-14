/**
 * Trích nhãn + chú thích của hình/bảng từ text (PDF theo từng trang hoặc HTML).
 * Chỉ nhận dòng bắt đầu bằng "Fig. 1." / "Figure 2:" / "Table 3." để tránh
 * nhầm với câu văn nhắc tới hình ("as shown in fig. 1").
 */

const LABEL_LINE =
  /^\s*(fig(?:ure)?\.?|table)\s*(\d+[a-z]?)\s*[.:]\s*(.+)$/i;
const NEXT_LABEL = /^\s*(fig(?:ure)?\.?|table)\s*\d+[a-z]?\s*[.:]/i;
const STOP_LINE =
  /^\s*(references?|bibliography|acknowledg(e)?ments?|discussion|results?|methods?|introduction|conclusion|supplementary|downloaded from|by guest on|all rights reserved|copyright)\b/i;

const MAX_CAPTION = 500;
const MAX_HINTS = 20;

function cleanLine(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

/** Chuẩn hóa nhãn để so khớp giữa AI và chú thích gốc: "Fig. 1" -> "figure 1". */
export function normalizeFigureLabel(value = '') {
  const normalized = String(value)
    .toLowerCase()
    .replace(/\bfig(?:ure)?\.?\b/g, 'figure')
    .replace(/\bhình\b/g, 'figure')
    .replace(/\bbảng\b/g, 'table')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  const match = normalized.match(/^(figure|table)\s*(\d+[a-z]?)$/);
  return match ? `${match[1]} ${match[2]}` : normalized;
}

function captionFrom(lines, startIndex) {
  const first = cleanLine(lines[startIndex].match(LABEL_LINE)?.[3] || '');
  const parts = first ? [first] : [];
  let length = first.length;

  // Chú thích ngắn kiểu "Experimental setup." thường là trọn câu; không dán body text phía sau.
  if (first.length <= 60 && /[.!?]$/.test(first)) {
    return cleanLine(first).slice(0, MAX_CAPTION);
  }

  for (let i = startIndex + 1; i < lines.length && parts.length < 4; i += 1) {
    const next = cleanLine(lines[i]);
    if (!next) break;
    if (NEXT_LABEL.test(next) || STOP_LINE.test(next)) break;
    if (/^(doi|https?:\/\/|www\.)/i.test(next)) break;
    if (/^(during|in the present|the present|these data|subjects were|participants were)\b/i.test(next)) {
      break;
    }
    if (length + next.length > MAX_CAPTION) break;
    parts.push(next);
    length += next.length;
  }

  return cleanLine(parts.join(' ')).slice(0, MAX_CAPTION);
}

/** pageTexts: mảng text theo thứ tự trang (index 0 = trang 1). */
export function extractFigureHintsFromPages(pageTexts = []) {
  const hints = [];
  const seen = new Set();

  pageTexts.forEach((pageText, pageIndex) => {
    const lines = String(pageText || '').split('\n');
    lines.forEach((line, lineIndex) => {
      const match = line.match(LABEL_LINE);
      if (!match) return;
      const kind = /^table/i.test(match[1]) ? 'table' : 'figure';
      const label = `${kind === 'figure' ? 'Figure' : 'Table'} ${match[2]}`;
      const key = normalizeFigureLabel(label);
      if (seen.has(key)) return;

      const caption = captionFrom(lines, lineIndex);
      if (caption.length < 12) return;

      seen.add(key);
      hints.push({ label, kind, page: pageIndex + 1, caption });
    });
  });

  return hints.slice(0, MAX_HINTS);
}

/** Dùng cho nguồn HTML/text không có số trang. */
export function extractFigureHints(text = '') {
  return extractFigureHintsFromPages([text]).map((hint) => ({ ...hint, page: 0 }));
}
