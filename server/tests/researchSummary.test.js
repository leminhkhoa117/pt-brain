import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { summaryContentSchema } from '../src/validation/summary.js';
import { verifySummary, verifyFactsQuotes } from '../src/services/ai/summaryVerifier.js';
import { augmentFactsFromText } from '../src/services/ai/paperFacts.js';
import { extractBibliographicHints } from '../src/services/research/metadata.js';
import { extractDoi, doiFromFilename, formatDoiForDisplay } from '../src/utils/doi.js';
import { orderPageItems } from '../src/services/research/pdfLayout.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(
  fs.readFileSync(
    path.join(here, 'fixtures/research-corpus/sample-garcia-lopez-2010.json'),
    'utf8',
  ),
);
const steves = JSON.parse(
  fs.readFileSync(
    path.join(here, 'fixtures/research-corpus/sample-steves-2016.json'),
    'utf8',
  ),
);
const schoenfeld = JSON.parse(
  fs.readFileSync(
    path.join(here, 'fixtures/research-corpus/sample-schoenfeld-2019.json'),
    'utf8',
  ),
);
const morton = JSON.parse(
  fs.readFileSync(
    path.join(here, 'fixtures/research-corpus/sample-morton-2018.json'),
    'utf8',
  ),
);
const ralston = JSON.parse(
  fs.readFileSync(
    path.join(here, 'fixtures/research-corpus/sample-ralston-2017.json'),
    'utf8',
  ),
);
const sourceKeywords =
  'In summary. Practical Applications. Limitations. Patent pending. Funding. Conflict of interest.';

function verify(content = golden.content) {
  return verifySummary({ content, facts: golden.facts, sourceText: sourceKeywords });
}

describe('golden sample — García-López 2010', () => {
  it('metadata đúng, không dùng tên file làm tiêu đề', () => {
    const meta = golden.content.metadata;
    expect(meta.title).toMatch(/Influence of .*Elastic Resistance/i);
    expect(meta.title).not.toMatch(/JSC201360|\.pdf|indd/i);
    expect(meta.authors.length).toBeGreaterThanOrEqual(5);
    expect(meta.year).toBe(2010);
    expect(meta.volume).toBe('24');
    expect(meta.issue).toBe('9');
    expect(meta.pages).toBe('2449-2455');
    expect(meta.doi.toLowerCase()).toBe('10.1519/jsc.0b013e3181e3482f');
  });

  it('có kết luận tác giả, không phải "Không nêu trong bài"', () => {
    expect(golden.content.authorsView.conclusion).toBeTruthy();
    expect(golden.content.authorsView.conclusion).not.toMatch(/không nêu trong bài/i);
  });

  it('có cờ patent pending và novel/inexpensive', () => {
    const flags = golden.content.benefitSignals.flags.map((flag) => flag.text).join(' ');
    expect(flags).toMatch(/patent/i);
    expect(flags).toMatch(/mới|novel|rẻ|inexpensive/i);
  });

  it('có mục vì sao, cơ chế nối tiếp, 5 kg, 70% 1RM, giải thích tạ đứng yên', () => {
    expect(golden.content.whyStudy).toMatch(/tạ tự do/i);
    expect(golden.content.whyStudy).toMatch(/giảm tốc/i);
    const mechanism = JSON.stringify(golden.content.mechanism);
    expect(mechanism).toMatch(/nối tiếp|in series/i);
    expect(mechanism).toMatch(/5 kg/i);
    expect(mechanism).toMatch(/70% 1RM/i);
    expect(golden.content.mechanism.whyWeightStaysStill).toMatch(/đứng yên|chưa nhấc/i);
  });

  it('ứng dụng có phì đại chưa đo và ý gia tốc đỉnh/VĐV', () => {
    const application = JSON.stringify(golden.content.application);
    expect(application).toMatch(/phì đại/i);
    expect(application).toMatch(/chưa được đo/i);
    expect(application).toMatch(/gia tốc đỉnh/i);
    expect(application).toMatch(/vận động viên|sức mạnh|power/i);
  });

  it('nêu tiêu chí failure của bài', () => {
    expect(golden.content.intervention).toMatch(/ngừng di chuyển/i);
    expect(golden.content.intervention).toMatch(/1 giây|một giây/i);
    expect(golden.content.intervention).toMatch(/gập/i);
  });

  it('có 3 câu tự kiểm tra và 3 trục bằng chứng', () => {
    expect(golden.content.selfCheck).toHaveLength(3);
    for (const axis of ['design', 'certainty', 'relevance']) {
      expect(golden.content.evidenceAxes[axis].rating).toBeTruthy();
      expect(golden.content.evidenceAxes[axis].reason).toBeTruthy();
    }
  });

  it('mọi kết quả có nhãn và claimType', () => {
    for (const item of golden.content.mainResults) {
      expect(item.finding).toMatch(/^\[(Dữ kiện|Tác giả diễn giải|Nhận xét của AI)\]/);
      expect(['data', 'author', 'ai']).toContain(item.claimType);
    }
  });

  it('không còn cụm từ bị cấm', () => {
    const text = JSON.stringify(golden.content);
    expect(text).not.toMatch(/không có khác biệt/i);
    expect(text).not.toMatch(/\bmỏi\b/i);
    expect(text).not.toMatch(/KTC|95% CI|khoảng tin cậy/i);
    expect(text).not.toMatch(/nhanh nhất/i);
  });

  it('đủ các con số then chốt', () => {
    const text = JSON.stringify(golden.content);
    for (const number of [
      '12.4',
      '10.9',
      '12.3',
      '0.01',
      '0.65',
      '7.9',
      '8.2',
      '0.157',
      '0.161',
      '18.6',
      '0.91',
    ]) {
      expect(text).toContain(number);
    }
    for (const marker of ['10%', '50%', '80%']) {
      expect(text).toContain(marker);
    }
  });

  it('có thuật ngữ khó được giải thích tại chỗ', () => {
    const terms = golden.content.glossary.map((term) => `${term.en} ${term.vi}`.toLowerCase());
    for (const expected of ['acceleration', 'velocity', 'intrarepetition', 'effect size', 'omni-res', 'cross-over', 'pulley']) {
      expect(terms.join(' ')).toContain(expected);
    }
  });

  it('qua kiểm tra tự động', () => {
    const result = verify();
    expect(result.issues).toEqual([]);
    expect(result.passed).toBe(true);
  });
});

