const quoteTerm = (term = '') => `"${String(term).replace(/"/g, '').trim()}"`;

/** Tạo truy vấn mở rộng từ concept khi kết quả ban đầu quá ít. */
export function buildExpandedQueries(concepts = []) {
  const groups = (Array.isArray(concepts) ? concepts : [])
    .filter((concept) => concept && Array.isArray(concept.terms) && concept.terms.length)
    .slice(0, 3);
  if (groups.length < 2) return [];

  const primary = groups[0].terms
    .slice(0, 4)
    .map(quoteTerm)
    .filter(Boolean)
    .join(' OR ');
  if (!primary) return [];

  return [
    ...new Set(
      groups.slice(1, 3).map((group) => {
        const secondary = group.terms
          .slice(0, 4)
          .map(quoteTerm)
          .filter(Boolean)
          .join(' OR ');
        return `(${primary}) AND (${secondary})`.slice(0, 220);
      }),
    ),
  ];
}
