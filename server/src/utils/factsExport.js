/**
 * Chuẩn hoá facts JSON thành dữ liệu dễ đọc cho phụ lục audit
 * trong bản export Markdown/PDF.
 */
export function buildFactsAudit(facts = {}) {
  const study = facts.study || {};
  const participants = study.participants || {};
  const results = (facts.results || []).map((result, index) => ({
    index: index + 1,
    outcome: result.outcome || result.id || '',
    arms: (result.arms || [])
      .map((arm) =>
        [arm.name, arm.value, arm.sd ? `± ${arm.sd}` : '', arm.n ? `(n=${arm.n})` : '']
          .filter(Boolean)
          .join(' '),
      )
      .join('; '),
    test: [result.p, result.d, result.ci].filter(Boolean).join(' · '),
    note: result.note || '',
    page: Number(result.page) || 0,
    quote: result.quote || '',
  }));

  return {
    design: study.design?.value || '',
    participants: [
      participants.n ? `n = ${participants.n}` : '',
      participants.description?.value || '',
    ]
      .filter(Boolean)
      .join(' · '),
    intervention: study.intervention?.value || '',
    device: study.device?.value || '',
    measurement: study.measurement?.value || '',
    failureCriteria: study.failureCriteria?.value || '',
    results,
    conclusion: facts.authors?.conclusion?.value || '',
    applications: (facts.authors?.applications || []).map((item) => item.value).filter(Boolean),
    limitations: (facts.authors?.limitations || []).map((item) => item.value).filter(Boolean),
    benefitSignals: (facts.authors?.benefitSignals || [])
      .map((item) => item.value)
      .filter(Boolean),
  };
}
