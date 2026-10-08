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
      "bs-button inline-flex items-center justify-center font-medium transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50 disabled:pointer-events-none select-none rounded-xl";

    const variantStyles = {
      primary: "bs-button--primary",
      secondary: "bs-button--secondary",
      outline: "bs-button--outline",
      danger: "bs-button--danger",
      success: "bs-button--success",
      ghost: "bs-button--ghost",
      accent: "bs-button--accent",
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
