import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Badge, Icon, PageHeader, Panel } from '../components/ui.jsx';
import { useTheme } from '../hooks/useTheme.jsx';
import { buildBaseVars, buildStudioVars } from '../theme/apply.js';
import {
  COMPONENT_GROUPS,
  DEFAULT_CUSTOMIZATION,
  EFFECT_GROUPS,
  SHAPES,
  THEMES,
  THEME_FAMILIES,
  TYPE_PAIRS,
  countActiveEffects,
  countComponentChanges,
  getComponentLabel,
  getOptionLabel,
  getShape,
  getTheme,
  getTypePair,
  normalizeCustomization,
} from '../theme/presets.js';
import { componentVarsFor, effectVars } from '../theme/variants.js';
import ThemeStage from './studio/ThemeStage.jsx';
import VariantSample from './studio/VariantSample.jsx';
import OptionGlyph from './studio/OptionGlyph.jsx';
import MotionDemo from './studio/MotionDemo.jsx';

const TABS = [
  { id: 'theme', label: 'Bảng màu', icon: 'palette', count: THEMES.length },
  {
    id: 'effects',
    label: 'Hiệu ứng',
    icon: 'sparkles',
    count: EFFECT_GROUPS.reduce((total, group) => total + group.options.length, 0),
  },
  {
    id: 'components',
    label: 'Component',
    icon: 'layers',
    count: COMPONENT_GROUPS.reduce((total, group) => total + group.options.length, 0),
  },
];

