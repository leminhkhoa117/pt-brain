import { Summary } from '../../models/Summary.js';
import { Paper } from '../../models/Paper.js';
import { chatCompletion } from '../ai/client.js';
import { assertAiQuota, recordAiCall } from '../ai/quota.js';
import { ApiError } from '../../utils/ApiError.js';
import { truncateText } from '../../utils/text.js';

const MAX_PAPERS = 8;

function compact(value, maxChars = 800) {
  return truncateText(String(value || ''), maxChars);
}

/**
 * Chỉ lấy Summary đã tạo từ toàn văn. Không dùng abstract-only, không nhận
 * summary của user khác. Hàm thuần để test payload/citation.
 */
export function buildFullTextSynthesisPayload(summaries = [], papers = []) {
  const paperById = new Map(papers.map((paper) => [String(paper._id), paper]));
  return summaries.slice(0, MAX_PAPERS).map((summary, index) => {
    const paper = paperById.get(String(summary.paperId)) || {};
    const content = summary.content || {};
    const metadata = content.metadata || {};
    return {
      id: index + 1,
      summaryId: String(summary._id),
      title: paper.title || metadata.title || 'Không rõ tiêu đề',
      authors: (paper.authors || metadata.authors || []).slice(0, 3),
      year: paper.year || metadata.year || 0,
      journal: paper.journal || metadata.journal || '',
      studyType: compact(content.studyType, 160),
      tldr: compact(content.tldr, 900),
      mainResults: (content.mainResults || []).slice(0, 5).map((result) => ({
        finding: compact(result.finding, 420),
        numbers: compact(result.numbers, 220),
        certainty: result.certainty?.rating || '',
      })),
      conclusion: compact(content.conclusion?.summary || content.authorsConclusion, 900),
      practicalTakeaways: (content.practicalTakeaways || [])
        .slice(0, 5)
        .map((item) => compact(item, 320)),
      limitations: (content.limitationsStructured?.ai || content.limitations || [])
        .slice(0, 5)
        .map((item) => compact(item, 320)),
      application: (content.application?.supported || [])
        .slice(0, 5)
        .map((item) => compact(item, 320)),
    };
  });
}

export async function synthesizeFromFullText(userId, { question, summaryIds }) {
  const summaries = await Summary.find({
    _id: { $in: summaryIds },
    userId,
    status: 'ready',
    basedOn: 'fulltext',
  }).lean();

  if (!summaries.length) {
    throw new ApiError(
      422,
      'NO_FULLTEXT_SUMMARIES',
      'Chưa có bản tóm tắt nào từ toàn văn để tổng hợp. Hãy đọc/tóm tắt ít nhất một bài OA hoặc PDF trước.',
    );
  }

  // Giữ thứ tự người dùng chọn, bỏ qua id không hợp lệ/không thuộc user.
  const byId = new Map(summaries.map((summary) => [String(summary._id), summary]));
  const ordered = summaryIds.map((id) => byId.get(String(id))).filter(Boolean);
  const papers = await Paper.find({
    _id: { $in: ordered.map((summary) => summary.paperId) },
    userId,
  }).lean();
  const payload = buildFullTextSynthesisPayload(ordered, papers);

  await assertAiQuota(userId, 'synthesize');
  const response = await chatCompletion({
    messages: [
      {
        role: 'system',
        content: `Bạn tổng hợp bằng chứng khoa học cho huấn luyện viên, bằng tiếng Việt.
- CHỈ dùng thông tin trong các bản tóm tắt toàn văn được cung cấp.
- Trích dẫn bằng số thứ tự trong ngoặc vuông, ví dụ [1], [2].
- Nêu rõ chỗ các bài mâu thuẫn, khác population/liều/volume/thời gian, hoặc bằng chứng còn yếu.
- Không thêm bài báo ngoài danh sách, không bịa số liệu.
- Trả lời 4-8 câu hoặc gạch đầu dòng, kết thúc bằng 1 câu về mức độ chắc chắn.
- Không đưa lời khuyên y tế cá nhân.`,
      },
      {
        role: 'user',
        content: `CÂU HỎI: ${question}\n\nCÁC BẢN TÓM TẮT TOÀN VĂN:\n${JSON.stringify(payload)}`,
      },
    ],
    temperature: 0.2,
    maxTokens: 2200,
    timeoutMs: 180000,
  });

  await recordAiCall(userId, { kind: 'synthesize', usage: response.usage });

  return {
    answer: response.text.trim(),
    papers: payload.map((paper) => ({
      id: paper.id,
      summaryId: paper.summaryId,
      title: paper.title,
      year: paper.year,
    })),
    usage: response.usage,
    model: response.model,
  };
}
