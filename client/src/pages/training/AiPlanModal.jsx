import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Field, Icon, Spinner } from '../../components/ui.jsx';
import MarkdownText from '../../components/MarkdownText.jsx';
import { aiSuggestProgram, createProgram } from '../../api/training.js';
import { getErrorMessage } from '../../api/client.js';
import { GOAL_LABELS } from '../../lib/format.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import { MUSCLE_LABELS_VI } from '@shared/training/planner.js';
import { HEALTH_CONDITIONS, healthConditionLabel } from '@shared/health/conditions.js';

const EQUIPMENT = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Tạ đơn' },
  { value: 'machine', label: 'Máy' },
  { value: 'cable', label: 'Cáp' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'bands', label: 'Dây kháng lực' },
];

export default function AiPlanModal({ onClose, onSaved }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    goal: 'lean_bulk',
    experience: 'intermediate',
    daysPerWeek: 4,
    equipment: ['barbell', 'dumbbell', 'machine', 'cable'],
    sessionMinutes: 60,
    healthConditions: user?.profile?.healthConditions || [],
    conditionNotes: user?.profile?.conditionNotes || '',
  });
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const suggest = useMutation({
    mutationFn: () => aiSuggestProgram(form),
    onSuccess: (data) => {
      setPreview(data);
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const save = useMutation({
    mutationFn: () =>
      createProgram({
        name: form.name.trim() || preview.name,
        goal: form.goal,
        daysPerWeek: preview.daysPerWeek,
        split: preview.split,
        equipment: form.equipment,
        days: preview.days,
        status: 'active',
        deloadEveryWeeks: 6,
        notes: `${preview.rationale || ''}${
          form.healthConditions.length
            ? `\n\nLưu ý sức khỏe: ${form.healthConditions.map(healthConditionLabel).join(', ')}.`
            : ''
        }`.slice(0, 2000),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      onSaved?.(data.program);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const toggleEquipment = (value) =>
    setForm((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(value)
        ? prev.equipment.filter((v) => v !== value)
        : [...prev.equipment, value],
    }));

  const toggleCondition = (value) =>
    setForm((prev) => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(value)
        ? prev.healthConditions.filter((v) => v !== value)
        : [...prev.healthConditions, value],
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full overflow-auto rounded-t-lg bg-white p-5 shadow-overlay dark:bg-slate-900 sm:max-w-3xl sm:rounded-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="mt-1 font-display text-[20px] font-semibold text-slate-900 dark:text-white">
              AI đề xuất giáo án
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Dựa trên bằng chứng về volume, tần suất, RIR, nghỉ và dụng cụ. Bạn duyệt rồi mới lưu.
            </p>
          </div>
          <button type="button" className="btn-ghost !p-2" onClick={onClose}>
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <Alert tone="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {!preview ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Tên giáo án">
                <input
                  className="input"
                  placeholder="AI · Upper/Lower 4 buổi"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Field>
              <Field label="Mục tiêu">
                <select
                  className="select"
                  value={form.goal}
                  onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                >
                  {Object.entries(GOAL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Trình độ">
                <select
                  className="select"
                  value={form.experience}
                  onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
                >
                  <option value="beginner">Mới bắt đầu</option>
                  <option value="intermediate">Trung cấp</option>
                  <option value="advanced">Nâng cao</option>
                </select>
              </Field>
              <Field label="Số buổi/tuần">
                <select
                  className="select"
                  value={form.daysPerWeek}
                  onChange={(e) => setForm((f) => ({ ...f, daysPerWeek: Number(e.target.value) }))}
                >
                  {[2, 3, 4, 5, 6].map((d) => (
                    <option key={d} value={d}>
                      {d} buổi
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Thời gian mỗi buổi">
                <select
                  className="select"
                  value={form.sessionMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, sessionMinutes: Number(e.target.value) }))}
                >
                  {[45, 60, 75, 90].map((m) => (
                    <option key={m} value={m}>
                      {m} phút
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-3">
              <p className="label">Dụng cụ</p>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => toggleEquipment(item.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      form.equipment.includes(item.value)
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-amber-200/70 bg-amber-50/40 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="label !mb-0">Bệnh nền / chấn thương</p>
                <span className="text-[11px] font-medium text-amber-700/80 dark:text-amber-300/80">
                  AI sẽ loại bài không phù hợp
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {HEALTH_CONDITIONS.map((item) => {
                  const active = form.healthConditions.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleCondition(item.key)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                        active
                          ? 'border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'
                          : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {item.vi}
                    </button>
                  );
                })}
              </div>
              <input
                className="input mt-2 !py-1.5 text-xs"
                placeholder="Ghi chú thêm: thoát vị L4-L5, đau khi cúi, bác sĩ cho tập nhẹ..."
                value={form.conditionNotes}
                maxLength={1000}
                onChange={(e) => setForm((f) => ({ ...f, conditionNotes: e.target.value }))}
              />
              <p className="mt-1.5 text-[11px] leading-relaxed text-amber-800/80 dark:text-amber-200/70">
                Đây là gợi ý an toàn chung, không thay thế đánh giá của bác sĩ/PT chuyên môn.
              </p>
            </div>

            <button
              type="button"
              className="btn-primary mt-4"
              disabled={suggest.isPending}
              onClick={() => suggest.mutate()}
            >
              {suggest.isPending ? <Spinner className="h-4 w-4 text-white" /> : <Icon name="target" className="h-4 w-4" />}
              {suggest.isPending ? 'AI đang thiết kế giáo án...' : 'Để AI đề xuất'}
            </button>
          </>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                {preview.daysPerWeek} buổi/tuần
              </span>
              <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {preview.days.reduce((sum, day) => sum + day.exercises.length, 0)} bài
              </span>
              <span
                className={`badge ${
                  preview.source === 'ai'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {preview.source === 'ai' ? 'AI đề xuất' : 'Phương án dự phòng theo quy tắc'}
              </span>
            </div>

            {preview.cautions?.length > 0 && (
              <Alert tone="warning" className="mt-3">
                {preview.cautions.join(' · ')}
              </Alert>
            )}

            <div className="mt-3 space-y-2">
              {preview.days.map((day) => (
                <div key={day.name} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{day.name}</p>
                  <div className="mt-1 space-y-1">
                    {day.exercises.map((exercise) => (
                      <div key={`${day.name}-${exercise.name}`} className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-slate-600 dark:text-slate-300">
                          {exercise.name}
                          <span className="ml-1 text-slate-500 dark:text-slate-400">
                            ({MUSCLE_LABELS_VI[exercise.muscleGroup] || exercise.muscleGroup})
                          </span>
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {exercise.sets} × {exercise.repRange.min}-{exercise.repRange.max} · RIR{' '}
                          {exercise.targetRir} · {exercise.restSec}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {preview.rationale && (
              <Card className="mt-3 border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/20">
                <MarkdownText>{preview.rationale}</MarkdownText>
              </Card>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {(preview.evidence || []).map((item) => (
                <a
                  key={item.id}
                  href={item.doi ? `https://doi.org/${item.doi}` : '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="badge bg-slate-100 text-slate-500 hover:text-brand-700 dark:bg-slate-800 dark:text-slate-400"
                  title={item.title}
                >
                  [{item.id}] {item.year}
                </a>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                disabled={save.isPending}
                onClick={() => save.mutate()}
              >
                {save.isPending ? 'Đang lưu...' : 'Lưu giáo án này'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setPreview(null)}>
                Quay lại chỉnh
              </button>
              <button type="button" className="btn-ghost" onClick={onClose}>
                Đóng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

