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

  // Bổ sung thư viện mở rộng
  { slug: 'incline-barbell-press', nameVi: 'Bench press nghiêng', nameEn: 'Incline Barbell Press', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders', 'triceps'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'decline-barbell-press', nameVi: 'Bench press dốc xuống', nameEn: 'Decline Barbell Press', primaryMuscles: ['chest'], secondaryMuscles: ['triceps'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'pec-deck', nameVi: 'Ép ngực máy', nameEn: 'Pec Deck', primaryMuscles: ['chest'], secondaryMuscles: [], equipment: ['machine'], category: 'isolation', isCompound: false },
  { slug: 'dumbbell-fly', nameVi: 'Ép ngực tạ đơn', nameEn: 'Dumbbell Fly', primaryMuscles: ['chest'], secondaryMuscles: ['shoulders'], equipment: ['dumbbell'], category: 'isolation', isCompound: false },
  { slug: 'low-cable-crossover', nameVi: 'Ép ngực cáp thấp', nameEn: 'Low Cable Crossover', primaryMuscles: ['chest'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'high-cable-crossover', nameVi: 'Ép ngực cáp cao', nameEn: 'High Cable Crossover', primaryMuscles: ['chest'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'landmine-press', nameVi: 'Đẩy landmine', nameEn: 'Landmine Press', primaryMuscles: ['chest', 'shoulders'], secondaryMuscles: ['triceps'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'machine-incline-press', nameVi: 'Đẩy ngực nghiêng máy', nameEn: 'Machine Incline Press', primaryMuscles: ['chest'], secondaryMuscles: ['triceps'], equipment: ['machine'], category: 'compound', isCompound: true },

  { slug: 'chin-up', nameVi: 'Kéo xà ngửa tay', nameEn: 'Chin-up', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], equipment: ['bodyweight'], category: 'compound', isCompound: true },
  { slug: 't-bar-row', nameVi: 'Kéo T-bar', nameEn: 'T-Bar Row', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'machine-row', nameVi: 'Kéo lưng máy', nameEn: 'Machine Row', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], equipment: ['machine'], category: 'compound', isCompound: true },
  { slug: 'dumbbell-pullover', nameVi: 'Kéo tạ qua đầu', nameEn: 'Dumbbell Pullover', primaryMuscles: ['back', 'chest'], secondaryMuscles: [], equipment: ['dumbbell'], category: 'isolation', isCompound: false },
  { slug: 'inverted-row', nameVi: 'Kéo người ngược', nameEn: 'Inverted Row', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], equipment: ['bodyweight'], category: 'compound', isCompound: true },
  { slug: 'rack-pull', nameVi: 'Rack pull', nameEn: 'Rack Pull', primaryMuscles: ['back', 'hamstrings'], secondaryMuscles: ['glutes'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'barbell-shrug', nameVi: 'Nhún vai tạ đòn', nameEn: 'Barbell Shrug', primaryMuscles: ['back'], secondaryMuscles: ['shoulders'], equipment: ['barbell'], category: 'isolation', isCompound: false },
  { slug: 'chest-supported-row', nameVi: 'Kéo lưng tựa ngực', nameEn: 'Chest-Supported Row', primaryMuscles: ['back'], secondaryMuscles: ['biceps'], equipment: ['machine'], category: 'compound', isCompound: true },

  { slug: 'arnold-press', nameVi: 'Đẩy vai Arnold', nameEn: 'Arnold Press', primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps'], equipment: ['dumbbell'], category: 'compound', isCompound: true },
  { slug: 'machine-shoulder-press', nameVi: 'Đẩy vai máy', nameEn: 'Machine Shoulder Press', primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps'], equipment: ['machine'], category: 'compound', isCompound: true },
  { slug: 'cable-lateral-raise', nameVi: 'Nâng vai ngang cáp', nameEn: 'Cable Lateral Raise', primaryMuscles: ['shoulders'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'upright-row', nameVi: 'Kéo đứng', nameEn: 'Upright Row', primaryMuscles: ['shoulders'], secondaryMuscles: ['back'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'reverse-pec-deck', nameVi: 'Vai sau máy', nameEn: 'Reverse Pec Deck', primaryMuscles: ['shoulders'], secondaryMuscles: ['back'], equipment: ['machine'], category: 'isolation', isCompound: false },
  { slug: 'landmine-lateral-raise', nameVi: 'Nâng vai ngang landmine', nameEn: 'Landmine Lateral Raise', primaryMuscles: ['shoulders'], secondaryMuscles: [], equipment: ['barbell'], category: 'isolation', isCompound: false },

  { slug: 'preacher-curl', nameVi: 'Cuốn tay ghế preacher', nameEn: 'Preacher Curl', primaryMuscles: ['biceps'], secondaryMuscles: [], equipment: ['machine'], category: 'isolation', isCompound: false },
  { slug: 'concentration-curl', nameVi: 'Cuốn tay tập trung', nameEn: 'Concentration Curl', primaryMuscles: ['biceps'], secondaryMuscles: [], equipment: ['dumbbell'], category: 'isolation', isCompound: false },
  { slug: 'spider-curl', nameVi: 'Spider curl', nameEn: 'Spider Curl', primaryMuscles: ['biceps'], secondaryMuscles: [], equipment: ['dumbbell'], category: 'isolation', isCompound: false },
  { slug: 'cable-rope-hammer-curl', nameVi: 'Hammer curl cáp', nameEn: 'Cable Rope Hammer Curl', primaryMuscles: ['biceps'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'bayesian-curl', nameVi: 'Bayesian curl', nameEn: 'Bayesian Cable Curl', primaryMuscles: ['biceps'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'reverse-curl', nameVi: 'Cuốn tay ngửa', nameEn: 'Reverse Curl', primaryMuscles: ['biceps'], secondaryMuscles: [], equipment: ['barbell'], category: 'isolation', isCompound: false },

  { slug: 'close-grip-bench', nameVi: 'Bench press tay hẹp', nameEn: 'Close-Grip Bench Press', primaryMuscles: ['triceps', 'chest'], secondaryMuscles: ['shoulders'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'rope-pushdown', nameVi: 'Duỗi tay sau cáp dây thừng', nameEn: 'Rope Triceps Pushdown', primaryMuscles: ['triceps'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'jm-press', nameVi: 'JM press', nameEn: 'JM Press', primaryMuscles: ['triceps'], secondaryMuscles: ['chest'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'diamond-push-up', nameVi: 'Hít đất kim cương', nameEn: 'Diamond Push-up', primaryMuscles: ['triceps', 'chest'], secondaryMuscles: [], equipment: ['bodyweight'], category: 'compound', isCompound: true },
  { slug: 'single-arm-overhead-extension', nameVi: 'Duỗi tay sau qua đầu một tay', nameEn: 'Single-arm Overhead Extension', primaryMuscles: ['triceps'], secondaryMuscles: [], equipment: ['dumbbell'], category: 'isolation', isCompound: false },
  { slug: 'bench-dip', nameVi: 'Dip ghế', nameEn: 'Bench Dip', primaryMuscles: ['triceps'], secondaryMuscles: ['chest'], equipment: ['bodyweight'], category: 'compound', isCompound: true },

  { slug: 'goblet-squat', nameVi: 'Goblet squat', nameEn: 'Goblet Squat', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['core'], equipment: ['dumbbell'], category: 'compound', isCompound: true },
  { slug: 'smith-squat', nameVi: 'Squat Smith', nameEn: 'Smith Machine Squat', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: [], equipment: ['machine'], category: 'compound', isCompound: true },
  { slug: 'step-up', nameVi: 'Bước lên bục', nameEn: 'Dumbbell Step-up', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings'], equipment: ['dumbbell'], category: 'compound', isCompound: true },
  { slug: 'sissy-squat', nameVi: 'Sissy squat', nameEn: 'Sissy Squat', primaryMuscles: ['quads'], secondaryMuscles: [], equipment: ['bodyweight'], category: 'isolation', isCompound: false },
  { slug: 'reverse-lunge', nameVi: 'Bước lùi', nameEn: 'Reverse Lunge', primaryMuscles: ['quads', 'glutes'], secondaryMuscles: ['hamstrings'], equipment: ['dumbbell'], category: 'compound', isCompound: true },
  { slug: 'pendulum-squat', nameVi: 'Pendulum squat', nameEn: 'Pendulum Squat', primaryMuscles: ['quads'], secondaryMuscles: ['glutes'], equipment: ['machine'], category: 'compound', isCompound: true },

  { slug: 'lying-leg-curl', nameVi: 'Gập gối nằm', nameEn: 'Lying Leg Curl', primaryMuscles: ['hamstrings'], secondaryMuscles: [], equipment: ['machine'], category: 'isolation', isCompound: false },
  { slug: 'stiff-leg-deadlift', nameVi: 'Deadlift chân thẳng', nameEn: 'Stiff-Leg Deadlift', primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['back'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'glute-ham-raise', nameVi: 'Glute-ham raise', nameEn: 'Glute-Ham Raise', primaryMuscles: ['hamstrings'], secondaryMuscles: ['glutes'], equipment: ['bodyweight'], category: 'isolation', isCompound: false },
  { slug: 'single-leg-rdl', nameVi: 'Romanian deadlift một chân', nameEn: 'Single-Leg Romanian Deadlift', primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['core'], equipment: ['dumbbell'], category: 'compound', isCompound: true },
  { slug: 'good-morning', nameVi: 'Good morning', nameEn: 'Good Morning', primaryMuscles: ['hamstrings', 'back'], secondaryMuscles: ['glutes'], equipment: ['barbell'], category: 'compound', isCompound: true },

  { slug: 'cable-kickback', nameVi: 'Đá mông cáp', nameEn: 'Cable Glute Kickback', primaryMuscles: ['glutes'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'sumo-deadlift', nameVi: 'Sumo deadlift', nameEn: 'Sumo Deadlift', primaryMuscles: ['glutes', 'hamstrings'], secondaryMuscles: ['back'], equipment: ['barbell'], category: 'compound', isCompound: true },
  { slug: 'hip-abduction', nameVi: 'Mở hông máy', nameEn: 'Hip Abduction', primaryMuscles: ['glutes'], secondaryMuscles: [], equipment: ['machine'], category: 'isolation', isCompound: false },
  { slug: 'single-leg-hip-thrust', nameVi: 'Hip thrust một chân', nameEn: 'Single-Leg Hip Thrust', primaryMuscles: ['glutes'], secondaryMuscles: ['hamstrings'], equipment: ['bodyweight'], category: 'compound', isCompound: true },
  { slug: 'frog-pump', nameVi: 'Frog pump', nameEn: 'Frog Pump', primaryMuscles: ['glutes'], secondaryMuscles: [], equipment: ['bodyweight'], category: 'isolation', isCompound: false },

  { slug: 'donkey-calf-raise', nameVi: 'Nhón chân donkey', nameEn: 'Donkey Calf Raise', primaryMuscles: ['calves'], secondaryMuscles: [], equipment: ['machine'], category: 'isolation', isCompound: false },
  { slug: 'calf-press', nameVi: 'Nhón chân máy đạp', nameEn: 'Calf Press', primaryMuscles: ['calves'], secondaryMuscles: [], equipment: ['machine'], category: 'isolation', isCompound: false },
  { slug: 'single-leg-calf-raise', nameVi: 'Nhón chân một chân', nameEn: 'Single-Leg Calf Raise', primaryMuscles: ['calves'], secondaryMuscles: [], equipment: ['bodyweight'], category: 'isolation', isCompound: false },

  { slug: 'ab-wheel', nameVi: 'Ab wheel', nameEn: 'Ab Wheel Rollout', primaryMuscles: ['core'], secondaryMuscles: [], equipment: ['bodyweight'], category: 'isolation', isCompound: false },
  { slug: 'side-plank', nameVi: 'Plank nghiêng', nameEn: 'Side Plank', primaryMuscles: ['core'], secondaryMuscles: [], equipment: ['bodyweight'], category: 'isolation', isCompound: false },
  { slug: 'dead-bug', nameVi: 'Dead bug', nameEn: 'Dead Bug', primaryMuscles: ['core'], secondaryMuscles: [], equipment: ['bodyweight'], category: 'isolation', isCompound: false },
  { slug: 'pallof-press', nameVi: 'Pallof press', nameEn: 'Pallof Press', primaryMuscles: ['core'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'russian-twist', nameVi: 'Xoay người Nga', nameEn: 'Russian Twist', primaryMuscles: ['core'], secondaryMuscles: [], equipment: ['dumbbell'], category: 'isolation', isCompound: false },
  { slug: 'cable-woodchop', nameVi: 'Chặt gỗ cáp', nameEn: 'Cable Woodchop', primaryMuscles: ['core'], secondaryMuscles: [], equipment: ['cable'], category: 'isolation', isCompound: false },
  { slug: 'hollow-body-hold', nameVi: 'Hollow body hold', nameEn: 'Hollow Body Hold', primaryMuscles: ['core'], secondaryMuscles: [], equipment: ['bodyweight'], category: 'isolation', isCompound: false },

  { slug: 'kettlebell-swing', nameVi: 'Kettlebell swing', nameEn: 'Kettlebell Swing', primaryMuscles: ['glutes', 'hamstrings'], secondaryMuscles: ['core'], equipment: ['kettlebell'], category: 'compound', isCompound: true },
  { slug: 'farmer-carry', nameVi: 'Farmer carry', nameEn: 'Farmer Carry', primaryMuscles: ['core', 'back'], secondaryMuscles: [], equipment: ['dumbbell'], category: 'compound', isCompound: true },
  { slug: 'turkish-get-up', nameVi: 'Turkish get-up', nameEn: 'Turkish Get-up', primaryMuscles: ['core', 'shoulders'], secondaryMuscles: [], equipment: ['kettlebell'], category: 'compound', isCompound: true },
];
