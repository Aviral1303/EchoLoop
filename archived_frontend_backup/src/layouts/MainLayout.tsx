import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface MainLayoutProps {
  requireAuth?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ requireAuth = true }) => {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // If authentication is required but user is not logged in, redirect to login
  if (requireAuth && !isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-white shadow-sm py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} EchoLoop. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 