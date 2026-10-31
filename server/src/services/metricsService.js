import { BodyLog } from '../models/BodyLog.js';
import { User } from '../models/User.js';
import {
  bmi as calcBmi,
  bmrMifflinStJeor,
  bodyComposition,
  ffmi as calcFfmi,
  leanBodyMass,
  movingAverage7,
  tdeeFromBmr,
  weeklyWeightRate,
} from '../../../shared/calculators/index.js';
import { buildWarnings } from '../../../shared/analytics/warnings.js';
import { addDaysKey, parseDateKey, todayKeyVN } from '../utils/date.js';
import { ApiError } from '../utils/ApiError.js';
import { toCsv } from '../utils/csv.js';

const BODY_FIELDS = [
  'weightKg',
  'bodyFatPct',
  'restingHr',
  'sleepHours',
  'steps',
  'calories',
  'proteinG',
  'notes',
];

/** Tính các chỉ số phái sinh tại thời điểm nhập, lưu vào BodyLog.computed. */
export function computeForLog(user, log) {
  const profile = user.profile || {};
  const computed = {};
  const heightCm = Number(profile.heightCm);
  const weightKg = Number(log.weightKg);
  if (!heightCm || !weightKg) return computed;

  computed.bmi = calcBmi(weightKg, heightCm).bmi;

  const measurements = log.measurements || {};
  if (measurements.neckCm && measurements.waistCm) {
    try {
      const composed = bodyComposition({
        sex: profile.sex,
        heightCm,
        weightKg,
        neckCm: Number(measurements.neckCm),
        waistCm: Number(measurements.waistCm),
        hipCm: measurements.hipCm ? Number(measurements.hipCm) : undefined,
      });
      Object.assign(computed, composed);
    } catch {
      // Số đo chưa đủ để tính % mỡ -> vẫn giữ BMI
    }
  }

  // Nếu người dùng nhập % mỡ tay, ưu tiên số đó để tính LBM/FFMI
  if (log.bodyFatPct) {
    try {
      computed.leanMassKg = leanBodyMass(weightKg, Number(log.bodyFatPct));
      Object.assign(computed, calcFfmi(computed.leanMassKg, heightCm));
    } catch {
      // ignore
    }
  }

  const age = user.age();
  if (age && (profile.sex === 'male' || profile.sex === 'female')) {
    computed.bmr = bmrMifflinStJeor({ sex: profile.sex, weightKg, heightCm, age });
    computed.tdee = tdeeFromBmr(computed.bmr, profile.activityLevel || 'moderate');
  }

  return computed;
}

/** Lấy hoặc tạo BodyLog của một ngày, cập nhật các trường được gửi lên. */
export async function upsertBodyLog(user, dateKey, payload) {
  const date = parseDateKey(dateKey);
  let log = await BodyLog.findOne({ userId: user._id, dateKey });
  if (!log) {
    log = new BodyLog({ userId: user._id, dateKey, date, weightKg: payload.weightKg });
  }
  log.date = date;

  for (const field of BODY_FIELDS) {
    if (payload[field] !== undefined) {
      log[field] = payload[field] === null ? undefined : payload[field];
    }
  }

  if (payload.measurements !== undefined) {
    const next = { ...(log.measurements?.toObject?.() ?? {}) };
    for (const [key, value] of Object.entries(payload.measurements || {})) {
      if (value === null || value === '' || value === undefined) delete next[key];
      else next[key] = value;
    }
    log.measurements = next;
  }

  if (payload.posture !== undefined) {
    log.posture = payload.posture;
  }

  log.computed = computeForLog(user, log);
  await log.save();
  return log;
}

export async function getBodyLog(userId, dateKey) {
  const log = await BodyLog.findOne({ userId, dateKey }).lean();
  if (!log) throw ApiError.notFound('Không có dữ liệu ngày này');
  return log;
}

export async function listBodyLogs(userId, { from, to, days } = {}) {
  const query = { userId };
  if (days) {
    const today = todayKeyVN();
    query.dateKey = { $gte: addDaysKey(today, -(days - 1)), $lte: today };
  } else if (from || to) {
    query.dateKey = {
      ...(from ? { $gte: from } : {}),
      ...(to ? { $lte: to } : {}),
    };
  }
  return BodyLog.find(query).sort({ dateKey: 1 }).lean();
}

