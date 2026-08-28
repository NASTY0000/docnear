export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden>
      <rect width="64" height="64" rx="16" className="fill-tide-800 dark:fill-tide-400" />
      <path
        d="M32 14c-7.2 0-13 5.9-13 13.2 0 9.3 13 22.8 13 22.8s13-13.5 13-22.8C45 19.9 39.2 14 32 14z"
        className="fill-tide-300 dark:fill-tide-950"
      />
      <rect x="29" y="22" width="6" height="16" rx="1" className="fill-tide-800 dark:fill-tide-400" />
      <rect x="24" y="27" width="16" height="6" rx="1" className="fill-tide-800 dark:fill-tide-400" />
    </svg>
  );
}
