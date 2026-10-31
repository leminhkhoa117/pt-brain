import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Field, Icon, PageHeader, Spinner } from '../../components/ui.jsx';
import {
  createFlashcard,
  deleteFlashcard,
  listFlashcards,
  reviewFlashcard,
} from '../../api/learning.js';
import { getErrorMessage } from '../../api/client.js';
import { formatDateKey } from '../../lib/date.js';
import { QUALITY_LABELS } from '@shared/learning/sm2.js';

export default function FlashcardsPage() {
  const queryClient = useQueryClient();
  const [revealed, setRevealed] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const dueQuery = useQuery({
    queryKey: ['flashcards', 'due'],
    queryFn: () => listFlashcards(true),
  });
  const allQuery = useQuery({
    queryKey: ['flashcards', 'all'],
    queryFn: () => listFlashcards(false),
  });

  const queue = dueQuery.data?.cards || [];
  const current = queue[0];
  const stats = allQuery.data?.stats || { total: 0, due: 0 };

  useEffect(() => {
    setRevealed(false);
  }, [current?._id]);

  const review = useMutation({
    mutationFn: ({ id, quality }) => reviewFlashcard(id, quality),
    onSuccess: (data) => {
      setRevealed(false);
      setNotice(
        `Đã ôn. Lần tới sau ${data.review.intervalDays} ngày (ease ${data.review.ease}).`,
      );
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const add = useMutation({
    mutationFn: () => createFlashcard({ front: front.trim(), back: back.trim() }),
    onSuccess: () => {
      setFront('');
      setBack('');
      setShowForm(false);
      setNotice('Đã tạo flashcard mới.');
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteFlashcard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['flashcards'] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title="Flashcard"
        subtitle="Ôn tập ngắt quãng theo SM-2. Thẻ đến hạn sẽ xuất hiện đầu tiên."
        actions={
          <div className="flex items-center gap-2">
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {stats.total} thẻ · {stats.due} đến hạn
            </span>
            <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>
              <Icon name="plus" className="h-4 w-4" />
              Thẻ mới
            </button>
          </div>
        }
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

      {showForm && (
        <Card className="mb-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mặt trước">
              <input
                className="input"
                placeholder="hypertrophy"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                maxLength={2000}
              />
            </Field>
            <Field label="Mặt sau">
              <input
                className="input"
                placeholder="phì đại cơ — tăng kích thước cơ"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                maxLength={4000}
              />
            </Field>
          </div>
          <button
            type="button"
            className="btn-primary mt-3"
            disabled={!front.trim() || !back.trim() || add.isPending}
            onClick={() => add.mutate()}
          >
            {add.isPending ? 'Đang lưu...' : 'Lưu thẻ'}
          </button>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {dueQuery.isLoading ? (
            <Card>
              <Spinner />
            </Card>
          ) : current ? (
            <Card className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Thẻ đến hạn · còn {queue.length}
              </p>
              <p className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                {current.front}
              </p>

              {revealed ? (
                <div className="mt-6">
                  <p className="whitespace-pre-wrap text-base text-slate-600 dark:text-slate-300">
                    {current.back}
                  </p>
                  <div className="mt-6">
                    <p className="text-xs text-slate-400">Bạn nhớ thẻ này ở mức nào?</p>
                    <div className="mt-2 flex flex-wrap justify-center gap-2">
                      {QUALITY_LABELS.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className="btn-secondary !px-3 !py-1.5 text-xs"
                          disabled={review.isPending}
                          onClick={() =>
                            review.mutate({ id: current._id, quality: item.value })
                          }
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-primary mt-8"
                  onClick={() => setRevealed(true)}
                >
                  Hiện đáp án
                </button>
              )}

              <p className="mt-5 text-[11px] text-slate-400">
                Ease {current.ease} · interval {current.intervalDays} ngày · reps {current.reps}
              </p>
            </Card>
          ) : (
            <Card className="py-12 text-center">
              <Icon name="checkCircle" className="mx-auto h-10 w-10 text-emerald-500" />
              <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                Hôm nay không có thẻ cần ôn.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Tạo thêm thẻ từ Từ điển hoặc quay lại khi thẻ đến hạn.
              </p>
            </Card>
          )}
        </div>

        <Card>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Tất cả thẻ</h3>
          <div className="mt-2 max-h-[520px] space-y-2 overflow-auto">
            {(allQuery.data?.cards || []).map((card) => (
              <div
                key={card._id}
                className="rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-700 dark:text-slate-200">
                      {card.front}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-slate-400">{card.back}</p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Due {formatDateKey(String(card.dueDate).slice(0, 10), true)} · interval{' '}
                      {card.intervalDays} ngày
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-ghost !p-1 text-rose-500"
                    onClick={() => remove.mutate(card._id)}
                    aria-label="Xóa thẻ"
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {!(allQuery.data?.cards || []).length && (
              <p className="py-4 text-center text-xs text-slate-400">Chưa có thẻ nào.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
