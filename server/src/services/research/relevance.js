const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'been',
  'being',
  'between',
  'by',
  'during',
  'for',
  'from',
  'has',
  'have',
  'in',
  'into',
  'is',
  'it',
  'its',
  'of',
  'on',
  'or',
  'over',
  'than',
  'that',
  'the',
  'their',
  'these',
  'this',
  'those',
  'to',
  'under',
  'using',
  'via',
  'was',
  'were',
  'with',
  'without',
  'not',
  'no',
  'study',
  'studies',
  'trial',
  'trials',
  'review',
  'reviews',
  'effect',
  'effects',
  'analysis',
  'meta',
]);

const normalize = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const CLINICAL_RE =
  /\b(patient|patients|asthma|copd|chronic obstructive|respiratory illness|respiratory disease|pulmonary disease|pulmonary rehabilitation|neuromuscular|stroke|surgery|postoperative|intensive care|mechanical ventilation|cancer|heart failure|disease|disorder|syndrome|bronchiectasis|cystic fibrosis|airway clearance|active cycle|obese|obesity|labour|labor|pregnan\w*|low back pain|shoulder pain|knee osteoarthritis|osteoarthritis|acl|anterior cruciate|rotator cuff|tendinopathy|dau lung|dau vai|dau goi|thoai hoa|chan thuong|phuc hoi|benh nhan|benh|hen|phau thuat|dot quy|ung thu|suy tim)\b/;
const HEALTHY_RE =
  /\b(healthy|athlete|athletes|triathlet\w*|cyclists?|trained|runners?|swimmers?|soccer|football|basketball|weightlift\w*|powerlift\w*|recreationally active|young adults?|strength trained|resistance trained)\b/;

const BREATHING_TERMS = [
  'breathing technique',
  'breathing pattern',
  'breathing strategy',
  'breathing exercises',
  'respiratory muscle training',
  'inspiratory muscle training',
  'Valsalva maneuver',
  'intra-abdominal pressure',
  'bracing',
  'diaphragmatic breathing',
  'nasal breathing',
  'ventilatory response',
  'respiratory response',
];
const BROAD_BREATHING_RE = /\b(hit tho|ho hap|tho|breath\w*|respirat\w*)\b/;
const SPECIFIC_BREATHING_RE =
  /\b(valsalva|bracing|diaphragm\w*|nasal|intra abdominal|inspiratory muscle|respiratory muscle)\b/;

const tokenize = (value = '') =>
  normalize(value)
    .split(' ')
    .filter((token) => token && !STOPWORDS.has(token) && token.length >= 2);

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const phraseTokens = (value = '') => normalize(value).split(' ').filter(Boolean);

/** Bỏ "s" số nhiều nhưng giữ các đuôi như "analysis", "status". */
const stemToken = (token = '') => {
  if (token.length > 3 && token.endsWith('s') && !/(ss|us|is)$/.test(token)) {
    return token.slice(0, -1);
  }
  return token;
};

/** Khớp nguyên cụm (chấp nhận số nhiều), tránh "breathing exercises" khớp "breathing during exercise". */
const containsPhrase = (text = '', term = '') => {
  const tokens = phraseTokens(term).map(stemToken);
  if (!tokens.length) return false;
  const pattern = tokens.map((token) => `${escapeRegExp(token)}(?:s|es)?`).join('\\s+');
  return new RegExp(`(^| )${pattern}(?= |$)`).test(text);
};

/** Khớp token nguyên vẹn (chấp nhận thêm "s"/"es" để bắt số nhiều). */
const containsToken = (text = '', token = '') => {
  if (!text || !token) return false;
  const pattern = new RegExp(`(^| )${escapeRegExp(token)}(s|es)?(?= |$)`);
  return pattern.test(text);
};

const termTokens = (term = '') => [...new Set(tokenize(term))];

function matchTerm(term, title, abstract, { mode = 'phrase', minRatio = 0.6 } = {}) {
  if (mode === 'phrase') {
    if (containsPhrase(title, term)) return 1;
    if (containsPhrase(abstract, term)) return 0.5;
    return 0;
  }

  const tokens = termTokens(term);
  if (!tokens.length) return 0;

  const required = tokens.length === 1 ? 1 : Math.max(2, Math.ceil(tokens.length * minRatio));
  const titleMatches = tokens.filter((token) => containsToken(title, token)).length;
  const abstractMatches = tokens.filter((token) => containsToken(abstract, token)).length;

  if (titleMatches >= required) return 1;
  if (abstractMatches >= required) return 0.5;
  return 0;
}

