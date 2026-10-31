import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Icon, PageHeader, Spinner } from '../../components/ui.jsx';
import { listExercises } from '../../api/training.js';
import { MUSCLE_LABELS_VI } from '@shared/training/planner.js';

const MUSCLES = Object.entries(MUSCLE_LABELS_VI);

export default function ExerciseLibraryPage() {
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState('');
  const [equipment, setEquipment] = useState('');

  const exercisesQuery = useQuery({ queryKey: ['exercises'], queryFn: () => listExercises() });
  const all = useMemo(() => exercisesQuery.data?.exercises || [], [exercisesQuery.data]);

  const equipmentList = useMemo(
    () => Array.from(new Set(all.flatMap((exercise) => exercise.equipment || []))).sort(),
    [all],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((exercise) => {
      if (muscle && !exercise.primaryMuscles?.includes(muscle)) return false;
      if (equipment && !exercise.equipment?.includes(equipment)) return false;
      if (!q) return true;
      return (
        exercise.nameVi.toLowerCase().includes(q) ||
        exercise.nameEn.toLowerCase().includes(q)
      );
    });
  }, [all, search, muscle, equipment]);

  return (
    <div>
      <PageHeader
        title="Thư viện bài tập"
        subtitle={`${all.length} bài tập với tên Việt/Anh, nhóm cơ và dụng cụ. Dùng khi chỉnh sửa giáo án.`}
      />

      <Card className="mb-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <input
              className="input pl-9"
              placeholder="Tìm bài tập..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Icon name="search" className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          </div>
          <select className="input" value={muscle} onChange={(e) => setMuscle(e.target.value)}>
            <option value="">Tất cả nhóm cơ</option>
            {MUSCLES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select className="input" value={equipment} onChange={(e) => setEquipment(e.target.value)}>
            <option value="">Tất cả dụng cụ</option>
            {equipmentList.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {exercisesQuery.isLoading ? (
        <Card>
          <Spinner />
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((exercise) => (
            <Card key={exercise._id} className="hover-lift">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {exercise.nameVi}
                  </h3>
                  <p className="text-xs text-slate-400">{exercise.nameEn}</p>
                </div>
                <span
                  className={`badge ${
                    exercise.isCompound
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {exercise.isCompound ? 'Compound' : 'Isolation'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {(exercise.primaryMuscles || []).map((m) => (
                  <span key={m} className="badge bg-brand-50/70 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                    {MUSCLE_LABELS_VI[m] || m}
                  </span>
                ))}
                {(exercise.secondaryMuscles || []).slice(0, 3).map((m) => (
                  <span key={m} className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {MUSCLE_LABELS_VI[m] || m}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Dụng cụ: {(exercise.equipment || []).join(', ') || '—'}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
