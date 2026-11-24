const BOOLEAN_OPERATOR = /\b(AND|OR|NOT)\b/gi;

/**
 * Chuyển truy vấn Boolean/MeSH (dành cho PubMed/Europe PMC) sang cụm từ khóa
 * đơn giản cho OpenAlex/Crossref — các nguồn này không hiểu cú pháp Boolean.
 */
export function toPlainQuery(query = '') {
  if (!query) return '';
  return String(query)
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/["()*]/g, ' ')
    .replace(BOOLEAN_OPERATOR, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}
