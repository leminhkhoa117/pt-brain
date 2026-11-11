import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Field, Icon, PageHeader } from '../../components/ui.jsx';
import {
  createTerm,
  deleteTerm,
  listTerms,
  updateTerm,
} from '../../api/summaries.js';
import { createFlashcard } from '../../api/learning.js';
import { getErrorMessage } from '../../api/client.js';

const emptyForm = { en: '', vi: '', explanation: '' };

export default function GlossaryPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const termsQuery = useQuery({ queryKey: ['terms'], queryFn: listTerms });
  const terms = termsQuery.data?.terms || [];

  const save = useMutation({
    mutationFn: () =>
      editingId
        ? updateTerm(editingId, {
            en: form.en.trim(),
            vi: form.vi.trim(),
            explanation: form.explanation.trim(),
          })
        : createTerm({
            en: form.en.trim(),
            vi: form.vi.trim(),
            explanation: form.explanation.trim(),
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      setNotice(editingId ? 'Đã cập nhật thuật ngữ.' : 'Đã thêm thuật ngữ.');
      setError(null);
      setForm(emptyForm);
      setEditingId(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteTerm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] });
      setNotice('Đã xóa thuật ngữ.');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const makeFlashcard = useMutation({
    mutationFn: (termId) => createFlashcard({ termId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      setNotice('Đã tạo flashcard từ thuật ngữ.');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const filtered = terms.filter((term) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      term.en.toLowerCase().includes(q) ||
      term.vi.toLowerCase().includes(q) ||
      (term.explanation || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Từ điển cá nhân"
        subtitle="Thuật ngữ lấy từ các bản tóm tắt. Sửa được, có ví dụ, và tạo flashcard ôn tập."
        actions={
          <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {terms.length} thuật ngữ
          </span>
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {editingId ? 'Sửa thuật ngữ' : 'Thêm thuật ngữ'}
          </h2>
          <div className="mt-3 space-y-3">
            <Field label="Tiếng Anh">
              <input
                className="input"
                placeholder="hypertrophy"
                value={form.en}
                onChange={(e) => setForm((f) => ({ ...f, en: e.target.value }))}
                maxLength={200}
              />
            </Field>
            <Field label="Tiếng Việt">
              <input
                className="input"
                placeholder="phì đại cơ"
                value={form.vi}
                onChange={(e) => setForm((f) => ({ ...f, vi: e.target.value }))}
                maxLength={200}
              />
            </Field>
            <Field label="Giải thích / ví dụ">
              <textarea
                className="input min-h-[90px]"
                placeholder="Tăng kích thước cơ do tổng hợp protein cơ..."
                value={form.explanation}
                onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
                maxLength={2000}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                disabled={!form.en.trim() || !form.vi.trim() || save.isPending}
                onClick={() => save.mutate()}
              >
                {save.isPending ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm thuật ngữ'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Hủy sửa
                </button>
              )}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Danh sách thuật ngữ
            </h2>
            <div className="relative">
              <input
                className="input w-52 !py-1.5 pl-8 text-xs"
                placeholder="Tìm thuật ngữ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Icon name="search" className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {filtered.map((term) => (
              <div
                key={term._id}
                className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {term.en} <span className="font-normal text-slate-500">· {term.vi}</span>
                    </p>
                    {term.explanation && (
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {term.explanation}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className="badge bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300"
                      onClick={() => makeFlashcard.mutate(term._id)}
                      disabled={makeFlashcard.isPending}
                    >
                      <Icon name="cards" className="h-3 w-3" />
                      Flashcard
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !p-1.5 text-xs"
                      onClick={() => {
                        setEditingId(term._id);
                        setForm({
                          en: term.en,
                          vi: term.vi,
                          explanation: term.explanation || '',
                        });
                        setNotice(null);
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn-ghost !p-1.5 text-xs text-rose-500"
                      onClick={() => remove.mutate(term._id)}
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!filtered.length && (
              <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                {terms.length ? 'Không tìm thấy thuật ngữ phù hợp.' : 'Chưa có thuật ngữ nào.'}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
