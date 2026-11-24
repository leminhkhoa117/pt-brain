/**
 * Metadata học tập theo ngữ cảnh cho toàn bộ giáo trình PT Academy.
 *
 * Mục tiêu: mỗi bài học biết nó liên quan tới surface nào (dashboard, planner,
 * workout, nutrition, body assessment, atlas 3D, calculator, research reader),
 * và có đúng một hành động áp dụng chính để đóng vòng lặp học → làm.
 *
 * File thuần dữ liệu/hàm thuần, dùng chung client + server. Không import
 * dependency ngoài để giữ quy ước của shared/.
 */

export const LEARNING_SURFACES = {
  dashboard: {
    vi: 'Tổng quan',
    description: 'Gợi ý học theo hoạt động, mục tiêu và hồ sơ gần đây.',
  },
  'learn.home': {
    vi: 'Giáo trình',
    description: 'Lộ trình cá nhân hoá và ôn tập hôm nay.',
  },
  'training.planner': {
    vi: 'Lập giáo án',
    description: 'Bài nền tảng trước/sau khi tạo hoặc đánh giá giáo án.',
  },
  'training.workout': {
    vi: 'Buổi tập',
    description: 'Bài kỹ thuật/an toàn theo bài tập và nhóm cơ đang log.',
  },
  nutrition: {
    vi: 'Dinh dưỡng',
    description: 'Bài nền tảng cho meal plan, macro và cân bằng năng lượng.',
  },
  'body.assessment': {
    vi: 'Đánh giá thể trạng',
    description: 'Bài đọc số đo, thành phần cơ thể và giới hạn của ước lượng.',
  },
  'muscle.atlas': {
    vi: 'Cơ bắp 3D',
    description: 'Bài giải phẫu/chức năng theo cơ, xương hoặc mô liên kết đang chọn.',
  },
  'calculator.1rm': {
    vi: 'Máy tính 1RM',
    description: 'Bài về sức mạnh, 1RM, volume và RIR.',
  },
  'calculator.calories': {
    vi: 'Máy tính calo',
    description: 'Bài về năng lượng, TDEE, macro và protein.',
  },
  'calculator.body': {
    vi: 'Máy tính cơ thể',
    description: 'Bài về BMI, % mỡ, FFMI và cách đọc số đo.',
  },
  'calculator.hr': {
    vi: 'Máy tính nhịp tim',
    description: 'Bài về tim mạch, vùng nhịp tim và ngưỡng lactate.',
  },
  'research.reader': {
    vi: 'Đọc nghiên cứu',
    description: 'Bài nền tảng liên quan tới chủ đề bài báo đang đọc.',
  },
};

export const MUSCLE_GROUP_TO_SLUG = {
  chest: 'pectoralis-major',
  back: 'latissimus-dorsi',
  shoulders: 'deltoid',
  quads: 'quadriceps',
  quadriceps: 'quadriceps',
  hamstrings: 'biceps-femoris',
  glutes: 'gluteus-maximus',
  biceps: 'biceps-brachii',
  triceps: 'triceps-brachii',
  calves: 'gastrocnemius',
  core: 'rectus-abdominis',
  adductors: 'adductor-longus',
  forearms: 'flexor-carpi-radialis',
  neck: 'sternocleidomastoid',
};

export const LEARNING_ACTION_TYPES = {
  open_calculator: { vi: 'Mở máy tính' },
  open_atlas: { vi: 'Xem trong 3D' },
  open_training: { vi: 'Mở giáo án' },
  open_workout: { vi: 'Log buổi tập' },
  open_nutrition: { vi: 'Mở dinh dưỡng' },
  open_body_log: { vi: 'Ghi số đo' },
  open_body_assessment: { vi: 'Đánh giá thể trạng' },
  open_research: { vi: 'Mở nghiên cứu' },
  open_lesson: { vi: 'Mở bài học' },
  create_flashcards: { vi: 'Tạo flashcard' },
};

