import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  Alert,
  Badge,
  Card,
  Icon,
  InfoTip,
  LoadingBlock,
  PageHeader,
  Spinner,
} from '../../components/ui.jsx';
import MarkdownText from '../../components/MarkdownText.jsx';
import { MUSCLES } from '@shared/muscles/index.js';
import { HEALTH_CONDITIONS } from '@shared/health/conditions.js';
import {
  askLessonCoachStream,
  generateLessonQuizAi,
  getCurriculum,
  getLesson,
  markLessonProgress,
  submitLessonQuiz,
} from '../../api/curriculum.js';
import { createFlashcard } from '../../api/learning.js';
import { createTerm } from '../../api/summaries.js';
import { getErrorMessage } from '../../api/client.js';

const MODULE_LABELS = {
  anat: 'Giải phẫu cơ xương khớp',
  phys: 'Sinh lý vận động & tập luyện',
  nutr: 'Dinh dưỡng',
  fit: 'Yếu tố thể chất',
  rehab: 'Phục hồi chức năng & an toàn',
  case: 'Ứng dụng cá nhân hoá',
};

const CALC_TABS = {
  'hr-zones': 'hr',
  macro: 'calories',
  calories: 'calories',
  tdee: 'calories',
  bmr: 'calories',
  'one-rm': '1rm',
  'percent-1rm': '1rm',
  'navy-body-fat': 'body',
  lbm: 'body',
  ffmi: 'body',
  bmi: 'body',
};

const CALC_LABELS = {
  macro: 'Calo & macro',
  calories: 'Mục tiêu calo',
  tdee: 'TDEE',
  bmr: 'BMR',
  'hr-zones': 'Vùng nhịp tim',
  'one-rm': '1RM',
  'percent-1rm': '%1RM',
  'navy-body-fat': '% mỡ Navy',
  lbm: 'Khối cơ (LBM)',
  ffmi: 'FFMI',
  bmi: 'BMI',
};

