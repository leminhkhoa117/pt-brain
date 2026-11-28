import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Alert, Card, Field, Icon, Spinner } from '../ui.jsx';
import MarkdownText from '../MarkdownText.jsx';
import { synthesizeResearch } from '../../api/summaries.js';
import { getErrorMessage } from '../../api/client.js';

const DEFAULT_QUESTION =
  'Các kết quả chính, điểm còn chưa chắc chắn và điều cần lưu ý khi áp dụng cho PT là gì?';

/**
 * Tổng hợp theo yêu cầu từ các Summary đã tạo bằng toàn văn.
 * Không gửi abstract-only lên AI.
 */
export default function SynthesizeFullTextCard({ summaries = [] }) {
  const [question, setQuestion] = useState(DEFAULT_QUESTION);
  const eligible = summaries
    .filter((item) => item.basedOn === 'fulltext' && item.status === 'ready')
    .slice(0, 8);

  const mutation = useMutation({
    mutationFn: () =>
      synthesizeResearch({
        question: question.trim(),
        summaryIds: eligible.map((item) => item.id),
      }),
  });

  if (!eligible.length) return null;

  return (
    <Card className="mb-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Icon name="book" className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Tổng hợp từ toàn văn
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Dùng {eligible.length} bản tóm tắt đã tạo từ toàn văn gần nhất. Không dùng abstract;
            không thêm bài ngoài danh sách.
          </p>
        </div>
        <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Fulltext only
        </span>
      </div>

      <Field label="Câu hỏi tổng hợp" hint="Ví dụ: có mâu thuẫn nào về volume tập và hypertrophy không?">
        <textarea
          className="input min-h-[80px]"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={1000}
          disabled={mutation.isPending}
        />
      </Field>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Chỉ các bản có `basedOn=fulltext` và trạng thái ready mới được dùng.
        </p>
        <button
          type="button"
          className="btn-primary !px-3 !py-1.5 text-xs"
          disabled={mutation.isPending || question.trim().length < 5}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <Spinner className="h-3.5 w-3.5 text-white" />
          ) : (
            <Icon name="book" className="h-3.5 w-3.5" />
          )}
          {mutation.isPending ? 'Đang tổng hợp...' : 'Tổng hợp'}
        </button>
      </div>

      {mutation.isError && (
        <Alert tone="danger" className="mt-3">
          {getErrorMessage(mutation.error)}
        </Alert>
      )}

      {mutation.data?.answer && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
            Tổng hợp từ toàn văn
          </p>
          <MarkdownText className="mt-2 text-sm text-emerald-950/90 dark:text-emerald-100/90">
            {mutation.data.answer}
          </MarkdownText>
          {mutation.data.papers?.length ? (
            <p className="mt-2 text-[10px] leading-relaxed text-emerald-800/70 dark:text-emerald-200/60">
              Nguồn: {mutation.data.papers.map((paper) => `[${paper.id}] ${paper.title}`).join(' · ')}
            </p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
