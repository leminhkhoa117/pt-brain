/**
 * Đọc text PDF theo đúng thứ tự đọc của bố cục nhiều cột.
 *
 * pdf-parse/pdfjs trả các "line" đã gộp theo trục y. Với PDF 2 cột, hai dòng
 * của cột trái và cột phải thường cùng y nên bị ghép thành một dòng, làm lẫn
 * nội dung (đặc biệt là chú thích hình). Module này:
 *   1. Gom item thành dòng theo y.
 *   2. Tách một dòng thành nhiều "run" nếu có khoảng trống ngang lớn (cột).
 *   3. Gom các dòng theo x-start thành cột, đọc cột trái -> cột phải.
 *   4. Đưa header/footer ra đầu/cuối trang.
 */

const Y_TOLERANCE = 2.5;
const COLUMN_GAP = 8;
const COLUMN_X_GAP = 40;
const HEADER_ZONE = 0.08;
const FOOTER_ZONE = 0.08;

function itemBox(item) {
  const x = Number(item.transform?.[4]);
  const y = Number(item.transform?.[5]);
  const height = Number(item.height) || Math.abs(Number(item.transform?.[3])) || 8;
  const width =
    Number(item.width) ||
    Math.max(1, String(item.str || '').length * height * 0.35);
  return { x, y, width, height, text: String(item.str || '') };
}

function buildLine(items) {
  let text = '';
  let previous = null;
  for (const item of items) {
    if (previous) {
      const gap = item.x - previous.end;
      if (gap > Math.max(1.2, item.height * 0.12)) text += ' ';
    }
    text += item.text;
    previous = { end: item.x + item.width };
  }
  const first = items[0];
  const last = previous;
  return {
    x: first.x,
    x1: last?.end || first.x + first.width,
    y: first.y,
    height: first.height,
    text: text.replace(/\s+/g, ' ').trim(),
  };
}

/** Gom item thành dòng; tách dòng khi có gutter ngang giữa hai cột. */
export function buildPdfLines(items = []) {
  const usable = items
    .filter((item) => item && String(item.str || '').trim())
    .map(itemBox)
    .filter((item) => Number.isFinite(item.x) && Number.isFinite(item.y));

  const rows = [];
  for (const item of usable.sort((a, b) => b.y - a.y || a.x - b.x)) {
    let row = rows.find((candidate) => Math.abs(candidate.y - item.y) <= Y_TOLERANCE);
    if (!row) {
      row = { y: item.y, items: [] };
      rows.push(row);
    }
    row.items.push(item);
  }

  const lines = [];
  for (const row of rows) {
    const sorted = row.items.sort((a, b) => a.x - b.x);
    let run = [];
    let runEnd = null;
    for (const item of sorted) {
      if (runEnd !== null && item.x - runEnd > COLUMN_GAP) {
        if (run.length) lines.push(buildLine(run));
        run = [];
      }
      run.push(item);
      runEnd = item.x + item.width;
    }
    if (run.length) lines.push(buildLine(run));
  }

  return lines.filter((line) => line.text.length > 0);
}

/** Gộp các mảnh superscript/page-number nhỏ vào dòng gần nhất để không tạo cột giả. */
function mergeFragments(lines) {
  const kept = [];
  const orphans = [];
  for (const line of lines) {
    const plain = line.text.normalize('NFD').replace(/\p{M}/gu, '');
    const isFragment =
      line.text.length <= 3 &&
      !/[a-zA-Z]{2}/.test(plain) &&
      /^[\d,.\s']+$/.test(plain);
    if (!isFragment) {
      kept.push(line);
      continue;
    }
    const target = kept.find(
      (candidate) =>
        Math.abs(candidate.y - line.y) <= 12 &&
        line.x >= candidate.x - 2 &&
        line.x <= candidate.x1 + 24,
    );
    if (target) target.text = `${target.text}${line.text}`;
    else orphans.push(line);
  }
  return [...kept, ...orphans];
}

function clusterByX(lines) {
  const starts = [...new Set(lines.map((line) => Math.round(line.x * 10) / 10))].sort(
    (a, b) => a - b,
  );
  const clusters = [];
  let current = [];
  for (const start of starts) {
    if (!current.length || start - current[current.length - 1] <= COLUMN_X_GAP) {
      current.push(start);
    } else {
      clusters.push(current);
      current = [start];
    }
  }
  if (current.length) clusters.push(current);

  return clusters.map((values) => ({
    min: values[0],
    max: values[values.length - 1],
    lines: [],
  }));
}

/**
 * @param {Array} items - textContent.items của pdfjs
 * @param {number} pageHeight - chiều cao trang (view[3])
 * @returns {{text: string, columns: number}}
 */
export function orderPageItems(items = [], pageHeight = 0) {
  const lines = mergeFragments(buildPdfLines(items));
  if (!lines.length) return { text: '', columns: 0 };

  const headerY = pageHeight ? pageHeight * (1 - HEADER_ZONE) : Infinity;
  const footerY = pageHeight ? pageHeight * FOOTER_ZONE : -Infinity;
  const header = [];
  const footer = [];
  const body = [];

  for (const line of lines) {
    if (line.y >= headerY) header.push(line);
    else if (line.y <= footerY) footer.push(line);
    else body.push(line);
  }

  const allClusters = clusterByX(body);
  for (const line of body) {
    const cluster =
      allClusters.find(
        (candidate) => line.x >= candidate.min - 1 && line.x <= candidate.max + 1,
      ) || allClusters[allClusters.length - 1];
    cluster.lines.push(line);
  }
  const clusters = allClusters.filter((cluster) => cluster.lines.length >= 2);
  let ordered;
  if (clusters.length >= 2) {
    ordered = clusters
      .sort((a, b) => a.min - b.min)
      .flatMap((cluster) => cluster.lines.sort((a, b) => b.y - a.y));
  } else {
    ordered = body.sort((a, b) => b.y - a.y);
  }

  const byY = (a, b) => b.y - a.y;
  const text = [...header.sort(byY), ...ordered, ...footer.sort(byY)]
    .map((line) => line.text)
    .join('\n');

  return { text, columns: clusters.length >= 2 ? clusters.length : 1 };
}
