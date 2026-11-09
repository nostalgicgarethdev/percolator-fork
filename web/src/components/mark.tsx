export function Mark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <circle cx="16" cy="16" r="12.1" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="16" cy="16" r="10.15" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.75" />
      <path d="M5.6 16H26.4" stroke="#14F195" strokeWidth="1.7" />
    </svg>
  );
}