/** Group xương/mô liên kết → bài giải phẫu/phục hồi phù hợp. */
const ANATOMY_GROUP_LESSONS = {
  'lower-limb': ['anat-2-7', 'anat-2-8', 'anat-3-1', 'rehab-4-1'],
  pelvis: ['anat-2-6', 'anat-3-1', 'rehab-2-1'],
  spine: ['anat-2-5', 'anat-5-1', 'anat-4-2', 'rehab-2-1'],
  thorax: ['anat-5-2', 'anat-3-1', 'anat-4-1'],
  shoulder: ['anat-2-3', 'anat-2-2', 'anat-3-1', 'rehab-3-1'],
  'upper-limb': ['anat-2-4', 'anat-1-2', 'anat-3-1'],
  skull: ['anat-3-1', 'anat-1-1'],
  'lower-leg': ['anat-2-8', 'rehab-8-1'],
  'upper-leg': ['anat-2-7', 'rehab-4-1'],
  tendon: ['rehab-5-1', 'anat-1-2', 'rehab-1-1'],
  ligament: ['rehab-1-1', 'rehab-4-2', 'anat-4-2'],
  fascia: ['rehab-5-1', 'anat-1-2', 'rehab-1-1'],
  disc: ['anat-2-5', 'anat-5-1', 'rehab-2-1'],
  cartilage: ['rehab-4-2', 'anat-4-1', 'anat-3-1'],
};

/**
 * Override cho các bài flagship/có ngữ cảnh đặc biệt. Các bài còn lại được
 * suy ra tự động từ `module`, `related.muscles/exercises/calculators/conditions`.
 */