/** Thanh tiến trình đọc: mảnh 2px pine nằm dưới header, đo theo cuộn trang. */
function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((doc.scrollTop / max) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="sticky top-14 z-20 -mx-4 h-0.5 bg-transparent sm:-mx-6 lg:-mx-8"
      aria-hidden="true"
    >
      <div
        className="h-full bg-pine-600 transition-[width] duration-150 ease-out motion-reduce:transition-none dark:bg-pine-400"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function LessonImage({ image }) {
  if (!image?.url) return null;
  return (
    <figure className="my-3">
      <img
        src={image.url}
        alt={image.caption || 'Minh hoạ bài học'}
        loading="lazy"
        className="w-full rounded-xl border border-line dark:border-white/10"
      />
      <figcaption className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
        <span className="font-medium text-slate-500 dark:text-slate-400">{image.caption}</span>
        {image.source && (
          <>
            <span aria-hidden="true">·</span>
            <span>
              Nguồn: {image.source}
              {image.sourceUrl && (
                <>
                  {' '}
                  (
                  <a
                    href={image.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2"
                  >
                    xem
                  </a>
                  )
                </>
              )}{' '}
              — {image.license}
            </span>
          </>
        )}
      </figcaption>
    </figure>
  );
}

function RelatedRow({ lesson, evidence }) {
  const navigate = useNavigate();
  const { related } = lesson;
  const hasRelated =
    related.muscles.length ||
    related.exercises.length ||
    related.calculators.length ||
    related.conditions.length ||
    evidence.length;
  if (!hasRelated) return null;

  const muscleName = (slug) => {
    const muscle = MUSCLES[slug];
    return muscle ? `${muscle.vi} (${muscle.en})` : slug;
  };

  return (
    <Card className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kết nối với app</h3>
      {related.muscles.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Xem cơ trong mô hình 3D
          </p>
          <div className="flex flex-wrap gap-1.5">
            {related.muscles.map((slug) => (
              <Link
                key={slug}
                to={`/muscles?muscle=${slug}`}
                className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-[12px] font-medium text-slate-600 transition hover:border-pine-300 hover:text-pine-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-pine-700 dark:hover:text-pine-300"
              >
                <Icon name="body" className="h-3 w-3" />
                {muscleName(slug)}
              </Link>
            ))}
          </div>
        </div>
      )}
      {related.exercises.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Bài tập liên quan (thư viện 110 bài)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {related.exercises.map((slug) => (
              <Link
                key={slug}
                to="/training?tab=library"
                className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-[12px] font-medium text-slate-600 transition hover:border-pine-300 hover:text-pine-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-pine-700 dark:hover:text-pine-300"
              >
                <Icon name="dumbbell" className="h-3 w-3" />
                {slug}
              </Link>
            ))}
          </div>
        </div>
      )}
      {related.calculators.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Máy tính áp dụng ngay
          </p>
          <div className="flex flex-wrap gap-1.5">
            {related.calculators.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => navigate(`/calculators?tab=${CALC_TABS[key] || '1rm'}`)}
                className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-[12px] font-medium text-slate-600 transition hover:border-pine-300 hover:text-pine-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-pine-700 dark:hover:text-pine-300"
              >
                <Icon name="calculator" className="h-3 w-3" />
                {CALC_LABELS[key] || key}
              </button>
            ))}
          </div>
        </div>
      )}
      {related.conditions.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Bệnh nền / chấn thương liên quan
          </p>
          <div className="flex flex-wrap gap-1.5">
            {related.conditions.map((key) => {
              const condition = HEALTH_CONDITIONS.find((c) => c.key === key);
              if (!condition) return null;
              return (
                <InfoTip key={key} label={condition.vi}>
                  <p className="max-w-72">{condition.rules}</p>
                </InfoTip>
              );
            })}
          </div>
        </div>
      )}
      {evidence.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Nghiên cứu trong thư viện bằng chứng
          </p>
          <div className="flex flex-wrap gap-1.5">
            {evidence.map((item) => (
              <a
                key={item.id}
                href={`https://doi.org/${item.doi}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-[12px] font-medium text-slate-600 transition hover:border-pine-300 hover:text-pine-700 dark:border-white/10 dark:text-slate-300 dark:hover:border-pine-700 dark:hover:text-pine-300"
              >
                <Icon name="external" className="h-3 w-3" />
                {item.id} · {item.journal} {item.year}
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function TermsCard({ terms }) {
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const clearNotice = () => {
    setNotice(null);
    setError(null);
  };

  useEffect(() => {
    if (!notice && !error) return undefined;
    const timer = window.setTimeout(clearNotice, 4000);
    return () => window.clearTimeout(timer);
  }, [notice, error]);

  const addFlashcards = useMutation({
    mutationFn: async () => {
      let created = 0;
      let skipped = 0;
      for (const term of terms) {
        try {
          await createFlashcard({
            front: `${term.en} — ${term.vi}`,
            back: term.def,
          });
          created += 1;
        } catch (err) {
          // Trùng thẻ hoặc lỗi khác: đếm là bỏ qua, không dừng cả loạt.
          if (err?.response?.status === 409) skipped += 1;
          else throw err;
        }
      }
      return { created, skipped };
    },
    onSuccess: ({ created, skipped }) => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      setNotice(
        skipped
          ? `Đã thêm ${created} flashcard (${skipped} thẻ đã tồn tại).`
          : `Đã thêm ${created} flashcard từ thuật ngữ của bài.`,
      );
      setError(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setNotice(null);
    },
  });

  const addTerm = useMutation({
    mutationFn: (term) =>
      createTerm({ en: term.en, vi: term.vi, explanation: term.def }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      setNotice('Đã lưu vào từ điển cá nhân.');
      setError(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setNotice(null);
    },
  });

  return (
    <Card className="overflow-hidden !p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3.5 dark:border-white/[0.08]">
        <h3 className="font-display text-[16px] font-semibold text-slate-900 dark:text-white">
          Thuật ngữ của bài
        </h3>
        <button
          type="button"
          className="btn-secondary !py-1 !text-xs"
          disabled={addFlashcards.isPending}
          onClick={() => addFlashcards.mutate()}
        >
          {addFlashcards.isPending ? (
            <Spinner className="h-3.5 w-3.5" />
          ) : (
            <Icon name="cards" className="h-3.5 w-3.5" />
          )}
          Tạo flashcard ({terms.length})
        </button>
      </div>

      {(notice || error) && (
        <div className="px-4 pt-3">
          {notice && <Alert tone="success">{notice}</Alert>}
          {error && <Alert tone="danger">{error}</Alert>}
        </div>
      )}

      <div className="grid gap-px bg-line sm:grid-cols-2 dark:bg-white/[0.08]">
        {terms.map((term) => (
          <div
            key={term.en}
            className="group flex flex-col gap-1.5 bg-surface p-4 dark:bg-[#151b18]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                  {term.en}
                </p>
                <p className="mt-0.5 font-display text-[14.5px] font-semibold leading-snug text-slate-800 dark:text-slate-100">
                  {term.vi}
                </p>
              </div>
              <button
                type="button"
                className="btn-ghost shrink-0 !px-2 !py-1 !text-[11px] opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                disabled={addTerm.isPending}
                onClick={() => addTerm.mutate(term)}
              >
                + Từ điển
              </button>
            </div>
            <p className="text-[12.5px] leading-relaxed text-slate-500 dark:text-slate-400">
              {term.def}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function QuizSection({ lesson }) {
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState({});
  const [graded, setGraded] = useState(null);
  const [aiQuiz, setAiQuiz] = useState(null);
  const [aiAnswers, setAiAnswers] = useState({});
  const [aiSubmitted, setAiSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const submit = useMutation({
    mutationFn: () =>
      submitLessonQuiz(lesson.slug, lesson.quiz.map((_, i) => answers[i] ?? 0)),
    onSuccess: (data) => {
      setGraded(data);
      queryClient.invalidateQueries({ queryKey: ['curriculum'] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-lesson', lesson.slug] });
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const quizAi = useMutation({
    mutationFn: () => generateLessonQuizAi(lesson.slug, 5),
    onSuccess: (data) => {
      setAiQuiz(data.quiz);
      setAiAnswers({});
      setAiSubmitted(false);
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const answeredCount = Object.keys(answers).length;
  const questions = lesson.quiz;

  const correctCount = graded?.correctCount ?? 0;
  const score = graded?.score ?? 0;

  const aiQuestions = aiQuiz?.questions || [];
  const aiScore = aiQuestions.reduce(
    (total, question, index) =>
      total + (aiSubmitted && aiAnswers[index] === question.correctIndex ? 1 : 0),
    0,
  );

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Kiểm tra cuối bài
          </h3>
          <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">
            {questions.length} câu trắc nghiệm, chấm ngay và lưu điểm tốt nhất.
          </p>
        </div>
        {graded && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-pine-200 bg-pine-50/60 px-4 py-3 dark:border-pine-800/60 dark:bg-pine-950/30">
            <p className="font-mono text-[30px] font-semibold leading-none tabular-nums text-pine-700 dark:text-pine-300">
              {correctCount}
              <span className="text-[18px] text-slate-400 dark:text-slate-500">
                /{graded.total}
              </span>
            </p>
            <div className="min-w-0">
              <p className="font-display text-[14px] font-semibold text-slate-800 dark:text-slate-100">
                {score >= 80
                  ? 'Nắm chắc bài này rồi.'
                  : score >= 50
                    ? 'Được hơn nửa — làm lại để chắc tay.'
                    : 'Đáng làm lại một lượt sau khi đọc lại các phần liên quan.'}
              </p>
              <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Điểm tốt nhất: {graded.quizBest}% · lần làm: {graded.quizAttempts}
              </p>
            </div>
            <Badge
              tone={score >= 80 ? 'success' : score >= 50 ? 'neutral' : 'danger'}
              className="ml-auto"
            >
              {score}%
            </Badge>
          </div>
        )}
      </div>

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="space-y-3">
        {questions.map((question, qIndex) => {
          const result = graded?.results?.[qIndex];
          return (
            <div
              key={question.q}
              className="rounded-xl border border-line p-3 dark:border-white/[0.08]"
            >
              <p className="flex gap-2 text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-pine-600 text-[11px] font-extrabold text-white">
                  {qIndex + 1}
                </span>
                {question.q}
              </p>
              <div className="mt-2 grid gap-1.5">
                {question.choices.map((choice, oIndex) => {
                  const selected = answers[qIndex] === oIndex;
                  const isCorrect = graded && oIndex === result?.answer;
                  const isWrong =
                    graded && selected && oIndex !== result?.answer;
                  return (
                    <button
                      key={`${oIndex}-${choice}`}
                      type="button"
                      disabled={Boolean(graded)}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))
                      }
                      className={clsx(
                        'flex items-start gap-2 rounded-lg border px-2.5 py-2 text-left text-[12.5px] transition',
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                          : isWrong
                            ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                            : selected
                              ? 'border-pine-400 bg-pine-50/60 text-slate-800 dark:border-pine-700 dark:bg-pine-950/30 dark:text-slate-100'
                              : 'border-line text-slate-600 hover:border-pine-300 dark:border-white/10 dark:text-slate-300 dark:hover:border-pine-700',
                        graded && 'cursor-default',
                      )}
                    >
                      <span
                        className={clsx(
                          'grid h-5 w-5 shrink-0 place-items-center rounded text-[10px] font-extrabold',
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : isWrong
                              ? 'bg-rose-600 text-white'
                              : selected
                                ? 'bg-pine-600 text-white'
                                : 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400',
                        )}
                      >
                        {String.fromCharCode(65 + oIndex)}
                      </span>
                      <span className="leading-relaxed">{choice}</span>
                    </button>
                  );
                })}
              </div>
              {graded && result && (
                <div
                  className={clsx(
                    'mt-2 rounded-lg px-2.5 py-2',
                    result.correct
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200',
                  )}
                >
                  <MarkdownText compact>
                    {`**${result.correct ? 'Chính xác.' : 'Chưa đúng.'}** ${result.explain}`}
                  </MarkdownText>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!graded ? (
          <button
            type="button"
            className="btn-primary"
            disabled={answeredCount < questions.length || submit.isPending}
            onClick={() => submit.mutate()}
          >
            {submit.isPending && <Spinner className="h-4 w-4 text-white" />}
            Nộp bài
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setAnswers({});
              setGraded(null);
            }}
          >
            Làm lại
          </button>
        )}
        <button
          type="button"
          className="btn-ghost"
          disabled={quizAi.isPending}
          onClick={() => quizAi.mutate()}
        >
          {quizAi.isPending ? (
            <>
              <Spinner className="h-3.5 w-3.5" /> AI đang tạo thêm câu hỏi...
            </>
          ) : (
            <>
              <Icon name="cards" className="h-3.5 w-3.5" /> AI tạo thêm câu hỏi
            </>
          )}
        </button>
        {!graded && answeredCount < questions.length && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Còn {questions.length - answeredCount} câu chưa chọn.
          </span>
        )}
      </div>

      {aiQuestions.length > 0 && (
        <div className="space-y-3 border-t border-line pt-3 dark:border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Bộ câu hỏi AI bổ sung
            </p>
            {aiSubmitted && (
              <span className="font-mono text-sm font-bold text-slate-600 dark:text-slate-300">
                {aiScore}/{aiQuestions.length}
              </span>
            )}
          </div>
          {aiQuestions.map((question, qIndex) => {
            const selected = aiAnswers[qIndex];
            const correct = aiSubmitted && selected === question.correctIndex;
            return (
              <div
                key={question.question}
                className="rounded-xl border border-dashed border-line p-3 dark:border-white/[0.12]"
              >
                <p className="flex gap-2 text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-slate-600 text-[11px] font-extrabold text-white">
                    {qIndex + 1}
                  </span>
                  {question.question}
                </p>
                <div className="mt-2 grid gap-1.5">
                  {question.options.map((option, oIndex) => {
                    const isSelected = selected === oIndex;
                    return (
                      <button
                        key={`${oIndex}-${option}`}
                        type="button"
                        disabled={aiSubmitted}
                        onClick={() =>
                          setAiAnswers((prev) => ({ ...prev, [qIndex]: oIndex }))
                        }
                        className={clsx(
                          'flex items-start gap-2 rounded-lg border px-2.5 py-2 text-left text-[12.5px] transition',
                          aiSubmitted && oIndex === question.correctIndex
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                            : aiSubmitted && isSelected
                              ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                              : isSelected
                                ? 'border-pine-400 bg-pine-50/60 text-slate-800 dark:border-pine-700 dark:bg-pine-950/30 dark:text-slate-100'
                                : 'border-line text-slate-600 hover:border-pine-300 dark:border-white/10 dark:text-slate-300 dark:hover:border-pine-700',
                        )}
                      >
                        <span className="leading-relaxed">
                          <strong className="mr-1 font-extrabold">
                            {String.fromCharCode(65 + oIndex)}.
                          </strong>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {aiSubmitted && (
                  <div
                    className={clsx(
                      'mt-2 rounded-lg px-2.5 py-2',
                      correct
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200',
                    )}
                  >
                    <MarkdownText compact>
                      {`**${correct ? 'Chính xác.' : 'Chưa đúng.'}** ${
                        question.explanation || 'Xem lại phần nội dung liên quan trong bài.'
                      }`}
                    </MarkdownText>
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2">
            {!aiSubmitted ? (
              <button
                type="button"
                className="btn-primary !py-1.5 !text-xs"
                disabled={Object.keys(aiAnswers).length < aiQuestions.length}
                onClick={() => setAiSubmitted(true)}
              >
                Xem kết quả bộ AI
              </button>
            ) : (
              <button
                type="button"
                className="btn-secondary !py-1.5 !text-xs"
                onClick={() => {
                  setAiAnswers({});
                  setAiSubmitted(false);
                }}
              >
                Làm lại bộ AI
              </button>
            )}
            <button
              type="button"
              className="btn-ghost !py-1.5 !text-xs"
              disabled={quizAi.isPending}
              onClick={() => quizAi.mutate()}
            >
              Tạo bộ AI khác
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function LessonChat({ lesson }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);
  const slugRef = useRef(lesson.slug);

  useEffect(() => {
    slugRef.current = lesson.slug;
    abortRef.current?.abort();
    setMessages([]);
    setInput('');
    setError(null);
    setStreaming(false);
  }, [lesson.slug]);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, streaming]);

  const send = async (text) => {
    const message = String(text || '').trim();
    if (!message || streaming) return;
    const history = messages
      .filter((item) => (item.role === 'user' || item.role === 'assistant') && item.content)
      .map((item) => ({ role: item.role, content: item.content.slice(0, 3000) }))
      .slice(-8);

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: message },
      { role: 'assistant', content: '', streaming: true },
    ]);
    setInput('');
    setError(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await askLessonCoachStream({
        slug: lesson.slug,
        message,
        history,
        signal: controller.signal,
        onDelta: (delta) => {
          if (slugRef.current !== lesson.slug) return;
          setMessages((prev) => {
            const next = [...prev];
            const last = next.length - 1;
            if (last >= 0 && next[last].role === 'assistant') {
              next[last] = { ...next[last], content: next[last].content + delta };
            }
            return next;
          });
        },
      });
      setStreaming(false);
    } catch (err) {
      setStreaming(false);
      if (err?.name === 'AbortError') return;
      setError(getErrorMessage(err));
      setMessages((prev) => prev.filter((item) => !item.streaming));
    }
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Icon name="chat" className="h-4 w-4" />
          Hỏi AI về bài này
        </h3>
        {messages.length > 0 && (
          <button
            type="button"
            className="btn-ghost !px-2 !py-1 !text-[11px]"
            onClick={() => {
              abortRef.current?.abort();
              setMessages([]);
              setError(null);
            }}
          >
            Xóa hội thoại
          </button>
        )}
      </div>
      <p className="text-[12px] text-slate-500 dark:text-slate-400">
        AI chỉ trả lời trong phạm vi nội dung bài học và bằng chứng đã kiểm chứng — tốn 1
        lượt quota riêng.
      </p>

      {error && <Alert tone="danger">{error}</Alert>}

      {messages.length > 0 && (
        <div ref={scrollRef} className="max-h-96 space-y-2.5 overflow-y-auto pr-1">
          {messages.map((item, index) => (
            <div
              key={index}
              className={clsx(
                'rounded-xl px-3 py-2',
                item.role === 'user'
                  ? 'ml-8 bg-pine-600 text-white'
                  : 'mr-2 border border-line bg-paper-2 dark:border-white/10 dark:bg-white/[0.04]',
              )}
            >
              {item.role === 'user' ? (
                <p className="text-[12.5px] leading-relaxed">{item.content}</p>
              ) : (
                <MarkdownText compact>{item.content || '...'}</MarkdownText>
              )}
            </div>
          ))}
        </div>
      )}

      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
      >
        <textarea
          id="lesson-chat-input"
          rows={2}
          className="input flex-1 resize-none"
          placeholder="Ví dụ: cho ví dụ áp dụng phần này với khách mới tập..."
          value={input}
          maxLength={2000}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send(input);
            }
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={!input.trim() || streaming}
        >
          {streaming ? <Spinner className="h-4 w-4 text-white" /> : <Icon name="send" className="h-4 w-4" />}
        </button>
      </form>
    </Card>
  );
}

export default function LessonPage({ slug, onBack }) {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const lessonQuery = useQuery({
    queryKey: ['curriculum-lesson', slug],
    queryFn: () => getLesson(slug),
  });

  // Cây giáo trình (đã cache) để tính bài trước/sau — giữ "vòng học tiếp".
  const curriculumQuery = useQuery({
    queryKey: ['curriculum'],
    queryFn: getCurriculum,
    staleTime: 5 * 60 * 1000,
  });

  const mark = useMutation({
    mutationFn: (status) => markLessonProgress(slug, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curriculum'] });
      queryClient.invalidateQueries({ queryKey: ['curriculum-lesson', slug] });
    },
  });

  // Mở bài = đánh dấu đang đọc (một lần mỗi lần vào trang).
  useEffect(() => {
    if (lessonQuery.data?.progress?.status === 'new') {
      mark.mutate('reading');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonQuery.data?.progress?.status]);

  const data = lessonQuery.data;
  const lesson = data?.lesson;
  const imageByFile = useMemo(() => {
    const map = new Map();
    (lesson?.images || []).forEach((image) => map.set(image.file, image));
    return map;
  }, [lesson]);

  const neighbours = useMemo(() => {
    const modules = curriculumQuery.data?.modules;
    if (!modules) return null;
    const ordered = [];
    modules.forEach((mod) =>
      mod.chapters.forEach((chapter) =>
        chapter.lessons.forEach((l) =>
          ordered.push({ slug: l.slug, title: l.title, moduleVi: mod.vi, minutes: l.minutes }),
        ),
      ),
    );
    const index = ordered.findIndex((l) => l.slug === slug);
    if (index === -1) return null;
    return {
      prev: index > 0 ? ordered[index - 1] : null,
      next: index < ordered.length - 1 ? ordered[index + 1] : null,
    };
  }, [curriculumQuery.data, slug]);

  const goToLesson = (nextSlug) => {
    const next = new URLSearchParams(searchParams);
    next.set('lesson', nextSlug);
    setSearchParams(next);
    window.scrollTo(0, 0);
  };

  if (lessonQuery.isLoading) {
    return <LoadingBlock label="Đang mở bài học..." />;
  }

  if (lessonQuery.isError) {
    return (
      <div className="space-y-4">
        <button type="button" className="btn-ghost" onClick={onBack}>
          ← Giáo trình
        </button>
        <Alert tone="danger">{getErrorMessage(lessonQuery.error)}</Alert>
      </div>
    );
  }

  if (!lesson) return null;

  const isCompleted = data.progress.status === 'completed';

  return (
    <div>
      <ReadingProgress />

      <div className="space-y-5 pt-1">
        <button type="button" className="btn-ghost !px-2 !py-1 !text-xs" onClick={onBack}>
          ← Giáo trình
        </button>

        <PageHeader
          title={lesson.title}
          subtitle={lesson.subtitle}
          meta={
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Icon name="book" className="h-3.5 w-3.5" />
                {MODULE_LABELS[lesson.module]}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Chương {lesson.chapter} — {lesson.chapterTitle}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <Icon name="clock" className="h-3.5 w-3.5" />
                {lesson.minutes} phút
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">
                {lesson.quiz.length} câu quiz · {lesson.terms.length} thuật ngữ
              </span>
            </div>
          }
          actions={
            <button
              type="button"
              className={clsx(isCompleted ? 'btn-secondary' : 'btn-primary')}
              disabled={mark.isPending}
              onClick={() => mark.mutate(isCompleted ? 'reading' : 'completed')}
            >
              {mark.isPending && <Spinner className="h-4 w-4" />}
              {isCompleted ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành'}
            </button>
          }
        />

        {/* Mục tiêu: checklist đánh số — lời hứa của bài học */}
        <Card className="overflow-hidden !p-0">
          <div className="border-b border-line px-4 py-3.5 dark:border-white/[0.08]">
            <h2 className="font-display text-[16px] font-semibold text-slate-900 dark:text-white">
              Mục tiêu — sau bài này bạn sẽ
            </h2>
          </div>
          <ol className="divide-y divide-line dark:divide-white/[0.06]">
            {lesson.objectives.map((objective, index) => (
              <li key={objective} className="flex items-start gap-3 px-4 py-2.5">
                <span className="mt-0.5 shrink-0 font-mono text-[11px] font-semibold tabular-nums text-pine-600 dark:text-pine-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-200">
                  {objective}
                </p>
              </li>
            ))}
          </ol>
        </Card>

        {/* Nội dung: cột đọc với số mục ở lề — nhịp đọc thay vì dải card */}
        <div>
          {lesson.sections.map((section, index) => (
            <article
              key={section.heading}
              id={`section-${index + 1}`}
              className={clsx(
                'pb-7 pt-6',
                index > 0 && 'border-t border-line dark:border-white/[0.08]',
              )}
            >
              <div className="flex items-baseline gap-3">
                <span className="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-pine-600 dark:text-pine-300">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="font-display text-[20px] font-semibold leading-snug text-slate-900 dark:text-white">
                  {section.heading}
                </h2>
              </div>
              <div className="mt-3 sm:pl-9">
                <MarkdownText className="text-[13.5px] text-slate-700 dark:text-slate-200">
                  {section.body}
                </MarkdownText>
                {section.imageUrl && (
                  <LessonImage
                    image={imageByFile.get(section.image) || { url: section.imageUrl }}
                  />
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Ghi chú thực hành: phần đáng mang ra floor nhất */}
        <Card className="overflow-hidden !p-0 border-pine-200 bg-pine-50/50 dark:border-pine-900 dark:bg-pine-950/20">
          <div className="flex items-center gap-3 border-b border-pine-200/70 px-4 py-3.5 dark:border-pine-900">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-pine-600 text-white dark:bg-pine-500">
              <Icon name="dumbbell" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-[16px] font-semibold text-slate-900 dark:text-white">
                Áp dụng vào phòng tập
              </h2>
              <p className="text-[12px] text-pine-800/80 dark:text-pine-200/70">
                Làm ngay trong buổi tập tiếp theo của bạn hoặc học viên.
              </p>
            </div>
          </div>
          <div className="px-4 py-4">
            <MarkdownText className="text-[13.5px] text-slate-700 dark:text-slate-200">
              {lesson.applyBox}
            </MarkdownText>
          </div>
        </Card>

        {lesson.safetyBox && (
          <Alert tone="warning" title="Lưu ý an toàn & ranh giới chuyên môn">
            <MarkdownText compact>{lesson.safetyBox}</MarkdownText>
          </Alert>
        )}

        <TermsCard terms={lesson.terms} />

        <RelatedRow lesson={lesson} evidence={data.evidence || []} />

        <QuizSection lesson={lesson} />

        <LessonChat lesson={lesson} />

        <Card className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Nguồn tham khảo</h3>
          <ol className="list-decimal space-y-1.5 pl-5 text-[12.5px] text-slate-500 marker:text-slate-400 dark:text-slate-400">
            {lesson.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-pine-700 underline underline-offset-2 hover:text-pine-800 dark:text-pine-300"
                >
                  {source.label}
                </a>{' '}
                — {source.license}
              </li>
            ))}
          </ol>
        </Card>

        {/* Bài trước / bài sau — giữ nhịp học */}
        {neighbours && (neighbours.prev || neighbours.next) && (
          <nav
            className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2 dark:border-white/[0.08]"
            aria-label="Điều hướng bài học"
          >
            {neighbours.prev ? (
              <button
                type="button"
                onClick={() => goToLesson(neighbours.prev.slug)}
                className="group flex min-w-0 items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-left transition-colors hover:border-line-strong hover:bg-paper-2 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
              >
                <Icon
                  name="arrowUpRight"
                  className="h-4 w-4 shrink-0 rotate-[-135deg] text-slate-400 transition-transform group-hover:-translate-x-0.5 group-hover:translate-y-0.5"
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                    Bài trước · {neighbours.prev.minutes}′
                  </span>
                  <span className="block truncate text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                    {neighbours.prev.title}
                  </span>
                </span>
              </button>
            ) : (
              <span className="hidden sm:block" aria-hidden="true" />
            )}
            {neighbours.next ? (
              <button
                type="button"
                onClick={() => goToLesson(neighbours.next.slug)}
                className="group flex min-w-0 items-center gap-3 rounded-lg border border-pine-200 bg-pine-50/60 px-4 py-3 text-right transition-colors hover:border-pine-300 hover:bg-pine-50 dark:border-pine-800/60 dark:bg-pine-950/30 dark:hover:border-pine-700"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-pine-700 dark:text-pine-300">
                    Bài tiếp theo · {neighbours.next.minutes}′
                  </span>
                  <span className="block truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                    {neighbours.next.title}
                  </span>
                </span>
                <Icon
                  name="arrowUpRight"
                  className="h-4 w-4 shrink-0 text-pine-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-pine-300"
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={onBack}
                className="group flex min-w-0 items-center justify-end gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-right transition-colors hover:border-line-strong hover:bg-paper-2 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                    Hết giáo trình
                  </span>
                  <span className="block truncate text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                    Xem lại toàn bộ giáo trình
                  </span>
                </span>
                <Icon name="notebook" className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
