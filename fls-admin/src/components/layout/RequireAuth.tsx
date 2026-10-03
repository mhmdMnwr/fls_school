import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasToken } from '@/lib/auth';

export const RequireAuth: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const authenticated = hasToken();

  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