const LESSON_OVERRIDES = {
  'anat-1-1': {
    contexts: [{ surface: 'dashboard', weight: 2 }],
  },
  'anat-2-1': {
    contexts: [
      { surface: 'muscle.atlas', match: { muscles: ['pectoralis-major', 'pectoralis-minor', 'serratus-anterior'] }, weight: 3 },
      { surface: 'training.workout', match: { muscles: ['pectoralis-major', 'pectoralis-minor', 'serratus-anterior'] }, weight: 2 },
    ],
  },
  'anat-2-2': {
    contexts: [
      { surface: 'muscle.atlas', match: { muscles: ['latissimus-dorsi', 'trapezius', 'rhomboid-major', 'erector-spinae'] }, weight: 3 },
      { surface: 'training.workout', match: { muscles: ['latissimus-dorsi', 'trapezius', 'erector-spinae'] }, weight: 2 },
    ],
  },
  'anat-2-3': {
    contexts: [
      { surface: 'muscle.atlas', match: { muscles: ['deltoid', 'supraspinatus', 'infraspinatus', 'subscapularis'] }, weight: 3 },
      { surface: 'training.planner', match: { conditions: ['shoulder_pain'] }, weight: 3 },
    ],
  },
  'anat-2-7': {
    contexts: [
      { surface: 'muscle.atlas', match: { muscles: ['quadriceps', 'biceps-femoris', 'semimembranosus', 'semitendinosus'] }, weight: 3 },
      { surface: 'training.planner', match: { goals: ['cut', 'lean_bulk', 'bulk'] }, weight: 2 },
      { surface: 'training.workout', match: { muscles: ['quadriceps', 'biceps-femoris'] }, weight: 2 },
    ],
    keyTakeaways: [
      'Quadriceps duỗi gối; hamstrings gấp gối và duỗi hông — hai nhóm cần được lập kế hoạch cùng nhau.',
      'Squat và hinge là hai mẫu chuyển động khác nhau, không thay thế nhau hoàn toàn.',
      'Tăng volume từ từ và giữ RIR 1–3 ở phần lớn set để kiểm soát chất lượng.',
    ],
    actions: [
      { type: 'open_training', label: 'Mở giáo án để cân bằng đùi trước/sau', tab: 'planner' },
      { type: 'open_atlas', label: 'Xem nhóm cơ đùi trong 3D', muscle: 'quadriceps' },
    ],
  },
  'phys-6-1': {
    contexts: [
      { surface: 'training.planner', weight: 4 },
      { surface: 'training.workout', weight: 3 },
      { surface: 'calculator.1rm', weight: 3 },
    ],
    keyTakeaways: [
      'Volume là biến số chính nhưng lợi ích tăng chậm dần; không cần tăng set vô hạn.',
      'Tần suất 2 lần/tuần/nhóm cơ là điểm khởi đầu thực dụng cho phần lớn người tập.',
      'Giữ phần lớn set cách thất bại 1–3 rep (RIR 1–3) và tăng tải có kiểm soát.',
    ],
    actions: [
      { type: 'open_training', label: 'Áp dụng vào giáo án', tab: 'planner' },
      { type: 'open_calculator', key: 'volume', label: 'Mở máy tính volume' },
    ],
  },
  'phys-4-1': {
    contexts: [
      { surface: 'training.planner', weight: 3 },
      { surface: 'calculator.1rm', weight: 3 },
    ],
  },
  'nutr-1-1': {
    contexts: [
      { surface: 'nutrition', weight: 4 },
      { surface: 'calculator.calories', weight: 4 },
      { surface: 'dashboard', weight: 2 },
    ],
    keyTakeaways: [
      'Cân nặng thay đổi theo cân bằng năng lượng tích lũy, không theo một bữa riêng lẻ.',
      'TDEE là ước lượng; hãy hiệu chỉnh bằng trend 2–4 tuần thay vì tin tuyệt đối một con số.',
      'Mục tiêu giảm mỡ/tăng cơ nên đi cùng theo dõi cân nặng, số đo và hiệu suất tập.',
    ],
    actions: [{ type: 'open_calculator', key: 'tdee', label: 'Tính TDEE của tôi' }],
  },
  'nutr-2-1': {
    contexts: [
      { surface: 'nutrition', weight: 4 },
      { surface: 'calculator.calories', weight: 4 },
    ],
    keyTakeaways: [
      'Khoảng 1,6–2,2 g protein/kg/ngày là vùng hợp lý cho người tập kháng lực.',
      'Chia protein thành 3–5 bữa, mỗi bữa khoảng 0,3–0,4 g/kg giúp duy trì tổng hợp protein cơ.',
      'Nguồn protein đa dạng và tổng lượng/ngày quan trọng hơn thời điểm tuyệt đối.',
    ],
    actions: [{ type: 'open_calculator', key: 'macro', label: 'Tính macro protein của tôi' }],
  },
  'nutr-6-1': {
    contexts: [
      { surface: 'nutrition', weight: 4 },
      { surface: 'learn.home', match: { goals: ['cut'] }, weight: 2 },
      { surface: 'dashboard', match: { goals: ['cut'] }, weight: 3 },
      { surface: 'calculator.calories', weight: 3 },
    ],
  },
  'nutr-6-2': {
    contexts: [
      { surface: 'nutrition', weight: 4 },
      { surface: 'learn.home', match: { goals: ['lean_bulk', 'bulk'] }, weight: 2 },
      { surface: 'dashboard', match: { goals: ['lean_bulk', 'bulk'] }, weight: 3 },
    ],
  },
  'rehab-2-1': {
    contexts: [
      { surface: 'body.assessment', match: { conditions: ['low_back_pain', 'herniated_disc'] }, weight: 4 },
      { surface: 'training.planner', match: { conditions: ['low_back_pain', 'herniated_disc'] }, weight: 4 },
      { surface: 'muscle.atlas', match: { muscles: ['erector-spinae', 'multifidus'] }, weight: 3 },
      { surface: 'learn.home', match: { conditions: ['low_back_pain', 'herniated_disc'] }, weight: 2 },
    ],
    keyTakeaways: [
      'Thoát vị đĩa đệm trên MRI không đồng nghĩa với đau hoặc mất chức năng.',
      'Phần lớn ca đau lưng cải thiện với vận động có kiểm soát, không phải nghỉ tuyệt đối.',
      'Red flags (yếu tiến triển, rối loạn đại tiểu tiện, sốt, chấn thương nặng) cần chuyển bác sĩ ngay.',
    ],
    actions: [{ type: 'open_training', label: 'Mở giáo án an toàn cho lưng', tab: 'planner' }],
  },
  'rehab-3-1': {
    contexts: [
      { surface: 'learn.home', match: { conditions: ['shoulder_pain'] }, weight: 2 },
      { surface: 'body.assessment', match: { conditions: ['shoulder_pain'] }, weight: 2 },
      { surface: 'training.planner', match: { conditions: ['shoulder_pain'] }, weight: 2 },
    ],
  },
  'rehab-4-1': {
    contexts: [
      { surface: 'learn.home', match: { conditions: ['knee_pain'] }, weight: 2 },
      { surface: 'body.assessment', match: { conditions: ['knee_pain'] }, weight: 2 },
      { surface: 'training.planner', match: { conditions: ['knee_pain'] }, weight: 2 },
    ],
  },
  'rehab-5-1': {
    contexts: [
      { surface: 'muscle.atlas', match: { groups: ['tendon', 'ligament', 'fascia'] }, weight: 3 },
      { surface: 'training.workout', weight: 2 },
      { surface: 'training.planner', weight: 2 },
    ],
  },
  'fit-6-1': {
    contexts: [
      { surface: 'body.assessment', weight: 4 },
      { surface: 'calculator.body', weight: 3 },
      { surface: 'calculator.1rm', weight: 2 },
    ],
  },
  'case-1-1': {
    contexts: [
      { surface: 'dashboard', weight: 1 },
      { surface: 'training.planner', weight: 3 },
      { surface: 'nutrition', weight: 2 },
    ],
    actions: [{ type: 'open_training', label: 'Bắt đầu quy trình 6 bước', tab: 'planner' }],
  },
};

