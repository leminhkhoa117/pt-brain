import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Alert, Card, Field, Icon, PageHeader, Spinner } from '../../components/ui.jsx';
import MarkdownText from '../../components/MarkdownText.jsx';
import { listSummaries } from '../../api/summaries.js';
import { generateQuiz } from '../../api/learning.js';
import { getErrorMessage } from '../../api/client.js';

export default function QuizPage() {
  const [summaryId, setSummaryId] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const summariesQuery = useQuery({ queryKey: ['summaries'], queryFn: () => listSummaries() });
  const summaries = useMemo(
    () => (summariesQuery.data?.summaries || []).filter((s) => !s.status || s.status === 'ready'),
    [summariesQuery.data],
  );

  useEffect(() => {
    if (!summaryId && summaries.length) setSummaryId(summaries[0].id);
  }, [summaries, summaryId]);

  const createQuiz = useMutation({
    mutationFn: () => generateQuiz({ summaryId, count: 5 }),
    onSuccess: (data) => {
      setQuiz(data.quiz);
      setAnswers({});
      setSubmitted(false);
      setError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const questions = quiz?.questions || [];
  const answeredCount = Object.keys(answers).length;
  const score = questions.reduce(
    (total, question, index) => total + (answers[index] === question.correctIndex ? 1 : 0),
    0,
  );

  const selectSummary = (id) => {
    setSummaryId(id);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setError(null);
  };

  return (
    <div>
      <PageHeader
        title="Quiz ôn tập"
        subtitle="AI tạo 5 câu trắc nghiệm từ một bài đã tóm tắt. Làm bài, xem giải thích và kiểm tra mức hiểu."
        actions={
          <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            <Icon name="cards" className="h-3 w-3" />
            Từ summary đã lưu
          </span>
        }
      />

      {error && (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {!summaries.length && !summariesQuery.isLoading ? (
        <Card className="py-12 text-center">
          <Icon name="book" className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Chưa có bài nào đã tóm tắt.
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Vào Nghiên cứu → Đọc &amp; tóm tắt một bài trước, rồi quay lại đây.
          </p>
          <Link to="/research" className="btn-primary mt-4">
            Tới Research Reader
          </Link>
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field label="Chọn bài đã tóm tắt" className="flex-1">
                <select
                  className="select"
                  value={summaryId}
                  onChange={(e) => selectSummary(e.target.value)}
                  disabled={createQuiz.isPending}
                >
                  {summaries.map((summary) => (
                    <option key={summary.id} value={summary.id}>
                      {summary.paper?.title || 'Không rõ tiêu đề'}
                      {summary.paper?.year ? ` (${summary.paper.year})` : ''}
                    </option>
                  ))}
                </select>
              </Field>
              <button
                type="button"
                className="btn-primary shrink-0"
                disabled={!summaryId || createQuiz.isPending}
                onClick={() => createQuiz.mutate()}
              >
                {createQuiz.isPending ? <Spinner className="h-4 w-4 text-white" /> : <Icon name="cards" className="h-4 w-4" />}
                {createQuiz.isPending ? 'AI đang tạo quiz...' : quiz ? 'Tạo quiz mới' : 'Tạo quiz 5 câu'}
              </button>
            </div>
            {createQuiz.isPending && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Thường mất 15-40 giây. Câu hỏi chỉ dựa trên bản tóm tắt, không dùng kiến thức ngoài.
              </p>
            )}
          </Card>

          {quiz && (
            <div className="space-y-4">
              <Card className="border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/20">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="mt-1 font-display text-[20px] font-semibold text-slate-900 dark:text-white">
                      {questions.length} câu · đã trả lời {answeredCount}/{questions.length}
                    </h2>
                  </div>
                  {submitted && (
                    <div className="rounded-lg bg-white px-4 py-2 text-center shadow-sm dark:bg-slate-900">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Điểm</p>
                      <p className="text-xl font-extrabold text-brand-600 dark:text-brand-300">
                        {score}/{questions.length}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {questions.map((question, qIndex) => (
                <Card key={question.question}>
                  <div className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-600 text-xs font-extrabold text-white">
                      {qIndex + 1}
                    </span>
                    <MarkdownText className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {question.question}
                    </MarkdownText>
                  </div>

                  <div className="mt-3 grid gap-2">
                    {question.options.map((option, oIndex) => {
                      const selected = answers[qIndex] === oIndex;
                      const correct = submitted && oIndex === question.correctIndex;
                      const wrong = submitted && selected && oIndex !== question.correctIndex;
                      return (
                        <button
                          key={`${option}-${oIndex}`}
                          type="button"
                          disabled={submitted}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))
                          }
                          className={clsx(
                            'flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition',
                            correct
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                              : wrong
                                ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                                : selected
                                  ? 'border-brand-400 bg-brand-50 text-brand-900 dark:border-brand-700 dark:bg-brand-950/40 dark:text-brand-100'
                                  : 'border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/[0.04]',
                            submitted && 'cursor-default',
                          )}
                        >
                          <span
                            className={clsx(
                              'grid h-5 w-5 shrink-0 place-items-center rounded-md text-[11px] font-extrabold',
                              correct
                                ? 'bg-emerald-600 text-white'
                                : wrong
                                  ? 'bg-rose-600 text-white'
                                  : selected
                                    ? 'bg-brand-600 text-white'
                                    : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300',
                            )}
                          >
                            {String.fromCharCode(65 + oIndex)}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div
                      className={clsx(
                        'mt-3 rounded-xl px-3 py-2.5 text-xs leading-relaxed',
                        answers[qIndex] === question.correctIndex
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
                          : 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200',
                      )}
                    >
                      <MarkdownText compact>
                        {`**${
                          answers[qIndex] === question.correctIndex ? 'Chính xác.' : 'Chưa đúng.'
                        }** ${question.explanation || 'Không có giải thích.'}`}
                      </MarkdownText>
                    </div>
                  )}
                </Card>
              ))}

              <div className="flex flex-wrap items-center gap-2">
                {!submitted ? (
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={answeredCount < questions.length}
                    onClick={() => setSubmitted(true)}
                  >
                    Chấm điểm
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setAnswers({});
                      setSubmitted(false);
                    }}
                  >
                    Làm lại
                  </button>
                )}
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={createQuiz.isPending}
                  onClick={() => createQuiz.mutate()}
                >
                  Tạo bộ câu hỏi khác
                </button>
                {!submitted && answeredCount < questions.length && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Còn {questions.length - answeredCount} câu chưa trả lời.
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
