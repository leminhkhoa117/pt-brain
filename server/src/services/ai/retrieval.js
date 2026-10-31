import { splitIntoChunks } from '../../utils/text.js';

/**
 * Chọn ngữ cảnh cho câu hỏi khi bài quá dài.
 * Luôn giữ phần đầu (abstract/intro), ưu tiên các mục Results/Discussion/Conclusion,
 * sau đó lấy mẫu đều phần còn lại để AI vẫn "nhớ" toàn bài.
 */
export function selectRelevantContext(text = '', _question = '', { maxChars = 90000 } = {}) {
  const value = String(text || '');
  if (value.length <= maxChars) return value;

  const chunks = splitIntoChunks(value, 4000);
  if (!chunks.length) return '';

  const keep = new Map();
  const quotaChunks = Math.max(2, Math.floor(maxChars / 4000));

  // 1. Phần đầu: abstract, giới thiệu, phương pháp
  for (let i = 0; i < Math.min(2, chunks.length); i += 1) keep.set(i, chunks[i]);

  // 2. Các mục kết quả / bàn luận / kết luận
  chunks.forEach((chunk, index) => {
    if (keep.size >= quotaChunks) return;
    if (/^\s*(results|discussion|conclusion|findings|outcomes)\b/i.test(chunk)) {
      keep.set(index, chunk);
    }
  });

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
