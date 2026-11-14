import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Icon, InfoTip, PageHeader, Spinner } from '../../components/ui.jsx';
import { useDialog } from '../../components/DialogProvider.jsx';
import { deleteWorkout, listPrograms, listWorkouts } from '../../api/training.js';
import { getErrorMessage } from '../../api/client.js';
import { formatDateKey } from '../../lib/date.js';
import { formatNumber } from '../../lib/format.js';
import { CARDIO_BY_KEY } from '@shared/training/cardio.js';

export default function WorkoutHistoryPage() {
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState(null);

  const workoutsQuery = useQuery({
    queryKey: ['workouts', 'history'],
    queryFn: () => listWorkouts({ limit: 100 }),
  });
  const programsQuery = useQuery({ queryKey: ['programs'], queryFn: listPrograms });
  const programs = useMemo(() => programsQuery.data?.programs || [], [programsQuery.data]);
  const workouts = useMemo(() => workoutsQuery.data?.workouts || [], [workoutsQuery.data]);

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
    const totalCalories = workouts.reduce(
      (sum, w) => sum + (w.kind === 'cardio' ? Number(w.caloriesBurned) || 0 : 0),
      0,
    );
    const cardioCount = workouts.filter((w) => w.kind === 'cardio').length;
    const thisMonth = workouts.filter(
      (w) => String(w.dateKey).slice(0, 7) === new Date().toISOString().slice(0, 7),
    ).length;
    return { totalTonnage, totalSets, totalCalories, cardioCount, thisMonth };
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

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <Card>
          <p className="card-title">Tổng buổi</p>
          <p className="stat-value mt-2">{workouts.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{stats.thisMonth} buổi tháng này</p>
        </Card>
        <Card>
          <p className="card-title">Tổng set</p>
          <p className="stat-value mt-2">{formatNumber(stats.totalSets, 0)}</p>
        </Card>
        <Card>
          <p className="card-title flex items-center gap-1">
            Tổng tonnage
            <InfoTip label="Tonnage">
              Tổng khối lượng đã nâng = Σ (tạ × số rep) của mọi set. Ví dụ 3 set × 10 rep × 50 kg =
              1.500 kg tonnage.
            </InfoTip>
          </p>
          <p className="stat-value mt-2">{formatNumber(stats.totalTonnage, 0)} kg</p>
        </Card>
        <Card>
          <p className="card-title flex items-center gap-1">
            Calo vận động
            <InfoTip label="Calo vận động">
              Tổng calo ước tính/nhập tay của các buổi cardio như chạy bộ, bơi, đạp xe.
            </InfoTip>
          </p>
          <p className="stat-value mt-2">{formatNumber(stats.totalCalories, 0)} kcal</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {stats.cardioCount} buổi cardio
          </p>
        </Card>
      </div>

      {workoutsQuery.isLoading ? (
        <Card>
          <Spinner />
        </Card>
      ) : !workouts.length ? (
        <Card className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
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
                      {workout.kind === 'cardio'
                        ? CARDIO_BY_KEY[workout.activity]?.label || workout.activity || 'Cardio'
                        : workout.dayName || 'Buổi tập'}
                      {workout.kind !== 'cardio' && program ? ` · ${program.name}` : ''}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDateKey(workout.dateKey, true)}
                      {workout.kind === 'cardio' ? (
                        <>
                          {' · '}
                          {workout.durationMin || 0} phút
                          {workout.distanceKm
                            ? ` · ${formatNumber(workout.distanceKm, 1)} km`
                            : ''}
                          {' · '}
                          {formatNumber(workout.caloriesBurned, 0)} kcal
                          {workout.caloriesSource === 'manual' ? ' (thủ công)' : ' (ước tính)'}
                        </>
                      ) : (
                        <>
                          {' · '}
                          {workout.sets?.length || 0} set ·{' '}
                          {formatNumber(workout.computed?.tonnage, 0)} kg tonnage
                          {workout.durationMin ? ` · ${workout.durationMin} phút` : ''}
                        </>
                      )}
                    </p>
                  </div>
                  <Icon
                    name={isOpen ? 'close' : 'arrowRight'}
                    className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400"
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                    {workout.kind === 'cardio' ? (
                      <div className="grid gap-2 text-xs sm:grid-cols-4">
                        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/[0.03]">
                          <p className="text-slate-500 dark:text-slate-400">Hoạt động</p>
                          <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">
                            {CARDIO_BY_KEY[workout.activity]?.label || workout.activity}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/[0.03]">
                          <p className="text-slate-500 dark:text-slate-400">Thời gian</p>
                          <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">
                            {workout.durationMin || 0} phút
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/[0.03]">
                          <p className="text-slate-500 dark:text-slate-400">Quãng đường</p>
                          <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">
                            {workout.distanceKm
                              ? `${formatNumber(workout.distanceKm, 1)} km`
                              : '—'}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-white/[0.03]">
                          <p className="text-slate-500 dark:text-slate-400">Calo</p>
                          <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">
                            {formatNumber(workout.caloriesBurned, 0)} kcal{' '}
                            <span className="font-normal text-slate-500 dark:text-slate-400">
                              ({workout.caloriesSource === 'manual' ? 'thủ công' : 'ước tính'})
                            </span>
                          </p>
                        </div>
                        {workout.notes && (
                          <p className="sm:col-span-4 text-slate-500 dark:text-slate-400">
                            Ghi chú: {workout.notes}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead className="text-left uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <tr>
                              <th className="py-1.5">Bài</th>
                              <th className="py-1.5">Nhóm cơ</th>
                              <th className="py-1.5">Tạ × rep</th>
                              <th className="py-1.5">
                                <span className="inline-flex items-center gap-1">
                                  RIR
                                  <InfoTip label="RIR (Reps In Reserve)">
                                    Số rep còn dư trước khi thất bại. RIR 2 = còn làm thêm được
                                    khoảng 2 rep.
                                  </InfoTip>
                                </span>
                              </th>
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
                    )}
                    <button
                      type="button"
                      className="btn-ghost mt-2 !px-2 !py-1 text-xs text-rose-500"
                      onClick={async () => {
                        const ok = await dialog.confirm({
                          title: 'Xóa buổi tập',
                          message: 'Xóa buổi tập này? Hành động không thể hoàn tác.',
                          confirmLabel: 'Xóa buổi tập',
                        });
                        if (ok) remove.mutate(workout._id);
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
