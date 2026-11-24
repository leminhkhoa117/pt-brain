import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { Icon } from '../../components/ui.jsx';

const NAV = ['Tổng quan', 'Cơ thể', 'Dinh dưỡng', 'Giáo án'];

const METRICS = [
  { label: 'Cân nặng', value: '72,4', unit: 'kg', note: 'MA7 72,8 kg' },
  { label: '% mỡ', value: '18,6', unit: '%', note: 'US Navy' },
  { label: 'Volume', value: '8.420', unit: 'kg', note: '7 ngày' },
  { label: 'Ngủ', value: '7:20', unit: 'giờ', note: 'TB tuần' },
];

const ROWS = [
  ['Bench Press', '4 × 8', '72,5 kg'],
  ['Row', '4 × 10', '60 kg'],
  ['Squat', '3 × 6', '95 kg'],
];

export default function ThemeStage({ vars, config, isDark }) {
  const stageRef = useRef(null);
  const cursorRef = useRef(null);
  const { cursor, hover } = config.effects;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    let raf = 0;
    let panel = null;
    let last = null;

    const paintSpotlight = () => {
      raf = 0;
      if (!panel || !last || !panel.isConnected) return;
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty('--ts-mx', `${last.x - rect.left}px`);
      panel.style.setProperty('--ts-my', `${last.y - rect.top}px`);
    };

    const onMove = (event) => {
      const rect = stage.getBoundingClientRect();
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${event.clientX - rect.left}px, ${
          event.clientY - rect.top
        }px, 0)`;
      }
      if (hover === 'spotlight') {
        const next = event.target?.closest?.('.panel');
        if (next && stage.contains(next)) {
          panel = next;
          last = { x: event.clientX, y: event.clientY };
          if (!raf) raf = requestAnimationFrame(paintSpotlight);
        }
      }
    };

    stage.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      stage.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cursor, hover]);

  return (
    <div
      ref={stageRef}
      className={clsx('studio-stage', isDark && 'dark')}
      style={vars}
      data-ts-mode={isDark ? 'dark' : 'light'}
      aria-label="Xem trước giao diện"
    >
      <div className="ts-stage-bg" data-ts-bg={config.effects.bg} aria-hidden="true">
        <div className="ts-aurora" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div
        className="ts-stage-texture"
        data-ts-texture={config.effects.texture}
        aria-hidden="true"
      />

      <div
        key={config.effects.motion}
        className="studio-window animate-fade-up"
        data-motion={config.effects.motion}
        aria-hidden="true"
      >
        <div className="studio-mini-shell app-shell">
          <div className="studio-mini-brand">
            <span>PT</span>
            <b>PT Brain</b>
          </div>
          {NAV.map((label, index) => (
            <div key={label} className="studio-mini-nav" data-active={index === 0}>
              <i />
              {label}
            </div>
          ))}
          <div className="mt-auto space-y-1">
            <div className="studio-mini-nav">
              <i />
              Cài đặt
            </div>
            <div className="studio-mini-nav">
              <i />
              Theme Studio
            </div>
          </div>
        </div>

        <div className="studio-mini-main">
          <div className="studio-mini-header app-header">
            <div className="app-breadcrumb">
              <span>Hôm nay</span>
              <span>/</span>
              <b>Tổng quan</b>
            </div>
            <span
              className="grid h-6 w-6 place-items-center rounded border border-line bg-surface text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300"
              aria-hidden="true"
            >
              <Icon name={isDark ? 'sun' : 'moon'} className="h-3 w-3" />
            </span>
            <span className="studio-mini-dot" aria-hidden="true" />
          </div>

          <div className="studio-mini-body">
            <div className="page-head">
              <div className="min-w-0">
                <h1 className="page-title">Tổng quan</h1>
                <p className="page-sub">
                  Buổi tập hôm nay đã sẵn sàng. Dữ liệu cơ thể cập nhật 2 giờ trước.
                </p>
                <div className="page-meta">
                  <span>Thứ hai, 23/11</span>
                  <span>/</span>
                  <span>Tuần 4 · Block 2</span>
                </div>
              </div>
            </div>

            <div className="metric-strip">
              {METRICS.map((item) => (
                <div key={item.label} className="metric">
                  <p className="metric-label">{item.label}</p>
                  <p className="metric-value">
                    {item.value}
                    <span className="metric-unit">{item.unit}</span>
                  </p>
                  <p className="metric-note">{item.note}</p>
                </div>
              ))}
            </div>

            <div className="studio-mini-grid">
              <section className="panel studio-mini-panel">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="panel-title">Ghi buổi tập</h2>
                    <p className="panel-note">Upper A · 4 bài</p>
                  </div>
                  <span className="badge badge-pine">Hôm nay</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="label">Cân nặng</span>
                    <input className="input" defaultValue="72,4" readOnly tabIndex={-1} />
                  </label>
                  <label className="block">
                    <span className="label">Bài tập</span>
                    <select className="select" defaultValue="bench" aria-label="Bài tập" tabIndex={-1}>
                      <option value="bench">Bench Press</option>
                      <option value="row">Row</option>
                      <option value="squat">Squat</option>
                    </select>
                  </label>
                </div>

                <div className="studio-mini-actions">
                  <button type="button" className="btn btn-primary btn-sm" tabIndex={-1}>
                    <Icon name="check" className="h-3 w-3" />
                    Lưu buổi tập
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" tabIndex={-1}>
                    Đổi giáo án
                  </button>
                  <span className="badge badge-neutral">RPE 8</span>
                </div>
              </section>

              <section className="panel studio-mini-panel">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="panel-title">Bài đã ghi</h2>
                    <p className="panel-note">3 set gần nhất</p>
                  </div>
                  <span className="badge badge-warn">MA7</span>
                </div>

                <table className="table-clinical mt-2">
                  <thead>
                    <tr>
                      <th>Bài</th>
                      <th>Set</th>
                      <th className="text-right">Tạ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map(([name, sets, load]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td className="num">{sets}</td>
                        <td className="num text-right">{load}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="studio-mini-tabs">
                  <div className="tabbar" role="tablist" aria-label="Mẫu tab">
                    <button type="button" className="tab tab-active" role="tab" aria-selected="true" tabIndex={-1}>
                      Tuần này
                    </button>
                    <button type="button" className="tab" role="tab" aria-selected="false" tabIndex={-1}>
                      Tháng
                    </button>
                    <button type="button" className="tab" role="tab" aria-selected="false" tabIndex={-1}>
                      Tất cả
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {cursor !== 'none' ? (
        <div
          ref={cursorRef}
          className="ts-cursor ts-cursor-local"
          data-ts-cursor={cursor}
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
