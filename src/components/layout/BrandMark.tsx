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
        d="M10 7v17c0 4 3 6 7 6h2c5 0 8-3 8-8s-3-8-8-8h-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16 20h3c1.5 0 2.5 1 2.5 2.5S20.5 25 19 25h-3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