/**
 * Chuẩn bị ngữ cảnh liên quan. Ưu tiên concepts do AI trả về; nếu người dùng
 * tự nhập truy vấn thì dùng chính các truy vấn làm nhóm khái niệm.
 */
export function buildRelevanceContext({ concepts = [], queries = [], question = '' } = {}) {
  const groups = (Array.isArray(concepts) ? concepts : [])
    .filter((concept) => concept && Array.isArray(concept.terms) && concept.terms.length)
    .map((concept) => ({
      label: concept.label || '',
      terms: concept.terms.map((term) => String(term || '').trim()).filter(Boolean),
      mode: 'phrase',
    }))
    .filter((group) => group.terms.length);

  const questionText = normalize(question);
  const questionClinical = CLINICAL_RE.test(questionText);
  const broadBreathing =
    BROAD_BREATHING_RE.test(questionText) && !SPECIFIC_BREATHING_RE.test(questionText);

  // Câu hỏi hô hấp rộng: bổ sung thuật ngữ chuẩn để concept chính không bỏ sót
  // các bài dùng "respiratory muscle training", "Valsalva", "bracing"...
  if (broadBreathing && groups.length) {
    groups[0] = {
      ...groups[0],
      terms: [...new Set([...groups[0].terms, ...BREATHING_TERMS])],
    };
  }

  if (groups.length) return { groups, source: 'concepts', questionClinical, requirePrimary: true };

  const fallback = (Array.isArray(queries) ? queries : [])
    .map((query) => String(query || '').trim())
    .filter(Boolean)
    .map((query) => ({
      label: query,
      terms: [query],
      mode: 'tokens',
      minRatio: 0.4,
    }));

  return fallback.length
    ? { groups: fallback, source: 'queries', questionClinical, requirePrimary: false }
    : null;
}

/**
 * Điểm liên quan 0..1 dựa trên độ phủ concept, ưu tiên khớp ở title.
 * `primaryMatch` bắt buộc khớp concept đầu tiên (chủ đề/can thiệp chính).
 */
export function scoreRelevance(item = {}, context) {
  if (!context || !context.groups?.length) {
    return { score: 0, primaryMatch: true, matchedConcepts: [] };
  }

  const title = normalize(item.title || '');
  const abstract = normalize(item.abstract || '');
  const scores = context.groups.map((group) => {
    let best = 0;
    for (const term of group.terms) {
      best = Math.max(best, matchTerm(term, title, abstract, group));
    }
    return best;
  });

  const primaryMatch = context.requirePrimary
    ? scores[0] > 0
    : scores.some((value) => value > 0);
  if (!primaryMatch) {
    return { score: 0, primaryMatch: false, matchedConcepts: [] };
  }

  const matchedConcepts = context.groups
    .filter((_, index) => scores[index] > 0)
    .map((group) => group.label)
    .filter(Boolean);

  const coverage = scores.reduce((total, value) => total + value, 0) / scores.length;
  let score = coverage;
  if (scores[0] === 1 && coverage >= 0.5) score += 0.1;
  if (scores.filter((value) => value > 0).length >= 2) score += 0.05;

  // Bài chỉ nhắc chủ đề chính trong abstract (không phải title) thường là
  // bài liên quan thoáng qua; hạ nhẹ để bài đúng chủ đề lên trước.
  if (context.source === 'concepts' && scores[0] < 1) {
    score *= 0.7;
  }

  // Câu hỏi không nhắc bệnh lý: hạ mạnh điểm bài chỉ trên population bệnh lý,
  // tránh review COPD/hen lấn át nghiên cứu trên người tập khỏe mạnh.
  const fullText = `${title} ${abstract}`;
  const titleHealthy = HEALTHY_RE.test(title);
  if (!context.questionClinical && CLINICAL_RE.test(fullText) && !titleHealthy) {
    score = Math.max(0, score * 0.35 - 0.15);
  }

  return {
    score: Math.min(1, Number(score.toFixed(3))),
    primaryMatch,
    matchedConcepts,
  };
}
