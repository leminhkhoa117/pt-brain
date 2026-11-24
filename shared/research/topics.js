/**
 * Bộ chủ đề dựng sẵn cho Tìm nghiên cứu.
 *
 * Mỗi topic gồm 4 truy vấn Boolean cho PubMed/Europe PMC (OpenAlex/Crossref sẽ
 * được server chuyển thành keyword) và concepts dùng cho xếp hạng relevance.
 * Giữ mỗi truy vấn <= 220 ký tự để khớp validation API.
 */
export const RESEARCH_TOPICS = [
  {
    id: 'breathing-training',
    label: 'Hít thở trong tập luyện',
    description:
      'Kỹ thuật thở, Valsalva, bracing, luyện cơ hô hấp và ảnh hưởng lên hiệu suất/an toàn.',
    exampleQuestion: 'Hít thở trong tập luyện nên như thế nào để tăng hiệu suất và an toàn?',
    tags: ['hô hấp', 'Valsalva', 'bracing', 'RMT'],
    queries: [
      '("breathing technique" OR "breathing pattern" OR "breathing strategy") AND ("resistance training" OR "strength training" OR exercise)',
      '("Valsalva maneuver" OR bracing OR "intra-abdominal pressure") AND (squat OR deadlift OR "resistance training")',
      '("respiratory muscle training" OR "inspiratory muscle training") AND ("exercise performance" OR athletes OR "healthy adults")',
      '("diaphragmatic breathing" OR "nasal breathing") AND ("exercise performance" OR recovery OR "autonomic nervous system")',
    ],
    concepts: [
      {
        label: 'Kỹ thuật thở/hô hấp',
        terms: [
          'breathing technique',
          'breathing pattern',
          'breathing strategy',
          'respiratory muscle training',
          'inspiratory muscle training',
          'diaphragmatic breathing',
          'nasal breathing',
          'Valsalva maneuver',
          'intra-abdominal pressure',
          'bracing',
        ],
      },
      {
        label: 'Tập luyện',
        terms: ['resistance training', 'strength training', 'squat', 'deadlift', 'exercise'],
      },
      {
        label: 'Hiệu suất/phục hồi',
        terms: [
          'exercise performance',
          'strength output',
          'athletic performance',
          'recovery',
          'autonomic nervous system',
        ],
      },
    ],
  },
  {
    id: 'warmup-performance',
    label: 'Khởi động & hiệu suất',
    description:
      'Khởi động chung, khởi động chuyên biệt, post-activation potentiation và ảnh hưởng lên sức mạnh/công suất.',
    exampleQuestion: 'Khởi động thế nào để tăng sức mạnh và công suất trong buổi tập?',
    tags: ['warm-up', 'PAP', 'stretching'],
    queries: [
      '("warm-up" OR "warm up") AND ("strength performance" OR "power output" OR "athletic performance")',
      '("post-activation potentiation" OR "post-activation performance enhancement") AND (squat OR "jump performance" OR strength)',
      '("dynamic stretching" OR "static stretching") AND ("muscle performance" OR strength OR "range of motion")',
      '("specific warm-up" OR "priming exercise") AND ("resistance training" OR "power output")',
    ],
    concepts: [
      {
        label: 'Khởi động',
        terms: [
          'warm-up',
          'warm up',
          'priming exercise',
          'post-activation potentiation',
          'post-activation performance enhancement',
          'specific warm-up',
        ],
      },
      {
        label: 'Phương pháp',
        terms: ['dynamic stretching', 'static stretching', 'resistance training', 'squat', 'jump performance'],
      },
      {
        label: 'Hiệu suất',
        terms: ['strength performance', 'power output', 'athletic performance', 'muscle performance'],
      },
    ],
  },
  {
    id: 'hypertrophy',
    label: 'Phì đại cơ',
    description:
      'Volume, tần suất, cường độ, tập gần failure và các yếu tố ảnh hưởng tăng khối cơ.',
    exampleQuestion: 'Tập bao nhiêu set mỗi nhóm cơ mỗi tuần để tăng cơ tối ưu?',
    tags: ['hypertrophy', 'volume', 'frequency'],
    queries: [
      '("resistance training" OR "strength training") AND volume AND ("muscle hypertrophy" OR "muscle mass")',
      '("training frequency" OR "weekly sets") AND ("muscle hypertrophy" OR "muscle growth")',
      '("training to failure" OR "repetitions in reserve") AND ("muscle hypertrophy" OR strength)',
      '("progressive overload" OR "load progression") AND ("muscle hypertrophy" OR "muscle strength")',
    ],
    concepts: [
      {
        label: 'Phì đại cơ',
        terms: ['muscle hypertrophy', 'muscle mass', 'muscle growth', 'hypertrophy'],
      },
      {
        label: 'Tập kháng lực',
        terms: ['resistance training', 'strength training', 'progressive overload', 'load progression'],
      },
      {
        label: 'Biến số tập',
        terms: [
          'training volume',
          'weekly sets',
          'training frequency',
          'training to failure',
          'repetitions in reserve',
        ],
      },
    ],
  },
  {
    id: 'strength-programming',
    label: 'Sức mạnh & lập trình',
    description:
      'Cường độ, periodization, khối lượng, lựa chọn bài tập và autoregulation cho sức mạnh.',
    exampleQuestion: 'Lập trình tập sức mạnh nên chọn cường độ và khối lượng thế nào?',
    tags: ['strength', 'periodization', 'intensity'],
    queries: [
      '("strength training" OR "resistance training") AND (intensity OR load) AND "maximal strength"',
      'periodization AND ("maximal strength" OR "strength performance")',
      '("exercise selection" OR "free weights" OR machines) AND "strength gains"',
      '("velocity-based training" OR autoregulation) AND ("strength training" OR "resistance training")',
    ],
    concepts: [
      {
        label: 'Sức mạnh',
        terms: ['maximal strength', 'strength performance', 'strength gains'],
      },
      {
        label: 'Tập kháng lực',
        terms: ['strength training', 'resistance training', 'exercise selection', 'free weights', 'machines'],
      },
      {
        label: 'Lập trình',
        terms: ['periodization', 'intensity', 'training volume', 'velocity-based training', 'autoregulation'],
      },
    ],
  },
  {
    id: 'tendinopathy',
    label: 'Gân & tendinopathy',
    description:
      'Tải tập luyện, eccentric/isometric, tiến trình phục hồi và quay lại vận động cho tendinopathy.',
    exampleQuestion: 'Tải tập luyện nào hiệu quả cho tendinopathy gân bánh chè/gân Achilles?',
    tags: ['tendon', 'tendinopathy', 'eccentric'],
    queries: [
      'tendinopathy AND (exercise OR "load management") AND (rehabilitation OR "pain function")',
      '("eccentric exercise" OR "isometric exercise") AND tendinopathy',
      '("patellar tendinopathy" OR "Achilles tendinopathy" OR "rotator cuff tendinopathy") AND exercise',
      '("tendon loading" OR "progressive loading") AND tendinopathy',
    ],
    concepts: [
      {
        label: 'Tendinopathy',
        terms: [
          'tendinopathy',
          'patellar tendinopathy',
          'Achilles tendinopathy',
          'rotator cuff tendinopathy',
        ],
      },
      {
        label: 'Tải tập luyện',
        terms: [
          'eccentric exercise',
          'isometric exercise',
          'tendon loading',
          'progressive loading',
          'load management',
        ],
      },
      {
        label: 'Kết quả',
        terms: ['pain', 'function', 'rehabilitation', 'return to sport'],
      },
    ],
  },
  {
    id: 'low-back-pain',
    label: 'Đau lưng & tập luyện',
    description:
      'Exercise therapy, motor control, deadlift/squat và yếu tố tâm lý vận động ở đau lưng.',
    exampleQuestion: 'Bài tập nào hiệu quả cho đau lưng mạn tính?',
    tags: ['low back pain', 'motor control', 'deadlift'],
    queries: [
      '("low back pain" OR "chronic low back pain") AND (exercise OR "exercise therapy")',
      '("motor control exercise" OR "stabilization exercise") AND "low back pain"',
      '(deadlift OR squat) AND ("low back pain" OR "injury prevention")',
      '("fear avoidance" OR "pain-related fear") AND exercise AND "low back pain"',
    ],
    concepts: [
      {
        label: 'Đau lưng',
        terms: ['low back pain', 'chronic low back pain', 'lumbopelvic pain'],
      },
      {
        label: 'Tập luyện',
        terms: [
          'exercise therapy',
          'motor control exercise',
          'stabilization exercise',
          'resistance training',
          'deadlift',
          'squat',
        ],
      },
      {
        label: 'Kết quả',
        terms: ['pain', 'disability', 'function', 'fear avoidance', 'pain-related fear'],
      },
    ],
  },
  {
    id: 'knee-osteoarthritis',
    label: 'Thoái hóa khớp gối',
    description:
      'Exercise therapy, sức mạnh cơ tứ đầu, aerobic exercise và kết quả đau/chức năng.',
    exampleQuestion: 'Tập luyện nào cải thiện đau và chức năng ở thoái hóa khớp gối?',
    tags: ['knee OA', 'osteoarthritis', 'quadriceps'],
    queries: [
      '("knee osteoarthritis" OR "knee OA") AND (exercise OR "exercise therapy")',
      '("strength training" OR "quadriceps strengthening") AND "knee osteoarthritis"',
      '("aerobic exercise" OR walking) AND "knee osteoarthritis" AND (pain OR function)',
      '("manual therapy" OR "physical therapy") AND "knee osteoarthritis"',
    ],
    concepts: [
      {
        label: 'Thoái hóa khớp gối',
        terms: ['knee osteoarthritis', 'knee OA', 'osteoarthritis'],
      },
      {
        label: 'Tập luyện',
        terms: [
          'exercise therapy',
          'strength training',
          'quadriceps strengthening',
          'aerobic exercise',
          'walking',
        ],
      },
      {
        label: 'Kết quả',
        terms: ['pain', 'function', 'physical function', 'manual therapy', 'physical therapy'],
      },
    ],
  },
  {
    id: 'acl-rehab',
    label: 'ACL & quay lại thể thao',
    description:
      'Phục hồi sau ACL reconstruction, tiêu chí return-to-sport, sức mạnh và neuromuscular training.',
    exampleQuestion: 'Tiêu chí và bài tập nào để quay lại thể thao sau ACL reconstruction?',
    tags: ['ACL', 'return to sport', 'rehab'],
    queries: [
      '("ACL reconstruction" OR "anterior cruciate ligament reconstruction") AND rehabilitation',
      '("return to sport" OR "return to play") AND "ACL reconstruction"',
      '("neuromuscular training" OR "strength training") AND "ACL reconstruction"',
      '("ACL injury prevention" OR "injury prevention program") AND athletes',
    ],
    concepts: [
      {
        label: 'ACL',
        terms: ['ACL reconstruction', 'anterior cruciate ligament reconstruction', 'ACL injury'],
      },
      {
        label: 'Phục hồi & quay lại',
        terms: ['rehabilitation', 'return to sport', 'return to play', 'return to running'],
      },
      {
        label: 'Can thiệp',
        terms: [
          'neuromuscular training',
          'strength training',
          'injury prevention program',
          'ACL injury prevention',
        ],
      },
    ],
  },
  {
    id: 'shoulder-pain',
    label: 'Đau vai & rotator cuff',
    description:
      'Exercise therapy, rotator cuff, scapular control và return-to-sport cho đau vai.',
    exampleQuestion: 'Bài tập nào hiệu quả cho đau vai do rotator cuff?',
    tags: ['shoulder', 'rotator cuff', 'scapula'],
    queries: [
      '("rotator cuff" OR "shoulder pain") AND exercise',
      '("scapular control" OR "scapular dyskinesis") AND "shoulder pain"',
      '("rotator cuff related shoulder pain" OR "subacromial pain") AND (exercise OR rehabilitation)',
      '("overhead athlete" OR swimmers OR throwers) AND shoulder AND prevention',
    ],
    concepts: [
      {
        label: 'Đau vai/rotator cuff',
        terms: [
          'rotator cuff related shoulder pain',
          'shoulder pain',
          'subacromial pain',
          'rotator cuff',
        ],
      },
      {
        label: 'Tập luyện',
        terms: ['exercise', 'exercise therapy', 'rehabilitation', 'scapular control', 'scapular dyskinesis'],
      },
      {
        label: 'Kết quả',
        terms: ['pain', 'function', 'return to sport', 'prevention'],
      },
    ],
  },
  {
    id: 'running-load',
    label: 'Chạy bộ & quản lý tải',
    description:
      'Khối lượng/cường độ chạy, injury prevention, gait retraining và return to running.',
    exampleQuestion: 'Quản lý khối lượng chạy thế nào để giảm chấn thương và vẫn tăng hiệu suất?',
    tags: ['running', 'training load', 'injury'],
    queries: [
      '("running injury" OR "running-related injury") AND ("training load" OR "training volume")',
      '("return to running" OR "running gait retraining") AND rehabilitation',
      '("strength training" OR "plyometric training") AND running AND performance',
      '("cadence" OR "step rate") AND running AND (load OR injury)',
    ],
    concepts: [
      {
        label: 'Chạy bộ',
        terms: ['running injury', 'running-related injury', 'running load', 'running gait'],
      },
      {
        label: 'Quản lý tải',
        terms: ['training load', 'training volume', 'strength training', 'plyometric training', 'gait retraining'],
      },
      {
        label: 'Kết quả',
        terms: ['injury prevention', 'performance', 'return to running', 'cadence', 'step rate'],
      },
    ],
  },
  {
    id: 'protein-muscle',
    label: 'Protein & khối cơ',
    description:
      'Liều lượng, thời điểm, phân bố protein và ảnh hưởng lên hypertrophy/sức mạnh.',
    exampleQuestion: 'Lượng protein nào hỗ trợ tăng cơ khi tập kháng lực?',
    tags: ['protein', 'muscle mass', 'nutrition'],
    queries: [
      '("protein intake" OR "dietary protein") AND ("muscle mass" OR "muscle hypertrophy")',
      '("protein supplementation" OR "whey protein") AND ("resistance training" OR strength)',
      '("protein distribution" OR "protein timing") AND ("muscle protein synthesis" OR hypertrophy)',
      '("energy deficit" OR "weight loss") AND "protein intake" AND ("lean mass" OR "muscle mass")',
    ],
    concepts: [
      {
        label: 'Protein',
        terms: ['protein intake', 'dietary protein', 'protein supplementation', 'whey protein'],
      },
      {
        label: 'Tập kháng lực',
        terms: ['resistance training', 'strength training', 'muscle protein synthesis'],
      },
      {
        label: 'Kết quả',
        terms: ['muscle mass', 'muscle hypertrophy', 'lean mass', 'strength'],
      },
    ],
  },
  {
    id: 'older-adults',
    label: 'Người cao tuổi & sarcopenia',
    description:
      'Tập kháng lực, power training, protein và dự phòng té ngã ở người cao tuổi.',
    exampleQuestion: 'Tập kháng lực cho người cao tuổi để giảm sarcopenia và cải thiện chức năng thế nào?',
    tags: ['older adults', 'sarcopenia', 'falls'],
    queries: [
      '("resistance training" OR "strength training") AND ("older adults" OR elderly) AND (sarcopenia OR "muscle mass" OR "physical function")',
      '("power training" OR "explosive training") AND "older adults" AND function',
      '("protein intake" OR "protein supplementation") AND "older adults" AND ("muscle mass" OR strength)',
      '("fall prevention" OR balance) AND "resistance training" AND "older adults"',
    ],
    concepts: [
      {
        label: 'Tập kháng lực',
        terms: ['resistance training', 'strength training', 'power training', 'explosive training'],
      },
      {
        label: 'Người cao tuổi',
        terms: ['older adults', 'elderly', 'sarcopenia'],
      },
      {
        label: 'Kết quả',
        terms: ['muscle mass', 'physical function', 'strength', 'fall prevention', 'balance'],
      },
    ],
  },
];

export const getResearchTopic = (id) =>
  RESEARCH_TOPICS.find((topic) => topic.id === id) || null;
