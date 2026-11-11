import { splitIntoChunks } from '../../utils/text.js';

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'were', 'was', 'are', 'has', 'have',
  'been', 'into', 'than', 'then', 'also', 'not', 'but', 'its', 'their', 'they', 'our', 'you',
  'cua', 'cho', 'voi', 'trong', 'nhung', 'duoc', 'khong', 'nhung', 'cac', 'mot', 'nhu', 'thi',
  'la', 'va', 'co', 'ra', 'vao', 'khi', 'de', 'bi', 'nen', 'se', 'dang', 'nay', 'do', 'the',
  'nao', 'gi', 'sao', 'bao', 'nhieu', 'hon', 'rat', 'hay', 'hoac', 'tren', 'duoi', 'sau',
]);

function normalizeToken(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function tokenize(value) {
  return normalizeToken(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
}

function questionNumbers(value) {
  return String(value || '').match(/\d+(?:[.,]\d+)?/g) || [];
}

/**
 * Chọn ngữ cảnh cho câu hỏi khi bài quá dài.
 * Luôn giữ phần đầu (abstract/intro), ưu tiên các mục Results/Discussion/Conclusion
 * và các đoạn có từ khóa/số liệu xuất hiện trong câu hỏi, sau đó lấy mẫu đều phần
 * còn lại để AI vẫn "nhớ" toàn bài.
 */
export function selectRelevantContext(text = '', question = '', { maxChars = 90000 } = {}) {
  const value = String(text || '');
  if (value.length <= maxChars) return value;

  const chunks = splitIntoChunks(value, 4000);
  if (!chunks.length) return '';

  const keep = new Map();
  const quotaChunks = Math.max(2, Math.floor(maxChars / 4000));
  const terms = [...new Set(tokenize(question))];
  const numbers = [...new Set(questionNumbers(question))];

  // 1. Phần đầu: abstract, giới thiệu, phương pháp
  for (let i = 0; i < Math.min(2, chunks.length); i += 1) keep.set(i, chunks[i]);

  // 2. Chấm điểm các đoạn còn lại theo từ khóa/số liệu trong câu hỏi.
  // Đoạn Results/Discussion được cộng điểm vì thường chứa câu trả lời.
  const scored = chunks
    .map((chunk, index) => {
      if (keep.has(index)) return null;
      const haystack = tokenize(chunk);
      const tokenSet = new Set(haystack);
      const normalizedChunk = normalizeToken(chunk);
      const keywordScore = terms.reduce((sum, term) => sum + (tokenSet.has(term) ? 1 : 0), 0);
      const numberScore = numbers.reduce(
        (sum, number) => sum + (normalizedChunk.includes(number) ? 2 : 0),
        0,
      );
      const sectionBonus = /^\s*(results|discussion|conclusion|findings|outcomes)\b/i.test(chunk)
        ? 5
        : 0;
      return { index, chunk, score: keywordScore + numberScore + sectionBonus };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.index - b.index);

  for (const item of scored) {
    if (keep.size >= quotaChunks) break;
    if (item.score > 0 || item.index < 4) keep.set(item.index, item.chunk);
  }

  // 3. Lấy mẫu đều phần còn lại (giữ được số liệu rải rác trong bài dài)
  const remaining = quotaChunks - keep.size;
  if (remaining > 0) {
    const step = Math.max(1, Math.floor(chunks.length / remaining));
    for (let i = 0; i < chunks.length && keep.size < quotaChunks; i += step) {
      if (!keep.has(i)) keep.set(i, chunks[i]);
    }
  }

  // 4. Nếu vẫn thiếu, lấp từ cuối lên (thường là kết luận/hạn chế)
  for (let i = chunks.length - 1; i >= 0 && keep.size < quotaChunks; i -= 1) {
    if (!keep.has(i)) keep.set(i, chunks[i]);
  }

  const selected = [...keep.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([index, chunk]) => `[Đoạn ${index + 1}/${chunks.length}]\n${chunk}`);

  return selected.join('\n\n').slice(0, maxChars + 4000);
}

export function countContextChars(text = '') {
  return String(text || '').length;
}
