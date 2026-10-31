import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Alert, Card, Field, Icon, PageHeader, Spinner } from '../../components/ui.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import AiPlanModal from './AiPlanModal.jsx';
import ProgramEditorModal from './ProgramEditorModal.jsx';
import PlanEvaluationModal from './PlanEvaluationModal.jsx';
import {
  createProgram,
  deleteProgram,
  getProgram,
  listPrograms,
  suggestProgram,
} from '../../api/training.js';
import { getErrorMessage } from '../../api/client.js';
import { GOAL_LABELS } from '../../lib/format.js';
import { MUSCLE_LABELS_VI, SPLIT_LABELS } from '@shared/training/planner.js';

const EQUIPMENT = [
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Tạ đơn' },
  { value: 'machine', label: 'Máy' },
  { value: 'cable', label: 'Cáp' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'bands', label: 'Dây kháng lực' },
];

const DAYS = [2, 3, 4, 5, 6];

const initialForm = {
  name: '',
  goal: 'lean_bulk',
  experience: 'intermediate',
  daysPerWeek: 4,
  equipment: ['barbell', 'dumbbell', 'machine', 'cable'],
  sessionMinutes: 60,
};

function VolumeBars({ volume }) {
  if (!volume?.status?.length) return null;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {volume.status.map((item) => {
        const pct = Math.min(100, (item.sets / volume.target.max) * 100);
        return (
          <div key={item.muscle}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {MUSCLE_LABELS_VI[item.muscle] || item.muscle}
              </span>
              <span
                className={clsx(
                  'font-semibold',
                  item.status === 'low'
                    ? 'text-amber-600 dark:text-amber-400'
                    : item.status === 'high'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400',
                )}
              >
                {item.sets} set
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className={clsx(
                  'h-full rounded-full',
                  item.status === 'low'
                    ? 'bg-amber-400'
                    : item.status === 'high'
                      ? 'bg-rose-400'
                      : 'bg-emerald-500',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgramDays({ days }) {
  return (
    <div className="space-y-2">
      {days.map((day) => (
        <details
          key={day.name}
          className="rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <summary className="cursor-pointer px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {day.name}
            <span className="ml-2 text-xs font-normal text-slate-400">
              {day.exercises.length} bài
            </span>
          </summary>
          <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-800">
            <table className="min-w-full text-xs">
              <thead className="text-left uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="py-1.5">Bài</th>
                  <th className="py-1.5">Nhóm cơ</th>
                  <th className="py-1.5">Set × rep</th>
                  <th className="py-1.5">RIR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {day.exercises.map((exercise) => (
                  <tr key={`${day.name}-${exercise.name}`}>
                    <td className="py-1.5 font-medium text-slate-700 dark:text-slate-200">
                      {exercise.name}
                    </td>
                    <td className="py-1.5 text-slate-500">
                      {MUSCLE_LABELS_VI[exercise.muscleGroup] || exercise.muscleGroup}
                    </td>
                    <td className="py-1.5 text-slate-500">
                      {exercise.sets} × {exercise.repRange.min}-{exercise.repRange.max}
                    </td>
                    <td className="py-1.5 text-slate-500">{exercise.targetRir}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </div>
  );
}

export default function PlannerPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [evaluating, setEvaluating] = useState(null);

  const programsQuery = useQuery({ queryKey: ['programs'], queryFn: listPrograms });
  const detailQuery = useQuery({
    queryKey: ['program', selectedId],
    queryFn: () => getProgram(selectedId),
    enabled: Boolean(selectedId),
  });

  const programs = useMemo(
    () => programsQuery.data?.programs || [],
    [programsQuery.data],
  );

  useEffect(() => {
    if (!selectedId && programs.length) setSelectedId(programs[0]._id);
  }, [programs, selectedId]);

  useEffect(() => {
    if (!programsQuery.isLoading && !programs.length) setShowWizard(true);
  }, [programs.length, programsQuery.isLoading]);

  const suggest = useMutation({
    mutationFn: () => suggestProgram(form),
    onSuccess: (data) => {
      setPreview(data);
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const save = useMutation({
    mutationFn: (payload) => createProgram(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setSelectedId(data.program._id);
      setPreview(null);
      setShowWizard(false);
      setNotice('Đã lưu giáo án.');
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteProgram(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setSelectedId(null);
      setNotice('Đã xóa giáo án.');
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

  const detail = detailQuery.data;
  const volume = detail?.volume;
  const totalSets = useMemo(() => volume?.totalSets || 0, [volume]);

  const resetWizard = () => {
    setForm(initialForm);
    setPreview(null);
    setShowWizard(false);
    setError(null);
  };

  return (
    <div>
      <PageHeader
        title="Giáo án"
        subtitle="Tạo giáo án theo quy tắc hoặc để AI đề xuất, đếm volume theo nhóm cơ và cảnh báo thiếu/quá nhiều."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setCreating(true)}
            >
              <Icon name="plus" className="h-4 w-4" />
              Tự tạo giáo án
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setAiOpen(true)}
            >
              <Icon name="target" className="h-4 w-4" />
              AI đề xuất
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setPreview(null);
                setShowWizard((v) => !v);
              }}
            >
              <Icon name="dumbbell" className="h-4 w-4" />
              {showWizard ? 'Đóng wizard' : 'Tạo nhanh'}
            </button>
          </div>
        }
      />

      {notice && (
        <Alert tone="success" className="mb-4">
          {notice}
        </Alert>
      )}
      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {showWizard && (
        <Card className="mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Wizard tạo giáo án
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Hệ thống đề xuất split và bài tập theo mục tiêu, trình độ, dụng cụ và thời gian mỗi buổi.
          </p>

          {!preview ? (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Tên giáo án">
                  <input
                    className="input"
                    placeholder="Upper/Lower 4 buổi"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    maxLength={120}
                  />
                </Field>
                <Field label="Mục tiêu">
                  <select
                    className="input"
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
                    className="input"
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
                    className="input"
                    value={form.daysPerWeek}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, daysPerWeek: Number(e.target.value) }))
                    }
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d} buổi
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Thời gian mỗi buổi">
                  <select
                    className="input"
                    value={form.sessionMinutes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sessionMinutes: Number(e.target.value) }))
                    }
                  >
                    <option value={45}>45 phút</option>
                    <option value={60}>60 phút</option>
                    <option value={75}>75 phút</option>
                    <option value={90}>90 phút</option>
                  </select>
                </Field>
              </div>

              <div className="mt-3">
                <p className="label">Dụng cụ có sẵn</p>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleEquipment(item.value)}
                      className={clsx(
                        'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                        form.equipment.includes(item.value)
                          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                          : 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400',
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="btn-primary mt-4"
                disabled={suggest.isPending}
                onClick={() => suggest.mutate()}
              >
                {suggest.isPending ? <Spinner className="h-4 w-4 text-white" /> : <Icon name="target" className="h-4 w-4" />}
                {suggest.isPending ? 'Đang tạo...' : 'Gợi ý giáo án'}
              </button>
            </>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {preview.splitLabel}
                </span>
                <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {preview.daysPerWeek} buổi/tuần
                </span>
                <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {preview.days.reduce((sum, d) => sum + d.exercises.length, 0)} bài
                </span>
              </div>

              <div className="mt-3">
                <ProgramDays days={preview.days} />
              </div>

              {preview.notes && (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{preview.notes}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={save.isPending}
                  onClick={() =>
                    save.mutate({
                      name: form.name.trim() || preview.name,
                      goal: form.goal,
                      daysPerWeek: form.daysPerWeek,
                      split: preview.split,
                      equipment: form.equipment,
                      days: preview.days,
                      status: 'active',
                      deloadEveryWeeks: 6,
                      notes: preview.notes || '',
                    })
                  }
                >
                  {save.isPending ? 'Đang lưu...' : 'Lưu giáo án'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setPreview(null)}>
                  Quay lại chỉnh
                </button>
                <button type="button" className="btn-ghost" onClick={resetWizard}>
                  Hủy
                </button>
              </div>
            </>
          )}
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Giáo án của bạn</h2>
          <div className="mt-3 space-y-2">
            {programsQuery.isLoading && <Spinner className="h-5 w-5" />}
            {!programs.length && !programsQuery.isLoading && (
              <p className="text-sm text-slate-400">Chưa có giáo án. Dùng wizard để tạo.</p>
            )}
            {programs.map((program) => (
              <button
                key={program._id}
                type="button"
                onClick={() => setSelectedId(program._id)}
                className={clsx(
                  'w-full rounded-xl border p-3 text-left transition',
                  selectedId === program._id
                    ? 'border-brand-400 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-950/30'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
                )}
              >
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {program.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {SPLIT_LABELS[program.split] || program.split} · {program.daysPerWeek} buổi/tuần
                </p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          {!selectedId && (
            <p className="py-10 text-center text-sm text-slate-400">
              Chọn một giáo án để xem volume và các ngày tập.
            </p>
          )}
          {selectedId && detailQuery.isLoading && <Spinner />}
          {detail && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {detail.program.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {SPLIT_LABELS[detail.program.split]} · {detail.program.daysPerWeek} buổi/tuần ·
                    deload mỗi {detail.program.deloadEveryWeeks} tuần
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    className="btn-ghost !px-2.5 !py-1.5 text-xs"
                    onClick={() => setEditing(detail.program)}
                  >
                    <Icon name="settings" className="h-4 w-4" />
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="btn-ghost !px-2.5 !py-1.5 text-xs"
                    onClick={() => setEvaluating(detail.program)}
                  >
                    <Icon name="target" className="h-4 w-4" />
                    Chấm điểm
                  </button>
                  <button
                    type="button"
                    className="btn-ghost !px-2.5 !py-1.5 text-xs text-rose-500"
                    onClick={() => {
                      if (window.confirm('Xóa giáo án này?')) remove.mutate(selectedId);
                    }}
                  >
                    <Icon name="trash" className="h-4 w-4" />
                    Xóa
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Volume mỗi tuần
                  </p>
                  <p className="text-xs text-slate-500">{totalSets} set/tuần</p>
                </div>
                <div className="mt-2">
                  <VolumeBars volume={volume} />
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  Mục tiêu {volume?.target.min}-{volume?.target.max} set/nhóm cơ/tuần. Vàng = thiếu,
                  đỏ = quá nhiều.
                </p>
              </div>

              <div className="mt-4">
                <ProgramDays days={detail.program.days} />
              </div>
            </>
          )}
        </Card>
      </div>

      {aiOpen && (
        <AiPlanModal
          onClose={() => setAiOpen(false)}
          onSaved={(program) => {
            setAiOpen(false);
            setSelectedId(program._id);
            setNotice('Đã lưu giáo án do AI đề xuất.');
          }}
        />
      )}
      {creating && (
        <ProgramEditorModal
          program={{
            name: 'Giáo án của tôi',
            goal: user?.profile?.goal || 'lean_bulk',
            daysPerWeek: 4,
            split: 'custom',
            equipment: [],
            days: [{ name: 'Buổi 1', exercises: [] }],
            deloadEveryWeeks: 6,
            status: 'active',
            notes: '',
          }}
          onClose={() => setCreating(false)}
          onSaved={(program) => {
            setCreating(false);
            setSelectedId(program._id);
            setNotice('Đã tạo giáo án mới. Bạn có thể chỉnh sửa bất cứ lúc nào.');
          }}
        />
      )}
      {editing && (
        <ProgramEditorModal
          program={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            queryClient.invalidateQueries({ queryKey: ['program', selectedId] });
            setNotice('Đã cập nhật giáo án.');
          }}
        />
      )}
      {evaluating && (
        <PlanEvaluationModal
          program={evaluating}
          onClose={() => setEvaluating(null)}
        />
      )}
    </div>
  );
}

