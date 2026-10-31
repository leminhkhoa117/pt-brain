import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Alert, Card, Field, Icon, PageHeader, Spinner } from '../../components/ui.jsx';
import {
  createWorkout,
  getProgram,
  getProgression,
  getSuggestions,
  listPrograms,
  listWorkouts,
} from '../../api/training.js';
import { getErrorMessage } from '../../api/client.js';
import { formatDateKey, todayKey } from '../../lib/date.js';
import { formatNumber } from '../../lib/format.js';
import { MUSCLE_LABELS_VI } from '@shared/training/planner.js';

const SUGGESTION_TONE = {
  increase: 'success',
  add_reps: 'info',
  no_data: 'info',
};

function ExerciseLogger({ item, rows, onChange, onAdd, onRemove }) {
  const suggestion = item.suggestion;
  const tone = SUGGESTION_TONE[suggestion.action] || 'info';
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h3>
          <p className="text-xs text-slate-400">
            {MUSCLE_LABELS_VI[item.muscleGroup] || item.muscleGroup} · {item.sets} ×{' '}
            {item.repRange.min}-{item.repRange.max} · RIR {item.targetRir}
          </p>
        </div>
        <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {item.lastDate ? `Buổi trước ${formatDateKey(item.lastDate)}` : 'Chưa có dữ liệu'}
        </span>
      </div>

      <Alert tone={tone} className="mt-3 !py-2">
        {suggestion.message}
      </Alert>

      {item.lastSets?.length ? (
        <p className="mt-2 text-[11px] text-slate-400">
          Buổi trước:{' '}
          {item.lastSets
            .map(
              (s) =>
                `${formatNumber(s.weightKg, 1)}kg × ${s.reps}${
                  s.rir !== undefined && s.rir !== null ? ` @RIR${s.rir}` : ''
                }`,
            )
            .join(' · ')}
        </p>
      ) : null}

      <div className="mt-3 space-y-1.5">
        <div className="grid grid-cols-[1fr_1fr_0.8fr_auto] gap-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Tạ (kg)</span>
          <span>Rep</span>
          <span>RIR</span>
          <span />
        </div>
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_0.8fr_auto] items-center gap-2">
            <input
              className="input !py-1.5 text-sm"
              type="number"
              step="0.5"
              min="0"
              placeholder="40"
              value={row.weightKg}
              onChange={(e) => onChange(index, 'weightKg', e.target.value)}
            />
            <input
              className="input !py-1.5 text-sm"
              type="number"
              step="1"
              min="0"
              placeholder={String(item.repRange.min)}
              value={row.reps}
              onChange={(e) => onChange(index, 'reps', e.target.value)}
            />
            <input
              className="input !py-1.5 text-sm"
              type="number"
              step="1"
              min="0"
              max="10"
              placeholder={String(item.targetRir)}
              value={row.rir}
              onChange={(e) => onChange(index, 'rir', e.target.value)}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
              aria-label="Xóa set"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400"
      >
        <Icon name="plus" className="h-3.5 w-3.5" />
        Thêm set
      </button>
    </Card>
  );
}

