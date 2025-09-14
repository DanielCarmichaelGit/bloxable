import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/contexts/AuthContext";
import { authAppearance } from "@/lib/authStyles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Authentication Required
              </h1>
              <p className="text-muted-foreground">
                Please sign in to access this page.
              </p>
            </div>
            <Auth
              supabaseClient={supabase}
              appearance={authAppearance}
              providers={["google", "github"]}
              redirectTo={window.location.origin}
            />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
