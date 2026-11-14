import PDFDocument from 'pdfkit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatDoiForDisplay } from '../../utils/doi.js';
import { buildFactsAudit } from '../../utils/factsExport.js';

const FONT_DIR = fileURLToPath(new URL('../../../assets/fonts/', import.meta.url));
const FONT_REGULAR = path.join(FONT_DIR, 'NotoSans-Regular.ttf');
const FONT_BOLD = path.join(FONT_DIR, 'NotoSans-Bold.ttf');

const MARGIN = 48;

function renderPdf(doc, build) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    try {
      build(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function newDoc(options = {}) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: MARGIN,
    ...options,
    info: {
      Producer: 'PT Brain',
      Creator: 'PT Brain',
      ...(options.info || {}),
    },
  });
  doc.registerFont('Noto', FONT_REGULAR);
  doc.registerFont('NotoBold', FONT_BOLD);
  doc.font('Noto');
  return doc;
}

const clean = (value) => String(value ?? '').trim();

function heading(doc, text) {
  if (!clean(text)) return;
  doc.moveDown(0.9);
  doc.font('NotoBold').fontSize(11).fillColor('#0f766e').text(clean(text).toUpperCase());
  doc.moveDown(0.25);
  doc.font('Noto').fontSize(10).fillColor('#1e293b');
}

function paragraph(doc, text, options = {}) {
  if (!clean(text)) return;
  doc.font('Noto').fontSize(options.size || 10).fillColor(options.color || '#334155');
  doc.text(clean(text), { lineGap: 2.5, ...options });
}

function bullets(doc, items = []) {
  for (const item of items) {
    if (!clean(item)) continue;
    doc.font('Noto').fontSize(10).fillColor('#334155');
    doc.text(`•  ${clean(item)}`, { indent: 8, lineGap: 2.5 });
  }
}

function labelValue(doc, label, value) {
  if (!clean(value)) return;
  doc.font('NotoBold').fontSize(9).fillColor('#64748b').text(`${label}: `, { continued: true });
  doc.font('Noto').fontSize(10).fillColor('#1e293b').text(clean(value), { lineGap: 2 });
}

