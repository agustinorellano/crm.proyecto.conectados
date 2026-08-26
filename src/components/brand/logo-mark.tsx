export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="conectados-logo-gradient" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#7C8FFA" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="28" fill="url(#conectados-logo-gradient)" />
      <circle cx="36" cy="50" r="26" stroke="white" strokeWidth="10" />
      <circle cx="64" cy="50" r="26" stroke="white" strokeWidth="10" />
    </svg>
  );
}
