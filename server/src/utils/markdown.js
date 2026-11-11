/** Chuyển nội dung tóm tắt JSON thành Markdown để tải về. */
export function summaryToMarkdown(summary, paper) {
  const c = summary.content || {};
  const meta = c.metadata || {};
  const lines = [];

  lines.push(`# ${meta.title || paper?.title || 'Bản tóm tắt bài nghiên cứu'}`);
  lines.push('');
  lines.push(
    `**Tạp chí:** ${meta.journal || paper?.journal || 'Không nêu'} · **Năm:** ${
      meta.year || paper?.year || 'Không nêu'
    } · **DOI:** ${meta.doi || paper?.doi || 'Không có'}`,
  );
  if (paper?.url) lines.push(`**Link:** ${paper.url}`);
  lines.push('');
  lines.push(
    `> **Mức bằng chứng:** ${c.evidenceLevel?.level ?? '?'}/5 — ${
      c.evidenceLevel?.explanation || ''
    }`,
  );
  lines.push('');
  lines.push('## Tóm tắt nhanh');
  lines.push(c.tldr || '');
  lines.push('');

  const section = (title, value) => {
    if (!value) return;
    lines.push(`## ${title}`);
    lines.push(value);
    lines.push('');
  };

  section('Câu hỏi nghiên cứu', c.researchQuestion);
  section('Loại nghiên cứu', c.studyType);
  if (c.participants) {
    section(
      'Người tham gia',
      `n = ${c.participants.n ?? 'Không nêu'}. ${c.participants.description || ''}`,
    );
  }
  section('Thiết kế', c.design);
  section('Can thiệp', c.intervention);
  section('Chỉ số đo', c.outcomes);

  if (Array.isArray(c.mainResults) && c.mainResults.length) {
    lines.push('## Kết quả chính');
    if (c.resultsOverview) {
      lines.push(`> **Đọc nhanh:** ${c.resultsOverview}`);
      lines.push('');
    }
    for (const [index, item] of c.mainResults.entries()) {
      lines.push(`### ${index + 1}. ${item.finding}`);
      lines.push(`- **Số liệu:** ${item.numbers}`);
      lines.push(`- **Nghĩa là:** ${item.plainMeaning}`);
      lines.push('');
    }
  }

  if (Array.isArray(c.figures) && c.figures.length) {
    lines.push('## Hình & bảng');
    for (const figure of c.figures) {
      lines.push(
        `### ${figure.label}${figure.page ? ` (trang ${figure.page})` : ''}${
          figure.title ? ` — ${figure.title}` : ''
        }`,
      );
      if (figure.caption) lines.push(`- **Chú thích gốc:** ${figure.caption}`);
      if (figure.explanation) lines.push(`- **Giải thích:** ${figure.explanation}`);
      if (figure.whatToLookFor) lines.push(`- **Cần chú ý:** ${figure.whatToLookFor}`);
      lines.push('');
    }
  }

  if (Array.isArray(c.secondaryResults) && c.secondaryResults.length) {
    lines.push('## Kết quả phụ');
    for (const item of c.secondaryResults) {
      lines.push(`- **${item.finding}** — ${item.numbers}. ${item.plainMeaning}`);
    }
    lines.push('');
  }

  section('Kết luận của tác giả', c.authorsConclusion);

  if (Array.isArray(c.limitations) && c.limitations.length) {
    lines.push('## Hạn chế');
    c.limitations.forEach((item) => lines.push(`- ${item}`));
    lines.push('');
  }

  section('Xung đột lợi ích', c.conflictOfInterest);

  if (Array.isArray(c.practicalTakeaways) && c.practicalTakeaways.length) {
    lines.push('## Ứng dụng thực tế');
    c.practicalTakeaways.forEach((item) => lines.push(`- ${item}`));
    lines.push('');
  }

  section('Không áp dụng cho', c.whoItDoesNotApplyTo);

  if (Array.isArray(c.glossary) && c.glossary.length) {
    lines.push('## Thuật ngữ');
    for (const term of c.glossary) {
      lines.push(`- **${term.en}** (${term.vi}): ${term.explanation}`);
    }
    lines.push('');
  }

  lines.push('## Độ tin cậy');
  lines.push(
    `- Dựa trên: ${c.confidence?.basedOn === 'fulltext' ? 'toàn văn bài báo' : 'chỉ abstract'}`,
  );
  if (Array.isArray(c.confidence?.missingInfo) && c.confidence.missingInfo.length) {
    lines.push(`- Thông tin còn thiếu: ${c.confidence.missingInfo.join('; ')}`);
  }
  lines.push('');
  lines.push('---');
  lines.push(
    '_Bản tóm tắt do AI tạo từ tài liệu gốc, có thể sai. Cần đối chiếu bài gốc với các kết luận quan trọng. Không thay thế tư vấn y tế._',
  );

  return lines.join('\n');
}
