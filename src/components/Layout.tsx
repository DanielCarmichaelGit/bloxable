import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  MessageCircle,
  LogOut,
  Monitor,
  Menu,
  X,
  Settings,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import AccountSwitcher from "@/components/AccountSwitcher";

interface LayoutProps {
  readonly children: ReactNode;
  readonly hideFooter?: boolean;
}

// Helper function to get theme display name
const getThemeDisplayName = (theme: string) => {
  switch (theme) {
    case "system":
      return "System";
    case "light":
      return "Light";
    case "dark":
      return "Dark";
    default:
      return "System";
  }
};

// Helper function to get theme icon
const getThemeIcon = (theme: string) => {
  switch (theme) {
    case "system":
      return <Monitor className="h-4 w-4" />;
    case "light":
      return <Sun className="h-4 w-4" />;
    case "dark":
      return <Moon className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
};

// Helper function to get next theme in cycle
const getNextTheme = (currentTheme: string) => {
  switch (currentTheme) {
    case "light":
      return "dark";
    case "dark":
      return "system";
    case "system":
      return "light";
    default:
      return "light";
  }
};

export default function Layout({ children, hideFooter = false }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simple navigation based on auth state
  const navigation = user
    ? [{ name: "Dashboard", href: "/dashboard", icon: Monitor }]
    : [
        { name: "Home", href: "/", icon: null },
        { name: "Integrations", href: "/#integrations", icon: null },
        { name: "Pricing", href: "/#pricing", icon: null },
        { name: "Solutions", href: "/#solutions", icon: null },
      ];

  // Contact button separate - always on the right
  const contactButton = user
    ? null
    : { name: "Contact", href: "/#contact", icon: MessageCircle };

  // Handle sign out with redirect to home
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 overflow-visible">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="lg" />
              <span className="text-xl font-bold text-foreground">
                Bloxable.io
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href.startsWith("#") && location.hash === item.href);
                const isAnchor = item.href.startsWith("#");

                if (isAnchor) {
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        const targetId = item.href.replace("#", "");

                        // If not on home page, navigate to home with hash
                        if (location.pathname === "/") {
                          // Already on home page, update hash and scroll
                          globalThis.history.pushState(null, "", item.href);
                          const element = document.getElementById(targetId);
                          if (element) {
                            element.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        } else {
                          navigate(`/${item.href}`, { replace: false });
                        }
                      }}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "text-brand bg-brand/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.name}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-brand bg-brand/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Right side - Contact button and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Contact Button - Desktop */}
              {contactButton && (
                <div className="hidden md:block">
                  <a
                    href={contactButton.href}
                    onClick={(e) => {
                      e.preventDefault();
                      const targetId = contactButton.href.replace("#", "");

                      // If not on home page, navigate to home with hash
                      if (location.pathname === "/") {
                        // Already on home page, update hash and scroll
                        globalThis.history.pushState(
                          null,
                          "",
                          contactButton.href
                        );
                        const element = document.getElementById(targetId);
                        if (element) {
                          element.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      } else {
                        navigate(`/${contactButton.href}`, { replace: false });
                      }
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.hash === contactButton.href
                        ? "text-brand bg-brand/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <contactButton.icon className="h-4 w-4" />
                    <span>{contactButton.name}</span>
                  </a>
                </div>
              )}

              {user ? (
                <>
                  {/* Account Switcher */}
                  <AccountSwitcher />

                  <div className="relative group">
                    {/* User Dropdown Trigger */}
                    <button
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      aria-label="User menu"
                      aria-expanded="false"
                    >
                      <Settings className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        {/* User Email */}
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>

                        {/* Settings Option */}
                        <Link
                          to="/settings"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>

                        {/* Sign Out Option */}
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Overlay - moved outside nav container */}
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 bg-black/50 z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Slide-out drawer */}
            <motion.div
              className="md:hidden fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-background z-[101] shadow-2xl border-l overflow-y-auto overflow-x-hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="flex flex-col h-full w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b shrink-0">
                  <h2 className="text-lg font-semibold text-foreground">
                    Menu
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                {/* Navigation links */}
                <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto overflow-x-hidden w-full">
                  {navigation.map((item) => {
                    const isActive =
                      location.pathname === item.href ||
                      (item.href.startsWith("#") &&
                        location.hash === item.href);
                    const isAnchor = item.href.startsWith("#");

                    if (isAnchor) {
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            setIsMobileMenuOpen(false);
                            const targetId = item.href.replace("#", "");

                            // If not on home page, navigate to home with hash
                            if (location.pathname === "/") {
                              // Already on home page, update hash and scroll
                              globalThis.history.pushState(null, "", item.href);
                              const element = document.getElementById(targetId);
                              if (element) {
                                element.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }
                            } else {
                              navigate(`/${item.href}`, { replace: false });
                            }
                          }}
                          className={`block w-full px-4 py-3 rounded-lg text-base font-medium transition-colors text-left ${
                            isActive
                              ? "text-brand bg-brand/10"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {item.name}
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block w-full px-4 py-3 rounded-lg text-base font-medium transition-colors text-left ${
                          isActive
                            ? "text-brand bg-brand/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                  {/* Contact button in mobile menu */}
                  {contactButton && (
                    <a
                      href={contactButton.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        const targetId = contactButton.href.replace("#", "");

                        // If not on home page, navigate to home with hash
                        if (location.pathname === "/") {
                          // Already on home page, update hash and scroll
                          globalThis.history.pushState(
                            null,
                            "",
                            contactButton.href
                          );
                          const element = document.getElementById(targetId);
                          if (element) {
                            element.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        } else {
                          navigate(`/${contactButton.href}`, {
                            replace: false,
                          });
                        }
                      }}
                      className={`flex items-center space-x-2 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        location.hash === contactButton.href
                          ? "text-brand bg-brand/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <contactButton.icon className="h-5 w-5 shrink-0" />
                      <span>{contactButton.name}</span>
                    </a>
                  )}
                </div>
                {/* User section */}
                {user && (
                  <div className="border-t px-4 py-4 space-y-3">
                    {/* Account Switcher */}
                    <div>
                      <AccountSwitcher />
                    </div>

                    {/* User Email */}
                    <div className="pb-3 border-b border-border">
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    {/* Settings Option */}
                    <Link
                      to="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-lg"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>

                    {/* Sign Out Option */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="border-t bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Logo size="sm" />
                  <span className="text-sm font-semibold text-foreground">
                    Bloxable.io
                  </span>
                </div>
                <p className="text-xs text-muted-foreground max-w-md">
                  Inexpensive bespoke AI solutions for local businesses.
                  Currently serving Northern Michigan.
                </p>
                <span className="text-xs text-muted-foreground">
                  © 2025-2026 Bloxable.io. All rights reserved.
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <Link
                  to="/#contact"
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
                <Link
                  to="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms-and-conditions"
                  className="hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
                <div className="text-xs text-muted-foreground">
                  Serving Northern Michigan
                </div>
                {/* Theme Toggle */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(getNextTheme(theme))}
                    className="h-8 w-8 p-0"
                    title={`Current: ${getThemeDisplayName(theme)}`}
                  >
                    {getThemeIcon(theme)}
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
