import { formatDoiForDisplay } from './doi.js';
import { buildFactsAudit } from './factsExport.js';

/** Chuyển nội dung tóm tắt JSON thành Markdown để tải về. */
export function summaryToMarkdown(summary, paper) {
  const c = summary.content || {};
  const meta = c.metadata || {};
  const lines = [];
  const push = (value) => {
    if (value) lines.push(String(value));
  };

  lines.push(`# ${meta.title || paper?.title || 'Bản tóm tắt bài nghiên cứu'}`);
  lines.push('');
  push(`**Tác giả:** ${(meta.authors || paper?.authors || []).join(', ') || 'Không nêu'}`);
  push(
    `**Tạp chí:** ${meta.journal || paper?.journal || 'Không nêu'} · **Năm:** ${
      meta.year || paper?.year || 'Không nêu'
    } · **Tập(số):** ${meta.volume || paper?.volume || 'Không nêu'}${
      meta.issue || paper?.issue ? `(${meta.issue || paper?.issue})` : ''
    } · **Trang:** ${meta.pages || paper?.pages || 'Không nêu'} · **DOI:** ${
      formatDoiForDisplay(meta.doi || paper?.doi) || 'DOI không nêu'
    }`,
  );
  if (paper?.url) lines.push(`**Link:** ${paper.url}`);
  lines.push('');

  if (c.evidenceAxes) {
    lines.push('## Ba trục bằng chứng');
    for (const [key, label] of [
      ['design', 'Thiết kế'],
      ['certainty', 'Độ chắc chắn'],
      ['relevance', 'Liên quan tới PT'],
    ]) {
      const axis = c.evidenceAxes[key];
      if (axis?.reason) lines.push(`- **${label} — ${axis.rating}:** ${axis.reason}`);
    }
    lines.push('');
  }

  if (c.quickRead?.lines?.length) {
    lines.push('## 30 giây');
    c.quickRead.lines.forEach((line) => lines.push(`- ${line}`));
    if (c.quickRead.readyForPt) push(`**Dùng được cho PT chưa?** ${c.quickRead.readyForPt}`);
    lines.push('');
  } else {
    lines.push('## Tóm tắt nhanh');
    lines.push(c.tldr || '');
    lines.push('');
  }

  if (c.whyStudy) {
    lines.push('## Vì sao làm nghiên cứu');
    lines.push(c.whyStudy);
    lines.push('');
  }

  lines.push('## Họ đã làm gì');
  if (c.studyType) push(`- **Loại nghiên cứu:** ${c.studyType}`);
  if (c.participants) {
    push(
      `- **Người tham gia:** n = ${c.participants.n ?? 'Không nêu'}. ${c.participants.description || ''}`,
    );
  }
  if (c.design) push(`- **Thiết kế:** ${c.design}`);
  if (c.intervention) push(`- **Can thiệp:** ${c.intervention}`);
  if (c.outcomes) push(`- **Chỉ số đo:** ${c.outcomes}`);
  if (c.measurementNote) push(`- **Nơi đo:** ${c.measurementNote}`);
  lines.push('');

  if (c.mechanism?.summary || c.mechanism?.steps?.length) {
    lines.push('## Cơ chế can thiệp');
    if (c.mechanism.summary) lines.push(c.mechanism.summary);
    if (c.mechanism.steps?.length) {
      c.mechanism.steps.forEach((step, index) => lines.push(`${index + 1}. ${step}`));
    }
    if (c.mechanism.whyWeightStaysStill) {
      push(`**Vì sao tạ đứng yên lúc đầu:** ${c.mechanism.whyWeightStaysStill}`);
    }
    if (c.mechanism.analogy) push(`**So sánh đời thường:** ${c.mechanism.analogy}`);
    lines.push('');
  }

  if (Array.isArray(c.mainResults) && c.mainResults.length) {
    lines.push('## Kết quả');
    if (c.resultsOverview) {
      lines.push(`> **Đọc nhanh:** ${c.resultsOverview}`);
      lines.push('');
    }
    for (const [index, item] of c.mainResults.entries()) {
      lines.push(`### ${index + 1}. ${item.finding}`);
      lines.push(`- **Số liệu gốc:** ${item.numbers}`);
      lines.push(`- **Nghĩa là gì trong phòng tập:** ${item.plainMeaning}`);
      if (item.certainty) {
        lines.push(`- **Mức chắc chắn:** ${item.certainty.rating} — ${item.certainty.reason}`);
      }
      lines.push('');
    }
  }

  if (c.authorsView?.conclusion || c.authorsConclusion) {
    lines.push('## Tác giả diễn giải');
    lines.push(c.authorsView?.conclusion || c.authorsConclusion);
    if (c.authorsView?.interpretations?.length) {
      lines.push('');
      lines.push('**Cách tác giả giải thích:**');
      c.authorsView.interpretations.forEach((item) => lines.push(`- ${item}`));
    }
    if (c.authorsView?.applications?.length) {
      lines.push('');
      lines.push('**Ứng dụng tác giả nêu:**');
      c.authorsView.applications.forEach((item) => lines.push(`- ${item}`));
    }
    lines.push('');
  }

  if (c.limitationsStructured?.authors?.length || c.limitationsStructured?.ai?.length) {
    lines.push('## Hạn chế');
    if (c.limitationsStructured.authors?.length) {
      lines.push('**Tác giả nêu:**');
      c.limitationsStructured.authors.forEach((item) => lines.push(`- ${item}`));
    }
    if (c.limitationsStructured.ai?.length) {
      lines.push('**AI nhận thấy:**');
      c.limitationsStructured.ai.forEach((item) => lines.push(`- ${item}`));
    }
    lines.push('');
  } else if (Array.isArray(c.limitations) && c.limitations.length) {
    lines.push('## Hạn chế');
    c.limitations.forEach((item) => lines.push(`- ${item}`));
    lines.push('');
  }

  if (c.application) {
    lines.push('## Áp dụng cho PT');
    const groups = [
      ['supported', 'Có cơ sở'],
      ['hypothesis', 'Chỉ là giả thuyết'],
      ['notYet', 'Chưa nên áp dụng'],
      ['unanswered', 'Bài không trả lời'],
    ];
    for (const [key, label] of groups) {
      const items = c.application[key] || [];
      lines.push(`### ${label}`);
      if (items.length) items.forEach((item) => lines.push(`- ${item}`));
      else lines.push('- Không có ý nào.');
    }
    if (c.application.notApplicableTo || c.whoItDoesNotApplyTo) {
      push(`**Không áp dụng cho:** ${c.application.notApplicableTo || c.whoItDoesNotApplyTo}`);
    }
    lines.push('');
  } else if (Array.isArray(c.practicalTakeaways) && c.practicalTakeaways.length) {
    lines.push('## Ứng dụng thực tế');
    c.practicalTakeaways.forEach((item) => lines.push(`- ${item}`));
    lines.push('');
  }

  lines.push('## Lợi ích & tài trợ');
  lines.push(c.benefitSignals?.statement || c.conflictOfInterest || 'Không nêu trong bài');
  if (c.benefitSignals?.flags?.length) {
    lines.push('**Dấu hiệu cần lưu ý:**');
    c.benefitSignals.flags.forEach((flag) =>
      lines.push(`- ${flag.text}${flag.source ? ` (${flag.source}${flag.page ? `, tr. ${flag.page}` : ''})` : ''}`),
    );
  }
  lines.push('');

  if (c.selfCheck?.length) {
    lines.push('## 3 câu tự kiểm tra');
    c.selfCheck.forEach((item, index) => {
      lines.push(`${index + 1}. **${item.question}**`);
      lines.push(`   ${item.answer}`);
    });
    lines.push('');
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

  if (Array.isArray(c.glossary) && c.glossary.length) {
    lines.push('## Thuật ngữ');
    for (const term of c.glossary) {
      lines.push(`- **${term.en}** (${term.vi}): ${term.explanation}`);
      if (term.example) lines.push(`  - Ví dụ: ${term.example}`);
    }
    lines.push('');
  }

  if (summary.facts) {
    const audit = buildFactsAudit(summary.facts);
    const cell = (value = '') =>
      String(value).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
    lines.push('## Phụ lục — Dữ kiện kiểm chứng (audit)');
    lines.push(
      'Phần này giữ nguyên dữ kiện bước 1 để đối chiếu với bản viết. Không dùng để thay thế bài gốc.',
    );
    lines.push('');
    if (audit.design) lines.push(`- **Thiết kế:** ${audit.design}`);
    if (audit.participants) lines.push(`- **Đối tượng:** ${audit.participants}`);
    if (audit.intervention) lines.push(`- **Can thiệp:** ${audit.intervention}`);
    if (audit.device) lines.push(`- **Thiết bị:** ${audit.device}`);
    if (audit.measurement) lines.push(`- **Đo lường:** ${audit.measurement}`);
    if (audit.failureCriteria) lines.push(`- **Tiêu chí dừng set:** ${audit.failureCriteria}`);
    lines.push('');
    if (audit.results.length) {
      lines.push('### Kết quả gốc');
      lines.push('| # | Chỉ số | Nhóm | Kiểm định | Trang | Trích nguyên văn |');
      lines.push('|---|---|---|---|---|---|');
      for (const row of audit.results) {
        lines.push(
          `| ${row.index} | ${cell(row.outcome)} | ${cell(row.arms)} | ${cell(
            row.test || row.note,
          )} | ${row.page || ''} | ${cell(row.quote)} |`,
        );
      }
      lines.push('');
    }
    if (audit.conclusion) {
      lines.push('### Kết luận tác giả (nguyên bản facts)');
      lines.push(audit.conclusion);
      lines.push('');
    }
    if (audit.applications.length) {
      lines.push('### Ứng dụng tác giả nêu (facts)');
      audit.applications.forEach((item) => lines.push(`- ${item}`));
      lines.push('');
    }
    if (audit.limitations.length) {
      lines.push('### Hạn chế tác giả nêu (facts)');
      audit.limitations.forEach((item) => lines.push(`- ${item}`));
      lines.push('');
    }
    if (audit.benefitSignals.length) {
      lines.push('### Dấu hiệu lợi ích (facts)');
      audit.benefitSignals.forEach((item) => lines.push(`- ${item}`));
      lines.push('');
    }
    lines.push('<details>');
    lines.push('<summary>JSON dữ kiện đầy đủ</summary>');
    lines.push('');
    lines.push('```json');
    lines.push(JSON.stringify(summary.facts, null, 2));
    lines.push('```');
    lines.push('</details>');
    lines.push('');
  }

  lines.push('## Độ tin cậy');
  lines.push(
    `- Dựa trên: ${c.confidence?.basedOn === 'fulltext' ? 'toàn văn bài báo' : 'chỉ abstract'}`,
  );
  if (c.verification?.passed === false) {
    lines.push(`- Kiểm tra tự động còn ${c.verification.issues?.length || 0} điểm chưa đạt.`);
  }
  if (Array.isArray(c.verification?.factsWarnings) && c.verification.factsWarnings.length) {
    lines.push(
      `- ${c.verification.factsWarnings.length} trích nguyên văn chưa khớp hoàn toàn; nên đối chiếu PDF gốc.`,
    );
  }
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
