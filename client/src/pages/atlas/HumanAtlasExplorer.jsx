import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import AtlasScene from './AtlasScene.jsx';
import {
  DEFAULT_VISIBLE,
  EXPLANATIONS,
  PRESETS,
  SYSTEM_BY_ID,
  SYSTEM_DETAILS,
  SYSTEMS,
  explanation,
  formatNumber,
} from './atlasData.js';
import {
  ATLAS_MUSCLE_CONCEPTS,
  ATLAS_MUSCLE_KEYWORDS,
  CONCEPT_TO_MUSCLE,
} from './atlasMuscleMap.js';
import { registerAtlasTools } from './atlasAgentTools.js';
import { MUSCLE_GROUPS, MUSCLES } from '@shared/muscles/index.js';
import { Spinner } from '../../components/ui.jsx';
import { useTheme } from '../../hooks/useTheme.jsx';
import './atlas.css';

const INITIAL_STATE = {
  explode: 0,
  visible: DEFAULT_VISIBLE,
  selected: [],
  isolate: false,
  highlightSelection: false,
  view: 'three-quarter',
  rotate: false,
  reset: 0,
};

const ORGAN_STARTERS = [
  'heart',
  'brain',
  'liver',
  'stomach',
  'spleen',
  'pancreas',
  'urinary bladder',
  'trachea',
];

function SvgIcon({ children, className = 'h-4 w-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function LayersIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </SvgIcon>
  );
}

function RotateIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </SvgIcon>
  );
}

function ResetIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M3 12a9 9 0 1 0 2.64-6.36" />
      <path d="M3 3v6h6" />
    </SvgIcon>
  );
}

function PauseIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M8 5v14M16 5v14" />
    </SvgIcon>
  );
}

function FocusIcon(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M3 9V5a2 2 0 0 1 2-2h4M15 3h4a2 2 0 0 1 2 2v4M21 15v4a2 2 0 0 1-2 2h-4M9 21H5a2 2 0 0 1-2-2v-4" />
    </SvgIcon>
  );
}

function ExpandIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
    </SvgIcon>
  );
}

function MinimizeIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M8 3v3a2 2 0 0 1-2 2H3M16 3v3a2 2 0 0 0 2 2h3M8 21v-3a2 2 0 0 0-2-2H3M16 21v-3a2 2 0 0 1 2-2h3" />
    </SvgIcon>
  );
}

function ChevronRightIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="m9 18 6-6-6-6" />
    </SvgIcon>
  );
}

function ChevronLeftIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="m15 18-6-6 6-6" />
    </SvgIcon>
  );
}

function SearchIcon(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </SvgIcon>
  );
}

function InfoIcon(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </SvgIcon>
  );
}

function CloseIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </SvgIcon>
  );
}

function dominantSystem(parts) {
  const counts = new Map();
  for (const part of parts) {
    if (!part?.system) continue;
    counts.set(part.system, (counts.get(part.system) ?? 0) + 1);
  }
  let best = null;
  let bestCount = -1;
  for (const [system, count] of counts) {
    if (count > bestCount) {
      best = system;
      bestCount = count;
    }
  }
  return best;
}

const SYSTEM_NAME_HINTS = [
  ['cardiac', ['heart', 'cardiac', 'ventricle', 'atrium', 'valve']],
  ['arterial', ['artery', 'arterial', 'aorta', 'carotid']],
  ['venous', ['vein', 'venous', 'vena cava', 'sinus']],
  ['respiratory', ['lung', 'trachea', 'bronch', 'respiratory', 'alveol', 'pleura']],
  [
    'digestive',
    ['stomach', 'liver', 'intestin', 'colon', 'esophagus', 'pancreas', 'gallbladder', 'digestive'],
  ],
  ['urinary', ['kidney', 'ureter', 'bladder', 'urethra', 'urinary']],
  ['lymphatic', ['lymph', 'spleen', 'thymus', 'tonsil']],
  ['endocrine', ['thyroid', 'adrenal', 'pituitary', 'endocrine']],
  ['reproductive', ['testis', 'prostate', 'seminal', 'reproductive', 'ovary', 'uterus']],
  ['nervous', ['nerve', 'brain', 'spinal cord', 'nervous', 'ganglion', 'cerebr', 'cranial']],
  ['sensory', ['eye', 'ear', 'retina', 'cochlea', 'sensory', 'lens']],
  ['muscular', ['muscle', 'muscular', 'biceps', 'triceps', 'deltoid', 'gluteus', 'pectoralis']],
  ['skeletal', ['bone', 'femur', 'humerus', 'vertebra', 'rib', 'skull', 'skeletal']],
  ['connective', ['ligament', 'tendon', 'fascia', 'connective', 'cartilage']],
  ['integumentary', ['skin', 'integumentary', 'epidermis', 'dermis']],
];

