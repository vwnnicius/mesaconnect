import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "danger"
    | "success"
    | "ghost"
    | "accent";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:pointer-events-none select-none rounded-xl";

    const variantStyles = {
      primary: "bg-espresso text-white hover:bg-espresso-muted",
      secondary: "bg-white text-stone-800 hover:bg-cream border border-border",
      outline:
        "border border-border bg-transparent hover:bg-white/70 text-stone-800",
      danger: "bg-red-700 text-white hover:bg-red-800",
      success: "bg-emerald-800 text-white hover:bg-emerald-900",
      ghost: "hover:bg-black/5 text-stone-700",
      accent: "bg-accent text-white hover:brightness-110",
    };

    const sizeStyles = {
      sm: "min-h-10 text-xs px-3 py-2 gap-1.5",
      md: "min-h-11 text-sm px-4 py-2.5 gap-2",
      lg: "min-h-12 text-[15px] px-5 py-3 gap-2 font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
