import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface SellerProtectedRouteProps {
  children: ReactNode;
}

export default function SellerProtectedRoute({
  children,
}: SellerProtectedRouteProps) {
  const { user, loading, isSeller } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/seller/auth" replace />;
  }

  if (!isSeller) {
    return <Navigate to="/seller" replace />;
  }

  return <>{children}</>;
}
