// Marca de Conectados, portada tal cual desde la landing oficial
// (proyecto.conectados: src/components/Logo.tsx y public/favicon.svg).

interface LogoProps {
  size?: number;
  className?: string;
}

/** Insignia circular con degradé — para usar junto al wordmark (headers, sidebar, login). */
export function LogoBadge({ size = 36, className }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[#5C7CFF] to-[#1E2FB0] ${className || ""}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" fill="none" width={size * 0.5} height={size * 0.5}>
        <circle cx="9" cy="12" r="6" stroke="white" strokeWidth="1.6" />
        <circle cx="15" cy="12" r="6" stroke="white" strokeWidth="1.6" />
      </svg>
    </span>
  );
}

/** Ícono squircle con degradé — para favicon / app icon. */
export function LogoMark({ size = 32, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <defs>
        <linearGradient id="conectados-logo-gradient" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#5C7CFF" />
          <stop offset="100%" stopColor="#1E2FB0" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#conectados-logo-gradient)" />
      <circle cx="19.5" cy="24" r="10.5" stroke="white" strokeWidth="3" />
      <circle cx="28.5" cy="24" r="10.5" stroke="white" strokeWidth="3" />
    </svg>
  );
}
