import { cn } from "@/lib/utils";
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      className={cn("text-accent shrink-0", className || "w-9 h-9")}
      aria-hidden
    >
      <path
        d="M8 9a15 15 0 0 1 23 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M27 29A15 15 0 0 1 4 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10 19h16M13 19v8m10-8v8m-9-13a6 6 0 0 1 8 0m-6-4a3 3 0 0 1 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
