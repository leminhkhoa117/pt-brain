import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon, Spinner } from '../../components/ui.jsx';
import { listExercises } from '../../api/training.js';
import { MUSCLE_LABELS_VI } from '@shared/training/planner.js';

const GROUPS = [
  { value: 'all', label: 'Tất cả' },
  ...Object.entries(MUSCLE_LABELS_VI).map(([value, label]) => ({ value, label })),
];

export default function ExercisePickerModal({
  open,
  onClose,
  onSelect,
  selectedName = '',
}) {
  const [group, setGroup] = useState('all');
  const [search, setSearch] = useState('');
  const [equipment, setEquipment] = useState('');

  const exercisesQuery = useQuery({
    queryKey: ['exercises'],
    queryFn: () => listExercises(),
    enabled: open,
  });
  const all = useMemo(() => exercisesQuery.data?.exercises || [], [exercisesQuery.data]);

  const equipmentList = useMemo(
    () => Array.from(new Set(all.flatMap((item) => item.equipment || []))).sort(),
    [all],
  );

  const counts = useMemo(() => {
    const map = { all: all.length };
    for (const item of all) {
      for (const muscle of item.primaryMuscles || []) {
        map[muscle] = (map[muscle] || 0) + 1;
      }
    }
    return map;
  }, [all]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((item) => {
      if (group !== 'all' && !item.primaryMuscles?.includes(group)) return false;
      if (equipment && !item.equipment?.includes(equipment)) return false;
      if (!q) return true;
      return (
        item.nameVi.toLowerCase().includes(q) ||
        item.nameEn.toLowerCase().includes(q) ||
        (item.primaryMuscles || []).some((m) =>
          (MUSCLE_LABELS_VI[m] || '').toLowerCase().includes(q),
        )
      );
    });
  }, [all, group, search, equipment]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/75 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full flex-col rounded-t-lg bg-white shadow-overlay dark:bg-slate-900 sm:max-w-3xl sm:rounded-lg">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4 dark:border-white/[0.06]">
          <div>
            <h2 className="mt-1 font-display text-[20px] font-semibold text-slate-900 dark:text-white">Chọn bài tập</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lọc theo nhóm cơ, tìm theo tên Việt/Anh và chọn bài phù hợp.
            </p>
          </div>
          <button type="button" className="btn-ghost !p-2" onClick={onClose} aria-label="Đóng">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-slate-100 p-3 dark:border-white/[0.06]">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                className="input pl-9"
                placeholder="Tìm bài tập..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <Icon name="search" className="absolute left-3 top-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
            </div>
            <select
              className="select max-w-[170px]"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
            >
              <option value="">Mọi dụng cụ</option>
              {equipmentList.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
            {GROUPS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setGroup(item.value)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  group === item.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:text-slate-800 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {item.label}
                <span className="ml-1 opacity-60">{counts[item.value] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {exercisesQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : filtered.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {filtered.map((item) => {
                const selected = item.nameVi === selectedName;
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={`rounded-xl border p-3 text-left transition ${
                      selected
                        ? 'border-brand-400 bg-brand-50/70 dark:border-brand-700 dark:bg-brand-950/30'
                        : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-brand-800 dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {item.nameVi}
                        </p>
                        <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{item.nameEn}</p>
                      </div>
                      <span
                        className={`badge shrink-0 ${
                          item.isCompound
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {item.isCompound ? 'Compound' : 'Isolation'}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {(item.primaryMuscles || []).map((muscle) => (
                        <span key={muscle} className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {MUSCLE_LABELS_VI[muscle] || muscle}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {(item.equipment || []).join(', ')}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Không tìm thấy bài phù hợp. Thử đổi nhóm cơ hoặc từ khóa.
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-3 text-[11px] text-slate-500 dark:text-slate-400 dark:border-white/[0.06]">
          Hiển thị {filtered.length} / {all.length} bài tập
        </div>
      </div>
    </div>,
    document.body,
  );
}
