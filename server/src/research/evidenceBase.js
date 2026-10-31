/**
 * Cơ sở bằng chứng đã kiểm chứng metadata qua Europe PMC.
 * Dùng để nạp context cho AI khi đánh giá thể trạng, bữa ăn và giáo án.
 * Mỗi entry có mức bằng chứng, khoảng thực hành và trích dẫn gốc.
 */
export const EVIDENCE_BASE = [
  {
    id: 'E1',
    topic: 'volume',
    strength: 'cao',
    level: 1,
    claim:
      'Volume tập kháng lực hằng tuần có quan hệ liều–đáp với phì đại cơ: nhiều set hơn (trong khoảng hợp lý) cho nhiều lợi ích hơn, nhưng lợi ích tăng chậm dần.',
    practicalRange: '10-20 set/nhóm cơ/tuần cho người có nền tảng; người mới nên bắt đầu 8-12 set và tăng dần.',
    citation: {
      title:
        'Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis',
      authors: 'Schoenfeld BJ, Ogborn D, Krieger JW',
      journal: 'Journal of Sports Sciences',
      year: 2017,
      doi: '10.1080/02640414.2016.1210197',
      pmid: '27433992',
    },
  },
  {
    id: 'E2',
    topic: 'frequency',
    strength: 'cao',
    level: 1,
    claim:
      'Khi volume được cân bằng, tập mỗi nhóm cơ 2 lần/tuần thường cho phì đại tốt hơn 1 lần/tuần; tần suất cao hơn giúp chia nhỏ volume và giảm mệt mỏi mỗi buổi.',
    practicalRange: 'Mỗi nhóm cơ chính 2 lần/tuần; 3 lần có thể phù hợp khi volume cao và hồi phục tốt.',
    citation: {
      title:
        'Effects of Resistance Training Frequency on Measures of Muscle Hypertrophy: A Systematic Review and Meta-Analysis',
      authors: 'Schoenfeld BJ, Ogborn D, Krieger JW',
      journal: 'Sports Medicine',
      year: 2016,
      doi: '10.1007/s40279-016-0543-8',
      pmid: '27102172',
    },
  },
  {
    id: 'E3',
    topic: 'protein',
    strength: 'cao',
    level: 1,
    claim:
      'Protein bổ sung giúp tăng khối cơ và sức mạnh khi tập kháng lực; lợi ích tăng chậm dần và đạt plateau quanh 1.6 g/kg/ngày, với khoảng tin cậy trên tới ~2.2 g/kg.',
    practicalRange: '1.6-2.2 g/kg/ngày; chia đều 3-5 bữa, mỗi bữa 0.25-0.4 g/kg là hợp lý.',
    citation: {
      title:
        'A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength in healthy adults',
      authors: 'Morton RW, Murphy KT, McKellar SR, et al.',
      journal: 'British Journal of Sports Medicine',
      year: 2018,
      doi: '10.1136/bjsports-2017-097608',
      pmid: '28698222',
    },
  },
  {
    id: 'E4',
    topic: 'effort',
    strength: 'trung bình-cao',
    level: 1,
    claim:
      'Tập gần thất bại (0-3 RIR) và tập tới thất bại cho phì đại tương đương ở nhiều bối cảnh; tập thất bại thường tăng mệt mỏi và giảm hiệu suất các set sau.',
    practicalRange: 'Phần lớn set ở RIR 1-3; chỉ set cuối bài mới nên chạm RIR 0-1.',
    citation: {
      title:
        'Influence of Resistance Training Proximity-to-Failure on Skeletal Muscle Hypertrophy: A Systematic Review with Meta-Analysis',
      authors: 'Refalo MC, Helms ER, Trexler ET, Hamilton DL, Fyfe JJ',
      journal: 'Sports Medicine',
      year: 2023,
      doi: '10.1007/s40279-022-01784-y',
      pmid: '36334240',
    },
  },
  {
    id: 'E5',
    topic: 'rest',
    strength: 'trung bình',
    level: 1,
    claim:
      'Nghỉ dài hơn giữa các set (khoảng 2-3 phút) cho sức mạnh và phì đại tốt hơn nghỉ ngắn (~1 phút) ở bài compound, nhờ duy trì chất lượng set.',
    practicalRange: 'Compound 2-3 phút; isolation 60-90 giây; điều chỉnh theo mục tiêu và thời gian buổi tập.',
    citation: {
      title:
        'Effects of Rest Interval Duration in Resistance Training on Measures of Muscular Strength: A Systematic Review',
      authors: 'Grgic J, Schoenfeld BJ, Skrepnik M, Davies TB, Mikulic P',
      journal: 'Sports Medicine',
      year: 2018,
      doi: '10.1007/s40279-017-0788-x',
      pmid: '28933024',
    },
  },
  {
    id: 'E6',
    topic: 'prescription',
    strength: 'cao',
    level: 1,
    claim:
      'Volume, tần suất, cường độ và mức nỗ lực đều ảnh hưởng đến phì đại/sức mạnh; không có một giáo án tối ưu cho tất cả, cần cá nhân hóa theo trình độ, thời gian và hồi phục.',
    practicalRange: 'Cá nhân hóa, ưu tiên compound, tăng dần volume, giữ 1-3 RIR và theo dõi phản hồi 4-6 tuần.',
    citation: {
      title:
        'The influence of resistance exercise training prescription variables on skeletal muscle mass, strength, and physical function in healthy adults: An umbrella review',
      authors: 'McLeod JC, Currier BS, Lowisz CV, Phillips SM',
      journal: 'Journal of Sport and Health Science',
      year: 2024,
      doi: '10.1016/j.jshs.2023.06.005',
      pmid: '37385345',
    },
  },
  {
    id: 'E7',
    topic: 'fat_loss',
    strength: 'trung bình',
    level: 4,
    claim:
      'Trong giai đoạn giảm mỡ, tốc độ giảm cân chậm và protein cao giúp bảo toàn khối nạc; tập kháng lực duy trì là thành phần quan trọng.',
    practicalRange: 'Giảm khoảng 0.5-1%/tuần; protein 1.8-2.7 g/kg trong giai đoạn cut; duy trì tạ và volume hợp lý.',
    citation: {
      title: 'Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation',
      authors: 'Helms ER, Aragon AA, Fitschen PJ',
      journal: 'Journal of the International Society of Sports Nutrition',
      year: 2014,
      doi: '10.1186/1550-2783-11-20',
      pmid: '24864135',
    },
  },
  {
    id: 'E8',
    topic: 'deload',
    strength: 'thấp-trung bình',
    level: 2,
    claim:
      'Deload (giảm volume/tải 1 tuần) có thể giúp duy trì hoặc cải thiện phì đại/sức bền ở người mới, nhưng bằng chứng về lịch deload tối ưu còn hạn chế.',
    practicalRange: 'Mỗi 4-8 tuần, giảm 40-50% volume và giữ cường độ; không cần thiết nếu hồi phục tốt.',
    citation: {
      title:
        'Effects of deload periods in resistance training on muscle hypertrophy and strength endurance in untrained young men',
      authors: 'Pancar Z, Ilhan MT, Darendeli MK, et al.',
      journal: 'Scientific Reports',
      year: 2026,
      doi: '10.1038/s41598-026-40612-5',
      pmid: '41730991',
    },
  },
  {
    id: 'E9',
    topic: 'food_photo',
    strength: 'trung bình',
    level: 1,
    claim:
      'AI nhận diện thực phẩm từ ảnh có thể hỗ trợ ước tính năng lượng nhưng sai số đáng kể, đặc biệt với khẩu phần, dầu/mỡ, nước sốt và món hỗn hợp; cần xem là ước lượng, không phải phép đo.',
    practicalRange: 'Dùng khoảng calo/macro và giả định khẩu phần; đối chiếu cân thực phẩm khi cần chính xác.',
    citation: {
      title:
        'Artificial Intelligence-Driven Dietary Assessment Software: A Structured Narrative Review of Technological Advances',
      authors: 'Nutrients review',
      journal: 'Nutrients',
      year: 2026,
      doi: '10.3390/nu18203406',
      pmid: '42942981',
    },
  },
  {
    id: 'E10',
    topic: 'body_photo',
    strength: 'thấp-trung bình',
    level: 4,
    claim:
      'Ước lượng thành phần cơ thể từ ảnh/computer vision có độ lặp lại nhưng phụ thuộc phương pháp, ánh sáng, tư thế và quần áo; không đủ chính xác để thay thế DEXA hay đánh giá y tế.',
    practicalRange: 'Chỉ dùng để theo dõi xu hướng; báo cáo dưới dạng khoảng và độ tin cậy thấp/trung bình.',
    citation: {
      title:
        'Assessing body composition via a smartphone computer vision application: High repeatability but method-dependent',
      authors: 'PLOS Digital Health study',
      journal: 'PLOS Digital Health',
      year: 2026,
      doi: '10.1371/journal.pdig.0000983',
      pmid: '42685095',
    },
  },
];

export const EVIDENCE_BY_ID = Object.fromEntries(EVIDENCE_BASE.map((item) => [item.id, item]));

export function getEvidence(ids = []) {
  return ids.map((id) => EVIDENCE_BY_ID[id]).filter(Boolean);
}

export function formatEvidence(entries = EVIDENCE_BASE) {
  return entries
    .map(
      (item) =>
        `[${item.id}] (${item.topic}, mức bằng chứng: ${item.strength}) ${item.claim}\n` +
        `Khoảng thực hành: ${item.practicalRange}\n` +
        `Nguồn: ${item.citation.authors}. ${item.citation.title}. ${item.citation.journal} ${item.citation.year}. ` +
        `DOI: ${item.citation.doi}${item.citation.pmid ? `; PMID: ${item.citation.pmid}` : ''}.`,
    )
    .join('\n\n');
}

export function evidenceReferences(ids = []) {
  return getEvidence(ids).map((item) => ({
    id: item.id,
    title: item.citation.title,
    authors: item.citation.authors,
    journal: item.citation.journal,
    year: item.citation.year,
    doi: item.citation.doi,
    pmid: item.citation.pmid,
  }));
}