function systemForConcept(concept, partsById) {
  if (!concept) return null;
  const muscle = muscleForConcept(concept);
  if (muscle) return SYSTEM_BY_ID.muscular;

  const name = String(concept.name || '').toLowerCase();
  for (const [system, keywords] of SYSTEM_NAME_HINTS) {
    if (keywords.some((keyword) => name.includes(keyword))) return SYSTEM_BY_ID[system];
  }

  return SYSTEM_BY_ID[
    dominantSystem((concept.elements ?? []).map((id) => partsById.get(id)).filter(Boolean))
  ];
}

function muscleForConcept(concept) {
  if (!concept) return null;
  const direct = CONCEPT_TO_MUSCLE[concept.id];
  if (direct && MUSCLES[direct]) return { slug: direct, ...MUSCLES[direct] };

  const name = String(concept.name || '').toLowerCase();
  for (const row of ATLAS_MUSCLE_KEYWORDS) {
    if (row.keywords.some((keyword) => name.includes(keyword))) {
      const meta = MUSCLES[row.slug];
      if (meta) return { slug: row.slug, ...meta };
    }
  }
  return null;
}

function IconButton({ label, active, disabled, onClick, children, className }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl border text-slate-600 transition',
        'border-slate-200/80 bg-white/80 shadow-sm backdrop-blur hover:border-slate-300 hover:bg-white hover:text-slate-900',
        'dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:border-white/20 dark:hover:bg-white/[0.08] dark:hover:text-white',
        active &&
          '!border-brand-500 !bg-brand-600 !text-white dark:!border-brand-400 dark:!bg-brand-500',
        disabled && 'pointer-events-none opacity-35',
        className,
      )}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={clsx(
        'relative h-5 w-9 shrink-0 rounded-full transition-colors',
        checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700',
      )}
    >
      <span
        className={clsx(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all',
          checked ? 'left-[18px]' : 'left-0.5',
        )}
      />
    </button>
  );
}

