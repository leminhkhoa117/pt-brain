import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Icon, Spinner } from '../../components/ui.jsx';
import { listExercises, updateProgram } from '../../api/training.js';
import { getErrorMessage } from '../../api/client.js';
import { GOAL_LABELS } from '../../lib/format.js';
import { MUSCLE_LABELS_VI } from '@shared/training/planner.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export default function ProgramEditorModal({ program, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => clone(program));
  const [error, setError] = useState(null);

  const exercisesQuery = useQuery({ queryKey: ['exercises'], queryFn: () => listExercises() });
  const exercises = useMemo(() => exercisesQuery.data?.exercises || [], [exercisesQuery.data]);

  const update = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const updateDay = (dayIndex, patch) =>
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day, index) => (index === dayIndex ? { ...day, ...patch } : day)),
    }));

  const updateExercise = (dayIndex, exIndex, patch) =>
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((ex, i) => (i === exIndex ? { ...ex, ...patch } : ex)),
            }
          : day,
      ),
    }));

  const addDay = () =>
    setDraft((prev) => ({
      ...prev,
      days: [...prev.days, { name: `Buổi ${prev.days.length + 1}`, exercises: [] }],
    }));

  const removeDay = (index) =>
    setDraft((prev) => ({ ...prev, days: prev.days.filter((_, i) => i !== index) }));

  const addExercise = (dayIndex) => {
    const first = exercises[0];
    if (!first) return;
    const day = draft.days[dayIndex];
    updateDay(dayIndex, {
      exercises: [
        ...day.exercises,
        {
          exerciseId: first._id,
          name: first.nameVi,
          muscleGroup: first.primaryMuscles[0],
          sets: 3,
          repRange: { min: 8, max: 12 },
          targetRir: 2,
          restSec: 120,
        },
      ],
    });
  };

  const removeExercise = (dayIndex, exIndex) =>
    updateDay(dayIndex, {
      exercises: draft.days[dayIndex].exercises.filter((_, i) => i !== exIndex),
    });

  const save = useMutation({
    mutationFn: () => {
      const days = draft.days
        .map((day) => ({
          ...day,
          name: day.name.trim() || 'Buổi tập',
          exercises: day.exercises
            .filter((ex) => ex.name?.trim() && ex.muscleGroup)
            .map((ex) => {
              const min = Math.min(Number(ex.repRange?.min) || 8, Number(ex.repRange?.max) || 12);
              const max = Math.max(Number(ex.repRange?.min) || 8, Number(ex.repRange?.max) || 12);
              return {
                exerciseId: ex.exerciseId || undefined,
                name: ex.name.trim(),
                muscleGroup: ex.muscleGroup,
                sets: Math.max(1, Math.min(20, Number(ex.sets) || 3)),
                repRange: { min, max },
                targetRir: Math.max(0, Math.min(5, Number(ex.targetRir) || 2)),
                restSec: Math.max(30, Math.min(300, Number(ex.restSec) || 120)),
              };
            }),
        }))
        .filter((day) => day.exercises.length > 0);

      if (!days.length) throw new Error('Cần ít nhất 1 ngày có bài tập');
      return updateProgram(draft._id, {
        name: draft.name.trim(),
        goal: draft.goal,
        daysPerWeek: Math.max(1, Math.min(7, Number(draft.daysPerWeek) || days.length)),
        deloadEveryWeeks: Math.max(3, Math.min(12, Number(draft.deloadEveryWeeks) || 6)),
        days,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', draft._id] });
      onSaved?.(data.program);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[94vh] w-full overflow-auto rounded-t-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:max-w-4xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">
              Chỉnh sửa giáo án
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{draft.name}</h2>
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

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <label className="sm:col-span-2">
            <span className="label">Tên giáo án</span>
            <input
              className="input"
              value={draft.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </label>
          <label>
            <span className="label">Mục tiêu</span>
            <select className="input" value={draft.goal} onChange={(e) => update({ goal: e.target.value })}>
              {Object.entries(GOAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Deload mỗi (tuần)</span>
            <input
              type="number"
              className="input"
              min="3"
              max="12"
              value={draft.deloadEveryWeeks || 6}
              onChange={(e) => update({ deloadEveryWeeks: Number(e.target.value) })}
            />
          </label>
        </div>

        <div className="mt-4 space-y-3">
          {draft.days.map((day, dayIndex) => (
            <div key={dayIndex} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  className="input !py-1.5 max-w-[220px] text-sm font-semibold"
                  value={day.name}
                  onChange={(e) => updateDay(dayIndex, { name: e.target.value })}
                />
                <span className="text-xs text-slate-400">{day.exercises.length} bài</span>
                <button
                  type="button"
                  className="btn-ghost ml-auto !px-2 !py-1 text-xs text-rose-500"
                  onClick={() => removeDay(dayIndex)}
                >
                  Xóa ngày
                </button>
              </div>

              <div className="mt-2 space-y-1.5">
                <div className="hidden grid-cols-[minmax(0,1.6fr)_repeat(5,minmax(0,0.55fr))_auto] gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:grid">
                  <span>Bài tập</span>
                  <span>Set</span>
                  <span>Rep min</span>
                  <span>Rep max</span>
                  <span>RIR</span>
                  <span>Nghỉ (s)</span>
                  <span />
                </div>
                {day.exercises.map((exercise, exIndex) => (
                  <div
                    key={exIndex}
                    className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-50 p-2 dark:bg-white/[0.03] sm:grid-cols-[minmax(0,1.6fr)_repeat(5,minmax(0,0.55fr))_auto] sm:bg-transparent sm:p-0 dark:sm:bg-transparent"
                  >
                    <select
                      className="input col-span-2 !py-1.5 text-xs sm:col-span-1"
                      value={exercise.name}
                      onChange={(e) => {
                        const found = exercises.find((item) => item.nameVi === e.target.value);
                        if (!found) return;
                        updateExercise(dayIndex, exIndex, {
                          exerciseId: found._id,
                          name: found.nameVi,
                          muscleGroup: found.primaryMuscles[0],
                        });
                      }}
                    >
                      <option value="">Chọn bài...</option>
                      {exercises.map((item) => (
                        <option key={item._id} value={item.nameVi}>
                          {item.nameVi}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="input !py-1.5 text-xs"
                      value={exercise.sets}
                      min="1"
                      max="20"
                      onChange={(e) => updateExercise(dayIndex, exIndex, { sets: Number(e.target.value) })}
                    />
                    <input
                      type="number"
                      className="input !py-1.5 text-xs"
                      value={exercise.repRange?.min}
                      min="1"
                      max="30"
                      onChange={(e) =>
                        updateExercise(dayIndex, exIndex, {
                          repRange: { ...exercise.repRange, min: Number(e.target.value) },
                        })
                      }
                    />
                    <input
                      type="number"
                      className="input !py-1.5 text-xs"
                      value={exercise.repRange?.max}
                      min="1"
                      max="30"
                      onChange={(e) =>
                        updateExercise(dayIndex, exIndex, {
                          repRange: { ...exercise.repRange, max: Number(e.target.value) },
                        })
                      }
                    />
                    <input
                      type="number"
                      className="input !py-1.5 text-xs"
                      value={exercise.targetRir}
                      min="0"
                      max="5"
                      onChange={(e) =>
                        updateExercise(dayIndex, exIndex, { targetRir: Number(e.target.value) })
                      }
                    />
                    <input
                      type="number"
                      className="input !py-1.5 text-xs"
                      value={exercise.restSec}
                      min="30"
                      max="300"
                      step="15"
                      onChange={(e) =>
                        updateExercise(dayIndex, exIndex, { restSec: Number(e.target.value) })
                      }
                    />
                    <button
                      type="button"
                      className="btn-ghost !p-1.5 text-rose-500"
                      onClick={() => removeExercise(dayIndex, exIndex)}
                      aria-label="Xóa bài"
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                    <p className="col-span-2 text-[10px] text-slate-400 sm:hidden">
                      {MUSCLE_LABELS_VI[exercise.muscleGroup] || exercise.muscleGroup}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                onClick={() => addExercise(dayIndex)}
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
                Thêm bài
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="btn-secondary mt-3"
          onClick={addDay}
        >
          <Icon name="plus" className="h-4 w-4" />
          Thêm ngày tập
        </button>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-primary"
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? <Spinner className="h-4 w-4 text-white" /> : <Icon name="check" className="h-4 w-4" />}
            {save.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

