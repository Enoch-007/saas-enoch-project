import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { ROLE_PERMISSIONS, type UserRole, type RolePermissions } from '../lib/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredPermissions?: (keyof RolePermissions)[];
  allowedRoles?: UserRole[];
}

export function RoleGuard({ children, requiredPermissions = [], allowedRoles = [] }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role as UserRole;

  // Check if user's role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user has all required permissions
  const hasAllPermissions = requiredPermissions.every(
    permission => ROLE_PERMISSIONS[userRole][permission]
  );

  if (!hasAllPermissions) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}