function SystemsPanel({
  counts,
  activeSystems,
  visible,
  visibleCount,
  onToggle,
  onOnly,
  onPreset,
  onClose,
  onCollapse,
}) {
  return (
    <aside className="atlas-glass flex max-h-full min-h-0 flex-col rounded-lg p-3.5">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
            {activeSystems.length}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="hidden rounded-lg p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:inline-flex dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onCollapse}
            aria-label="Thu nhỏ bảng hệ cơ quan"
            title="Thu nhỏ bảng hệ cơ quan"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg p-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 md:hidden dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onClose}
            aria-label="Đóng bảng hệ cơ quan"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-white/[0.05]">
        {[
          ['Tất cả', PRESETS.all],
          ['Cơ', PRESETS.muscle],
          ['Xương', PRESETS.skeleton],
          ['Nội tạng', PRESETS.organs],
        ].map(([label, ids]) => {
          const active = ids.length === visible.length && ids.every((id) => visible.includes(id));
          return (
            <button
              key={label}
              type="button"
              onClick={() => onPreset(ids)}
              className={clsx(
                'rounded-lg px-1 py-1.5 text-[11px] font-semibold transition',
                active
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="atlas-panel-scroll mt-2 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
        {activeSystems.map((system) => {
          const enabled = visible.includes(system.id);
          return (
            <div key={system.id} className="group flex items-center gap-1.5">
              <button
                type="button"
                title={`Chỉ hiện ${system.vi.toLowerCase()}`}
                onClick={() => onOnly(system.id)}
                className={clsx(
                  'flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1.5 text-left text-[11px] transition hover:bg-slate-100 dark:hover:bg-white/[0.06]',
                  enabled
                    ? 'text-slate-700 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400 dark:text-slate-500',
                )}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: system.color }}
                />
                <span className="min-w-0 flex-1 truncate">{system.vi}</span>
                <span className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  {counts[system.id] ?? 0}
                </span>
              </button>
              <Toggle
                checked={enabled}
                onChange={() => onToggle(system.id)}
                label={`Hiện ${system.vi.toLowerCase()}`}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-slate-200/70 px-1 pt-2 text-[11px] text-slate-500 dark:text-slate-400 dark:border-white/10 dark:text-slate-500">
        <span>{formatNumber(visibleCount)} mảnh hiển thị</span>
        <button
          type="button"
          className="rounded-md px-1.5 py-1 font-semibold hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          onClick={() => onPreset([])}
        >
          Ẩn tất cả
        </button>
      </div>
    </aside>
  );
}

function SearchPanel({ atlas, partsById, query, setQuery, inputRef, results, onChoose, onClose }) {
  return (
    <section className="atlas-glass absolute left-1/2 top-4 z-40 w-[min(580px,calc(100%-2rem))] -translate-x-1/2 overflow-hidden rounded-lg max-md:top-[4.4rem]">
      <div className="flex items-center gap-2 border-b border-slate-200/70 px-3 py-2.5 dark:border-white/10">
        <SearchIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'Enter' && results[0]) onChoose(results[0]);
          }}
          placeholder="Tìm cơ, xương, cơ quan, dây thần kinh…"
          className="min-w-0 flex-1 bg-transparent py-1 text-sm text-slate-800 outline-none placeholder:text-slate-500 dark:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
          aria-label="Tìm cấu trúc giải phẫu"
          autoComplete="off"
        />
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          onClick={onClose}
          aria-label="Đóng tìm kiếm"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="atlas-panel-scroll max-h-[min(430px,55dvh)] overflow-y-auto p-1.5">
        {results.map((concept) => {
          const system = systemForConcept(concept, partsById);
          const muscle = muscleForConcept(concept);
          return (
            <button
              key={concept.id}
              type="button"
              onClick={() => onChoose(concept)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: system?.color ?? '#94a3b8' }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">
                  {muscle ? muscle.vi : concept.name}
                </span>
                <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500">
                  {muscle ? `${muscle.en} · ` : ''}
                  {system?.vi ?? 'Giải phẫu'}
                </span>
              </span>
              <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500 dark:bg-white/10 dark:text-slate-300">
                {concept.elements.length} mảnh
              </span>
            </button>
          );
        })}
        {!results.length && (
          <p className="px-3 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Không tìm thấy cấu trúc phù hợp.
          </p>
        )}
      </div>
      <div className="border-t border-slate-200/70 px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400 dark:border-white/10 dark:text-slate-500">
        {query
          ? `${formatNumber(results.length)} kết quả · tối đa 80`
          : `${formatNumber(atlas.concepts.length)} cấu trúc · gõ để tìm`}
      </div>
    </section>
  );
}

function ViewControls({ view, rotate, explode, onChangeView, onRotate, onReset }) {
  return (
    <div className="atlas-glass absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1 rounded-xl p-1 max-md:left-auto max-md:right-3 max-md:top-20 max-md:translate-x-0 max-md:translate-y-0 max-md:flex-col">
      {[
        ['three-quarter', '¾', 'Góc 3/4'],
        ['front', 'F', 'Nhìn trước'],
        ['side', 'S', 'Nhìn nghiêng'],
        ['back', 'B', 'Nhìn sau'],
      ].map(([id, label, title]) => (
        <button
          key={id}
          type="button"
          title={title}
          aria-label={title}
          aria-pressed={view === id}
          disabled={explode > 0.8 && id !== 'front'}
          onClick={() => onChangeView(id)}
          className={clsx(
            'grid h-8 w-8 place-items-center rounded-lg text-[11px] font-bold transition',
            view === id
              ? 'bg-slate-800 text-white shadow-sm dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white',
          )}
        >
          {label}
        </button>
      ))}
      <span className="mx-0.5 h-px w-6 self-center bg-slate-200 max-md:h-6 max-md:w-px dark:bg-white/10" />
      <button
        type="button"
        title={rotate ? 'Tạm dừng xoay' : 'Tự động xoay'}
        aria-label={rotate ? 'Tạm dừng xoay' : 'Tự động xoay'}
        aria-pressed={rotate}
        disabled={explode >= 0.4}
        onClick={onRotate}
        className={clsx(
          'grid h-8 w-8 place-items-center rounded-lg transition',
          rotate
            ? 'bg-brand-600 text-white'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white',
          explode >= 0.4 && 'pointer-events-none opacity-35',
        )}
      >
        {rotate ? <PauseIcon /> : <RotateIcon />}
      </button>
      <button
        type="button"
        title="Đặt lại góc nhìn"
        aria-label="Đặt lại góc nhìn"
        onClick={onReset}
        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <ResetIcon />
      </button>
    </div>
  );
}

function BottomDock({ explode, onExplode, onReset, onSystems }) {
  return (
    <div className="atlas-glass absolute bottom-3 left-1/2 z-30 flex w-[min(560px,calc(100%-1.5rem))] -translate-x-1/2 items-center gap-3 rounded-lg px-3 py-2.5">
      <button
        type="button"
        className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-white/10"
        onClick={onSystems}
        aria-label="Mở bảng hệ cơ quan"
      >
        <LayersIcon className="h-4 w-4" />
        Hệ
      </button>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            Tách giải phẫu
          </label>
          <output className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-slate-600 dark:bg-white/10 dark:text-slate-300">
            {Math.round(explode * 100)}%
          </output>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round(explode * 100)}
          onChange={(event) => onExplode(Number(event.target.value) / 100)}
          className="atlas-range w-full"
          style={{ '--atlas-range': `${Math.round(explode * 100)}%` }}
          aria-label="Mức tách giải phẫu"
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500">
          <span>Nguyên vẹn</span>
          <span>Từng mảnh</span>
        </div>
      </div>
      <button
        type="button"
        className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
        onClick={onReset}
        aria-label="Đặt lại toàn bộ"
      >
        <ResetIcon className="h-4 w-4" />
        Đặt lại
      </button>
    </div>
  );
}

function SystemInfoCard({ system, info, count }) {
  if (!system || !info) return null;
  return (
    <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-2.5 dark:border-white/10 dark:bg-white/[0.035]">
      <div className="flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: system.color }}
          />
          <span className="truncate">{system.vi}</span>
        </p>
        <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500 dark:text-slate-400 shadow-sm dark:bg-white/10 dark:text-slate-400">
          {formatNumber(count)} mảnh
        </span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
        {info.summary}
      </p>
      <div className="mt-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          Chức năng chính
        </p>
        <ul className="mt-1 space-y-1">
          {info.functions.map((item) => (
            <li
              key={item}
              className="flex gap-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400"
            >
              <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-brand-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-600 dark:text-slate-300">Trong mô hình: </span>
        {info.structures.join(' · ')}
      </p>
      {info.note && (
        <p className="mt-2 border-l-2 border-brand-300/70 pl-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 dark:border-brand-700 dark:text-slate-500">
          {info.note}
        </p>
      )}
      {info.related?.length > 0 && (
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Liên quan:{' '}
          {info.related
            .map((id) => SYSTEM_BY_ID[id]?.vi)
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
    </div>
  );
}

function DetailPanel({
  chosen,
  selectedParts,
  system,
  systemCount,
  muscle,
  onChoosePart,
  onClose,
  onIsolate,
  onClear,
  isolated,
}) {
  const group = muscle ? MUSCLE_GROUPS[muscle.group] : null;
  const description = muscle ? muscle.fn : chosen ? explanation(chosen.name, system?.id) : '';

  return (
    <aside className="atlas-glass atlas-detail absolute right-3 top-[4.6rem] z-30 flex max-h-[calc(100%-12rem)] w-[330px] flex-col overflow-hidden rounded-lg max-md:inset-x-3 max-md:bottom-20 max-md:top-auto max-md:max-h-[56%] max-md:w-auto">
      <div className="h-1 shrink-0" style={{ background: system?.color ?? '#94a3b8' }} />
      <div className="flex items-start justify-between gap-2 px-4 pt-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 dark:text-slate-500">
            {system?.vi ?? 'Giải phẫu'}
          </p>
          <h2 className="mt-1 font-display text-[20px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">
            {muscle ? muscle.vi : chosen?.name}
          </h2>
          {muscle && (
            <p className="mt-0.5 truncate text-[11px] italic text-slate-500 dark:text-slate-400 dark:text-slate-500">
              {muscle.en}
            </p>
          )}
        </div>
        <button
          type="button"
          className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          onClick={onClose}
          aria-label="Đóng bảng thông tin"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="atlas-detail-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-3 pt-2">
        {muscle && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
              {group?.vi ?? 'Cơ'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{group?.en}</span>
          </div>
        )}

        <p className="text-[12px] leading-relaxed text-slate-600 dark:text-slate-300">
          {description}
        </p>

        {muscle && (
          <>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Bài tập thường dùng
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {muscle.exercises.map((exercise) => (
                  <span
                    key={exercise}
                    className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                  >
                    {exercise}
                  </span>
                ))}
              </div>
            </div>
            {muscle.note && (
              <p className="border-l-2 border-amber-400 pl-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {muscle.note}
              </p>
            )}
          </>
        )}

        {!muscle && chosen && !EXPLANATIONS[String(chosen.name).toLowerCase()] && (
          <p className="rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 dark:bg-white/[0.04] dark:text-slate-500">
            Mô tả ở cấp hệ cơ quan · cấu trúc được nhận diện từ bộ dữ liệu nguồn.
          </p>
        )}

        <SystemInfoCard system={system} info={SYSTEM_DETAILS[system?.id]} count={systemCount} />

        <div className="grid grid-cols-2 gap-2 border-y border-slate-200/70 py-2 text-[11px] dark:border-white/10">
          <div>
            <p className="text-slate-500 dark:text-slate-400">Mã tham chiếu</p>
            <p className="mt-0.5 truncate font-semibold text-slate-600 dark:text-slate-300">
              {chosen?.reference ?? chosen?.id ?? '—'}
            </p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400">Số mảnh đã chọn</p>
            <p className="mt-0.5 font-semibold tabular-nums text-slate-600 dark:text-slate-300">
              {formatNumber(selectedParts.length)}
            </p>
          </div>
        </div>

        {selectedParts.length > 1 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Cấu trúc đi kèm
            </p>
            <div className="mt-1 space-y-0.5">
              {selectedParts.slice(0, 60).map((part) => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => onChoosePart(part.id)}
                  className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left text-[11px] text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]"
                >
                  <span className="min-w-0 flex-1 truncate">{part.name}</span>
                  <ChevronRightIcon className="h-3 w-3 shrink-0 text-slate-300" />
                </button>
              ))}
              {selectedParts.length > 60 && (
                <p className="px-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Và {formatNumber(selectedParts.length - 60)} mảnh khác.
                </p>
              )}
            </div>
          </div>
        )}

        <a
          href="https://lifesciencedb.jp/bp3d/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:underline dark:text-brand-300"
        >
          Nguồn giải phẫu BodyParts3D
          <ChevronRightIcon className="h-3 w-3" />
        </a>
      </div>

      <div className="shrink-0 space-y-1 border-t border-slate-200/70 p-2.5 dark:border-white/10">
        <button
          type="button"
          onClick={onIsolate}
          className={clsx(
            'flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold transition',
            isolated
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'bg-slate-800 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
          )}
        >
          <FocusIcon className="h-3.5 w-3.5" />
          {isolated ? 'Hiện vùng xung quanh' : 'Phóng to cấu trúc'}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="w-full rounded-lg py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        >
          Bỏ chọn
        </button>
      </div>
    </aside>
  );
}

function AboutDialog({ atlas, onClose }) {
  return (
    <div className="absolute inset-0 z-[60] grid place-items-center p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Đóng thông tin nguồn"
      />
      <section className="atlas-glass relative max-h-[85%] w-full max-w-md overflow-y-auto rounded-lg p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
              Nguồn & phạm vi
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Một cơ thể, được mở ra.
            </h2>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            onClick={onClose}
            aria-label="Đóng"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 space-y-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            <strong className="font-semibold text-slate-800 dark:text-white">
              Nam · BodyParts3D 4.0
            </strong>
            <br />
            {formatNumber(atlas.parts.length)} mảnh hình học riêng lẻ và{' '}
            {formatNumber(atlas.concepts.length)} cấu trúc được đặt tên từ một mẫu giải phẫu nam
            trưởng thành.
          </p>
          <p>
            Mô hình không chứa mọi cấu trúc hoặc biến thể giải phẫu. Một cấu trúc được đặt tên có
            thể gồm nhiều mảnh; mỗi mảnh nguồn chỉ được hiển thị một lần.
          </p>
          <p>
            Màu sắc và cách phân hệ được tối ưu cho việc khám phá. Hình học đã được đơn giản hóa cho
            web; phần mô tả chỉ mang tính giáo dục, không dùng để chẩn đoán hay phẫu thuật.
          </p>
          <div className="rounded-xl bg-amber-50/80 p-3 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            Metadata 59 cơ của PT Brain được nối với Human Atlas qua FMA ID. 5 cơ trong metadata cũ
            (latissimus dorsi, rectus abdominis, internal oblique, transversus abdominis,
            multifidus) không có hình học trong nguồn BodyParts3D 4.0.
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Giấy phép dữ liệu
            </a>
            <a
              href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Dữ liệu gốc
            </a>
            <a
              href="https://academic.oup.com/nar/article/37/suppl_1/D782/1000752"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Bài báo nguồn
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HumanAtlasExplorer({ onMuscleChange }) {
  const { isDark } = useTheme();
  const [atlas, setAtlas] = useState(null);
  const [state, setState] = useState(INITIAL_STATE);
  const [chosen, setChosen] = useState(null);
  const [details, setDetails] = useState(false);
  const [panel, setPanel] = useState(null);
  const [query, setQuery] = useState('');
  const [about, setAbout] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [systemsCollapsed, setSystemsCollapsed] = useState(false);
  const [status, setStatus] = useState({
    phase: 'loading',
    ready: false,
    loading: true,
    loaded: 0,
    required: 0,
    loadedChunks: 0,
    totalChunks: 0,
    parts: 0,
    totalParts: 0,
  });
  const [error, setError] = useState('');
  const sceneRef = useRef(null);
  const searchRef = useRef(null);
  const chooseRef = useRef(null);

  useEffect(() => {
    const abort = new AbortController();
    setError('');
    fetch('/models/human-atlas/atlas.json', { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Không tải được danh mục giải phẫu.');
        return response.json();
      })
      .then(setAtlas)
      .catch((nextError) => {
        if (nextError.name !== 'AbortError') setError(nextError.message);
      });
    return () => abort.abort();
  }, []);

  useEffect(() => {
    if (panel === 'search') {
      const timer = window.setTimeout(() => searchRef.current?.focus(), 30);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [panel]);

  useEffect(() => {
    if (!expanded) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('atlas-fullscreen');
    return () => {
      document.body.style.overflow = previous;
      document.body.classList.remove('atlas-fullscreen');
    };
  }, [expanded]);

  const partsById = useMemo(
    () => new Map((atlas?.parts ?? []).map((part) => [part.id, part])),
    [atlas],
  );

  const counts = useMemo(() => {
    if (!atlas) return {};
    return Object.fromEntries(
      SYSTEMS.map((system) => [
        system.id,
        atlas.parts.filter((part) => part.system === system.id).length,
      ]),
    );
  }, [atlas]);

  const activeSystems = useMemo(
    () => SYSTEMS.filter((system) => (counts[system.id] ?? 0) > 0),
    [counts],
  );

  const selectedParts = useMemo(
    () => state.selected.map((id) => partsById.get(id)).filter(Boolean),
    [partsById, state.selected],
  );
  const system = useMemo(
    () =>
      systemForConcept(chosen, partsById) ??
      (selectedParts.length ? SYSTEM_BY_ID[dominantSystem(selectedParts)] : null),
    [chosen, partsById, selectedParts],
  );
  const selectedMuscle = useMemo(() => muscleForConcept(chosen), [chosen]);

  const visibleCount = useMemo(() => {
    if (!atlas) return 0;
    return atlas.parts.filter((part) =>
      state.isolate
        ? state.selected.includes(part.id)
        : state.visible.includes(part.system) || state.selected.includes(part.id),
    ).length;
  }, [atlas, state.isolate, state.selected, state.visible]);

  const results = useMemo(() => {
    if (!atlas) return [];
    const term = query.toLowerCase().trim();
    if (!term) {
      return ORGAN_STARTERS.map((name) =>
        atlas.concepts.find((concept) => concept.name.toLowerCase() === name),
      ).filter(Boolean);
    }

    // Vietnamese muscle names are a PT Brain convenience layer, not upstream
    // concept names. A synthetic concept lets one result select every mesh of
    // that muscle while keeping the existing detail/isolate flow.
    const muscleResults = [];
    for (const [slug, meta] of Object.entries(MUSCLES)) {
      if (!meta.vi.toLowerCase().includes(term) && !meta.en.toLowerCase().includes(term)) {
        continue;
      }
      const keywordRow = ATLAS_MUSCLE_KEYWORDS.find((row) => row.slug === slug);
      const elements = atlas.parts
        .filter((part) =>
          (keywordRow?.keywords ?? []).some((keyword) => part.name.toLowerCase().includes(keyword)),
        )
        .map((part) => part.id);
      if (elements.length) {
        muscleResults.push({
          id: `pt:muscle:${slug}`,
          name: meta.en,
          elements,
          reference: (ATLAS_MUSCLE_CONCEPTS[slug] ?? []).join(' · ') || undefined,
        });
      }
    }

    const conceptResults = atlas.concepts
      .filter(
        (concept) =>
          concept.name.toLowerCase().includes(term) || concept.id.toLowerCase().includes(term),
      )
      .sort((a, b) => a.name.length - b.name.length);

    return [...muscleResults, ...conceptResults]
      .filter(
        (concept, index, list) =>
          list.findIndex((candidate) => candidate.id === concept.id) === index,
      )
      .slice(0, 80);
  }, [atlas, query]);

  const selectedMuscleSlug = selectedMuscle?.slug;
  useEffect(() => {
    onMuscleChange?.(
      selectedMuscleSlug
        ? {
            slug: selectedMuscleSlug,
            ...MUSCLES[selectedMuscleSlug],
          }
        : null,
    );
  }, [onMuscleChange, selectedMuscleSlug]);

  const closeDetails = useCallback(() => {
    setDetails(false);
    setChosen(null);
    setState((current) => ({ ...current, selected: [], isolate: false }));
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable;
      if (event.key === '/' && !typing) {
        event.preventDefault();
        setDetails(false);
        setPanel('search');
      }
      if (event.key === 'Escape') {
        if (panel) setPanel(null);
        else if (about) setAbout(false);
        else if (expanded) setExpanded(false);
        else if (details) closeDetails();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [about, closeDetails, details, expanded, panel]);

  const showOnly = (systemId) => {
    setState((current) => ({ ...current, visible: [systemId], selected: [], isolate: false }));
    setDetails(false);
    setChosen(null);
    void sceneRef.current?.ensureSystem(systemId);
  };

  const toggleSystem = (systemId) => {
    setState((current) => ({
      ...current,
      selected: [],
      isolate: false,
      visible: current.visible.includes(systemId)
        ? current.visible.filter((id) => id !== systemId)
        : [...current.visible, systemId],
    }));
    setDetails(false);
    setChosen(null);
  };

  const applyPreset = (ids) => {
    setState((current) => ({ ...current, visible: ids, selected: [], isolate: false }));
    setDetails(false);
    setChosen(null);
    ids.forEach((id) => {
      void sceneRef.current?.ensureSystem(id);
    });
  };

  const choosePart = (id) => {
    const part = partsById.get(id);
    if (!part) return;
    setChosen({ id: part.conceptId, name: part.name, elements: [id] });
    setState((current) => ({
      ...current,
      visible: current.visible.includes(part.system)
        ? current.visible
        : [...current.visible, part.system],
      selected: [id],
      isolate: false,
      highlightSelection: true,
      rotate: false,
    }));
    setDetails(true);
    setPanel(null);
  };

  const chooseConcept = (concept) => {
    if (!concept) return;
    const primarySystem = systemForConcept(concept, partsById)?.id;
    setChosen(concept);
    setState((current) => ({
      ...current,
      visible:
        primarySystem && !current.visible.includes(primarySystem)
          ? [...current.visible, primarySystem]
          : current.visible,
      selected: concept.elements,
      isolate: false,
      highlightSelection: true,
      rotate: false,
    }));
    setDetails(true);
    setPanel(null);
    void sceneRef.current?.ensureParts(concept.elements);
  };

  const reset = () => {
    setState((current) => ({ ...INITIAL_STATE, reset: current.reset + 1 }));
    setChosen(null);
    setDetails(false);
    setPanel(null);
  };

  const changeView = (view) => {
    setState((current) => ({ ...current, view, reset: current.reset + 1, rotate: false }));
  };

  const changeExplode = (value) => {
    setState((current) => ({
      ...current,
      explode: value,
      view: value > 0.8 ? 'front' : current.view,
      rotate: false,
    }));
  };

  const toggleIsolate = () => {
    setState((current) => ({
      ...current,
      isolate: !current.isolate,
      highlightSelection: false,
      explode: 0,
    }));
  };

  chooseRef.current = chooseConcept;

  useEffect(() => {
    if (!atlas) return undefined;
    return registerAtlasTools(atlas, (concept) => chooseRef.current?.(concept));
  }, [atlas]);

  const sceneState = useMemo(
    () => ({
      ...state,
      inspectorOpen: details && selectedParts.length > 0,
      layersOpen: !systemsCollapsed,
    }),
    [details, selectedParts.length, state, systemsCollapsed],
  );

  const loadingProgress =
    status.required > 0 ? Math.round((status.loaded / status.required) * 100) : 0;

  return (
    <div
      className={clsx(
        'w-full overflow-hidden border border-slate-200/80 bg-[#f2f3f3] shadow-[0_20px_60px_-35px_rgba(15,23,42,0.45)] dark:border-white/[0.06] dark:bg-[#0b1220]',
        expanded
          ? 'fixed inset-0 z-[80] rounded-none border-0'
          : 'relative h-[calc(100dvh-255px)] min-h-[480px] rounded-lg sm:min-h-[600px]',
      )}
    >
      {atlas && (
        <AtlasScene
          ref={sceneRef}
          atlas={atlas}
          state={sceneState}
          onSelect={choosePart}
          onStatus={setStatus}
          onError={setError}
          theme={isDark ? 'dark' : 'light'}
        />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_51%_43%,transparent_35%,rgba(131,145,158,0.08)_100%)]" />

      <>
        <div className="atlas-identity pointer-events-none absolute left-4 top-4 z-20 max-md:left-3 max-md:top-3">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
            Interactive anatomy
          </p>
          <h2 className="mt-1.5 flex items-center gap-2 text-[26px] font-bold tracking-[-0.04em] text-slate-900 max-md:text-[22px] dark:text-white">
            Human Atlas
            <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[11px] font-semibold tracking-normal text-slate-500 dark:text-slate-400 dark:border-white/10 dark:text-slate-500">
              3D
            </span>
          </h2>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-500">
            {atlas ? formatNumber(atlas.parts.length) : '2.234'} mảnh · BodyParts3D 4.0
          </p>
        </div>

        <div className="absolute right-3 top-3 z-30 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setDetails(false);
              setPanel((current) => (current === 'search' ? null : 'search'));
            }}
            className="atlas-glass inline-flex h-9 items-center gap-2 rounded-xl px-3 text-[11px] font-semibold text-slate-600 transition hover:bg-white dark:text-slate-300 dark:hover:bg-white/10"
            aria-label="Tìm cấu trúc giải phẫu"
          >
            <SearchIcon className="h-3.5 w-3.5" />
            <span className="max-md:hidden">Tìm cấu trúc</span>
            <kbd className="hidden rounded border border-slate-200 px-1 text-[11px] font-normal text-slate-500 dark:text-slate-400 lg:inline dark:border-white/10 dark:text-slate-500">
              /
            </kbd>
          </button>
          <IconButton
            label="Nguồn và giới hạn dữ liệu"
            onClick={() => {
              setDetails(false);
              setPanel(null);
              setAbout(true);
            }}
          >
            <InfoIcon />
          </IconButton>
          <IconButton
            label={expanded ? 'Thoát toàn màn hình' : 'Mở toàn màn hình'}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? <MinimizeIcon /> : <ExpandIcon />}
          </IconButton>
        </div>

        <div
          className={clsx(
            'absolute left-3 top-[8.2rem] z-30 max-h-[calc(100%-12.5rem)] w-[248px] max-md:inset-x-3 max-md:bottom-20 max-md:top-auto max-md:max-h-[58%] max-md:w-auto',
            panel === 'systems' ? 'block' : systemsCollapsed ? 'hidden' : 'hidden md:block',
          )}
        >
          <SystemsPanel
            counts={counts}
            activeSystems={activeSystems}
            visible={state.visible}
            visibleCount={visibleCount}
            onToggle={toggleSystem}
            onOnly={showOnly}
            onPreset={applyPreset}
            onClose={() => setPanel(null)}
            onCollapse={() => setSystemsCollapsed(true)}
          />
        </div>

        {systemsCollapsed && (
          <button
            type="button"
            onClick={() => setSystemsCollapsed(false)}
            className="atlas-glass absolute left-3 top-[8.2rem] z-30 hidden items-center gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-lg transition hover:bg-white md:flex dark:text-slate-300 dark:hover:bg-white/10"
            aria-label="Mở lại bảng hệ cơ quan"
            title="Mở lại bảng hệ cơ quan"
          >
            <LayersIcon className="h-3.5 w-3.5 text-brand-600 dark:text-brand-300" />
            <span>Hệ cơ quan</span>
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
              {activeSystems.length}
            </span>
          </button>
        )}

        {panel === 'search' && (
          <SearchPanel
            atlas={atlas ?? { concepts: [] }}
            partsById={partsById}
            query={query}
            setQuery={setQuery}
            inputRef={searchRef}
            results={results}
            onChoose={chooseConcept}
            onClose={() => setPanel(null)}
          />
        )}

        <ViewControls
          view={state.view}
          rotate={state.rotate}
          explode={state.explode}
          onChangeView={changeView}
          onRotate={() => setState((current) => ({ ...current, rotate: !current.rotate }))}
          onReset={reset}
        />

        <p className="pointer-events-none absolute bottom-[5.7rem] left-1/2 z-10 w-[calc(100%-2rem)] -translate-x-1/2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 dark:text-slate-500">
          {state.isolate
            ? (chosen?.name ?? 'Cấu trúc đang chọn')
            : state.explode > 0.95
              ? 'Danh mục giải phẫu'
              : state.explode > 0.05
                ? 'Các cấu trúc đã tách'
                : 'Nam trưởng thành · BodyParts3D 4.0'}
        </p>

        <BottomDock
          explode={state.explode}
          onExplode={changeExplode}
          onReset={reset}
          onSystems={() => {
            setDetails(false);
            setPanel((current) => (current === 'systems' ? null : 'systems'));
          }}
        />

        <div className="pointer-events-none absolute bottom-1.5 left-4 right-4 z-10 hidden items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 md:flex dark:text-slate-500">
          <span>Kéo để xoay · Cuộn để zoom · Bấm để xem cấu trúc</span>
          <a
            href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html"
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto font-semibold hover:text-brand-600 dark:hover:text-brand-300"
          >
            BodyParts3D · CC BY 4.0
          </a>
        </div>

        {details && selectedParts.length > 0 && (
          <DetailPanel
            chosen={chosen}
            selectedParts={selectedParts}
            system={system}
            systemCount={counts[system?.id] ?? 0}
            muscle={selectedMuscle}
            onChoosePart={choosePart}
            onClose={closeDetails}
            onIsolate={toggleIsolate}
            onClear={closeDetails}
            isolated={state.isolate}
          />
        )}

        {status.ready && status.loading && (
          <div className="atlas-glass absolute right-3 top-[3.6rem] z-20 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-300">
            <Spinner className="h-3 w-3" />
            Đang tải hệ…
          </div>
        )}

        {(!status.ready || !atlas) && !error && (
          <div className="absolute inset-0 z-50 grid place-items-center bg-white/65 p-4 backdrop-blur-sm dark:bg-slate-950/65">
            <div className="atlas-glass w-full max-w-xs rounded-lg p-4 text-center">
              <Spinner className="mx-auto h-7 w-7 text-brand-600 dark:text-brand-300" />
              <p className="mt-3 text-xs font-semibold text-slate-800 dark:text-white">
                Đang chuẩn bị giải phẫu
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                {atlas
                  ? `${loadingProgress}% · ${status.loaded}/${status.required || '…'} nhóm hệ cơ quan`
                  : 'Đang tải danh mục 2.234 mảnh…'}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-500 transition-all"
                  style={{ width: `${atlas ? Math.max(4, loadingProgress) : 8}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Chỉ tải hình học của hệ cơ và xương trước; các hệ khác được tải khi bạn mở.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
            <div className="atlas-glass w-full max-w-sm rounded-lg p-4 text-center">
              <InfoIcon className="mx-auto h-7 w-7 text-amber-400" />
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                Không tải được mô hình 3D
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {error}
              </p>
              <button
                type="button"
                className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-[11px] font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </button>
            </div>
          </div>
        )}

        {about && atlas && <AboutDialog atlas={atlas} onClose={() => setAbout(false)} />}
      </>
    </div>
  );
}
