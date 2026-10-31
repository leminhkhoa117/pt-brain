import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Icon, PageHeader, Spinner } from '../../components/ui.jsx';
import { deleteWorkout, listPrograms, listWorkouts } from '../../api/training.js';
import { getErrorMessage } from '../../api/client.js';
import { formatDateKey } from '../../lib/date.js';
import { formatNumber } from '../../lib/format.js';

export default function WorkoutHistoryPage() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(null);

  const workoutsQuery = useQuery({
    queryKey: ['workouts', 'history'],
    queryFn: () => listWorkouts({ limit: 100 }),
  });
  const programsQuery = useQuery({ queryKey: ['programs'], queryFn: listPrograms });
  const programs = useMemo(() => programsQuery.data?.programs || [], [programsQuery.data]);
  const workouts = useMemo(
    () => workoutsQuery.data?.workouts || [],
    [workoutsQuery.data],
  );

  const remove = useMutation({
    mutationFn: (id) => deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const stats = useMemo(() => {
    const totalTonnage = workouts.reduce((sum, w) => sum + (w.computed?.tonnage || 0), 0);
    const totalSets = workouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0);
    const thisMonth = workouts.filter((w) => String(w.dateKey).slice(0, 7) === new Date().toISOString().slice(0, 7)).length;
    return { totalTonnage, totalSets, thisMonth };
  }, [workouts]);

  return (
    <div>
      <PageHeader
        title="Danh sách buổi tập"
        subtitle="Toàn bộ buổi tập đã ghi, tonnage và chi tiết từng set. Bấm vào buổi để xem lại."
        actions={
          <Link to="/training?tab=workout" className="btn-primary">
            <Icon name="plus" className="h-4 w-4" />
            Log buổi tập
          </Link>
        }
      />

      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="card-title">Tổng buổi</p>
          <p className="stat-value mt-2">{workouts.length}</p>
          <p className="text-xs text-slate-400">{stats.thisMonth} buổi tháng này</p>
        </Card>
        <Card>
          <p className="card-title">Tổng set</p>
          <p className="stat-value mt-2">{formatNumber(stats.totalSets, 0)}</p>
        </Card>
        <Card>
          <p className="card-title">Tổng tonnage</p>
          <p className="stat-value mt-2">{formatNumber(stats.totalTonnage, 0)} kg</p>
        </Card>
      </div>

      {workoutsQuery.isLoading ? (
        <Card>
          <Spinner />
        </Card>
      ) : !workouts.length ? (
        <Card className="py-12 text-center text-sm text-slate-400">
          Chưa có buổi tập nào. Bấm “Log buổi tập” để bắt đầu.
        </Card>
      ) : (
        <div className="space-y-2">
          {workouts.map((workout) => {
            const program = programs.find((p) => p._id === workout.programId);
            const isOpen = expanded === workout._id;
            return (
              <Card key={workout._id} className="!p-0 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : workout._id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    {String(workout.dateKey).slice(8, 10)}/{String(workout.dateKey).slice(5, 7)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {workout.dayName || 'Buổi tập'}
                      {program ? ` · ${program.name}` : ''}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateKey(workout.dateKey, true)} · {workout.sets?.length || 0} set ·{' '}
                      {formatNumber(workout.computed?.tonnage, 0)} kg tonnage
                      {workout.durationMin ? ` · ${workout.durationMin} phút` : ''}
                    </p>
                  </div>
                  <Icon name={isOpen ? 'close' : 'arrowRight'} className="h-4 w-4 shrink-0 text-slate-400" />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead className="text-left uppercase tracking-wide text-slate-400">
                          <tr>
                            <th className="py-1.5">Bài</th>
                            <th className="py-1.5">Nhóm cơ</th>
                            <th className="py-1.5">Tạ × rep</th>
                            <th className="py-1.5">RIR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {(workout.sets || []).map((set, index) => (
                            <tr key={index}>
                              <td className="py-1.5 font-medium text-slate-700 dark:text-slate-200">
                                {set.exercise}
                              </td>
                              <td className="py-1.5 text-slate-500">{set.muscleGroup}</td>
                              <td className="py-1.5 text-slate-500">
                                {formatNumber(set.weightKg, 1)} kg × {set.reps}
                              </td>
                              <td className="py-1.5 text-slate-500">{set.rir ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      type="button"
                      className="btn-ghost mt-2 !px-2 !py-1 text-xs text-rose-500"
                      onClick={() => {
                        if (window.confirm('Xóa buổi tập này?')) remove.mutate(workout._id);
                      }}
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                      Xóa buổi tập
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
