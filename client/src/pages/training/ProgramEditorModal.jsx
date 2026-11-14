import { Fragment, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Alert, Icon, Portal, Spinner } from '../../components/ui.jsx';
import ExercisePickerModal from './ExercisePickerModal.jsx';
import { updateProgram, createProgram } from '../../api/training.js';
import { getErrorMessage } from '../../api/client.js';
import { GOAL_LABELS } from '../../lib/format.js';
import { MUSCLE_LABELS_VI } from '@shared/training/planner.js';
import {
  CARDIO_ACTIVITIES,
  CARDIO_INTENSITY_LABELS,
} from '@shared/training/cardio.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** Chỉ tự đánh số lại khi mọi buổi vẫn dùng tên mặc định "Buổi N". */
function renumberDefaultDays(days) {
  const allDefault = days.every((day) => {
    const name = String(day.name || '').trim();
    return !name || /^Buổi \d+$/.test(name);
  });
  if (!allDefault) return days;
  return days.map((day, index) => ({ ...day, name: `Buổi ${index + 1}` }));
}

function DayInsertRow({ index, active, dragging, onInsert }) {
  return (
    <div
      data-day-drop={index}
      className={clsx(
        'group relative flex items-center justify-center transition-[height] duration-150',
        dragging ? 'h-9' : 'h-7',
      )}
    >
      <span
        className={clsx(
          'pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 transition-colors',
          active
            ? 'bg-pine-600 dark:bg-pine-400'
            : 'bg-line/70 group-hover:bg-line-strong dark:bg-white/[0.08] dark:group-hover:bg-white/20',
        )}
      />
      <button
        type="button"
        onClick={onInsert}
        title="Chèn ngày tập tại đây"
        aria-label={`Chèn ngày tập tại vị trí ${index + 1}`}
        className={clsx(
          'relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-surface transition-all hover:border-pine-600 hover:text-pine-700 dark:bg-[#151b18] dark:hover:border-pine-400 dark:hover:text-pine-300',
          active
            ? 'border-pine-600 text-pine-700 opacity-100 dark:border-pine-400 dark:text-pine-300'
            : 'border-line text-slate-400 opacity-80 hover:opacity-100 dark:border-white/15 dark:text-slate-500',
        )}
      >
        <Icon name="plus" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function ProgramEditorModal({ program, onClose, onSaved }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => clone(program));
  const [error, setError] = useState(null);
  const [picker, setPicker] = useState(null);
  const panelRef = useRef(null);
  const dayDragRef = useRef(null);
  const [dayDragging, setDayDragging] = useState(null);
  const [dayDropIndex, setDayDropIndex] = useState(null);
  const exerciseDragRef = useRef(null);
  const [exerciseDragging, setExerciseDragging] = useState(null);
  const [exerciseDrop, setExerciseDrop] = useState(null);
  const isNew = !draft._id;

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

  const addCardio = (dayIndex) =>
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              cardio: [
                ...(day.cardio || []),
                { activity: 'running', durationMin: 30, distanceKm: '', intensity: 'moderate' },
              ],
            }
          : day,
      ),
    }));

  const updateCardio = (dayIndex, cardioIndex, patch) =>
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              cardio: (day.cardio || []).map((item, i) =>
                i === cardioIndex ? { ...item, ...patch } : item,
              ),
            }
          : day,
      ),
    }));

  const removeCardio = (dayIndex, cardioIndex) =>
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day, index) =>
        index === dayIndex
          ? { ...day, cardio: (day.cardio || []).filter((_, i) => i !== cardioIndex) }
          : day,
      ),
    }));

  const insertDay = (atIndex) =>
    setDraft((prev) => {
      const position = Number.isInteger(atIndex)
        ? Math.max(0, Math.min(prev.days.length, atIndex))
        : prev.days.length;
      const days = [...prev.days];
      days.splice(position, 0, { name: `Buổi ${position + 1}`, exercises: [], cardio: [] });
      return { ...prev, days: renumberDefaultDays(days) };
    });

  const removeDay = (index) =>
    setDraft((prev) => ({
      ...prev,
      days: renumberDefaultDays(prev.days.filter((_, i) => i !== index)),
    }));

  const moveDay = (from, to) => {
    if (from == null || to == null) return;
    setDraft((prev) => {
      if (from < 0 || from >= prev.days.length) return prev;
      const days = [...prev.days];
      const [moved] = days.splice(from, 1);
      const target = to > from ? to - 1 : to;
      if (target === from || target < 0 || target > days.length) return prev;
      days.splice(target, 0, moved);
      return { ...prev, days: renumberDefaultDays(days) };
    });
  };

  const moveExercise = (dayIndex, from, to) => {
    if (from == null || to == null) return;
    setDraft((prev) => {
      const day = prev.days[dayIndex];
      if (!day) return prev;
      const exercises = [...day.exercises];
      if (from < 0 || from >= exercises.length) return prev;
      const [moved] = exercises.splice(from, 1);
      const target = to > from ? to - 1 : to;
      if (!moved || target === from || target < 0 || target > exercises.length) return prev;
      exercises.splice(target, 0, moved);
      return {
        ...prev,
        days: prev.days.map((item, index) => (index === dayIndex ? { ...item, exercises } : item)),
      };
    });
  };

  const autoScrollPanel = (clientY) => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    if (clientY < rect.top + 56) panel.scrollBy(0, -18);
    else if (clientY > rect.bottom - 56) panel.scrollBy(0, 18);
  };

  const resolveDayDrop = (clientX, clientY) => {
    const element = document.elementFromPoint(clientX, clientY);
    if (!element) return null;
    const row = element.closest('[data-day-drop]');
    if (row) return Number(row.getAttribute('data-day-drop'));
    const card = element.closest('[data-day-index]');
    if (!card) return null;
    const index = Number(card.getAttribute('data-day-index'));
    const rect = card.getBoundingClientRect();
    return clientY < rect.top + rect.height / 2 ? index : index + 1;
  };

  const resolveExerciseDrop = (clientX, clientY, dayIndex) => {
    const element = document.elementFromPoint(clientX, clientY);
    if (!element) return null;
    const line = element.closest('[data-exercise-drop]');
    if (line && line.getAttribute('data-exercise-day') === String(dayIndex)) {
      return Number(line.getAttribute('data-exercise-drop'));
    }
    const row = element.closest('[data-exercise-index]');
    if (row && row.getAttribute('data-exercise-day') === String(dayIndex)) {
      const index = Number(row.getAttribute('data-exercise-index'));
      const rect = row.getBoundingClientRect();
      return clientY < rect.top + rect.height / 2 ? index : index + 1;
    }
    return null;
  };

  const startDayDrag = (event, index) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dayDragRef.current = {
      from: index,
      startY: event.clientY,
      pointerId: event.pointerId,
      active: false,
      drop: null,
    };
    setDayDragging({ from: index, active: false });
    setDayDropIndex(null);
  };

  const moveDayDrag = (event) => {
    const drag = dayDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.active) {
      if (Math.abs(event.clientY - drag.startY) < 6) return;
      drag.active = true;
      setDayDragging({ from: drag.from, active: true });
    }
    event.preventDefault();
    autoScrollPanel(event.clientY);
    const drop = resolveDayDrop(event.clientX, event.clientY);
    if (drop != null) {
      drag.drop = drop;
      setDayDropIndex(drop);
    }
  };

  const endDayDrag = (event) => {
    const drag = dayDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.active && drag.drop != null) moveDay(drag.from, drag.drop);
    dayDragRef.current = null;
    setDayDragging(null);
    setDayDropIndex(null);
  };

  const startExerciseDrag = (event, dayIndex, exIndex) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    exerciseDragRef.current = {
      dayIndex,
      from: exIndex,
      startY: event.clientY,
      pointerId: event.pointerId,
      active: false,
      drop: null,
    };
    setExerciseDragging({ dayIndex, from: exIndex, active: false });
    setExerciseDrop(null);
  };

  const moveExerciseDrag = (event) => {
    const drag = exerciseDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.active) {
      if (Math.abs(event.clientY - drag.startY) < 6) return;
      drag.active = true;
      setExerciseDragging({ dayIndex: drag.dayIndex, from: drag.from, active: true });
    }
    event.preventDefault();
    autoScrollPanel(event.clientY);
    const drop = resolveExerciseDrop(event.clientX, event.clientY, drag.dayIndex);
    if (drop != null) {
      drag.drop = drop;
      setExerciseDrop({ dayIndex: drag.dayIndex, index: drop });
    }
  };

  const endExerciseDrag = (event) => {
    const drag = exerciseDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.active && drag.drop != null) moveExercise(drag.dayIndex, drag.from, drag.drop);
    exerciseDragRef.current = null;
    setExerciseDragging(null);
    setExerciseDrop(null);
  };

  const handleDayHandleKeyDown = (event, dayIndex) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    if (event.key === 'ArrowUp' && dayIndex > 0) moveDay(dayIndex, dayIndex - 1);
    if (event.key === 'ArrowDown' && dayIndex < draft.days.length - 1) {
      moveDay(dayIndex, dayIndex + 2);
    }
  };

  const handleExerciseHandleKeyDown = (event, dayIndex, exIndex) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const total = draft.days[dayIndex]?.exercises.length || 0;
    if (event.key === 'ArrowUp' && exIndex > 0) moveExercise(dayIndex, exIndex, exIndex - 1);
    if (event.key === 'ArrowDown' && exIndex < total - 1) {
      moveExercise(dayIndex, exIndex, exIndex + 2);
    }
  };

  const insertRow = (index) => (
    <DayInsertRow
      key={`insert-${index}`}
      index={index}
      active={dayDropIndex === index}
      dragging={Boolean(dayDragging?.active)}
      onInsert={() => insertDay(index)}
    />
  );

  const addExercise = (dayIndex) => {
    const day = draft.days[dayIndex];
    const newIndex = day.exercises.length;
    updateDay(dayIndex, {
      exercises: [
        ...day.exercises,
        {
          exerciseId: undefined,
          name: '',
          muscleGroup: '',
          sets: 3,
          repRange: { min: 8, max: 12 },
          targetRir: 2,
          restSec: 120,
        },
      ],
    });
    setPicker({ dayIndex, exIndex: newIndex, newRow: true });
  };

  const closePicker = () => {
    if (picker?.newRow) {
      const { dayIndex, exIndex } = picker;
      setDraft((prev) => {
        const exercise = prev.days[dayIndex]?.exercises[exIndex];
        if (!exercise || exercise.name?.trim()) return prev;
        return {
          ...prev,
          days: prev.days.map((day, index) =>
            index === dayIndex
              ? { ...day, exercises: day.exercises.filter((_, i) => i !== exIndex) }
              : day,
          ),
        };
      });
    }
    setPicker(null);
  };

  const removeExercise = (dayIndex, exIndex) =>
    updateDay(dayIndex, {
      exercises: draft.days[dayIndex].exercises.filter((_, i) => i !== exIndex),
    });

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !picker) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, picker]);

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
          cardio: (day.cardio || [])
            .filter((item) => item.activity && Number(item.durationMin) > 0)
            .map((item) => ({
              activity: item.activity,
              durationMin: Math.max(1, Math.min(600, Number(item.durationMin) || 30)),
              distanceKm:
                item.distanceKm === '' || item.distanceKm === null
                  ? undefined
                  : Math.max(0, Math.min(1000, Number(item.distanceKm) || 0)),
              intensity: item.intensity || 'moderate',
              notes: item.notes || '',
            })),
        }))
        .filter((day) => day.exercises.length > 0 || day.cardio.length > 0);

      if (!days.length) throw new Error('Cần ít nhất 1 ngày có bài tập hoặc cardio');

      const payload = {
        name: draft.name.trim() || 'Giáo án của tôi',
        goal: draft.goal,
        daysPerWeek: days.length,
        split: draft.split || 'custom',
        equipment: draft.equipment || [],
        days,
        status: draft.status || 'active',
        deloadEveryWeeks: Math.max(3, Math.min(12, Number(draft.deloadEveryWeeks) || 6)),
        notes: draft.notes || '',
      };

      return isNew ? createProgram(payload) : updateProgram(draft._id, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      if (!isNew) queryClient.invalidateQueries({ queryKey: ['program', draft._id] });
      onSaved?.(data.program);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <Portal>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 sm:items-center sm:p-4"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label={draft.name || 'Sửa giáo án'}
      >
      <div
        ref={panelRef}
        className="max-h-[94vh] w-full overflow-auto rounded-t-lg bg-white p-5 shadow-overlay dark:bg-slate-900 sm:max-w-4xl sm:rounded-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="mt-1 font-display text-[20px] font-semibold text-slate-900 dark:text-white">
              {draft.name || (isNew ? 'Giáo án của tôi' : 'Giáo án')}
            </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Kéo tay nắm để đổi thứ tự buổi hoặc bài tập trong buổi; bấm nút <strong>+</strong> giữa hai buổi để chèn ngày mới đúng vị trí. Có thể dùng ↑/↓ trên tay nắm.
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
        <select className="select" value={draft.goal} onChange={(e) => update({ goal: e.target.value })}>
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

    <div className="mt-3">
      {insertRow(0)}
      {draft.days.map((day, dayIndex) => (
        <Fragment key={dayIndex}>
          <div
            data-day-index={dayIndex}
            className={clsx(
              'rounded-md border border-line bg-surface p-3 transition-opacity dark:border-white/[0.08] dark:bg-[#151b18]',
              dayDragging?.active && dayDragging.from === dayIndex && 'opacity-45',
            )}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="w-5 shrink-0 font-mono text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                {String(dayIndex + 1).padStart(2, '0')}
              </span>
              <span
                onPointerDown={(event) => startDayDrag(event, dayIndex)}
                onPointerMove={moveDayDrag}
                onPointerUp={endDayDrag}
                onPointerCancel={endDayDrag}
                onKeyDown={(event) => handleDayHandleKeyDown(event, dayIndex)}
                role="button"
                tabIndex={0}
                title="Kéo để đổi thứ tự buổi (hoặc dùng ↑/↓)"
                aria-label={`Đổi thứ tự ${day.name || `buổi ${dayIndex + 1}`}`}
                className="grid h-7 w-6 shrink-0 cursor-grab touch-none place-items-center rounded text-slate-400 transition-colors hover:bg-paper-2 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-pine-600/40 active:cursor-grabbing dark:hover:bg-white/[0.06] dark:hover:text-slate-200"
              >
                <Icon name="grip" className="h-3.5 w-3.5" />
              </span>
              <input
                data-day-name
                className="input !py-1.5 w-[min(100%,200px)] text-sm font-semibold"
                value={day.name}
                onChange={(e) => updateDay(dayIndex, { name: e.target.value })}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">{day.exercises.length} bài</span>
              <div className="ml-auto flex items-center gap-0.5">
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-paper-2 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-25 dark:hover:bg-white/[0.06] dark:hover:text-slate-200"
                  onClick={() => moveDay(dayIndex, dayIndex - 1)}
                  disabled={dayIndex === 0}
                  title="Đưa buổi lên"
                  aria-label="Đưa buổi tập lên"
                >
                  <Icon name="chevronDown" className="h-3.5 w-3.5 rotate-180" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-400 transition-colors hover:bg-paper-2 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-25 dark:hover:bg-white/[0.06] dark:hover:text-slate-200"
                  onClick={() => moveDay(dayIndex, dayIndex + 2)}
                  disabled={dayIndex === draft.days.length - 1}
                  title="Đưa buổi xuống"
                  aria-label="Đưa buổi tập xuống"
                >
                  <Icon name="chevronDown" className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="btn-ghost !px-2 !py-1 text-xs text-rose-500"
                  onClick={() => removeDay(dayIndex)}
                >
                  Xóa ngày
                </button>
              </div>
            </div>

              <div className="mt-2 space-y-1.5">
                <div className="hidden grid-cols-[minmax(0,1.6fr)_repeat(5,minmax(0,0.55fr))_auto] gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:grid">
                  <span className="pl-7">Bài tập</span>
                  <span>Set</span>
                  <span>Rep min</span>
                  <span>Rep max</span>
                  <span>RIR</span>
                  <span>Nghỉ (s)</span>
                  <span />
                </div>
                {day.exercises.map((exercise, exIndex) => (
                  <Fragment key={exIndex}>
                    <div
                      data-exercise-day={dayIndex}
                      data-exercise-drop={exIndex}
                      className={clsx(
                        'h-0.5 rounded-full transition-colors',
                        exerciseDrop?.dayIndex === dayIndex && exerciseDrop.index === exIndex
                          ? 'bg-pine-600 dark:bg-pine-400'
                          : 'bg-transparent',
                      )}
                    />
                    <div
                      data-exercise-day={dayIndex}
                      data-exercise-index={exIndex}
                      className={clsx(
                        'grid grid-cols-2 gap-1.5 rounded-md bg-paper-2/45 p-2 transition-opacity dark:bg-white/[0.03] sm:grid-cols-[minmax(0,1.6fr)_repeat(5,minmax(0,0.55fr))_auto] sm:bg-transparent sm:p-0 dark:sm:bg-transparent',
                        exerciseDragging?.active &&
                          exerciseDragging.dayIndex === dayIndex &&
                          exerciseDragging.from === exIndex &&
                          'opacity-45',
                      )}
                    >
                      <div className="col-span-2 flex min-w-0 items-center gap-1 sm:col-span-1">
                        <span
                          onPointerDown={(event) => startExerciseDrag(event, dayIndex, exIndex)}
                          onPointerMove={moveExerciseDrag}
                          onPointerUp={endExerciseDrag}
                          onPointerCancel={endExerciseDrag}
                          onKeyDown={(event) => handleExerciseHandleKeyDown(event, dayIndex, exIndex)}
                          role="button"
                          tabIndex={0}
                          title="Kéo để đổi thứ tự bài (hoặc dùng ↑/↓)"
                          aria-label={`Đổi thứ tự ${exercise.name || `bài ${exIndex + 1}`}`}
                          className="grid h-7 w-6 shrink-0 cursor-grab touch-none place-items-center rounded text-slate-400 transition-colors hover:bg-paper-2 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-pine-600/40 active:cursor-grabbing dark:hover:bg-white/[0.06] dark:hover:text-slate-200"
                        >
                          <Icon name="grip" className="h-3.5 w-3.5" />
                        </span>
                        <button
                          type="button"
                          onClick={() => setPicker({ dayIndex, exIndex })}
                          className="input flex min-w-0 flex-1 items-center justify-between gap-2 !py-1.5 text-left text-xs"
                        >
                          <span className={exercise.name ? 'truncate' : 'text-slate-500 dark:text-slate-400'}>
                            {exercise.name || 'Chọn bài...'}
                          </span>
                          <Icon name="chevronDown" className="h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
                        </button>
                      </div>
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
                      <p className="col-span-2 text-[11px] text-slate-500 dark:text-slate-400 sm:hidden">
                        {MUSCLE_LABELS_VI[exercise.muscleGroup] || exercise.muscleGroup}
                      </p>
                    </div>
                    {exIndex === day.exercises.length - 1 && (
                      <div
                        data-exercise-day={dayIndex}
                        data-exercise-drop={exIndex + 1}
                        className={clsx(
                          'h-0.5 rounded-full transition-colors',
                          exerciseDrop?.dayIndex === dayIndex && exerciseDrop.index === exIndex + 1
                            ? 'bg-pine-600 dark:bg-pine-400'
                            : 'bg-transparent',
                        )}
                      />
                    )}
                  </Fragment>
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

              <div className="mt-3 rounded-md border border-line bg-paper-2/30 p-2.5 dark:border-white/[0.08] dark:bg-white/[0.02]">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Cardio trong ngày
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Ví dụ Chủ nhật chạy bộ 30 phút. Có thể log nhanh từ tab Log buổi tập.
                </p>
                {(day.cardio || []).map((item, cardioIndex) => (
                  <div
                    key={cardioIndex}
                    className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-[1.5fr_0.8fr_0.8fr_0.9fr_auto]"
                  >
                    <select
                      className="select !py-1.5 text-xs"
                      value={item.activity}
                      onChange={(e) =>
                        updateCardio(dayIndex, cardioIndex, { activity: e.target.value })
                      }
                    >
                      {CARDIO_ACTIVITIES.map((activity) => (
                        <option key={activity.key} value={activity.key}>
                          {activity.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className="input !py-1.5 text-xs"
                      placeholder="Phút"
                      min="1"
                      max="600"
                      value={item.durationMin}
                      onChange={(e) =>
                        updateCardio(dayIndex, cardioIndex, {
                          durationMin: Number(e.target.value),
                        })
                      }
                    />
                    <input
                      type="number"
                      className="input !py-1.5 text-xs"
                      placeholder="km (tùy chọn)"
                      min="0"
                      max="1000"
                      step="0.1"
                      value={item.distanceKm ?? ''}
                      onChange={(e) =>
                        updateCardio(dayIndex, cardioIndex, { distanceKm: e.target.value })
                      }
                    />
                    <select
                      className="select !py-1.5 text-xs"
                      value={item.intensity}
                      onChange={(e) =>
                        updateCardio(dayIndex, cardioIndex, { intensity: e.target.value })
                      }
                    >
                      {Object.entries(CARDIO_INTENSITY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-ghost !p-1.5 text-rose-500"
                      onClick={() => removeCardio(dayIndex, cardioIndex)}
                      aria-label="Xóa cardio"
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
                  onClick={() => addCardio(dayIndex)}
                >
                  <Icon name="plus" className="h-3.5 w-3.5" />
                  Thêm cardio
                </button>
              </div>
            </div>
            {insertRow(dayIndex + 1)}
          </Fragment>
        ))}
      </div>

      <button
        type="button"
        className="btn-secondary mt-3"
        onClick={() => insertDay()}
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
            {save.isPending ? 'Đang lưu...' : isNew ? 'Tạo giáo án' : 'Lưu thay đổi'}
          </button>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>

      <ExercisePickerModal
        open={Boolean(picker)}
        onClose={closePicker}
        selectedName={
          picker ? draft.days[picker.dayIndex]?.exercises[picker.exIndex]?.name || '' : ''
        }
        onSelect={(item) => {
          if (!picker) return;
          updateExercise(picker.dayIndex, picker.exIndex, {
            exerciseId: item._id,
            name: item.nameVi,
            muscleGroup: item.primaryMuscles[0],
          });
          setPicker(null);
        }}
      />
      </div>
    </Portal>
  );
}

