import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Alert, Badge, EmptyState, Field, Icon, InfoTip, PageHeader, Panel, Spinner } from '../../components/ui.jsx';
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
import { CARDIO_BY_KEY } from '@shared/training/cardio.js';

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
                  'num text-[11px] font-medium',
                  item.status === 'low'
                    ? 'text-ochre-600 dark:text-ochre-300'
                    : item.status === 'high'
                      ? 'text-vermilion-600 dark:text-vermilion-300'
                      : 'text-pine-700 dark:text-pine-300',
                )}
              >
                {item.sets} set
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-sm bg-paper-2 dark:bg-white/[0.08]">
              <div
                className={clsx(
                  'h-full',
                  item.status === 'low'
                    ? 'bg-ochre-500'
                    : item.status === 'high'
                      ? 'bg-vermilion-500'
                      : 'bg-pine-600 dark:bg-pine-400',
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
          className="rounded-md border border-line dark:border-white/[0.08]"
        >
          <summary className="cursor-pointer px-3 py-2.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
            {day.name}{' '}
            <span className="ml-2 font-mono text-[11px] font-normal uppercase tracking-[0.06em] text-slate-500 dark:text-slate-400">
              {day.exercises.length} bài
              {day.cardio?.length ? ` · ${day.cardio.length} cardio` : ''}
            </span>
          </summary>
          <div className="border-t border-line px-3 py-2 dark:border-white/[0.07]">
            {day.cardio?.length > 0 && (
              <div className="mb-2 rounded-md bg-brand-50/60 px-2.5 py-1.5 dark:bg-brand-950/30">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
                  Cardio
                </p>
                <ul className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                  {day.cardio.map((item, index) => (
                    <li key={`${day.name}-cardio-${index}`}>
                      {CARDIO_BY_KEY[item.activity]?.label || item.activity} · {item.durationMin}{' '}
                      phút
                      {item.distanceKm ? ` · ${item.distanceKm} km` : ''}
                      {item.intensity
                        ? ` · ${item.intensity === 'light' ? 'nhẹ' : item.intensity === 'vigorous' ? 'mạnh' : 'vừa'}`
                        : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <table className="table-clinical min-w-full">
              <thead className="text-left uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-1.5">Bài</th>
                  <th className="py-1.5">Nhóm cơ</th>
                  <th className="py-1.5">Set × rep</th>
                  <th className="py-1.5">
                    <span className="inline-flex items-center gap-1">
                      RIR
                      <InfoTip label="RIR (Reps In Reserve)">
                        Số rep còn dư trước khi thất bại. RIR 2 = còn có thể làm thêm khoảng 2 rep.
                      </InfoTip>
                    </span>
                  </th>
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

  const programs = useMemo(() => programsQuery.data?.programs || [], [programsQuery.data]);

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
            <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
              <Icon name="plus" className="h-4 w-4" />
              Tự tạo giáo án
            </button>
            <button type="button" className="btn-secondary" onClick={() => setAiOpen(true)}>
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
        <Panel
          className="mb-4"
          title="Tạo giáo án nhanh"
          note="Hệ thống đề xuất split và bài tập theo mục tiêu, trình độ, dụng cụ và thời gian mỗi buổi."
          actions={
            <button type="button" className="btn-ghost btn-sm" onClick={resetWizard}>
              <Icon name="close" className="h-3.5 w-3.5" />
              Đóng
            </button>
          }
        >
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
                    className="select"
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
                      aria-pressed={form.equipment.includes(item.value)}
                      className={clsx(
                        'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[12px] font-medium transition-colors',
                        form.equipment.includes(item.value)
                          ? 'border-pine-600 bg-pine-50 text-pine-800 dark:border-pine-400/60 dark:bg-pine-950/50 dark:text-pine-200'
                          : 'border-line bg-surface text-slate-600 hover:border-line-strong dark:border-white/10 dark:bg-transparent dark:text-slate-400 dark:hover:border-white/20',
                      )}
                    >
                      {form.equipment.includes(item.value) && (
                        <Icon name="check" className="h-3 w-3" />
                      )}
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
                {suggest.isPending ? (
                  <Spinner className="h-4 w-4 text-white" />
                ) : (
                  <Icon name="target" className="h-4 w-4" />
                )}
                {suggest.isPending ? 'Đang tạo...' : 'Gợi ý giáo án'}
              </button>
            </>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge tone="pine">{preview.splitLabel}</Badge>
                <Badge>{preview.daysPerWeek} buổi/tuần</Badge>
                <Badge>{preview.days.reduce((sum, d) => sum + d.exercises.length, 0)} bài</Badge>
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
        </Panel>
      )}

      <div className={clsx('grid gap-4', programs.length > 0 && 'lg:grid-cols-3')}>
        <Panel
          className={clsx(programs.length > 0 && 'lg:col-span-1')}
          title="Giáo án của bạn"
          note={`${programs.length} giáo án đã lưu`}
          flush
        >
          <div className="space-y-1 p-2">
            {programsQuery.isLoading && (
              <div className="p-3">
                <Spinner className="h-4 w-4" />
              </div>
            )}
            {!programs.length && !programsQuery.isLoading && (
              <EmptyState
                icon="dumbbell"
                title="Chưa có giáo án"
                note="Dùng Tạo nhanh hoặc Tự tạo giáo án để bắt đầu."
              />
            )}
            {programs.map((program) => (
              <button
                key={program._id}
                type="button"
                onClick={() => setSelectedId(program._id)}
                className={clsx(
                  'w-full rounded-md border px-3 py-2.5 text-left transition-colors',
                  selectedId === program._id
                    ? 'border-pine-600 bg-pine-50/70 dark:border-pine-500/50 dark:bg-pine-950/30'
                    : 'border-transparent hover:border-line hover:bg-paper-2 dark:hover:border-white/10 dark:hover:bg-white/[0.04]',
                )}
              >
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  {program.name}
                </p>
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-slate-500 dark:text-slate-400">
                  {SPLIT_LABELS[program.split] || program.split} · {program.daysPerWeek} buổi/tuần
                </p>
              </button>
            ))}
          </div>
        </Panel>

        {programs.length > 0 && (
          <Panel className="lg:col-span-2">
            {!selectedId && (
              <EmptyState
                icon="clipboard"
                title="Chọn một giáo án"
                note="Volume theo nhóm cơ và các ngày tập sẽ hiện ở đây."
              />
            )}
          {selectedId && detailQuery.isLoading && <Spinner />}
          {detail && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-[20px] font-semibold text-slate-900 dark:text-white">
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
                    className="btn-ghost btn-sm"
                    onClick={() => setEditing(detail.program)}
                  >
                    <Icon name="settings" className="h-3.5 w-3.5" />
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={() => setEvaluating(detail.program)}
                  >
                    <Icon name="target" className="h-3.5 w-3.5" />
                    Chấm điểm
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn-sm text-vermilion-600 dark:text-vermilion-300"
                    onClick={() => {
                      if (window.confirm('Xóa giáo án này?')) remove.mutate(selectedId);
                    }}
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                    Xóa
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-line bg-paper-2/60 p-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1 font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400">
                    Volume mỗi tuần
                    <InfoTip label="Volume (set/nhóm cơ/tuần)">
                      Tổng số set của từng nhóm cơ trong một tuần. Khoảng 10-20 set/nhóm cơ/tuần là
                      mức tham khảo cho người tập trung cấp.
                    </InfoTip>
                  </p>
                  <p className="num text-[11px] text-slate-500">{totalSets} set/tuần</p>
                </div>
                <div className="mt-2">
                  <VolumeBars volume={volume} />
                </div>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  Mục tiêu {volume?.target.min}-{volume?.target.max} set/nhóm cơ/tuần. Vàng = thiếu,
                  đỏ = quá nhiều.
                </p>
              </div>

              <div className="mt-4">
                <ProgramDays days={detail.program.days} />
              </div>
            </>
          )}
          </Panel>
        )}
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
            days: [{ name: 'Buổi 1', exercises: [], cardio: [] }],
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
        <PlanEvaluationModal program={evaluating} onClose={() => setEvaluating(null)} />
      )}
    </div>
  );
}
