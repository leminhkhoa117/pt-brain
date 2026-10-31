/**
 * Cảnh báo tự động theo quy tắc (không dùng AI).
 * Input: danh sách BodyLog (đã sort tăng dần), profile người dùng, ngày hôm nay (YYYY-MM-DD).
 * Output: mảng { code, severity, message } - severity: info | warning | danger.
 */
import {
  MISSING_DATA_DAYS,
  PROTEIN_ALERT_PER_KG,
  WEEKLY_RATE_LIMITS,
} from '../config/nutrition.js';
import { weeklyWeightRate } from '../calculators/index.js';

const DAY_MS = 86400000;

const diffDays = (laterKey, earlierKey) =>
  Math.round(
    (new Date(`${laterKey}T00:00:00Z`) - new Date(`${earlierKey}T00:00:00Z`)) / DAY_MS,
  );

export function buildWarnings({ logs = [], profile = {}, todayKey, proteinWindow = 3 }) {
  const warnings = [];
  if (!logs.length) {
    warnings.push({
      code: 'NO_DATA',
      severity: 'info',
      message: 'Chưa có dữ liệu cơ thể. Hãy nhập cân nặng hôm nay để bắt đầu theo dõi.',
    });
    return warnings;
  }

  const sorted = [...logs].sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  const latest = sorted.at(-1);

  // 1) Thiếu dữ liệu nhiều ngày
  if (todayKey) {
    const missing = diffDays(todayKey, latest.dateKey);
    if (missing >= MISSING_DATA_DAYS) {
      warnings.push({
        code: 'MISSING_DATA',
        severity: 'info',
        message: `Đã ${missing} ngày chưa nhập dữ liệu. Thiếu dữ liệu làm biểu đồ xu hướng kém chính xác.`,
      });
    }
  }

  // 2) Tốc độ đổi cân so với mục tiêu
  const rate = weeklyWeightRate(sorted);
  if (rate && profile.goal && WEEKLY_RATE_LIMITS[profile.goal]) {
    const limit = WEEKLY_RATE_LIMITS[profile.goal];
    const r = rate.weeklyRatePct;
    if (r < limit.min) {
      warnings.push({
        code: 'WEIGHT_LOSS_TOO_FAST',
        severity: 'danger',
        message: `Đang giảm ${Math.abs(r).toFixed(2)}%/tuần, nhanh hơn ngưỡng an toàn (${Math.abs(limit.min)}%/tuần) cho mục tiêu này. Nguy cơ mất cơ và giảm hiệu suất.`,
      });
    } else if (r > limit.max) {
      warnings.push({
        code: 'WEIGHT_GAIN_TOO_FAST',
        severity: 'warning',
        message: `Đang tăng ${r.toFixed(2)}%/tuần, nhanh hơn ngưỡng khuyến nghị (${limit.max}%/tuần). Phần tăng thêm có thể là mỡ.`,
      });
    } else if (profile.goal === 'cut' && r >= 0) {
      warnings.push({
        code: 'WEIGHT_NOT_DECREASING',
        severity: 'warning',
        message: 'Mục tiêu là giảm cân nhưng cân nặng không giảm trong 1-2 tuần gần đây. Kiểm tra lại calo và vận động.',
      });
    } else if (
      (profile.goal === 'lean_bulk' || profile.goal === 'bulk') &&
      r <= 0
    ) {
      warnings.push({
        code: 'WEIGHT_NOT_INCREASING',
        severity: 'warning',
        message: 'Mục tiêu là tăng cân nhưng cân nặng chưa tăng. Có thể cần tăng calo thêm 5-10%.',
      });
    }
  }

  // 3) Thiếu protein nhiều ngày liên tiếp
  if (profile.sex && latest.weightKg) {
    const minProtein = PROTEIN_ALERT_PER_KG * latest.weightKg;
    const recent = sorted.slice(-proteinWindow);
    const hasEnoughDays = recent.length === proteinWindow;
    const lowDays = recent.filter((l) => Number(l.proteinG) > 0 && Number(l.proteinG) < minProtein);
    if (hasEnoughDays && lowDays.length === proteinWindow) {
      warnings.push({
        code: 'LOW_PROTEIN',
        severity: 'warning',
        message: `${proteinWindow} ngày liên tiếp protein dưới ${Math.round(minProtein)} g (1.6 g/kg). Nên bổ sung thêm nguồn protein.`,
      });
    }
  }

  // 4) Ngủ ít nhiều ngày liên tiếp
  const sleepWindow = sorted.slice(-3);
  if (sleepWindow.length === 3 && sleepWindow.every((l) => Number(l.sleepHours) > 0 && Number(l.sleepHours) < 6)) {
    warnings.push({
      code: 'LOW_SLEEP',
      severity: 'info',
      message: 'Ngủ dưới 6 giờ trong 3 ngày gần đây. Thiếu ngủ ảnh hưởng phục hồi và hiệu suất tập.',
    });
  }

  return warnings;
}
