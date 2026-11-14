/**
 * Tổng quan thư mục từ chính danh sách kết quả đã xếp hạng — không gọi thêm API,
 * không dùng sentiment heuristic. Chỉ trả về dữ kiện để UI hiển thị.
 */

const toRef = (item = {}) => ({
  title: item.title || '',
  authors: (item.authors || []).slice(0, 3),
  year: item.year || undefined,
  journal: item.journal || '',
  doi: item.doi || '',
  citationCount: item.citationCount || 0,
});

function countValues(values = []) {
  const counts = new Map();
  for (const raw of values) {
    const value = String(raw || '').trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function buildLandscape(
  results = [],
  { currentYear = new Date().getFullYear(), limit = 4 } = {},
) {
  const seminal = [...results]
    .filter((item) => item.year && item.year <= currentYear - 5)
    .sort(
      (a, b) =>
        (b.citationCount || 0) - (a.citationCount || 0) || (a.year || 0) - (b.year || 0),
    )
    .slice(0, limit)
    .map(toRef);

  const recent = [...results]
    .filter((item) => item.year && item.year >= currentYear - 3)
    .sort(
      (a, b) =>
        (b.year || 0) - (a.year || 0) || (b.citationCount || 0) - (a.citationCount || 0),
    )
    .slice(0, limit)
    .map(toRef);

  const venues = countValues(results.map((item) => item.journal))
    .slice(0, limit)
    .map(([venue, count]) => ({ venue, count }));

  const authors = countValues(results.flatMap((item) => item.authors || []))
    .slice(0, limit)
    .map(([author, count]) => ({ author, count }));

  return { seminal, recent, venues, authors };
}
