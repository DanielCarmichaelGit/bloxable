import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { authAppearance } from "@/lib/authStyles";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  title = "Sign In Required",
  description = "Please sign in to continue with your request.",
}: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-background rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Auth Form */}
            <div className="p-6">
              <Auth
                supabaseClient={supabase}
                appearance={authAppearance}
                providers={["google", "github"]}
                redirectTo={window.location.origin}
                view="sign_in"
                showLinks={false}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
