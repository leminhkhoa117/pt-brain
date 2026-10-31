import {
  exportCsv,
  getBodyLog,
  getSummary,
  listBodyLogs,
  POSTURE_CHECKLIST,
  upsertBodyLog,
} from '../services/metricsService.js';
import { getUser } from '../services/authService.js';

export async function listMetrics(req, res) {
  const logs = await listBodyLogs(req.userId, req.validatedQuery || {});
  res.json({ data: { logs } });
}

export async function getMetric(req, res) {
  const log = await getBodyLog(req.userId, req.params.date);
  res.json({ data: { log } });
}

export async function putMetric(req, res) {
  const user = await getUser(req.userId);
  const log = await upsertBodyLog(user, req.params.date, req.body);
  res.json({ data: { log, checklist: POSTURE_CHECKLIST } });
}

export async function summary(req, res) {
  const data = await getSummary(req.userId, req.validatedQuery || {});
  res.json({ data: { ...data, checklist: POSTURE_CHECKLIST } });
}

export async function downloadCsv(req, res) {
  const csv = await exportCsv(req.userId);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="pt-brain-bodylog.csv"');
  // BOM để Excel mở đúng tiếng Việt
  res.send(`\ufeff${csv}`);
}