describe('golden sample — Steves 2016 (quan sát)', () => {
  it('metadata đúng, không dùng tên file', () => {
    const meta = steves.content.metadata;
    expect(meta.title).toMatch(/Kicking Back Cognitive Ageing/i);
    expect(meta.title).not.toMatch(/GER441029|\.pdf|indd/i);
    expect(meta.year).toBe(2016);
    expect(meta.volume).toBe('62');
    expect(meta.issue).toBe('2');
    expect(meta.pages).toBe('138-149');
    expect(meta.doi).toBe('10.1159/000441029');
  });

  it('là nghiên cứu quan sát, không bắt buộc cơ chế thiết bị', () => {
    expect(steves.content.studyType).toMatch(/quan sát/i);
    expect(steves.content.mechanism.whyWeightStaysStill).toMatch(/không áp dụng/i);
  });

  it('có kết luận, 3 trục, 4 nhóm ứng dụng và số liệu chính', () => {
    expect(steves.content.authorsView.conclusion).toMatch(/suy giảm nhận thức/i);
    expect(steves.content.evidenceAxes.relevance.rating).toBe('thấp');
    for (const key of ['supported', 'hypothesis', 'notYet', 'unanswered']) {
      expect(Array.isArray(steves.content.application[key])).toBe(true);
    }
    const text = JSON.stringify(steves.content);
    for (const number of ['0.174', '0.002', '0.362', '0.005']) {
      expect(text).toContain(number);
    }
  });

  it('không có cụm từ bị cấm', () => {
    const text = JSON.stringify(steves.content);
    expect(text).not.toMatch(/không có khác biệt/i);
    expect(text).not.toMatch(/\bmỏi\b/i);
    expect(text).not.toMatch(/nhanh nhất/i);
  });

  it('qua kiểm tra tự động của pipeline', () => {
    expect(steves.content.verification.passed).toBe(true);
  });
});

