import * as React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLOutputElement> {
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}

const Spinner = React.forwardRef<HTMLOutputElement, SpinnerProps>(
  ({ size = "md", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    };

    return (
      <output
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-2 border-current border-t-transparent",
          sizeClasses[size],
          className
        )}
        aria-label="Loading"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </output>
    );
  }
);
Spinner.displayName = "Spinner";

// Loading button component
interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly loading?: boolean;
  readonly children: React.ReactNode;
  readonly loadingText?: string;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    { loading = false, children, loadingText, className, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        "h-10 px-4 py-2",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {loading ? loadingText || "Loading..." : children}
    </button>
  )
);
LoadingButton.displayName = "LoadingButton";

export { Spinner, LoadingButton };
