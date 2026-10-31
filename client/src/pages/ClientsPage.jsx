import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { Alert, Card, Field, Icon, PageHeader } from '../components/ui.jsx';
import { createClient, deleteClient, listClients, updateClient } from '../api/clients.js';
import { listPrograms } from '../api/training.js';
import { getErrorMessage } from '../api/client.js';
import { todayKey } from '../lib/date.js';
import { GOAL_LABELS, EXPERIENCE_LABELS } from '../lib/format.js';

const STATUS_LABELS = {
  active: 'Đang tập',
  paused: 'Tạm dừng',
  ended: 'Kết thúc',
};
const STATUS_STYLES = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  ended: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  goal: 'maintain',
  experience: 'beginner',
  status: 'active',
  programId: '',
  notes: '',
};

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: () => listClients() });
  const programsQuery = useQuery({ queryKey: ['programs'], queryFn: listPrograms });
  const clients = useMemo(() => clientsQuery.data?.clients || [], [clientsQuery.data]);
  const programs = useMemo(() => programsQuery.data?.programs || [], [programsQuery.data]);

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        goal: form.goal,
        experience: form.experience,
        status: form.status,
        programId: form.programId || undefined,
        notes: form.notes.trim(),
      };
      return editingId ? updateClient(editingId, payload) : createClient(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setNotice(editingId ? 'Đã cập nhật khách hàng.' : 'Đã thêm khách hàng.');
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setNotice('Đã xóa khách hàng.');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const checkIn = useMutation({
    mutationFn: (id) => updateClient(id, { lastCheckIn: todayKey() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setNotice('Đã ghi nhận check-in hôm nay.');
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(q) ||
        (client.email || '').toLowerCase().includes(q) ||
        (client.phone || '').includes(q),
    );
  }, [clients, search]);

  const startEdit = (client) => {
    setEditingId(client._id);
    setForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      goal: client.goal || 'maintain',
      experience: client.experience || 'beginner',
      status: client.status || 'active',
      programId: client.programId?._id || '',
      notes: client.notes || '',
    });
    setShowForm(true);
    setNotice(null);
  };

  return (
    <div>
      <PageHeader
        title="Khách hàng"
        subtitle="Quản lý danh sách khách, mục tiêu, giáo án đang áp dụng và lịch check-in."
        actions={
          <div className="flex items-center gap-2">
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {clients.filter((c) => c.status === 'active').length} đang tập
            </span>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setShowForm((v) => !v);
              }}
            >
              <Icon name="plus" className="h-4 w-4" />
              Thêm khách
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
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {editingId ? 'Sửa khách hàng' : 'Khách hàng mới'}
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Họ tên *">
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={120}
              />
            </Field>
            <Field label="Email">
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field label="Số điện thoại">
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                maxLength={30}
              />
            </Field>
            <Field label="Mục tiêu">
              <select
                className="input"
                value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              >
                {Object.entries(GOAL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Trình độ">
              <select
                className="input"
                value={form.experience}
                onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              >
                {Object.entries(EXPERIENCE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Trạng thái">
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Giáo án đang áp dụng">
              <select
                className="input"
                value={form.programId}
                onChange={(e) => setForm((f) => ({ ...f, programId: e.target.value }))}
              >
                <option value="">Chưa gán</option>
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ghi chú" className="sm:col-span-2">
              <input
                className="input"
                placeholder="Chấn thương, lịch tập, lưu ý dinh dưỡng..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                maxLength={4000}
              />
            </Field>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary"
              disabled={form.name.trim().length < 2 || save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm khách'}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Hủy
            </button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Danh sách</h2>
          <div className="relative">
            <input
              className="input w-56 !py-1.5 pl-8 text-xs"
              placeholder="Tìm theo tên/email/SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Icon name="search" className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((client) => (
            <div
              key={client._id}
              className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {client.name}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {[client.email, client.phone].filter(Boolean).join(' · ') || 'Chưa có liên hệ'}
                  </p>
                </div>
                <span className={clsx('badge shrink-0', STATUS_STYLES[client.status])}>
                  {STATUS_LABELS[client.status]}
                </span>
              </div>

              <div className="mt-2 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                <p>
                  Mục tiêu: <span className="font-medium">{GOAL_LABELS[client.goal]}</span> ·{' '}
                  {EXPERIENCE_LABELS[client.experience]}
                </p>
                <p>
                  Giáo án:{' '}
                  {client.programId?.name ? (
                    <span className="font-medium">{client.programId.name}</span>
                  ) : (
                    'Chưa gán'
                  )}
                </p>
                <p>
                  Check-in:{' '}
                  {client.lastCheckIn
                    ? new Date(client.lastCheckIn).toLocaleDateString('vi-VN')
                    : 'Chưa có'}
                </p>
                {client.notes && <p className="line-clamp-2 italic">{client.notes}</p>}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-2 dark:border-slate-800">
                <button
                  type="button"
                  className="btn-ghost !px-2 !py-1 text-xs"
                  disabled={checkIn.isPending}
                  onClick={() => checkIn.mutate(client._id)}
                >
                  <Icon name="checkCircle" className="h-3.5 w-3.5" />
                  Check-in
                </button>
                <button
                  type="button"
                  className="btn-ghost !px-2 !py-1 text-xs"
                  onClick={() => startEdit(client)}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className="btn-ghost !px-2 !py-1 text-xs text-rose-500"
                  onClick={() => {
                    if (window.confirm(`Xóa khách hàng ${client.name}?`)) remove.mutate(client._id);
                  }}
                >
                  <Icon name="trash" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {!filtered.length && (
            <p className="col-span-full py-8 text-center text-sm text-slate-400">
              {clients.length ? 'Không tìm thấy khách phù hợp.' : 'Chưa có khách hàng nào.'}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
