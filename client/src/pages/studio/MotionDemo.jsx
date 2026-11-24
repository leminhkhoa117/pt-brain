import { useEffect, useState } from 'react';
import { Icon } from '../../components/ui.jsx';
import { MOTION } from '../../theme/variants.js';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function motionLabel(motion) {
  const preset = MOTION[motion] || MOTION.subtle;
  if (motion === 'off') return 'Không animation';
  return `Vào trang ${preset.pageDuration} · hover ${preset.dur}`;
}

/**
 * Dải xem trước nhịp chuyển động: một khung nhỏ trượt vào theo đúng
 * page-duration / page-rise và một ô transition dùng đúng --ts-dur.
 * Đổi lựa chọn hoặc bấm "Chạy lại" để xem lại; tôn trọng reduced motion.
 */
export default function MotionDemo({ motion, vars }) {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event) => setReduced(event.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);

  const off = motion === 'off';

  return (
    <div className="motion-demo" style={vars}>
      <div className="motion-demo-head">
        <div className="min-w-0">
          <p className="motion-demo-kicker">Xem trước nhịp</p>
          <p className="motion-demo-meta">{motionLabel(motion)}</p>
        </div>
        <button
          type="button"
          className="btn-ghost btn-sm shrink-0"
          onClick={() => setRun((current) => current + 1)}
          disabled={off}
        >
          <Icon name="refresh" className="h-3.5 w-3.5" />
          Chạy lại
        </button>
      </div>

      <div className="motion-demo-stage" key={`${motion}-${run}`} aria-hidden="true">
        <div className="motion-demo-lane">
          <span className="motion-demo-caption">Vào trang</span>
          <div className="motion-demo-scene">
            <span className="motion-demo-ghost" />
            <span className="motion-demo-ghost motion-demo-ghost-b" />
            <span className="motion-demo-page">
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
        <div className="motion-demo-lane">
          <span className="motion-demo-caption">Transition</span>
          <div className="motion-demo-scene motion-demo-scene-hover">
            <span className="motion-demo-hover">Card</span>
          </div>
        </div>
      </div>

      <p className="motion-demo-note" role="status" aria-live="polite">
        {off
          ? 'Tắt: mọi transition về 0ms, trang và panel đổi trạng thái ngay.'
          : reduced
            ? 'Hệ điều hành đang bật “giảm chuyển động”, nên bản xem trước đứng yên.'
            : 'Hai ô trên chạy đúng thời lượng của lựa chọn này. Đổi lựa chọn để xem lại.'}
      </p>
    </div>
  );
}
