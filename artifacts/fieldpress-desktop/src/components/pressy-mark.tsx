export function PressyMark({ busy = false, className = "" }: { busy?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="22" y="4" width="20" height="6" rx="1.5" />
      <path d="M32 10 v8" />
      <circle cx="32" cy="22" r="5" className={busy ? "pressy-screw" : undefined} />
      <path d="M18 28 h28 v6 H18z" />
      <path d="M14 34 h36 v8 H14z" className={busy ? "pressy-platen" : undefined} />
      <circle cx="32" cy="50" r="10" className={busy ? "pressy-block" : undefined} />
      <circle cx="32" cy="50" r="5.5" opacity="0.7" />
      <path d="M8 58 h48" opacity="0.45" />
    </svg>
  );
}