describe('golden sample — Schoenfeld 2019 (RCT)', () => {
  it('metadata đúng, là RCT', () => {
    const meta = schoenfeld.content.metadata;
    expect(meta.title).toMatch(/Resistance Training Volume Enhances Muscle Hypertrophy/i);
    expect(meta.year).toBe(2019);
    expect(meta.volume).toBe('51');
    expect(meta.pages).toMatch(/^\d{2,4}-\d{2,4}$/);
    expect(meta.doi.toLowerCase()).toBe('10.1249/mss.0000000000001764');
    expect(schoenfeld.content.studyType).toMatch(/RCT|ngẫu nhiên/i);
  });

  it('có kết luận, 3 trục, 4 nhóm ứng dụng', () => {
    expect(schoenfeld.content.authorsView.conclusion).toBeTruthy();
    for (const axis of ['design', 'certainty', 'relevance']) {
      expect(schoenfeld.content.evidenceAxes[axis].rating).toBeTruthy();
    }
    for (const key of ['supported', 'hypothesis', 'notYet', 'unanswered']) {
      expect(Array.isArray(schoenfeld.content.application[key])).toBe(true);
    }
  });

  it('không lặp p-value giữa hai kết quả', () => {
    const result = verifySummary({
      content: schoenfeld.content,
      facts: schoenfeld.facts,
      sourceText: '',
    });
    expect(result.issues.join(' ')).not.toMatch(/0\.02/);
    expect(result.passed).toBe(true);
  });

  it('qua kiểm tra tự động của pipeline', () => {
    expect(schoenfeld.content.verification.passed).toBe(true);
  });
});

describe('golden sample — Morton 2018 (SR/MA)', () => {
  it('metadata đúng, là meta-analysis', () => {
    const meta = morton.content.metadata;
    expect(meta.title).toMatch(/protein supplementation/i);
    expect(meta.year).toBe(2018);
    expect(meta.doi.toLowerCase()).toBe('10.1136/bjsports-2017-097608');
    expect(morton.content.studyType).toMatch(/meta-analysis|tổng quan hệ thống/i);
  });

  it('kết luận có nội dung và qua kiểm tra', () => {
    expect(morton.content.authorsView.conclusion).toMatch(/protein|khối cơ|sức mạnh/i);
    expect(morton.content.verification.passed).toBe(true);
  });
});

describe('golden sample — Ralston 2017 (meta-analysis)', () => {
  it('metadata đúng, là meta-analysis', () => {
    const meta = ralston.content.metadata;
    expect(meta.title).toMatch(/Weekly Set Volume on Strength Gain/i);
    expect(meta.year).toBe(2017);
    expect(meta.pages).toBe('2585-2601');
    expect(meta.doi.toLowerCase()).toBe('10.1007/s40279-017-0762-7');
    expect(ralston.content.studyType).toMatch(/meta-analysis|tổng quan/i);
  });

  it('có quickRead 3 dòng, kết luận và verification pass', () => {
    expect(ralston.content.quickRead.lines).toHaveLength(3);
    expect(ralston.content.quickRead.readyForPt).toBeTruthy();
    expect(ralston.content.authorsView.conclusion).toMatch(/sức mạnh|1RM/i);
    expect(ralston.content.verification.passed).toBe(true);
  });

  it('không còn lỗi lặp số trong secondaryResults', () => {
    const result = verifySummary({
      content: ralston.content,
      facts: ralston.facts,
      sourceText: '',
    });
    expect(result.passed).toBe(true);
  });
});

describe('verifier bắt lỗi', () => {
  it('bắt lặp số 18.6 trong prose', () => {
    const broken = structuredClone(golden.content);
    broken.quickRead.lines[0] = `${broken.quickRead.lines[0]} (18.6%)`;
    broken.mainResults[4].finding = `${broken.mainResults[4].finding} (18.6%)`;
    const result = verify(broken);
    expect(result.passed).toBe(false);
    expect(result.issues.join(' ')).toMatch(/18\.6/);
  });

  it('bắt kết luận "Không nêu" khi bài có In summary', () => {
    const broken = structuredClone(golden.content);
    broken.authorsConclusion = 'Không nêu trong bài';
    broken.authorsView.conclusion = 'Không nêu trong bài';
    const result = verify(broken);
    expect(result.passed).toBe(false);
    expect(result.issues.join(' ')).toMatch(/In summary|kết luận/i);
  });

  it('bắt kết quả thiếu nhãn', () => {
    const broken = structuredClone(golden.content);
    broken.mainResults[0].finding = 'Số lần lặp giảm.';
    const result = verify(broken);
    expect(result.passed).toBe(false);
    expect(result.issues.join(' ')).toMatch(/nhãn/i);
  });

  it('audit trích nguyên văn facts', () => {
    const facts = {
      results: [
        { page: 2, quote: 'the barbell ceased to move' },
        { page: 3, quote: 'a quote that is not in the source text' },
      ],
    };
    const result = verifyFactsQuotes({
      facts,
      sourceText: '[[page 2]] the barbell ceased to move, if the subject paused more than 1 second',
    });
    expect(result.passed).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toMatch(/không khớp/i);
  });

  it('quét heading dự phòng khi model bỏ sót Conclusion', () => {
    const facts = {
      authors: { conclusion: { value: '', page: 0, quote: '', source: '' }, applications: [] },
      sections: {},
    };
    const result = augmentFactsFromText(
      facts,
      '[[page 3]]\nConclusion\nProtein supplementation augments muscle mass and strength.\n\nSummary box\nBackground...',
    );
    expect(result.authors.conclusion.value).toMatch(/Protein supplementation/i);
    expect(result.authors.conclusion.page).toBe(3);
    expect(result.sections.conclusion).toBe(true);
  });
});

