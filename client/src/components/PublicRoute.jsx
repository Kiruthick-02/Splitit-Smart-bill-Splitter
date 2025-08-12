import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicRoute = () => {
  const { user, loading } = useAuth();

  // Don't render anything until the auth state is confirmed
  if (loading) {
    return null; // Or a loading spinner
  }

  // If a user IS logged in, redirect them away from the public route (e.g., /login) to the dashboard.
  // Otherwise, if there is NO user, show the public route's component (e.g., the Login page).
  return user ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;