/**
 * Thư viện bài tập seed vào MongoDB (idempotent theo slug).
 * Tên tiếng Việt + tiếng Anh, nhóm cơ chính/phụ, dụng cụ.
 */
export const EXERCISES = [
  // Quads
  { slug: 'barbell-back-squat', nameVi: 'Squat tạ đòn', nameEn: 'Barbell Back Squat', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['core'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'front-squat', nameVi: 'Squat trước', nameEn: 'Front Squat', primaryMuscles: ['quads'], secondaryMuscles: ['core'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'leg-press', nameVi: 'Đạp chân máy', nameEn: 'Leg Press', primaryMuscles: ['quads'], secondaryMuscles: ['glutes'], equipment: ['machine'], category: 'compound', isCompound: true },
  { slug: 'hack-squat', nameVi: 'Hack squat', nameEn: 'Hack Squat', primaryMuscles: ['quads'], secondaryMuscles: ['glutes'], equipment: ['machine'], category: 'compound', isCompound: true },
  { slug: 'bulgarian-split-squat', nameVi: 'Squat Bulgaria', nameEn: 'Bulgarian Split Squat', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings'], equipment: ['dumbbell'], category: 'compound', isCompound: true },
  { slug: 'walking-lunge', nameVi: 'Bước gập gối', nameEn: 'Walking Lunge', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings'], equipment: ['dumbbell'], category: 'compound', isCompound: true },
  { slug: 'leg-extension', nameVi: 'Duỗi gối', nameEn: 'Leg Extension', primaryMuscles: ['quads'], secondaryMuscles: [], equipment: ['machine'], category: 'isolation', isCompound: false },

  // Hamstrings / glutes
  { slug: 'romanian-deadlift', nameVi: 'Romanian deadlift', nameEn: 'Romanian Deadlift', primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['back'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'conventional-deadlift', nameVi: 'Deadlift tạ đòn', nameEn: 'Conventional Deadlift', primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['back', 'core'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'hip-thrust', nameVi: 'Hip thrust', nameEn: 'Barbell Hip Thrust', primaryMuscles: ['glutes'], secondaryMuscles: ['hamstrings'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'leg-curl', nameVi: 'Gập gối máy', nameEn: 'Seated Leg Curl', primaryMuscles: ['hamstrings'], secondaryMuscles: [], equipment: ['machine'], category: 'isolation', isCompound: false },
  { slug: 'nordic-curl', nameVi: 'Nordic curl', nameEn: 'Nordic Hamstring Curl', primaryMuscles: ['hamstrings'], secondaryMuscles: [], equipment: ['bodyweight'], category: 'isolation', isCompound: false },
  { slug: 'cable-pull-through', nameVi: 'Kéo cáp qua hông', nameEn: 'Cable Pull Through', primaryMuscles: ['glutes', 'hamstrings'], secondaryMuscles: [], equipment: ['cable'], category: 'compound', isCompound: true },

  // Chest
  { slug: 'barbell-bench-press', nameVi: 'Bench press tạ đòn', nameEn: 'Barbell Bench Press', primaryMuscles: ['chest'], secondaryMuscles: ['triceps', 'shoulders'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'incline-dumbbell-press', nameVi: 'Đẩy ngực nghiêng tạ đơn', nameEn: 'Incline Dumbbell Press', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders', 'triceps'], equipment: ['dumbbell'], category: 'compound', isCompound: true },
  { slug: 'machine-chest-press', nameVi: 'Đẩy ngực máy', nameEn: 'Machine Chest Press', primaryMuscles: ['chest'], secondaryMuscles: ['triceps'], equipment: ['machine'], category: 'compound', isCompound: true },
  { slug: 'cable-fly', nameVi: 'Ép ngực cáp', nameEn: 'Cable Chest Fly', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders'], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'push-up', nameVi: 'Hít đất', nameEn: 'Push-up', primaryMuscles: ['chest'], secondaryMuscles: ['triceps', 'shoulders'], equipment: ['bodyweight'], category: 'compound', isCompound: true },
  { slug: 'dips', nameVi: 'Dips', nameEn: 'Parallel Bar Dips', primaryMuscles: ['chest', 'triceps'], secondaryMuscles: ['shoulders'], equipment: ['bodyweight'], category: 'compound', isCompound: true },

  // Back
  { slug: 'pull-up', nameVi: 'Kéo xà', nameEn: 'Pull-up', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], equipment: ['bodyweight'], category: 'compound', isCompound: true },
  { slug: 'lat-pulldown', nameVi: 'Kéo lưng xô', nameEn: 'Lat Pulldown', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], equipment: ['cable'], category: 'compound', isCompound: true },
  { slug: 'barbell-row', nameVi: 'Gập người kéo tạ đòn', nameEn: 'Barbell Row', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'seated-cable-row', nameVi: 'Kéo cáp ngồi', nameEn: 'Seated Cable Row', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], equipment: ['cable'], category: 'compound', isCompound: true },
  { slug: 'one-arm-dumbbell-row', nameVi: 'Kéo tạ đơn một tay', nameEn: 'One-arm Dumbbell Row', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], equipment: ['dumbbell'], category: 'compound', isCompound: true },
  { slug: 'face-pull', nameVi: 'Face pull', nameEn: 'Face Pull', primaryMuscles: ['shoulders', 'back'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'straight-arm-pulldown', nameVi: 'Kéo tay thẳng', nameEn: 'Straight-arm Pulldown', primaryMuscles: ['back'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },

  // Shoulders
  { slug: 'overhead-press', nameVi: 'Đẩy vai tạ đòn', nameEn: 'Overhead Press', primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps', 'core'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'dumbbell-shoulder-press', nameVi: 'Đẩy vai tạ đơn', nameEn: 'Dumbbell Shoulder Press', primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps'], equipment: ['dumbbell'], category: 'compound', isCompound: true },
  { slug: 'lateral-raise', nameVi: 'Nâng vai ngang', nameEn: 'Dumbbell Lateral Raise', primaryMuscles: ['shoulders'], secondaryMuscles: [], equipment: ['dumbbell'], category: 'isolation', isCompound: false },
  { slug: 'rear-delt-fly', nameVi: 'Nâng vai sau', nameEn: 'Rear Delt Fly', primaryMuscles: ['shoulders'], secondaryMuscles: ['back'], equipment: ['dumbbell'], category: 'isolation', isCompound: false },

  // Arms
  { slug: 'barbell-curl', nameVi: 'Cuốn tay trước tạ đòn', nameEn: 'Barbell Curl', primaryMuscles: ['biceps'], secondaryMuscles: [], equipment: ['barbell'], category: 'isolation', isCompound: false },
  { slug: 'incline-dumbbell-curl', nameVi: 'Cuốn tay ghế nghiêng', nameEn: 'Incline Dumbbell Curl', primaryMuscles: ['biceps'], secondaryMuscles: [], equipment: ['dumbbell'], category: 'isolation', isCompound: false },
  { slug: 'hammer-curl', nameVi: 'Hammer curl', nameEn: 'Hammer Curl', primaryMuscles: ['biceps'], secondaryMuscles: [], equipment: ['dumbbell'], category: 'isolation', isCompound: false },
  { slug: 'cable-curl', nameVi: 'Cuốn tay cáp', nameEn: 'Cable Curl', primaryMuscles: ['biceps'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'triceps-pushdown', nameVi: 'Duỗi tay sau cáp', nameEn: 'Triceps Pushdown', primaryMuscles: ['triceps'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'overhead-triceps-extension', nameVi: 'Duỗi tay sau qua đầu', nameEn: 'Overhead Triceps Extension', primaryMuscles: ['triceps'], secondaryMuscles: [], equipment: ['dumbbell'], category: 'isolation', isCompound: false },
  { slug: 'skull-crusher', nameVi: 'Skull crusher', nameEn: 'EZ-bar Skull Crusher', primaryMuscles: ['triceps'], secondaryMuscles: [], equipment: ['barbell'], category: 'isolation', isCompound: false },

  // Calves / core
  { slug: 'standing-calf-raise', nameVi: 'Nhón chân đứng', nameEn: 'Standing Calf Raise', primaryMuscles: ['calves'], secondaryMuscles: [], equipment: ['machine'], category: 'isolation', isCompound: false },
  { slug: 'seated-calf-raise', nameVi: 'Nhón chân ngồi', nameEn: 'Seated Calf Raise', primaryMuscles: ['calves'], secondaryMuscles: [], equipment: ['machine'], category: 'isolation', isCompound: false },
  { slug: 'plank', nameVi: 'Plank', nameEn: 'Plank', primaryMuscles: ['core'], secondaryMuscles: [], equipment: ['bodyweight'], category: 'isolation', isCompound: false },
  { slug: 'hanging-leg-raise', nameVi: 'Nâng chân treo xà', nameEn: 'Hanging Leg Raise', primaryMuscles: ['core'], secondaryMuscles: [], equipment: ['bodyweight'], category: 'isolation', isCompound: false },
  { slug: 'cable-crunch', nameVi: 'Gập bụng cáp', nameEn: 'Cable Crunch', primaryMuscles: ['core'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
];