describe('metadata helpers', () => {
  it('trích volume/issue/năm/trang từ trang đầu PDF', () => {
    const hints = extractBibliographicHints(
      'VOLUME 24 | NUMBER 9 | SEPTEMBER 2010 |2449\nJ Strength Cond Res 24(9): 2449–2455, 2010\nJournal of Strength and Conditioning Research',
    );
    expect(hints.volume).toBe('24');
    expect(hints.issue).toBe('9');
    expect(hints.year).toBe(2010);
    expect(hints.pageStart).toBe('2449');
    expect(hints.pageEnd).toBe('2455');
    expect(hints.journalFull).toMatch(/Journal of Strength and Conditioning Research/i);
  });

  it('trích DOI từ text và tên file', () => {
    expect(extractDoi('doi: 10.1519/JSC.0b013e3181e3482f')).toBe(
      '10.1519/JSC.0b013e3181e3482f',
    );
    expect(doiFromFilename('10.1519-JSC.0b013e3181e3482f.pdf')).toBe(
      '10.1519/JSC.0b013e3181e3482f',
    );
  });

  it('hiển thị DOI giữ chữ hoa mã publisher', () => {
    expect(formatDoiForDisplay('10.1519/jsc.0b013e3181e3482f')).toBe(
      '10.1519/JSC.0b013e3181e3482f',
    );
    expect(formatDoiForDisplay('10.1159/000441029')).toBe('10.1159/000441029');
    expect(formatDoiForDisplay('10.1007/s40279-017-0762-7')).toBe(
      '10.1007/s40279-017-0762-7',
    );
  });
});

describe('đọc PDF hai cột', () => {
  it('đọc hết cột trái rồi cột phải, không trộn dòng cùng y', () => {
    const items = [
      { str: 'LEFT ONE', transform: [0, 0, 0, 8, 50, 700], width: 80, height: 8 },
      { str: 'RIGHT ONE', transform: [0, 0, 0, 8, 320, 700], width: 85, height: 8 },
      { str: 'LEFT TWO', transform: [0, 0, 0, 8, 50, 680], width: 80, height: 8 },
      { str: 'RIGHT TWO', transform: [0, 0, 0, 8, 320, 680], width: 85, height: 8 },
    ];
    const result = orderPageItems(items, 800);
    const text = result.text;
    expect(result.columns).toBeGreaterThanOrEqual(2);
    expect(text.indexOf('LEFT ONE')).toBeLessThan(text.indexOf('LEFT TWO'));
    expect(text.indexOf('LEFT TWO')).toBeLessThan(text.indexOf('RIGHT ONE'));
    expect(text.indexOf('RIGHT ONE')).toBeLessThan(text.indexOf('RIGHT TWO'));
  });
});

describe('schema tương thích', () => {
  it('nhận bản cũ thiếu field mới', () => {
    const parsed = summaryContentSchema.parse({
      tldr: 'x',
      studyType: 'RCT',
      mainResults: [{ finding: 'a', plainMeaning: 'b' }],
    });
    expect(parsed.mainResults[0].claimType).toBe('data');
    expect(parsed.quickRead.lines).toEqual([]);
    expect(parsed.evidenceAxes.design.rating).toBe('vừa');
  });
});
