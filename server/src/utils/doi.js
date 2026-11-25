/** Chuẩn hóa DOI: bỏ URL/tiền tố "doi:", bỏ dấu câu cuối, bỏ version bioRxiv/medRxiv. */
export function normalizeDoi(value = '') {
  const cleaned = String(value)
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .replace(/[.,;)\]]+$/, '');
  // bioRxiv/medRxiv URL thường có hậu tố version (v1, v2...) không thuộc DOI.
  if (/^10\.(1101|64898)\//i.test(cleaned)) {
    return cleaned.replace(/v\d+$/i, '');
  }
  return cleaned;
}

/** Tìm DOI đầu tiên trong văn bản hoặc tên file. */
export function extractDoi(value = '') {
  const match = String(value).match(/\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/i);
  return match ? normalizeDoi(match[1]) : '';
}

/** DOI có thể nằm trong tên file kiểu "10.1519-JSC.0b013e3181e3482f.pdf". */
export function doiFromFilename(filename = '') {
  const direct = extractDoi(filename);
  if (direct) return direct;
  const cleaned = String(filename)
    .replace(/\.pdf$/i, '')
    .replace(/[_+]+/g, '/')
    .replace(/-/g, '/');
  const match = cleaned.match(/\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/i);
  return match ? normalizeDoi(match[1]) : '';
}

/**
 * Hiển thị DOI giữ đúng chữ hoa phần mã publisher khi DOI có dạng
 * 10.1519/jsc.0b013e... -> 10.1519/JSC.0b013e...
 * Các DOI bắt đầu bằng số hoặc không có dấu chấm sau mã publisher được giữ nguyên.
 */
export function formatDoiForDisplay(value = '') {
  const doi = normalizeDoi(value);
  const match = doi.match(/^(10\.\d{4,9}\/)([a-z]{2,8})(\.[-._;()/:a-z0-9]+)$/i);
  if (!match) return doi;
  return `${match[1]}${match[2].toUpperCase()}${match[3]}`;
}