/** Xuất bản tóm tắt nghiên cứu ra PDF (font Noto Sans hỗ trợ tiếng Việt). */
export function buildSummaryPdf(summary, paper) {
  const c = summary.content || {};
  const meta = c.metadata || {};
  const title = meta.title || paper?.title || 'Bản tóm tắt nghiên cứu';
  const doc = newDoc({ info: { Title: title } });

  doc.font('NotoBold').fontSize(9).fillColor('#0f766e').text('PT BRAIN · RESEARCH READER');
  doc.moveDown(0.4);
  doc.font('NotoBold').fontSize(17).fillColor('#0f172a').text(title, { lineGap: 2 });
  doc.moveDown(0.3);

  const authors = (meta.authors || paper?.authors || []).join(', ');
  doc.font('Noto').fontSize(9).fillColor('#64748b');
  doc.text(
    [
      authors,
      meta.journal || paper?.journal,
      meta.year || paper?.year,
      meta.volume || paper?.volume
        ? `${meta.volume || paper?.volume}${
            meta.issue || paper?.issue ? `(${meta.issue || paper?.issue})` : ''
          }`
        : '',
      meta.pages || paper?.pages ? `tr. ${meta.pages || paper?.pages}` : '',
      meta.doi || paper?.doi
        ? `DOI ${formatDoiForDisplay(meta.doi || paper?.doi)}`
        : 'DOI không nêu',
    ]
      .filter(Boolean)
      .join(' · '),
  );
  doc.moveDown(0.4);

  if (c.evidenceAxes) {
    const axisLabels = {
      design: 'Thiết kế',
      certainty: 'Độ chắc chắn',
      relevance: 'Liên quan tới PT',
    };
    for (const [key, label] of Object.entries(axisLabels)) {
      const axis = c.evidenceAxes[key];
      if (axis?.reason) labelValue(doc, `${label} (${axis.rating})`, axis.reason);
    }
  } else {
    doc
      .font('NotoBold')
      .fontSize(9)
      .fillColor('#0f766e')
      .text(
        `Mức bằng chứng ${c.evidenceLevel?.level ?? '?'}/5 · ${
          c.confidence?.basedOn === 'abstract_only' ? 'Chỉ dựa trên abstract' : 'Dựa trên toàn văn'
        }`,
      );
  }

  if (c.confidence?.basedOn === 'abstract_only') {
    doc.moveDown(0.3);
    doc
      .font('Noto')
      .fontSize(8.5)
      .fillColor('#b45309')
      .text('Lưu ý: bản tóm tắt này chỉ dựa trên abstract, có thể thiếu thiết kế chi tiết và bảng số liệu.');
  }

  if (c.quickRead?.lines?.length) {
    heading(doc, '30 giây');
    bullets(doc, c.quickRead.lines);
    if (c.quickRead.readyForPt) labelValue(doc, 'Dùng được cho PT chưa?', c.quickRead.readyForPt);
  } else {
    doc.moveDown(0.8);
    doc.font('Noto').fontSize(10.5).fillColor('#0f172a');
    doc.text(clean(c.tldr), { lineGap: 3 });
  }

  heading(doc, 'Vì sao làm nghiên cứu');
  paragraph(doc, c.whyStudy || c.researchQuestion);

  heading(doc, 'Họ đã làm gì');
  labelValue(doc, 'Loại nghiên cứu', c.studyType);
  if (c.participants) {
    labelValue(
      doc,
      'Người tham gia',
      `${c.participants.n ? `n = ${c.participants.n}. ` : ''}${c.participants.description || ''}`,
    );
  }
  labelValue(doc, 'Thiết kế', c.design);
  labelValue(doc, 'Can thiệp', c.intervention);
  labelValue(doc, 'Chỉ số đo', c.outcomes);
  labelValue(doc, 'Nơi đo', c.measurementNote);

  if (c.mechanism?.summary || c.mechanism?.steps?.length) {
    heading(doc, 'Cơ chế can thiệp');
    paragraph(doc, c.mechanism.summary);
    bullets(doc, c.mechanism.steps || []);
    labelValue(doc, 'Vì sao tạ đứng yên lúc đầu', c.mechanism.whyWeightStaysStill);
    labelValue(doc, 'So sánh đời thường', c.mechanism.analogy);
  }

  heading(doc, 'Kết quả');
  if (c.resultsOverview) {
    doc
      .font('Noto')
      .fontSize(9.5)
      .fillColor('#0f766e')
      .text(`Đọc nhanh: ${c.resultsOverview}`, { lineGap: 2.5 });
    doc.moveDown(0.4);
  }
  for (const [index, item] of (c.mainResults || []).entries()) {
    doc.font('NotoBold').fontSize(10).fillColor('#1e293b').text(`${index + 1}. ${item.finding}`, {
      lineGap: 2,
    });
    doc.font('Noto').fontSize(9).fillColor('#92400e').text(`Số liệu: ${item.numbers}`, {
      lineGap: 2,
    });
    paragraph(doc, `Nghĩa là: ${item.plainMeaning}`, { size: 9, color: '#475569' });
    if (item.certainty) {
      paragraph(doc, `Mức chắc chắn: ${item.certainty.rating} — ${item.certainty.reason}`, {
        size: 8.5,
        color: '#64748b',
      });
    }
    doc.moveDown(0.25);
  }

  if (Array.isArray(c.figures) && c.figures.length) {
    heading(doc, 'Hình & bảng');
    for (const figure of c.figures) {
      const title = `${figure.label}${figure.page ? ` (trang ${figure.page})` : ''}${
        figure.title ? ` — ${figure.title}` : ''
      }`;
      doc.font('NotoBold').fontSize(10).fillColor('#1e293b').text(title, { lineGap: 2 });
      if (figure.caption) {
        paragraph(doc, `Chú thích gốc: ${figure.caption}`, { size: 8.5, color: '#64748b' });
      }
      if (figure.explanation) paragraph(doc, figure.explanation, { size: 9 });
      if (figure.whatToLookFor) {
        paragraph(doc, `Cần chú ý: ${figure.whatToLookFor}`, { size: 9, color: '#92400e' });
      }
      doc.moveDown(0.3);
    }
  }

  if (Array.isArray(c.secondaryResults) && c.secondaryResults.length) {
    heading(doc, 'Kết quả phụ');
    bullets(doc, c.secondaryResults.map((item) => `${item.finding} — ${item.numbers}`));
  }

  heading(doc, 'Tác giả diễn giải');
  paragraph(doc, c.authorsView?.conclusion || c.authorsConclusion);
  if (c.authorsView?.interpretations?.length) {
    labelValue(doc, 'Cách tác giả giải thích', '');
    bullets(doc, c.authorsView.interpretations);
  }
  if (c.authorsView?.applications?.length) {
    labelValue(doc, 'Ứng dụng tác giả nêu', '');
    bullets(doc, c.authorsView.applications);
  }

  if (c.limitationsStructured?.authors?.length || c.limitationsStructured?.ai?.length) {
    heading(doc, 'Hạn chế');
    if (c.limitationsStructured.authors?.length) {
      labelValue(doc, 'Tác giả nêu', '');
      bullets(doc, c.limitationsStructured.authors);
    }
    if (c.limitationsStructured.ai?.length) {
      labelValue(doc, 'AI nhận thấy', '');
      bullets(doc, c.limitationsStructured.ai);
    }
  } else if (Array.isArray(c.limitations) && c.limitations.length) {
    heading(doc, 'Hạn chế');
    bullets(doc, c.limitations);
  }

  if (c.application) {
    heading(doc, 'Áp dụng cho PT');
    const groups = [
      ['supported', 'Có cơ sở'],
      ['hypothesis', 'Chỉ là giả thuyết'],
      ['notYet', 'Chưa nên áp dụng'],
      ['unanswered', 'Bài không trả lời'],
    ];
    for (const [key, label] of groups) {
      const items = c.application[key] || [];
      labelValue(doc, label, items.length ? '' : 'Không có ý nào.');
      bullets(doc, items);
    }
    labelValue(
      doc,
      'Không áp dụng cho',
      c.application.notApplicableTo || c.whoItDoesNotApplyTo,
    );
  } else if (Array.isArray(c.practicalTakeaways) && c.practicalTakeaways.length) {
    heading(doc, 'Ứng dụng thực tế');
    bullets(doc, c.practicalTakeaways);
  }

  heading(doc, 'Lợi ích & tài trợ');
  paragraph(doc, c.benefitSignals?.statement || c.conflictOfInterest);
  if (c.benefitSignals?.flags?.length) {
    bullets(
      doc,
      c.benefitSignals.flags.map(
        (flag) =>
          `${flag.text}${flag.source ? ` (${flag.source}${flag.page ? `, tr. ${flag.page}` : ''})` : ''}`,
      ),
    );
  }

  if (c.selfCheck?.length) {
    heading(doc, '3 câu tự kiểm tra');
    c.selfCheck.forEach((item, index) => {
      doc.font('NotoBold').fontSize(9.5).fillColor('#1e293b').text(`${index + 1}. ${item.question}`);
      paragraph(doc, item.answer, { size: 9, color: '#475569' });
    });
  }

  if (Array.isArray(c.glossary) && c.glossary.length) {
    heading(doc, 'Thuật ngữ');
    bullets(
      doc,
      c.glossary.map(
        (term) =>
          `${term.en} (${term.vi}): ${term.explanation}${term.example ? ` Ví dụ: ${term.example}` : ''}`,
      ),
    );
  }

  if (summary.facts) {
    const audit = buildFactsAudit(summary.facts);
    heading(doc, 'Phụ lục — Dữ kiện kiểm chứng (audit)');
    labelValue(doc, 'Thiết kế', audit.design);
    labelValue(doc, 'Đối tượng', audit.participants);
    labelValue(doc, 'Can thiệp', audit.intervention);
    labelValue(doc, 'Thiết bị', audit.device);
    labelValue(doc, 'Đo lường', audit.measurement);
    labelValue(doc, 'Tiêu chí dừng set', audit.failureCriteria);
    if (audit.results.length) {
      labelValue(doc, 'Kết quả gốc', '');
      audit.results.slice(0, 12).forEach((row) => {
        const parts = [
          `${row.index}. ${row.outcome}`,
          row.arms,
          row.test || row.note,
          row.page ? `tr. ${row.page}` : '',
          row.quote ? `“${row.quote}”` : '',
        ].filter(Boolean);
        bullets(doc, [parts.join(' — ')]);
      });
      if (audit.results.length > 12) {
        paragraph(doc, `… còn ${audit.results.length - 12} kết quả khác trong JSON dữ kiện.`, {
          size: 8.5,
          color: '#64748b',
        });
      }
    }
    labelValue(doc, 'Kết luận tác giả (facts)', audit.conclusion);
    if (audit.benefitSignals.length) {
      labelValue(doc, 'Dấu hiệu lợi ích (facts)', '');
      bullets(doc, audit.benefitSignals);
    }
  }

  heading(doc, 'Độ tin cậy');
  paragraph(
    doc,
    c.confidence?.missingInfo?.length
      ? `Thông tin còn thiếu: ${c.confidence.missingInfo.join('; ')}`
      : 'Không có thông tin thiếu được ghi nhận.',
    { size: 9, color: '#64748b' },
  );
  if (c.verification?.factsWarnings?.length) {
    paragraph(
      doc,
      `${c.verification.factsWarnings.length} trích nguyên văn chưa khớp hoàn toàn; nên đối chiếu PDF gốc.`,
      { size: 8.5, color: '#b45309' },
    );
  }

  doc.moveDown(1);
  doc
    .font('Noto')
    .fontSize(8)
    .fillColor('#94a3b8')
    .text(
      'Bản tóm tắt do AI tạo từ tài liệu gốc, có thể sai. Cần đối chiếu bài gốc với các kết luận quan trọng. Không thay thế tư vấn y tế.',
      { lineGap: 1.5 },
    );

  return renderPdf(doc, () => {});
}