const MODULE_SURFACES = {
  anat: ['muscle.atlas', 'training.workout', 'calculator.1rm'],
  phys: ['training.planner', 'training.workout', 'calculator.1rm'],
  nutr: ['nutrition', 'calculator.calories', 'dashboard'],
  fit: ['training.planner', 'body.assessment', 'calculator.1rm'],
  rehab: ['body.assessment', 'training.planner', 'muscle.atlas'],
  case: ['dashboard', 'training.planner', 'nutrition'],
};

const CALCULATOR_TAB = {
  'one-rm': '1rm',
  'percent-1rm': '1rm',
  volume: '1rm',
  tonnage: '1rm',
  bmr: 'calories',
  tdee: 'calories',
  calories: 'calories',
  macro: 'calories',
  'navy-body-fat': 'body',
  bmi: 'body',
  'hr-zones': 'hr',
};

export function calculatorTab(key) {
  return CALCULATOR_TAB[key] || '1rm';
}

function uniqueBy(list, keyFn) {
  const seen = new Set();
  return list.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inferContexts(lesson) {
  const contexts = [
    { surface: 'learn.home', weight: 1, auto: true },
    ...(MODULE_SURFACES[lesson.module] || []).map((surface) => ({
      surface,
      weight: 1,
      auto: true,
    })),
  ];

  const muscles = lesson.related?.muscles || [];
  const exercises = lesson.related?.exercises || [];
  const calculators = lesson.related?.calculators || [];
  const conditions = lesson.related?.conditions || [];

  if (muscles.length) {
    contexts.push({ surface: 'muscle.atlas', match: { muscles }, weight: 2, auto: true });
    contexts.push({ surface: 'training.workout', match: { muscles }, weight: 1, auto: true });
  }
  if (exercises.length) {
    contexts.push({ surface: 'training.workout', match: { exercises }, weight: 2, auto: true });
  }
  if (calculators.length) {
    for (const key of calculators) {
      contexts.push({
        surface: `calculator.${calculatorTab(key)}`,
        match: { calculators: [key] },
        weight: 2,
        auto: true,
      });
    }
  }
  if (conditions.length) {
    contexts.push({ surface: 'body.assessment', match: { conditions }, weight: 2, auto: true });
    contexts.push({ surface: 'training.planner', match: { conditions }, weight: 2, auto: true });
  }

  return uniqueBy(contexts, (item) => `${item.surface}:${JSON.stringify(item.match || {})}`);
}

function inferActions(lesson) {
  const calculators = lesson.related?.calculators || [];
  const muscles = lesson.related?.muscles || [];

  if (calculators.length) {
    const key = calculators[0];
    return [
      {
        type: 'open_calculator',
        key,
        label: `Mở máy tính ${key}`,
      },
    ];
  }
  if (muscles.length) {
    return [
      {
        type: 'open_atlas',
        muscle: muscles[0],
        label: 'Xem cơ liên quan trong 3D',
      },
    ];
  }
  if (lesson.module === 'nutr') {
    return [{ type: 'open_nutrition', label: 'Áp dụng vào dinh dưỡng' }];
  }
  if (lesson.module === 'rehab' || lesson.module === 'phys' || lesson.module === 'fit') {
    return [{ type: 'open_training', label: 'Áp dụng vào giáo án', tab: 'planner' }];
  }
  if (lesson.module === 'case') {
    return [{ type: 'open_training', label: 'Mở quy trình ca', tab: 'planner' }];
  }
  return [{ type: 'open_lesson', label: 'Mở bài học' }];
}

/** Metadata đầy đủ cho một lesson; fallback suy ra từ chính nội dung bài. */
export function lessonLearningMeta(lesson) {
  if (!lesson) return null;
  const override = LESSON_OVERRIDES[lesson.slug] || {};
  const contexts = override.contexts
    ? uniqueBy(
        [...override.contexts, ...inferContexts(lesson)],
        (item) => `${item.surface}:${JSON.stringify(item.match || {})}`,
      )
    : inferContexts(lesson);
  const actions = override.actions || inferActions(lesson);
  const keyTakeaways = override.keyTakeaways || (lesson.objectives || []).slice(0, 3);
  const microQuiz = (lesson.quiz || []).slice(0, 2);
  const concepts = [
    ...(lesson.terms || []).slice(0, 5).map((term) => term.en),
    lesson.module,
  ];

  return {
    slug: lesson.slug,
    module: lesson.module,
    title: lesson.title,
    minutes: lesson.minutes,
    contexts,
    actions,
    keyTakeaways,
    microQuiz,
    concepts,
  };
}

export function anatomyLessonsForGroup(group) {
  return ANATOMY_GROUP_LESSONS[group] || ANATOMY_GROUP_LESSONS['lower-limb'];
}

/** Kiểm tra metadata không trỏ tới surface/action type không tồn tại. */
export function validateLearningMetadata(lessons) {
  const surfaces = new Set(Object.keys(LEARNING_SURFACES));
  const actions = new Set(Object.keys(LEARNING_ACTION_TYPES));

  lessons.forEach((lesson) => {
    const meta = lessonLearningMeta(lesson);
    if (!meta.contexts.length) {
      throw new Error(`${lesson.slug}: không có learning context nào`);
    }
    if (!meta.actions.length) {
      throw new Error(`${lesson.slug}: không có apply action nào`);
    }
    meta.contexts.forEach((context) => {
      if (!surfaces.has(context.surface)) {
        throw new Error(`${lesson.slug}: surface không hợp lệ: ${context.surface}`);
      }
    });
    meta.actions.forEach((action) => {
      if (!actions.has(action.type)) {
        throw new Error(`${lesson.slug}: action không hợp lệ: ${action.type}`);
      }
      if (action.type === 'open_calculator' && !action.key) {
        throw new Error(`${lesson.slug}: open_calculator thiếu key`);
      }
    });
  });

  return true;
}

export { LESSON_OVERRIDES, ANATOMY_GROUP_LESSONS };
