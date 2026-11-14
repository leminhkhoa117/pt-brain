const LABEL_PATTERN = /^\s*\[(Dữ kiện|Tác giả diễn giải|Nhận xét của AI)\]/i;

const SECTION_PATTERNS = {
  conclusion: /\b(in summary|in conclusion|conclusions?|summary)\b/i,
  practicalApplications: /\bpractical applications?\b/i,
  limitations: /\blimitations?\b/i,
  benefit:
    /\b(patent(?: pending)?|funding|funded|acknowledg(?:e)?ments?|disclosure|conflicts? of interest|financial support|grant)\b/i,
};

const STRUCTURAL_NUMBERS = new Set([
  '1',
  '2',
  '3',
  '4',
  '5',
  '10',
  '30',
  '50',
  '70',
  '80',
  '95',
  '100',
]);

function walkStrings(value, visit, path = '') {
  if (typeof value === 'string') {
    visit(value, path);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, visit, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (['metadata', 'verification', 'confidence', 'glossary'].includes(key)) continue;
      walkStrings(item, visit, path ? `${path}.${key}` : key);
    }
  }
}

function normalizeNumber(token = '') {
  return String(token).replace(',', '.').replace(/^\+/, '');
}

function numericTokens(text = '') {
  return [...String(text).matchAll(/\d+(?:[.,]\d+)?/g)].map((match) => normalizeNumber(match[0]));
}

function isYear(token) {
  const value = Number(token);
  return Number.isInteger(value) && value >= 1800 && value <= 2200;
}

function collectFactNumbers(facts = {}) {
  const numbers = new Set();
  const visit = (value) => {
    if (typeof value === 'string') {
      for (const token of numericTokens(value)) numbers.add(token);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === 'object') {
      Object.values(value).forEach(visit);
    }
  };
  visit(facts);
  return numbers;
}

/** Chỉ kiểm tra các con số mang nghĩa dữ liệu, tránh bắt nhầm "3 dòng", "4 nhóm". */
function isDataLikeNumber(token, context = '') {
  if (token.includes('.')) return true;
  if (STRUCTURAL_NUMBERS.has(token)) return false;
  if (isYear(token)) return false;
  if (/%|p\s*[<>=]|d\s*=|±|SD|CI|KTC|kg|m\/s|lần|rep|người|tuổi|cm/i.test(context)) {
    return true;
  }
  return token.length >= 2;
}

