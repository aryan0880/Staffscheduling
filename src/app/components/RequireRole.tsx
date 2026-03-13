import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth, type UserRole } from "../context/AuthContext";

export function RequireRole({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const { user, refreshing } = useAuth();
  const location = useLocation();

  if (refreshing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/app/dashboard" : "/staff/dashboard"} replace />;
  }

  return <>{children}</>;
}

