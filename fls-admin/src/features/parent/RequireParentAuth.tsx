import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const RequireParentAuth: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const token = localStorage.getItem('fls_parent_token');

  if (!token) {
    return <Navigate to="/parent" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default RequireParentAuth;
