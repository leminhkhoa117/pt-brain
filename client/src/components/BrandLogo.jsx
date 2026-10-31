import { useId } from 'react';

/**
 * Logo PT Brain: quả tạ (gym) nằm trong quỹ đạo electron (science).
 * Dùng SVG nên sắc nét ở mọi kích thước và tự đổi màu theo theme.
 */
export default function BrandLogo({ size = 40, className = '', glow = false }) {
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9_-]/g, '');
  const bgId = `ptb-bg-${uid}`;
  const barId = `ptb-bar-${uid}`;

  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          className="absolute inset-0 rounded-[28%] bg-brand-400/30 blur-lg"
          aria-hidden="true"
        />
      )}
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        role="img"
        aria-label="PT Brain"
        className="relative drop-shadow-[0_6px_16px_rgba(13,148,136,0.25)]"
      >
        <defs>
          <linearGradient id={bgId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0b1220" />
            <stop offset="1" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id={barId} x1="25" y1="32" x2="39" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a7f3d5" />
            <stop offset="1" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="62" height="62" rx="17" fill={`url(#${bgId})`} />
        <circle cx="52" cy="12" r="9" fill="#34d399" opacity=".12" />
        <ellipse
          cx="32"
          cy="32"
          rx="23"
          ry="8.5"
          transform="rotate(32 32 32)"
          fill="none"
          stroke="#5eead4"
          strokeWidth="1.4"
          opacity=".55"
        />
        <g transform="rotate(-38 32 32)">
          <rect x="16.5" y="26" width="5" height="12" rx="2.5" fill="#ecfdf7" />
          <rect x="21.5" y="24.5" width="3.5" height="15" rx="1.75" fill="#a7f3d5" />
          <rect x="25" y="29" width="14" height="6" rx="3" fill={`url(#${barId})`} />
          <rect x="39" y="24.5" width="3.5" height="15" rx="1.75" fill="#a7f3d5" />
          <rect x="42.5" y="26" width="5" height="12" rx="2.5" fill="#ecfdf7" />
        </g>
        <circle cx="51.5" cy="17.5" r="2" fill="#fbbf24" />
        <circle cx="13.5" cy="45" r="1.5" fill="#5eead4" />
      </svg>
    </span>
  );
}