/** Xuất báo cáo BodyLog ra PDF (A4 ngang, 10 cột). */
export function buildBodyLogPdf(logs = [], user = {}) {
  const doc = newDoc({ size: 'A4', layout: 'landscape', margin: 32 });
  doc.font('NotoBold').fontSize(9).fillColor('#0f766e').text('PT BRAIN · BODY CHECK');
  doc.moveDown(0.3);
  doc.font('NotoBold').fontSize(16).fillColor('#0f172a').text('Báo cáo theo dõi cơ thể');
  doc.font('Noto').fontSize(9).fillColor('#64748b');
  doc.text(
    `${user.name || 'Người dùng'} · ${logs.length} ngày · xuất ${new Date().toLocaleDateString('vi-VN')}`,
  );

  const columns = [
    { key: 'dateKey', label: 'Ngày', w: 66 },
    { key: 'weightKg', label: 'Cân (kg)', w: 62 },
    { key: 'waistCm', label: 'Bụng (cm)', w: 64 },
    { key: 'neckCm', label: 'Cổ (cm)', w: 56 },
    { key: 'bodyFat', label: '% mỡ', w: 50 },
    { key: 'leanMass', label: 'LBM (kg)', w: 62 },
    { key: 'ffmi', label: 'FFMI', w: 44 },
    { key: 'sleepHours', label: 'Ngủ (h)', w: 54 },
    { key: 'calories', label: 'Calo', w: 56 },
    { key: 'proteinG', label: 'Protein (g)', w: 68 },
  ];

  const startX = 32;
  let y = doc.y + 18;
  const rowHeight = 18;

  const drawHeader = () => {
    doc.font('NotoBold').fontSize(8).fillColor('#0f766e');
    let x = startX;
    for (const col of columns) {
      doc.text(col.label, x, y, { width: col.w - 4 });
      x += col.w;
    }
    y += rowHeight;
    doc
      .moveTo(startX, y - 4)
      .lineTo(startX + columns.reduce((s, c) => s + c.w, 0), y - 4)
      .strokeColor('#cbd5e1')
      .stroke();
  };

  drawHeader();

  for (const log of logs) {
    if (y > doc.page.height - 50) {
      doc.addPage();
      y = 40;
      drawHeader();
    }
    const values = {
      dateKey: log.dateKey,
      weightKg: log.weightKg,
      waistCm: log.measurements?.waistCm,
      neckCm: log.measurements?.neckCm,
      bodyFat: log.computed?.bodyFatNavy ?? log.bodyFatPct,
      leanMass: log.computed?.leanMassKg,
      ffmi: log.computed?.ffmi,
      sleepHours: log.sleepHours,
      calories: log.calories,
      proteinG: log.proteinG,
    };
    doc.font('Noto').fontSize(8).fillColor('#334155');
    let x = startX;
    for (const col of columns) {
      const value = values[col.key];
      doc.text(value === undefined || value === null || value === '' ? '—' : String(value), x, y, {
        width: col.w - 4,
        ellipsis: true,
      });
      x += col.w;
    }
    y += rowHeight;
  }

  doc.y = y + 12;
  doc
    .font('Noto')
    .fontSize(8)
    .fillColor('#94a3b8')
    .text(
      'Chỉ số chỉ mang tính ước lượng, không thay thế bác sĩ hoặc chuyên gia dinh dưỡng.',
      startX,
      doc.y,
    );

  return renderPdf(doc, () => {});
}
