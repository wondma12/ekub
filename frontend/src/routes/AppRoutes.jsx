import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout Components
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

// Public Pages
import Home from '../pages/public/Home';
import DrawWheel from '../pages/public/DrawWheel';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import Users from '../pages/admin/Users';
import Draws from '../pages/admin/Draws';
import DrawManagement from '../pages/admin/DrawManagement';
import CreateDraw from '../pages/admin/CreateDraw';
import Ekubs from '../pages/admin/Ekubs';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.32s]"></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.16s]"></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  // Check roles
  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Wrapper
const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="lg:ml-64 pt-16">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Public Draw Route - Accessible without auth */}
      <Route path="/draws/:drawId/public" element={<DrawWheel />} />

      {/* Public home page */}
      <Route path="/" element={
        <Layout>
          <Home />
        </Layout>
      } />

      {/* Protected Routes with Layout */}

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/draws/new" element={
        <ProtectedRoute requiredRoles={['ADMIN', 'JUDGE']}>
          <Layout>
            <CreateDraw />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin & Judge Routes */}
      <Route path="/draws" element={
        <ProtectedRoute requiredRoles={['ADMIN', 'JUDGE']}>
          <Layout>
            <Draws />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/draws/:drawId" element={
        <ProtectedRoute requiredRoles={['ADMIN', 'JUDGE']}>
          <Layout>
            <DrawManagement />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/ekubs" element={
        <ProtectedRoute requiredRoles={['ADMIN', 'JUDGE']}>
          <Layout>
            <Ekubs />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Only Routes */}
      <Route path="/users" element={
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <Layout>
            <Users />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;