function clockLabel() {
  return new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function Studio() {
  const { customization, isDark, toggle, applyCustomization } = useTheme();
  const [draft, setDraft] = useState(() => normalizeCustomization(customization));
  const [tab, setTab] = useState('theme');
  const [family, setFamily] = useState('all');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setDraft(normalizeCustomization(customization));
  }, [customization]);

  const mode = isDark ? 'dark' : 'light';
  const settled = useMemo(() => normalizeCustomization(customization), [customization]);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settled), [draft, settled]);
  const previewVars = useMemo(() => buildStudioVars(draft, mode), [draft, mode]);
  const baseVars = useMemo(() => buildBaseVars(draft, mode), [draft, mode]);
  const motionVars = useMemo(() => effectVars(draft.effects), [draft.effects]);

  const draftTheme = getTheme(draft.themeId);
  const appliedTheme = getTheme(settled.themeId);
  const draftType = getTypePair(draft.typeId);
  const draftShape = getShape(draft.shapeId);
  const activeEffects = countActiveEffects(settled.effects);
  const changedComponents = countComponentChanges(settled.components);

  const visibleThemes = family === 'all' ? THEMES : THEMES.filter((theme) => theme.family === family);

  const variantStyle = (group, value) => ({
    ...baseVars,
    ...componentVarsFor(group, value, mode),
  });

  const patch = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const pickTheme = (themeId) =>
    setDraft((current) => ({ ...current, themeId, accentOverride: null }));
  const patchEffect = (key, value) =>
    setDraft((current) => ({
      ...current,
      effects: { ...current.effects, [key]: value },
    }));
  const patchComponent = (key, value) =>
    setDraft((current) => ({
      ...current,
      components: { ...current.components, [key]: value },
    }));

  const apply = () => {
    const next = normalizeCustomization(draft);
    applyCustomization(next);
    setDraft(next);
    setStatus(`Đã áp dụng lúc ${clockLabel()}. Cấu hình được lưu trên thiết bị này.`);
  };

  const revert = () => {
    setDraft(settled);
    setStatus('Đã hoàn tác về cấu hình đang dùng.');
  };

  const resetAll = () => {
    setDraft(normalizeCustomization(DEFAULT_CUSTOMIZATION));
    setStatus('Đã đưa bản nháp về mặc định. Bấm “Áp dụng ngay” để ghi lại.');
  };

  return (
    <div>
      <PageHeader
        title="Theme Studio"
        subtitle="Chọn bảng màu, kiểu chữ, hiệu ứng và biến thể cho từng component. Mọi thứ chỉ đổi khi bạn bấm Áp dụng — và đổi ngay lập tức, không cần tải lại."
        meta={
          <>
            <Badge tone={dirty ? 'warn' : 'pine'}>
              {dirty ? 'Có thay đổi chưa áp dụng' : 'Đã đồng bộ'}
            </Badge>
            <span>Đang dùng · {appliedTheme.name}</span>
            <span className="hidden text-line-strong dark:text-white/20 sm:inline">/</span>
            <span>20 theme</span>
            <span className="hidden text-line-strong dark:text-white/20 sm:inline">/</span>
            <span className="hidden sm:inline">Lưu trên thiết bị này</span>
          </>
        }
        actions={
          <>
            <button type="button" className="btn-secondary" onClick={revert} disabled={!dirty}>
              <Icon name="refresh" className="h-3.5 w-3.5" />
              Hoàn tác
            </button>
            <button type="button" className="btn-primary" onClick={apply} disabled={!dirty}>
              <Icon name="check" className="h-3.5 w-3.5" />
              Áp dụng ngay
            </button>
          </>
        }
      />

      <div className="metric-strip mb-6" aria-label="Cấu hình đang áp dụng">
        <div className="metric">
          <p className="metric-label">Theme</p>
          <p className="metric-value !text-[22px]">{appliedTheme.name}</p>
          <p className="metric-note">
            {settled.accentOverride ? `Accent tùy chỉnh ${settled.accentOverride}` : appliedTheme.note}
          </p>
        </div>
        <div className="metric">
          <p className="metric-label">Chế độ</p>
          <p className="metric-value !text-[22px]">{isDark ? 'Tối' : 'Sáng'}</p>
          <p className="metric-note">{draftType.name} · {draftShape.name}</p>
        </div>
        <div className="metric">
          <p className="metric-label">Hiệu ứng</p>
          <p className="metric-value !text-[22px]">
            {activeEffects}
            <span className="metric-unit">tuỳ chỉnh</span>
          </p>
          <p className="metric-note">
            {getOptionLabel('bg', settled.effects.bg)} · {getOptionLabel('texture', settled.effects.texture)} ·{' '}
            {getOptionLabel('cursor', settled.effects.cursor)}
          </p>
        </div>
        <div className="metric">
          <p className="metric-label">Component</p>
          <p className="metric-value !text-[22px]">
            {changedComponents}
            <span className="metric-unit">đổi</span>
          </p>
          <p className="metric-note">
            {COMPONENT_GROUPS.length} nhóm · {COMPONENT_GROUPS.reduce((n, g) => n + g.options.length, 0)}{' '}
            biến thể
          </p>
        </div>
      </div>

      <div className="tabbar studio-tabbar" role="tablist" aria-label="Khu vực chỉnh giao diện">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={clsx('tab', tab === item.id && 'tab-active')}
          >
            <Icon name={item.icon} className="h-3.5 w-3.5" />
            {item.label}
            <span className="studio-count">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="studio-layout">
        <div className="min-w-0">
          {tab === 'theme' ? (
            <>
              <Panel
                title="Bảng màu"
                note={`${THEMES.length} theme dựng trên cùng hệ token. Mỗi theme có đủ bản sáng và tối.`}
                actions={<Badge tone="neutral">{visibleThemes.length} theme</Badge>}
              >
                <div className="studio-chip-row mb-3">
                  {THEME_FAMILIES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="studio-chip"
                      aria-pressed={family === item.id}
                      onClick={() => setFamily(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="theme-grid">
                  {visibleThemes.map((theme) => {
                    const active = draft.themeId === theme.id;
                    const inUse = settled.themeId === theme.id && !settled.accentOverride;
                    const activeAccent = draft.accentOverride || theme.accent;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        className="theme-card"
                        data-active={active}
                        aria-pressed={active}
                        onClick={() => pickTheme(theme.id)}
                        style={
                          active
                            ? {
                                borderColor: activeAccent,
                                boxShadow: `0 0 0 2px ${activeAccent}24, 0 10px 24px -20px ${activeAccent}`,
                              }
                            : undefined
                        }
                      >
                        <span className="theme-swatch" aria-hidden="true">
                          <span style={{ background: theme.accent }} />
                          <span style={{ background: theme.surfaces.light.paper }} />
                          <span style={{ background: theme.surfaces.light.surface }} />
                          <span style={{ background: theme.surfaces.dark.paper }} />
                          <span style={{ background: theme.surfaces.dark.surface }} />
                        </span>
                        <span>
                          <span className="theme-name">
                            <span className="truncate">{theme.name}</span>
                            {inUse ? (
                              <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.08em] text-pine-700 dark:text-pine-300">
                                Đang dùng
                              </span>
                            ) : null}
                          </span>
                          <span className="theme-note">{theme.note}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 border-t border-line pt-4 dark:border-white/[0.08]">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="label !mb-1">Màu nhấn tùy chỉnh</p>
                      <p className="text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400">
                        Đổi accent nhưng giữ nguyên bề mặt và mực của theme.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="grid h-9 w-9 cursor-pointer place-items-center overflow-hidden rounded-md border border-line dark:border-white/15">
                        <input
                          type="color"
                          value={draft.accentOverride || draftTheme.accent}
                          onChange={(event) => patch('accentOverride', event.target.value)}
                          className="h-11 w-11 cursor-pointer border-0 bg-transparent p-0"
                          aria-label="Chọn màu nhấn"
                        />
                      </label>
                      <span className="font-mono text-[11px] tabular-nums text-slate-600 dark:text-slate-300">
                        {draft.accentOverride || draftTheme.accent}
                      </span>
                      {draft.accentOverride ? (
                        <button
                          type="button"
                          className="btn-ghost btn-sm"
                          onClick={() => patch('accentOverride', null)}
                        >
                          Bỏ
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {THEMES.slice(0, 12).map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => patch('accentOverride', theme.accent)}
                        className="h-5 w-5 rounded-full border border-black/10 transition-transform hover:scale-110 dark:border-white/20"
                        style={{ background: theme.accent }}
                        title={`Dùng accent ${theme.name}`}
                        aria-label={`Dùng accent ${theme.name}`}
                      />
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel
                title="Kiểu chữ"
                note="Đổi cặp font hiển thị toàn app: tiêu đề, UI và số liệu."
                className="mt-4"
                actions={<Badge tone="neutral">{draftType.name}</Badge>}
              >
                <div className="opt-grid">
                  {TYPE_PAIRS.map((pair) => (
                    <button
                      key={pair.id}
                      type="button"
                      className="opt-tile"
                      aria-pressed={draft.typeId === pair.id}
                      onClick={() => patch('typeId', pair.id)}
                    >
                      <span className="type-sample">
                        <strong style={{ fontFamily: pair.display }}>{pair.sample}</strong>
                        <em style={{ fontFamily: pair.mono }}>72.4 kg</em>
                      </span>
                      <span>
                        <span className="opt-label">{pair.name}</span>
                        <span className="opt-note block">{pair.note}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel
                title="Độ bo góc"
                note="Áp dụng cho nút, input, panel, tab và badge cùng lúc."
                className="mt-4"
                actions={<Badge tone="neutral">{draftShape.name}</Badge>}
              >
                <div className="opt-grid">
                  {SHAPES.map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      className="opt-tile"
                      aria-pressed={draft.shapeId === shape.id}
                      onClick={() => patch('shapeId', shape.id)}
                    >
                      <span className="shape-sample">
                        <i style={{ borderRadius: `${shape.radius * 8}px` }} />
                      </span>
                      <span>
                        <span className="opt-label">{shape.name}</span>
                        <span className="opt-note block">{shape.note}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </Panel>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-paper-2/40 px-3 py-2.5 dark:border-white/[0.08] dark:bg-white/[0.02]">
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400">
                  Bản nháp hiện tại: {draftTheme.name} · {draftType.name} · {draftShape.name}
                </p>
                <button type="button" className="btn-secondary btn-sm" onClick={resetAll}>
                  Về mặc định
                </button>
              </div>
            </>
          ) : null}

          {tab === 'effects' ? (
            <>
              {EFFECT_GROUPS.map((group) => (
                <Panel
                  key={group.key}
                  title={group.label}
                  note={group.note}
                  className={group.key === 'motion' ? '' : 'mt-4'}
                  actions={
                    <Badge tone="neutral">{getOptionLabel(group.key, draft.effects[group.key])}</Badge>
                  }
                >
                  {group.key === 'motion' ? (
                    <MotionDemo motion={draft.effects.motion} vars={motionVars} />
                  ) : null}
                  <div className={clsx('opt-grid', group.key === 'bg' && 'cols-3')}>
                    {group.options.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="opt-tile"
                        aria-pressed={draft.effects[group.key] === option.value}
                        onClick={() => patchEffect(group.key, option.value)}
                      >
                        <OptionGlyph group={group.key} value={option.value} />
                        <span>
                          <span className="opt-label">{option.label}</span>
                          <span className="opt-note block">{option.note}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </Panel>
              ))}

              <div className="mt-4 rounded-lg border border-line bg-paper-2/40 px-3 py-2.5 text-[11.5px] leading-relaxed text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-slate-400">
                Hiệu ứng nền, texture và con trỏ chỉ là lớp trang trí — không chặn thao tác. Nếu hệ
                điều hành bật <span className="font-mono text-[10.5px]">prefers-reduced-motion</span>,
                chuyển động tự giảm về gần như đứng yên.
              </div>
            </>
          ) : null}

          {tab === 'components' ? (
            <>
              {COMPONENT_GROUPS.map((group, index) => (
                <Panel
                  key={group.key}
                  title={group.label}
                  note={group.note}
                  className={index === 0 ? '' : 'mt-4'}
                  actions={
                    <Badge tone="neutral">
                      {getComponentLabel(group.key, draft.components[group.key])}
                    </Badge>
                  }
                >
                  <div className="variant-row">
                    {group.options.map((option) => {
                      const active = draft.components[group.key] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className="variant-tile"
                          aria-pressed={active}
                          onClick={() => patchComponent(group.key, option.value)}
                          style={variantStyle(group.key, option.value)}
                        >
                          <span className="variant-sample">
                            <VariantSample group={group.key} />
                          </span>
                          <span className="variant-caption">
                            <span>{option.label}</span>
                            {active ? (
                              <Icon name="check" className="h-3 w-3 text-pine-700 dark:text-pine-300" />
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Panel>
              ))}
            </>
          ) : null}
        </div>

        <div className="studio-preview min-w-0">
          <Panel
            title="Xem trước trực tiếp"
            note={dirty ? 'Bản nháp — chưa áp dụng lên trang.' : 'Đang khớp với cấu hình áp dụng.'}
            actions={
              <button type="button" className="btn-secondary btn-sm" onClick={toggle}>
                <Icon name={isDark ? 'sun' : 'moon'} className="h-3.5 w-3.5" />
                {isDark ? 'Xem bản sáng' : 'Xem bản tối'}
              </button>
            }
          >
            <ThemeStage vars={previewVars} config={draft} isDark={isDark} />

            <div className="studio-summary">
              <Badge tone="pine">{draftTheme.name}</Badge>
              <Badge tone="neutral">{draftType.name}</Badge>
              <Badge tone="neutral">{draftShape.name}</Badge>
              <Badge tone="neutral">{countActiveEffects(draft.effects)} hiệu ứng</Badge>
              <Badge tone="neutral">{countComponentChanges(draft.components)} component đổi</Badge>
            </div>

            <button
              type="button"
              className="btn-primary mt-4 w-full"
              onClick={apply}
              disabled={!dirty}
            >
              <Icon name="check" className="h-4 w-4" />
              Áp dụng ngay
            </button>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" className="btn-secondary" onClick={revert} disabled={!dirty}>
                <Icon name="refresh" className="h-3.5 w-3.5" />
                Hoàn tác
              </button>
              <button type="button" className="btn-ghost" onClick={resetAll}>
                Mặc định
              </button>
            </div>

            <p className="studio-status" role="status" aria-live="polite">
              {status || 'Chọn một theme rồi bấm Áp dụng. Cấu hình lưu trong trình duyệt này.'}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
