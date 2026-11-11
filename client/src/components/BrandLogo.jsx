/**
 * Logo PT Brain: vòng tròn navy + quỹ đạo nguyên tử + người chạy (gym & science).
 * Dùng chung asset /logo-mark.png để header, favicon và icon PWA luôn khớp nhau.
 */
export default function BrandLogo({ size = 40, className = '', glow = false }) {
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          className="absolute inset-0 rounded-full bg-brand-400/25 blur-lg"
          aria-hidden="true"
        />
      )}
      <img
        src="/logo-mark.png"
        width={size}
        height={size}
        alt="PT Brain"
        className="relative h-full w-full drop-shadow-[0_6px_16px_rgba(23,50,79,0.28)]"
        draggable="false"
      />
    </span>
  );
}
