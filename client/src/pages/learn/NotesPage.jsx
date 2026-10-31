import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Card, Field, Icon, PageHeader } from '../../components/ui.jsx';
import {
  createNote,
  deleteNote,
  listNotes,
  updateNote,
} from '../../api/summaries.js';
import { getErrorMessage } from '../../api/client.js';
import { formatDateKey } from '../../lib/date.js';

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [text, setText] = useState('');
  const [tags, setTags] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const notesQuery = useQuery({
    queryKey: ['notes', query],
    queryFn: () => listNotes(query),
  });
  const notes = notesQuery.data?.notes || [];

  const add = useMutation({
    mutationFn: () =>
      createNote({
        text: text.trim(),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 20),
      }),
    onSuccess: () => {
      setText('');
      setTags('');
      setNotice('Đã lưu ghi chú.');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const saveEdit = useMutation({
    mutationFn: () => updateNote(editingId, { text: draft.trim() }),
    onSuccess: () => {
      setEditingId(null);
      setDraft('');
      setNotice('Đã cập nhật ghi chú.');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteNote(id),
    onSuccess: () => {
      setNotice('Đã xóa ghi chú.');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <div>
      <PageHeader
        title="Sổ tay kiến thức"
        subtitle="Ghi chú và takeaway từ các bài nghiên cứu. Tìm kiếm toàn văn."
        actions={
          <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {notes.length} ghi chú
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
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Ghi chú mới</h2>
          <div className="mt-3 space-y-3">
            <Field label="Nội dung">
              <textarea
                className="input min-h-[130px]"
                placeholder="Áp dụng volume 12-20 set/tuần cho nhóm cơ chính; theo dõi 4 tuần rồi đánh giá lại..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={10000}
              />
            </Field>
            <Field label="Tag (cách nhau bởi dấu phẩy)">
              <input
                className="input"
                placeholder="hypertrophy, volume"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </Field>
            <button
              type="button"
              className="btn-primary w-full"
              disabled={text.trim().length < 3 || add.isPending}
              onClick={() => add.mutate()}
            >
              {add.isPending ? 'Đang lưu...' : 'Lưu ghi chú'}
            </button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Tất cả ghi chú
            </h2>
            <form
              className="relative"
              onSubmit={(e) => {
                e.preventDefault();
                setQuery(search.trim());
              }}
            >
              <input
                className="input w-56 !py-1.5 pl-8 text-xs"
                placeholder="Tìm toàn văn..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Icon name="search" className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            </form>
          </div>

          <div className="mt-3 space-y-2">
            {notes.map((note) => (
              <div
                key={note._id}
                className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
              >
                {editingId === note._id ? (
                  <div>
                    <textarea
                      className="input min-h-[90px]"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="btn-primary !px-3 !py-1.5 text-xs"
                        disabled={draft.trim().length < 3 || saveEdit.isPending}
                        onClick={() => saveEdit.mutate()}
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        className="btn-ghost !px-3 !py-1.5 text-xs"
                        onClick={() => setEditingId(null)}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {note.text}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(note.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                        <span className="text-[11px] text-slate-400">
                          {formatDateKey(String(note.createdAt).slice(0, 10), true)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="btn-ghost !p-1.5 text-xs"
                          onClick={() => {
                            setEditingId(note._id);
                            setDraft(note.text);
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-ghost !p-1.5 text-xs text-rose-500"
                          onClick={() => remove.mutate(note._id)}
                        >
                          <Icon name="trash" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            {!notes.length && (
              <p className="py-8 text-center text-sm text-slate-400">
                {query ? 'Không tìm thấy ghi chú phù hợp.' : 'Chưa có ghi chú nào.'}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
