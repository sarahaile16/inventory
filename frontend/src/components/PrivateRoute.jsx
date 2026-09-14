import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { canAccessPath, getStoredUser, homePath } from '../auth/roles';

const PrivateRoute = ({ isAuthenticated }) => {
  const location = useLocation();
  const user = getStoredUser();

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessPath(location.pathname, user?.role)) {
    return <Navigate to={homePath(user?.role)} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
