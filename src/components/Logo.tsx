interface LogoProps {
  readonly className?: string;
  readonly size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export default function Logo({ className = "", size = "md" }: LogoProps) {
  // For now, using the same logo for all themes
  // Note: Light/dark logo variants can be implemented using CSS classes
  const logoSrc = "/assets/bloxable-dark-logo.svg";
  const sizeClass = sizeClasses[size];

  return (
    <img
      src={logoSrc}
      alt="Bloxable.io - Automation Platform"
      className={`${sizeClass} ${className}`}
    />
  );
}

// Alternative approach using CSS for system theme
export function LogoWithCSS({
  className = "",
  size = "md",
}: Readonly<LogoProps>) {
  const sizeClass = sizeClasses[size];

  return (
    <div className={`${sizeClass} ${className} relative`}>
      <img
        src="/assets/bloxable-dark-logo.svg"
        alt="Bloxable.io"
        className="block dark:hidden w-full h-full"
      />
      <img
        src="/assets/bloxable-dark-logo.svg"
        alt="Bloxable.io"
        className="hidden dark:block w-full h-full"
      />
    </div>
  );
}