export default function WorkoutPage() {
  const queryClient = useQueryClient();
  const [programId, setProgramId] = useState('');
  const [dayName, setDayName] = useState('');
  const [date, setDate] = useState(todayKey());
  const [durationMin, setDurationMin] = useState('60');
  const [logs, setLogs] = useState({});
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState('');

  const programsQuery = useQuery({ queryKey: ['programs'], queryFn: listPrograms });
  const programs = useMemo(
    () => programsQuery.data?.programs || [],
    [programsQuery.data],
  );

  useEffect(() => {
    if (!programId && programs.length) {
      const active = programs.find((p) => p.status === 'active') || programs[0];
      setProgramId(active._id);
    }
  }, [programs, programId]);

  const programQuery = useQuery({
    queryKey: ['program', programId],
    queryFn: () => getProgram(programId),
    enabled: Boolean(programId),
  });
  const program = programQuery.data?.program;

  useEffect(() => {
    if (program && !program.days.some((d) => d.name === dayName)) {
      setDayName(program.days[0]?.name || '');
    }
  }, [program, dayName]);

  const suggestionsQuery = useQuery({
    queryKey: ['suggestions', programId, dayName],
    queryFn: () => getSuggestions(programId, dayName),
    enabled: Boolean(programId && dayName),
  });

  useEffect(() => {
    setLogs({});
    setResult(null);
    setError(null);
  }, [programId, dayName]);

  useEffect(() => {
    const data = suggestionsQuery.data;
    if (!data) return;
    setLogs((prev) => {
      if (Object.keys(prev).length) return prev;
      const next = {};
      for (const item of data.suggestions) {
        const lastWeight = item.lastSets?.length
          ? Math.max(...item.lastSets.map((s) => Number(s.weightKg) || 0))
          : '';
        next[item.name] = Array.from({ length: item.sets }, () => ({
          weightKg: lastWeight || '',
          reps: item.repRange.min,
          rir: item.targetRir,
        }));
      }
      return next;
    });
    setSelectedExercise((prev) => prev || data.suggestions[0]?.name || '');
  }, [suggestionsQuery.data]);

  const save = useMutation({
    mutationFn: (payload) => createWorkout(payload),
    onSuccess: (data) => {
      setResult(data.workout);
      setNotice('Đã lưu buổi tập.');
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['suggestions', programId, dayName] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const historyQuery = useQuery({
    queryKey: ['workouts'],
    queryFn: () => listWorkouts({ limit: 20 }),
  });

  const progressionQuery = useQuery({
    queryKey: ['progression', selectedExercise],
    queryFn: () => getProgression(selectedExercise),
    enabled: Boolean(selectedExercise),
  });

  const suggestions = suggestionsQuery.data?.suggestions || [];

  const updateRow = (name, index, key, value) =>
    setLogs((prev) => ({
      ...prev,
      [name]: prev[name].map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    }));

  const addRow = (name) =>
    setLogs((prev) => {
      const rows = prev[name] || [];
      const last = rows.at(-1);
      return {
        ...prev,
        [name]: [
          ...rows,
          { weightKg: last?.weightKg || '', reps: last?.reps || '', rir: last?.rir ?? '' },
        ],
      };
    });

  const removeRow = (name, index) =>
    setLogs((prev) => ({
      ...prev,
      [name]: prev[name].filter((_, i) => i !== index),
    }));

  const submit = () => {
    setError(null);
    const exerciseMap = new Map(suggestions.map((s) => [s.name, s]));
    const sets = [];
    for (const [name, rows] of Object.entries(logs)) {
      const meta = exerciseMap.get(name);
      for (const row of rows) {
        if (!Number(row.weightKg) || !Number(row.reps)) continue;
        sets.push({
          exercise: name,
          muscleGroup: meta?.muscleGroup || 'other',
          weightKg: Number(row.weightKg),
          reps: Number(row.reps),
          rir: row.rir === '' || row.rir === null ? undefined : Number(row.rir),
        });
      }
    }
    if (!sets.length) {
      setError('Nhập ít nhất một set có tạ và số rep trước khi lưu.');
      return;
    }
    save.mutate({
      date,
      programId: programId || undefined,
      dayName,
      sets,
      durationMin: Number(durationMin) || undefined,
    });
  };

  const chartData = (progressionQuery.data?.points || []).map((p) => ({
    ...p,
    label: formatDateKey(p.dateKey),
  }));

  const dayNames = program?.days.map((d) => d.name) || [];
  const totalInputSets = useMemo(
    () =>
      Object.values(logs).reduce(
        (sum, rows) =>
          sum + rows.filter((r) => Number(r.weightKg) > 0 && Number(r.reps) > 0).length,
        0,
      ),
    [logs],
  );

  return (
    <div>
      <PageHeader
        title="Log buổi tập"
        subtitle="Ghi tạ, rep và RIR cho từng set. Hệ thống so với buổi trước và gợi ý tăng tạ theo quy tắc."
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

      {!programs.length ? (
        <Card className="text-center text-sm text-slate-400">
          Chưa có giáo án. Tạo giáo án ở tab “Giáo án” trước khi log buổi tập.
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Giáo án">
                <select
                  className="input"
                  value={programId}
                  onChange={(e) => {
                    setProgramId(e.target.value);
                    setDayName('');
                  }}
                >
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Buổi tập">
                <select
                  className="input"
                  value={dayName}
                  onChange={(e) => setDayName(e.target.value)}
                >
                  {dayNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ngày">
                <input
                  className="input"
                  type="date"
                  value={date}
                  max={todayKey()}
                  onChange={(e) => setDate(e.target.value || todayKey())}
                />
              </Field>
              <Field label="Thời lượng (phút)">
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="600"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                />
              </Field>
            </div>
          </Card>

          {suggestionsQuery.data?.deload && (
            <Alert
              tone={suggestionsQuery.data.deload.suggested ? 'warning' : 'info'}
              className="mb-4"
            >
              {suggestionsQuery.data.deload.message}
            </Alert>
          )}

          {suggestionsQuery.isLoading ? (
            <Card>
              <Spinner />
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-3 lg:col-span-2">
                {suggestions.map((item) => (
                  <ExerciseLogger
                    key={item.name}
                    item={item}
                    rows={logs[item.name] || []}
                    onChange={(index, key, value) => updateRow(item.name, index, key, value)}
                    onAdd={() => addRow(item.name)}
                    onRemove={(index) => removeRow(item.name, index)}
                  />
                ))}
              </div>

              <div className="space-y-4">
                <Card>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Lưu buổi tập
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {totalInputSets} set hợp lệ đã nhập
                  </p>
                  <button
                    type="button"
                    className="btn-primary mt-3 w-full"
                    disabled={save.isPending}
                    onClick={submit}
                  >
                    {save.isPending ? 'Đang lưu...' : 'Lưu buổi tập'}
                  </button>

                  {result && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        Đã lưu · tonnage {formatNumber(result.computed?.tonnage, 0)} kg
                      </p>
                      <ul className="mt-1 space-y-0.5 text-slate-500 dark:text-slate-400">
                        {Object.entries(result.computed?.estimated1RMs || {}).map(
                          ([name, value]) => (
                            <li key={name}>
                              {name}: 1RM ~{formatNumber(value, 1)} kg
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </Card>

                <Card>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Tiến trình 1RM
                  </h3>
                  <select
                    className="input mt-2 !py-1.5 text-xs"
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                  >
                    {suggestions.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 h-40">
                    {chartData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
                          <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                          <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                          <Tooltip
                            formatter={(value) => [`${formatNumber(value, 1)} kg`, '1RM']}
                            labelFormatter={(label) => `Ngày ${label}`}
                          />
                          <Line type="monotone" dataKey="estimated1RM" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="pt-12 text-center text-xs text-slate-400">
                        Chưa có dữ liệu cho bài này.
                      </p>
                    )}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    20 buổi gần nhất
                  </h3>
                  <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
                    {(historyQuery.data?.workouts || []).map((workout) => (
                      <div key={workout._id} className="flex items-center justify-between py-2 text-xs">
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-200">
                            {formatDateKey(workout.dateKey, true)}
                          </p>
                          <p className="text-slate-400">{workout.dayName || 'Buổi tập'}</p>
                        </div>
                        <span className="text-slate-500">
                          {formatNumber(workout.computed?.tonnage, 0)} kg
                        </span>
                      </div>
                    ))}
                    {!historyQuery.data?.workouts?.length && (
                      <p className="py-3 text-xs text-slate-400">Chưa có buổi tập nào.</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

