import { ApiError } from '../../utils/ApiError.js';
import { assessFullText } from './fullText.js';

/** Chính sách duy nhất cho Finder/Reader: chỉ bài OA đã xác minh + có toàn văn. */
export const RESEARCH_ACCESS_POLICY = 'oa_fulltext';

const OA_STATUSES = new Set(['gold', 'hybrid', 'green', 'bronze', 'diamond']);

/**
 * `isOpenAccess` phải đến từ nguồn xác minh (Europe PMC, OpenAlex, Unpaywall).
 * Có PDF trên mạng không đồng nghĩa với open access.
 */
export function isVerifiedOpenAccess(item = {}) {
  if (item?.isOpenAccess === true) return true;
  const status = String(item?.oaStatus || '').toLowerCase();
  return OA_STATUSES.has(status);
}

export function assessResearchItem(item = {}) {
  return { ...item, ...assessFullText(item) };
}

export function isEligibleResearchItem(item = {}) {
  const assessed = assessResearchItem(item);
  return isVerifiedOpenAccess(assessed) && assessed.hasFullText === true;
}

/** Trả lý do loại để Finder báo minh bạch, không chỉ im lặng bỏ bài. */
export function researchDropReason(item = {}) {
  if (!isVerifiedOpenAccess(item)) return 'notOa';
  if (!assessFullText(item).hasFullText) return 'noFullText';
  return '';
}

export function countDroppedResearch(items = []) {
  return items.reduce(
    (counts, item) => {
      const reason = researchDropReason(item);
      if (reason) counts[reason] += 1;
      return counts;
    },
    { notOa: 0, noFullText: 0 },
  );
}

/** Lỗi thống nhất khi Reader không có toàn văn — UI dùng details để gợi ý nguồn hợp pháp. */
export function fullTextRequiredError(paper = {}, fallbackUrl = '') {
  const doi = String(paper.doi || '').trim();
  const publisherUrl =
    paper.url || (doi ? `https://doi.org/${doi}` : '') || fallbackUrl || '';
  return new ApiError(
    422,
    'FULLTEXT_REQUIRED',
    'Bài này không có toàn văn open access đọc được. Hệ thống không tóm tắt từ abstract. Hãy mở PDF/link OA hoặc tải PDF bạn có quyền truy cập.',
    {
      doi,
      title: paper.title || '',
      publisherUrl,
      oaStatus: paper.oaStatus || '',
    },
  );
}
