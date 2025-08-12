import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // Show a loading indicator while auth state is being checked
  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  // If the user is authenticated, render the child route's component (via <Outlet />).
  // Otherwise, redirect them to the /login page.
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;