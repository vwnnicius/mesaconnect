import { cn } from '@/lib/utils';

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-accent text-white shadow-sm',
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="w-[58%] h-[58%]" fill="none">
        <ellipse cx="12" cy="14.5" rx="7" ry="4" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M6 11.2C6 8.4 8.7 6.4 12 6.4s6 2 6 4.8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
