import { useTheme } from "@/contexts/ThemeContext";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const { theme } = useTheme();

  // Determine which logo to use based on theme
  const getLogoSrc = () => {
    if (theme === "dark") {
      return "/assets/bloxable-dark-logo.svg";
    } else if (theme === "light") {
      return "/assets/bloxable-light-logo.svg";
    } else {
      // For system theme, we'll use CSS media queries
      return "/assets/bloxable-light-logo.svg";
    }
  };

  const logoSrc = getLogoSrc();
  const sizeClass = sizeClasses[size];

  return (
    <img
      src={logoSrc}
      alt="Bloxable.io"
      className={`${sizeClass} ${className}`}
      style={{
        // For system theme, we'll use CSS to switch between logos
        ...(theme === "system" && {
          content: `url("/assets/bloxable-light-logo.svg")`,
        }),
      }}
    />
  );
}

// Alternative approach using CSS for system theme
export function LogoWithCSS({ className = "", size = "md" }: LogoProps) {
  const sizeClass = sizeClasses[size];

  return (
    <div className={`${sizeClass} ${className} relative`}>
      <img
        src="/assets/bloxable-light-logo.svg"
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
