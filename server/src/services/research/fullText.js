/**
 * Đánh giá khả năng đọc toàn văn của một kết quả tìm kiếm — chỉ dựa trên metadata
 * đã có, không gọi thêm API.
 *
 * - `pmc_xml`: có PMCID + open access => Europe PMC chắc chắn có full-text XML.
 * - `pdf`: có link PDF trực tiếp (OpenAlex/Europe PMC/Unpaywall).
 * - `landing`: chỉ có link landing page; có thể mở được nhưng chưa chắc là toàn văn.
 * - `abstract`: chỉ có abstract.
 *
 * `hasFullText` cố ý chỉ tính pmc_xml + pdf để filter "có toàn văn" không hứa
 * quá mức; landing page được trả riêng qua `hasFullTextLink`.
 */

const OA_STATUS_WITH_PMC = new Set(['gold', 'hybrid', 'green', 'bronze', 'diamond']);

const PDF_URL_PATTERN = /\.pdf(?:$|[?#])/i;

export const FULL_TEXT_LABELS = {
  pmc_xml: 'Toàn văn PMC',
  pdf: 'Toàn văn PDF',
  landing: 'Có link toàn văn',
  abstract: 'Chỉ abstract',
};

function cleanUrl(value = '') {
  return String(value || '').trim();
}

function isDirectPdfUrl(url) {
  if (!url) return false;
  return PDF_URL_PATTERN.test(url) || /pdf/i.test(url);
}

export function assessFullText(item = {}) {
  const pmcid = String(item.pmcid || '').trim();
  const isOpenAccess = Boolean(item.isOpenAccess);
  const oaStatus = String(item.oaStatus || '').toLowerCase();
  const pdfUrl = cleanUrl(item.pdfUrl);
  const fullTextUrl = cleanUrl(item.fullTextUrl);

  if (pmcid && (isOpenAccess || OA_STATUS_WITH_PMC.has(oaStatus))) {
    return {
      hasFullText: true,
      hasFullTextLink: false,
      fullTextSource: 'pmc_xml',
      fullTextLabel: FULL_TEXT_LABELS.pmc_xml,
    };
  }

  if (pdfUrl && (isDirectPdfUrl(pdfUrl) || isOpenAccess)) {
    return {
      hasFullText: true,
      hasFullTextLink: false,
      fullTextSource: 'pdf',
      fullTextLabel: FULL_TEXT_LABELS.pdf,
    };
  }

  if (fullTextUrl) {
    return {
      hasFullText: false,
      hasFullTextLink: true,
      fullTextSource: 'landing',
      fullTextLabel: FULL_TEXT_LABELS.landing,
    };
  }

  return {
    hasFullText: false,
    hasFullTextLink: false,
    fullTextSource: 'abstract',
    fullTextLabel: FULL_TEXT_LABELS.abstract,
  };
}

/** Gộp metadata của 2 bản ghi cùng bài trước khi đánh giá lại full-text. */
export function mergeFullTextFields(target = {}, source = {}) {
  return {
    ...target,
    pmcid: target.pmcid || source.pmcid || '',
    isOpenAccess: Boolean(target.isOpenAccess || source.isOpenAccess),
    oaStatus: target.oaStatus || source.oaStatus || '',
    pdfUrl: target.pdfUrl || source.pdfUrl || '',
    fullTextUrl: target.fullTextUrl || source.fullTextUrl || '',
  };
}
