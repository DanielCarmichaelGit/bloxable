import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  Home,
  Store,
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

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export default function Layout({ children, hideFooter = false }: LayoutProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Conditional navigation based on auth state
  const navigation = user
    ? [
        { name: "Dashboard", href: "/dashboard", icon: Monitor },
        { name: "Marketplace", href: "/marketplace", icon: Store },
      ]
    : [
        { name: "Home", href: "/", icon: Home },
        { name: "Marketplace", href: "/marketplace", icon: Store },
      ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="lg" />
              <span className="text-xl font-bold text-foreground">
                Bloxable.ai
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative group">
                  {/* User Dropdown Trigger */}
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
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
                        onClick={signOut}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                process.env.NODE_ENV === "development" && (
                  <Button
                    variant="default"
                    size="sm"
                    className="hidden md:flex items-center space-x-2"
                    asChild
                  >
                    <Link to="/agent">
                      <MessageCircle className="h-4 w-4" />
                      <span>Build Agent with AI</span>
                    </Link>
                  </Button>
                )
              )}

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

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="md:hidden border-t fixed left-0 right-0 top-16 bg-background z-40 shadow-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          isActive
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  {user ? (
                    <div className="mt-2 space-y-1">
                      {/* User Email */}
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>

                      {/* Settings Option */}
                      <Link
                        to="/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-md"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>

                      {/* Sign Out Option */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>Sign Out</span>
                      </Button>
                    </div>
                  ) : (
                    process.env.NODE_ENV === "development" && (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full justify-start mt-2"
                        asChild
                      >
                        <Link
                          to="/agent"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          <span>Build Agent with AI</span>
                        </Link>
                      </Button>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

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
              <div className="flex items-center space-x-2">
                <Logo size="sm" />
                <span className="text-sm text-muted-foreground">
                  © 2024 Bloxable.ai. All rights reserved.
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <Link
                  to="/seller"
                  className="hover:text-foreground transition-colors"
                >
                  Sell your workflows
                </Link>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact
                </a>
                {/* Theme Toggle */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setTheme(
                        theme === "light"
                          ? "dark"
                          : theme === "dark"
                          ? "system"
                          : "light"
                      )
                    }
                    className="h-8 w-8 p-0"
                    title={`Current: ${
                      theme === "system"
                        ? "System"
                        : theme === "light"
                        ? "Light"
                        : "Dark"
                    }`}
                  >
                    {theme === "system" ? (
                      <Monitor className="h-4 w-4" />
                    ) : theme === "light" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
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
