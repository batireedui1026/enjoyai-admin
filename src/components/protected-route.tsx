"use client";
import { useAuth } from "@/contexts/auth-context";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "teacher" | "admin" | "superadmin";
  redirectPath?: string;
  fallback?: ReactNode;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  redirectPath = "/login",
  fallback = <div>Loading...</div>,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (requiredRole && user.role !== requiredRole))) {
      router.push(redirectPath);
    }
    // if (!user || (requiredRole && user.role !== requiredRole)) {
    //   router.back();
    // }
  }, [user, loading, router, redirectPath, requiredRole]);

  if (loading) {
    return <>{fallback}</>;
  }
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
};