function normalizeSentence(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/\[[^\]]+\]/g, ' ')
    .replace(/[^a-z0-9à-ỹ\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(text = '') {
  return new Set(
    normalizeSentence(text)
      .split(' ')
      .filter((token) => token.length >= 3),
  );
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  return overlap / (a.size + b.size - overlap);
}

function splitSentences(text = '') {
  return String(text)
    .split(/(?<=[.!?;])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 25);
}

function hasLabel(text = '') {
  return LABEL_PATTERN.test(String(text));
}

function claimUnits(content = {}) {
  const units = [];
  const push = (text, where) => {
    if (typeof text === 'string' && text.trim()) units.push({ text, where });
  };
  (content.quickRead?.lines || []).forEach((line, index) =>
    push(line, `quickRead.lines[${index}]`),
  );
  (content.mainResults || []).forEach((item, index) => {
    push(item.finding, `mainResults[${index}].finding`);
    push(item.plainMeaning, `mainResults[${index}].plainMeaning`);
  });
  push(content.authorsView?.conclusion, 'authorsView.conclusion');
  (content.authorsView?.interpretations || []).forEach((item, index) =>
    push(item, `authorsView.interpretations[${index}]`),
  );
  (content.authorsView?.applications || []).forEach((item, index) =>
    push(item, `authorsView.applications[${index}]`),
  );
  for (const group of ['supported', 'hypothesis', 'notYet', 'unanswered']) {
    (content.application?.[group] || []).forEach((item, index) =>
      push(item, `application.${group}[${index}]`),
    );
  }
  (content.selfCheck || []).forEach((item, index) =>
    push(item.answer, `selfCheck[${index}].answer`),
  );
  return units;
}

function checkNumbers(content, facts, issues) {
  const factNumbers = collectFactNumbers(facts);
  walkStrings(content, (text, path) => {
    for (const match of String(text).matchAll(/\d+(?:[.,]\d+)?/g)) {
      const token = normalizeNumber(match[0]);
      const start = Math.max(0, match.index - 16);
      const context = text.slice(start, match.index + match[0].length + 16);
      if (!isDataLikeNumber(token, context)) continue;
      if (factNumbers.has(token)) continue;
      if (isYear(token)) continue;
      issues.add(`Số ${token} ở ${path} không khớp JSON dữ kiện.`);
    }
  });
}

function checkMissingSections(content, sourceText, issues) {
  const source = String(sourceText || '');
  const conclusion = `${content.authorsConclusion || ''} ${content.authorsView?.conclusion || ''}`;
  if (
    SECTION_PATTERNS.conclusion.test(source) &&
    /không nêu trong bài/i.test(conclusion) &&
    !String(conclusion).replace(/không nêu trong bài/gi, '').trim()
  ) {
    issues.add(
      'Kết luận tác giả đang để "Không nêu trong bài" nhưng toàn văn có "In summary"/"Conclusion". Hãy lấy nội dung từ mục tương đương.',
    );
  }

  const benefit = `${content.benefitSignals?.statement || ''} ${
    (content.benefitSignals?.flags || []).map((flag) => flag.text).join(' ')
  }`;
  if (
    SECTION_PATTERNS.benefit.test(source) &&
    (!benefit.trim() || /không nêu trong bài/i.test(benefit)) &&
    !(content.benefitSignals?.flags || []).length
  ) {
    issues.add(
      'Mục lợi ích/tài trợ đang trống nhưng toàn văn có patent/funding/acknowledgment/disclosure. Hãy quét lại và ghi dấu hiệu.',
    );
  }

  const authorLimitations = content.limitationsStructured?.authors || [];
  if (SECTION_PATTERNS.limitations.test(source) && authorLimitations.length === 0) {
    issues.add('Bài có mục Limitations nhưng limitationsStructured.authors đang trống.');
  }

  const applications = content.authorsView?.applications || [];
  if (SECTION_PATTERNS.practicalApplications.test(source) && applications.length === 0) {
    issues.add(
      'Bài có "Practical Applications" nhưng authorsView.applications đang trống. Hãy lấy các ý tác giả nêu.',
    );
  }
}

function checkDuplicates(content, issues) {
  const units = claimUnits(content);
  const sentencePairs = [];
  for (const unit of units) {
    for (const sentence of splitSentences(unit.text)) {
      sentencePairs.push({ sentence, where: unit.where, tokens: tokenSet(sentence) });
    }
  }

  const seenNumbers = new Map();
  for (const unit of units) {
    for (const token of numericTokens(unit.text)) {
      if (!token.includes('.')) continue;
      if (['0.05', '0.01', '0.001'].includes(token)) continue;
      const key = token;
      const list = seenNumbers.get(key) || [];
      list.push(unit.where);
      seenNumbers.set(key, list);
    }
  }
  for (const [token, places] of seenNumbers) {
    if (places.length > 1) {
      issues.add(`Số ${token} xuất hiện lặp ở: ${[...new Set(places)].join(', ')}. Mỗi ý chỉ nêu một lần.`);
    }
  }

  for (let i = 0; i < sentencePairs.length; i += 1) {
    for (let j = i + 1; j < sentencePairs.length; j += 1) {
      const a = sentencePairs[i];
      const b = sentencePairs[j];
      if (a.where === b.where) continue;
      if (jaccard(a.tokens, b.tokens) > 0.82) {
        issues.add(`Ý bị lặp giữa ${a.where} và ${b.where}: "${a.sentence.slice(0, 90)}..."`);
      }
    }
  }
}

function checkLabels(content, issues) {
  (content.mainResults || []).forEach((item, index) => {
    if (!hasLabel(item.finding)) {
      issues.add(
        `mainResults[${index}].finding phải bắt đầu bằng [Dữ kiện] (hoặc nhãn phù hợp).`,
      );
    }
    if (!hasLabel(item.plainMeaning)) {
      issues.add(
        `mainResults[${index}].plainMeaning phải bắt đầu bằng [Dữ kiện], [Tác giả diễn giải] hoặc [Nhận xét của AI].`,
      );
    }
    if (!['data', 'author', 'ai'].includes(item.claimType)) {
      issues.add(`mainResults[${index}].claimType không hợp lệ.`);
    }
  });
  (content.quickRead?.lines || []).forEach((line, index) => {
    if (!hasLabel(line)) issues.add(`quickRead.lines[${index}] phải bắt đầu bằng một nhãn.`);
  });
  if (!hasLabel(content.whyStudy)) {
    issues.add('whyStudy phải bắt đầu bằng một nhãn [Dữ kiện]/[Tác giả diễn giải]/[Nhận xét của AI].');
  } else if (/^\s*\[Nhận xét của AI\]/i.test(content.whyStudy)) {
    issues.add(
      'whyStudy là lý do tác giả làm nghiên cứu, phải dùng nhãn [Tác giả diễn giải] hoặc [Dữ kiện], không dùng [Nhận xét của AI].',
    );
  }
  if (
    /^\s*\[Tác giả diễn giải\]/i.test(content.authorsView?.conclusion || '') &&
    /dẫn tới|làm tăng|chứng minh/i.test(content.authorsView.conclusion) &&
    !/có thể|đề xuất|giả thuyết/i.test(content.authorsView.conclusion)
  ) {
    issues.add(
      'authorsView.conclusion đang khẳng định nhân quả; nếu tác giả chỉ nói could/may, phải dùng "có thể" và để giải thích đó ở phần giả thuyết.',
    );
  }
  if (!hasLabel(content.mechanism?.summary)) {
    issues.add('mechanism.summary phải bắt đầu bằng một nhãn.');
  }
  if (content.authorsView?.conclusion && !hasLabel(content.authorsView.conclusion)) {
    issues.add('authorsView.conclusion phải bắt đầu bằng [Tác giả diễn giải].');
  }
  if (content.benefitSignals?.statement && !hasLabel(content.benefitSignals.statement)) {
    issues.add('benefitSignals.statement phải bắt đầu bằng một nhãn.');
  }
  (content.limitationsStructured?.ai || []).forEach((item, index) => {
    if (!hasLabel(item)) {
      issues.add(`limitationsStructured.ai[${index}] phải bắt đầu bằng [Nhận xét của AI].`);
    }
  });
  (content.limitationsStructured?.authors || []).forEach((item, index) => {
    if (!hasLabel(item)) {
      issues.add(`limitationsStructured.authors[${index}] phải bắt đầu bằng [Tác giả diễn giải].`);
    }
  });
  for (const group of ['supported', 'hypothesis', 'notYet', 'unanswered']) {
    (content.application?.[group] || []).forEach((item, index) => {
      if (!hasLabel(item)) {
        issues.add(`application.${group}[${index}] phải bắt đầu bằng một nhãn.`);
      }
    });
  }
  (content.application?.hypothesis || []).forEach((item, index) => {
    if (!/chưa được đo|chưa đo/i.test(item)) {
      issues.add(
        `application.hypothesis[${index}] phải ghi rõ "chưa được đo" vì đây là giả thuyết tác giả chưa đo.`,
      );
    }
  });
}

function checkFactCoverage(content, facts, issues) {
  const contentText = JSON.stringify(content);
  const contentNumbers = new Set(numericTokens(contentText));
  const required = new Set();
  const add = (value) => {
    for (const token of numericTokens(value)) {
      if (isYear(token)) continue;
      if (['1', '2', '3', '4', '5'].includes(token)) continue;
      required.add(token);
    }
  };

  for (const result of (facts.results || []).slice(0, 8)) {
    add(result.p);
    add(result.d);
    add(result.ci);
    add(result.note);
    for (const arm of result.arms || []) {
      add(arm.value);
      add(arm.sd);
    }
  }
  add(facts.study?.device?.value);
  add(facts.study?.participants?.n);

  for (const token of required) {
    if (!contentNumbers.has(token)) {
      issues.add(`Thiếu số liệu ${token} có trong JSON dữ kiện. Không được bỏ sót kết quả.`);
    }
  }

  if (
    (facts.authors?.benefitSignals || []).length &&
    !(content.benefitSignals?.flags || []).length
  ) {
    issues.add('Facts có dấu hiệu lợi ích nhưng benefitSignals.flags đang trống.');
  }

  if (
    facts.authors?.conclusion?.value &&
    /không nêu trong bài/i.test(content.authorsView?.conclusion || content.authorsConclusion || '')
  ) {
    issues.add('Facts có kết luận tác giả nhưng bản viết đang ghi "Không nêu trong bài".');
  }

  if (
    facts.study?.failureCriteria?.value &&
    !/ngừng di chuyển|1 giây|một giây|gập hết|full flexion|failure/i.test(
      content.intervention || '',
    )
  ) {
    issues.add(
      'intervention phải nêu tiêu chí failure của bài (thanh tạ ngừng di chuyển, nghỉ >1 giây ở vị trí duỗi, không gập hết tầm...).',
    );
  }

  const factsText = JSON.stringify(facts).toLowerCase();
  if (
    /free weight|fwr|tạ tự do|barbell/.test(factsText) &&
    !/giảm tốc|deceleration|hãm tốc/.test(content.whyStudy || '')
  ) {
    issues.add(
      'whyStudy phải giải thích vì sao tạ tự do cần giảm tốc ở cuối tầm vận động và cơ bớt phải gồng.',
    );
  }
  if (
    /free weight|fwr|tạ tự do|barbell/.test(factsText) &&
    !/tạ tự do|free weight|fwr|barbell/i.test(content.whyStudy || '')
  ) {
    issues.add('whyStudy phải nhắc rõ "tạ tự do (free weights)" khi bài so sánh với tạ tự do.');
  }

  const scanContent = { ...content };
  delete scanContent.glossary;
  delete scanContent.metadata;
  delete scanContent.confidence;
  delete scanContent.verification;
}

function checkRequired(content, facts, issues) {
  const meta = content.metadata || {};
  if (!meta.title) issues.add('Thiếu tiêu đề bài.');
  if (!meta.authors?.length) issues.add('Thiếu danh sách tác giả.');
  if (!meta.year) issues.add('Thiếu năm công bố.');
  if (!meta.journal) issues.add('Thiếu tên tạp chí.');
  if (!meta.pages) issues.add('Thiếu số trang.');
  if (!meta.doi || /\.pdf|jsc\d|indd/i.test(meta.doi)) {
    issues.add('DOI trống hoặc trông giống tên file; hãy lấy DOI từ Crossref.');
  } else if (!/^10\.\d{4,9}\//i.test(meta.doi)) {
    issues.add(`DOI "${meta.doi}" không đúng định dạng 10.xxxx/...; hãy lấy DOI thật từ Crossref.`);
  }
  if ((content.quickRead?.lines || []).length !== 3) {
    issues.add('quickRead.lines phải có đúng 3 dòng.');
  }
  if (!content.quickRead?.readyForPt) issues.add('Thiếu câu "Dùng được cho PT chưa?".');
  if (!content.whyStudy) issues.add('Thiếu mục "Vì sao làm nghiên cứu".');
  const hasIntervention = Boolean(
    facts.study?.intervention?.value || facts.study?.device?.value,
  );
  const isExperimental = /rct|random|trial|cross-?over|intervention|thử nghiệm|can thiệp/i.test(
    `${facts.study?.design?.value || ''} ${content.studyType || ''}`,
  );
  if (hasIntervention && isExperimental) {
    if ((content.mechanism?.steps || []).length < 3) {
      issues.add('Nghiên cứu can thiệp phải có mechanism.steps ít nhất 3 bước.');
    }
    if (!content.mechanism?.whyWeightStaysStill) {
      issues.add('Thiếu giải thích vì sao tạ đứng yên lúc đầu (với can thiệp nối tiếp).');
    }
  }
  if ((content.selfCheck || []).length !== 3) {
    issues.add('selfCheck phải có đúng 3 câu hỏi-đáp.');
  }
  for (const axis of ['design', 'certainty', 'relevance']) {
    if (!content.evidenceAxes?.[axis]?.reason) {
      issues.add(`evidenceAxes.${axis} thiếu lý do.`);
    }
  }
  if ((content.glossary || []).length < 4) {
    issues.add('glossary cần ít nhất 4 thuật ngữ khó có giải thích tại chỗ.');
  }
  if (!content.benefitSignals?.statement) {
    issues.add('Thiếu benefitSignals.statement.');
  }
}

function checkDecimalFormat(content, issues) {
  const scan = { ...content };
  delete scan.glossary;
  delete scan.metadata;
  delete scan.verification;
  const allText = JSON.stringify(scan);
  const matches = [...allText.matchAll(/\b\d+,\d+\b/g)].map((match) => match[0]);
  if (matches.length) {
    issues.add(
      `Dùng dấu phẩy thập phân (${[...new Set(matches)].slice(0, 5).join(', ')}); phải giữ dấu chấm như bài gốc (12.4, 0.65).`,
    );
  }
}

function checkNumberRepeats(content, issues) {
  const occurrences = new Map();
  const pValueTokens = new Set();
  const collectPValues = (value) => {
    if (typeof value === 'string') {
      for (const match of value.matchAll(/p\s*[<>=]?\s*(\d+\.\d+)/gi)) {
        pValueTokens.add(normalizeNumber(match[1]));
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(collectPValues);
      return;
    }
    if (value && typeof value === 'object') {
      Object.values(value).forEach(collectPValues);
    }
  };
  collectPValues(content);

  const walk = (value, path = '') => {
    if (typeof value === 'string') {
      if (/\.numbers$/.test(path)) return;
      for (const match of value.matchAll(/\b\d+\.\d+\b/g)) {
        const token = match[0];
        if (['0.05', '0.01', '0.001'].includes(token)) continue;
        if (pValueTokens.has(token)) continue;
        const list = occurrences.get(token) || [];
        list.push(path);
        occurrences.set(token, list);
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (value && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if (
          ['metadata', 'glossary', 'verification', 'quote', 'page', 'secondaryResults'].includes(
            key,
          )
        ) {
          continue;
        }
        walk(item, path ? `${path}.${key}` : key);
      }
    }
  };
  walk(content);
  for (const [token, places] of occurrences) {
    if (places.length > 1) {
      issues.add(
        `Số ${token} lặp ${places.length} lần ở: ${[...new Set(places)].join(', ')}. Mỗi số chỉ nêu một lần, ưu tiên trong "numbers".`,
      );
    }
  }
}

function checkForbiddenPhrases(content, facts, sourceText, issues) {
  const scan = { ...content };
  delete scan.verification;
  const allText = JSON.stringify(scan);
  if (/\bJSON\b/i.test(allText)) {
    issues.add('Không được nhắc đến "JSON" trong bản viết cho người đọc; hãy dùng ngôn ngữ tự nhiên.');
  }
  const forbidden = [
    /không có khác biệt/gi,
    /không cảm thấy khó hơn/gi,
    /lần lặp nhanh nhất/gi,
    /\bmỏi\b/gi,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(allText)) {
      issues.add(
        `Có cụm từ không được dùng: "${allText.match(pattern)?.[0]}". Với p>0.05 hãy viết "không phát hiện khác biệt".`,
      );
    }
  }

  const factHasCi = (facts.results || []).some((result) => String(result.ci || '').trim());
  const sourceHasCi = /95\s*%\s*(CI|KTC|confidence)/i.test(String(sourceText || ''));
  const ciMentions = allText.replace(
    /(không|chưa|thiếu|không có|không kèm)[^.]{0,120}(KTC|95\s*%\s*CI|khoảng tin cậy)/gi,
    ' ',
  );
  if (
    !factHasCi &&
    !sourceHasCi &&
    /(KTC\s*95|95\s*%\s*CI|khoảng tin cậy)/i.test(ciMentions)
  ) {
    issues.add('Bài không báo KTC 95%/CI nhưng bản viết có nhắc KTC. Hãy bỏ phần hướng dẫn KTC.');
  }
}

function normalizeQuote(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Kiểm tra trích nguyên văn của facts có thật sự xuất hiện trong toàn văn.
 * Đây là audit cho bước 1, không dùng để bắt writer sửa.
 */
export function verifyFactsQuotes({ facts, sourceText }) {
  const normalizedSource = normalizeQuote(
    String(sourceText || '').replace(/\[\[page\s+\d+\]\]/gi, ' '),
  );
  if (!normalizedSource) return { passed: true, warnings: [] };

  const warnings = [];
  const visit = (value, path = '') => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }
    if (!value || typeof value !== 'object') return;

    if (typeof value.quote === 'string' && value.quote.trim().length >= 18) {
      const quote = normalizeQuote(value.quote);
      if (quote && !normalizedSource.includes(quote)) {
        warnings.push(
          `Trích nguyên văn không khớp toàn văn${value.page ? ` (tr. ${value.page})` : ''}: "${value.quote.slice(0, 120)}"`,
        );
      }
    }
    for (const [key, item] of Object.entries(value)) {
      if (key === 'quote') continue;
      visit(item, path ? `${path}.${key}` : key);
    }
  };
  visit(facts);
  return { passed: warnings.length === 0, warnings: warnings.slice(0, 10) };
}
export function verifySummary({ content, facts, sourceText }) {
  const issues = new Set();
  checkNumbers(content, facts, issues);
  checkFactCoverage(content, facts, issues);
  checkMissingSections(content, sourceText, issues);
  checkDuplicates(content, issues);
  checkNumberRepeats(content, issues);
  checkLabels(content, issues);
  checkRequired(content, facts, issues);
  checkDecimalFormat(content, issues);
  checkForbiddenPhrases(content, facts, sourceText, issues);

  return {
    passed: issues.size === 0,
    issues: [...issues],
  };
}