export async function getSummary(userId, { days } = {}) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.unauthorized('Tài khoản không tồn tại');

  const allLogs = await BodyLog.find({ userId }).sort({ dateKey: 1 }).lean();
  const todayKey = todayKeyVN();
  const cutoff = addDaysKey(todayKey, -(Math.max(days || 90, 14) - 1));
  const logs = allLogs.filter((l) => l.dateKey >= cutoff);

  const trend = movingAverage7(logs);
  const rate = weeklyWeightRate(allLogs);
  const warnings = buildWarnings({
    logs: allLogs,
    profile: user.profile || {},
    todayKey,
  });

  const latest = allLogs.at(-1) || null;
  const previous = allLogs.length > 1 ? allLogs.at(-2) : null;

  return {
    latest,
    previous,
    trend,
    rate,
    warnings,
    count: allLogs.length,
    firstDate: allLogs[0]?.dateKey ?? null,
    lastDate: latest?.dateKey ?? null,
    todayKey,
    profile: {
      goal: user.profile?.goal,
      heightCm: user.profile?.heightCm,
      sex: user.profile?.sex,
      activityLevel: user.profile?.activityLevel,
    },
  };
}

/** Checklist tư thế mặc định (dùng cho form Body Check). */
export const POSTURE_CHECKLIST = [
  { key: 'stand_posture', label: 'Đứng thẳng: tai - vai - hông - mắt cá thẳng hàng' },
  { key: 'squat_depth', label: 'Squat đạt độ sâu (đùi dưới song song)' },
  { key: 'shoulder_mobility', label: 'Vai gập quá đầu không đau / không nhô vai' },
  { key: 'hip_mobility', label: 'Hông gập đủ sâu khi ngồi xổm / hip hinge' },
  { key: 'knee_tracking', label: 'Gối đi theo hướng mũi chân khi squat' },
];

export const CSV_COLUMNS = [
  { key: 'dateKey', label: 'Ngày' },
  { key: 'weightKg', label: 'Cân nặng (kg)' },
  { key: 'bodyFatPct', label: '% mỡ (nhập tay)' },
  { key: 'bodyFatNavy', label: '% mỡ (Navy)', get: (row) => row.computed?.bodyFatNavy },
  { key: 'leanMassKg', label: 'Khối lượng nạc (kg)', get: (row) => row.computed?.leanMassKg },
  { key: 'ffmi', label: 'FFMI', get: (row) => row.computed?.ffmi },
  { key: 'bmi', label: 'BMI', get: (row) => row.computed?.bmi },
  { key: 'waistCm', label: 'Vòng bụng (cm)', get: (row) => row.measurements?.waistCm },
  { key: 'neckCm', label: 'Vòng cổ (cm)', get: (row) => row.measurements?.neckCm },
  { key: 'hipCm', label: 'Vòng mông (cm)', get: (row) => row.measurements?.hipCm },
  { key: 'chestCm', label: 'Vòng ngực (cm)', get: (row) => row.measurements?.chestCm },
  { key: 'armCm', label: 'Vòng tay (cm)', get: (row) => row.measurements?.armCm },
  { key: 'thighCm', label: 'Vòng đùi (cm)', get: (row) => row.measurements?.thighCm },
  { key: 'restingHr', label: 'Nhịp tim nghỉ' },
  { key: 'sleepHours', label: 'Giấc ngủ (giờ)' },
  { key: 'steps', label: 'Số bước' },
  { key: 'calories', label: 'Calo (kcal)' },
  { key: 'proteinG', label: 'Protein (g)' },
  { key: 'notes', label: 'Ghi chú' },
];

export async function exportCsv(userId) {
  const logs = await BodyLog.find({ userId }).sort({ dateKey: 1 }).lean();
  const columns = CSV_COLUMNS.map((c) => ({
    key: c.key,
    label: c.label,
    get: c.get,
  }));
  const rows = logs.map((row) => {
    const flat = { ...row };
    for (const col of columns) {
      if (col.get) flat[col.key] = col.get(row);
    }
    return flat;
  });
  return toCsv(rows, columns);
}
