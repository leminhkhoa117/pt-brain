import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Icon, Spinner } from '../ui.jsx';
import MarkdownText from '../MarkdownText.jsx';
import { listPrograms } from '../../api/training.js';
import { applyPlanChanges, applyToPlan } from '../../api/summaries.js';
import { getErrorMessage } from '../../api/client.js';

const FIELD_LABELS = {
  sets: 'Số set',
  targetRir: 'RIR mục tiêu',
  repMin: 'Rep tối thiểu',
  repMax: 'Rep tối đa',
};

export default function ApplyPlanModal({ summaryId, onClose, onApplied }) {
  const queryClient = useQueryClient();
  const [programId, setProgramId] = useState('');
  const [proposal, setProposal] = useState(null);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(null);

  const programsQuery = useQuery({ queryKey: ['programs'], queryFn: listPrograms });
  const programs = useMemo(
    () => programsQuery.data?.programs || [],
    [programsQuery.data],
  );

  useEffect(() => {
    if (!programId && programs.length) {
      setProgramId((programs.find((p) => p.status === 'active') || programs[0])._id);
    }
  }, [programs, programId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const preview = useMutation({
    mutationFn: () => applyToPlan(summaryId, programId),
    onSuccess: (data) => {
      setProposal(data.proposal);
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const apply = useMutation({
    mutationFn: () =>
      applyPlanChanges(
        programId,
        (proposal.changes || []).map((change) => ({
          dayName: change.dayName,
          exerciseName: change.exerciseName,
          field: change.field,
          after: change.after,
        })),
      ),
    onSuccess: (data) => {
      setApplied(data);
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      if (onApplied) onApplied(data);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full overflow-auto rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:max-w-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Áp dụng vào giáo án</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              AI đề xuất chỉnh volume / RIR / rep range dựa trên bài đã tóm tắt. Bạn duyệt trước khi áp dụng.
            </p>
          </div>
          <button type="button" className="btn-ghost !p-2" onClick={onClose} aria-label="Đóng">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <Alert tone="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {!applied && (
          <div className="mt-4">
            <label className="label">Chọn giáo án</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                className="input"
                value={programId}
                onChange={(e) => {
                  setProgramId(e.target.value);
                  setProposal(null);
                }}
                disabled={preview.isPending}
              >
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-primary shrink-0"
                disabled={!programId || preview.isPending}
                onClick={() => preview.mutate()}
              >
                {preview.isPending ? <Spinner className="h-4 w-4 text-white" /> : <Icon name="target" className="h-4 w-4" />}
                {preview.isPending ? 'AI đang phân tích...' : 'Phân tích & đề xuất'}
              </button>
            </div>
            {!programs.length && (
              <p className="mt-2 text-xs text-amber-600">
                Chưa có giáo án. Hãy tạo giáo án ở tab Giáo án trước.
              </p>
            )}
          </div>
        )}

        {proposal && !applied && (
          <div className="mt-4">
            {proposal.rationale && (
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-slate-800/50 dark:text-slate-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Lý do</p>
                <MarkdownText className="mt-1">{proposal.rationale}</MarkdownText>
              </div>
            )}

            {proposal.changes?.length ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400 dark:bg-slate-800">
                    <tr>
                      <th className="px-3 py-2">Ngày / bài</th>
                      <th className="px-3 py-2">Chỉnh</th>
                      <th className="px-3 py-2">Trước</th>
                      <th className="px-3 py-2">Sau</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {proposal.changes.map((change, index) => (
                      <tr key={`${change.dayName}-${change.exerciseName}-${change.field}-${index}`}>
                        <td className="px-3 py-2">
                          <p className="font-semibold text-slate-700 dark:text-slate-200">
                            {change.exerciseName}
                          </p>
                          <p className="text-xs text-slate-400">{change.dayName}</p>
                          {change.reason && (
                            <p className="mt-0.5 text-[11px] text-slate-400">{change.reason}</p>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {FIELD_LABELS[change.field] || change.field}
                        </td>
                        <td className="px-3 py-2 text-slate-500">{change.before ?? '—'}</td>
                        <td className="px-3 py-2 font-semibold text-emerald-600 dark:text-emerald-400">
                          {change.after}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Alert tone="info" className="mt-3">
                {proposal.noChangeReason ||
                  'Bài này chưa đủ bằng chứng để chỉnh giáo án hiện tại. Giữ nguyên là lựa chọn an toàn.'}
              </Alert>
            )}

            {proposal.skipped?.length > 0 && (
              <p className="mt-2 text-xs text-amber-600">
                Bỏ qua {proposal.skipped.length} đề xuất không hợp lệ hoặc ngoài giới hạn.
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {proposal.changes?.length > 0 && (
                <button
                  type="button"
                  className="btn-primary"
                  disabled={apply.isPending}
                  onClick={() => apply.mutate()}
                >
                  {apply.isPending ? 'Đang áp dụng...' : `Áp dụng ${proposal.changes.length} thay đổi`}
                </button>
              )}
              <button
                type="button"
                className="btn-secondary"
                disabled={preview.isPending}
                onClick={() => {
                  setProposal(null);
                  preview.mutate();
                }}
              >
                Đề xuất lại
              </button>
              <button type="button" className="btn-ghost" onClick={onClose}>
                Hủy
              </button>
            </div>
          </div>
        )}

        {applied && (
          <div className="mt-4">
            <Alert tone="success">
              Đã áp dụng {applied.applied?.length || 0} thay đổi vào giáo án. Volume đã được tính lại.
            </Alert>
            {applied.skipped?.length > 0 && (
              <p className="mt-2 text-xs text-amber-600">
                {applied.skipped.length} thay đổi bị bỏ qua.
              </p>
            )}
            <div className="mt-4 flex justify-end">
              <button type="button" className="btn-primary" onClick={onClose}>
                Xong
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
