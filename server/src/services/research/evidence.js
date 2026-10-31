/**
 * Xếp mức bằng chứng bằng code (không để AI đoán), theo publicationTypes của PubMed/Europe PMC.
 * 1: meta-analysis / systematic review
 * 2: RCT
 * 3: cohort / case-control / cross-sectional
 * 4: case report / nghiên cứu nhỏ không đối chứng
 * 5: ý kiến chuyên gia / bình luận / không rõ
 */
export function evidenceLevelFromPublicationTypes(types = []) {
  const text = types.join(' ').toLowerCase();
  if (/meta[- ]?analysis|systematic review/.test(text)) {
    return { level: 1, label: 'Meta-analysis / Systematic review' };
  }
  if (/randomi[sz]ed controlled trial|randomi[sz]ed trial|\brct\b/.test(text)) {
    return { level: 2, label: 'Randomized controlled trial' };
  }
  if (/cohort|case[- ]control|cross[- ]sectional|observational/.test(text)) {
    return { level: 3, label: 'Nghiên cứu quan sát' };
  }
  if (/case report|case series|clinical trial|non[- ]randomi[sz]ed/.test(text)) {
    return { level: 4, label: 'Case report / nghiên cứu nhỏ' };
  }
  return { level: 5, label: 'Ý kiến chuyên gia / chưa phân loại' };
}

export const EVIDENCE_LABELS = {
  1: 'Mức 1 · Meta-analysis / Systematic review',
  2: 'Mức 2 · RCT',
  3: 'Mức 3 · Nghiên cứu quan sát',
  4: 'Mức 4 · Case report / nghiên cứu nhỏ',
  5: 'Mức 5 · Ý kiến chuyên gia',
};
