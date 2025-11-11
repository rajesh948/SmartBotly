import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientDashboard from './components/client/dashboard/ClientDashboard';
import ClientHome from './pages/client/ClientHome';
import ClientProducts from './components/client/dashboard/products/ClientProducts';
import ClientFAQs from './pages/client/ClientFAQs';
import ClientProfile from './pages/client/ClientProfile';
import ClientList from './components/admin/clients/ClientList';
import PromptEditor from './components/admin/PromptEditor';
import AdminProducts from './components/admin/AdminProducts';
import ChatSimulator from './components/admin/ChatSimulator';
import AdminStats from './components/admin/AdminStats';

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/client/dashboard" replace />;
  }

  return children;
};

// Protected Route Component for Client
const ProtectedClientRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'client') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Unified Login for both Admin and Client */}
        <Route
          path="/login"
          element={
            user ? (
              user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/client/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        {/* Admin Routes - Protected */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<ClientList />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="prompts" element={<PromptEditor />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="simulator" element={<ChatSimulator />} />
          <Route path="stats" element={<AdminStats />} />
        </Route>

        {/* Client Routes - Protected */}
        <Route
          path="/client/dashboard"
          element={
            <ProtectedClientRoute>
              <ClientDashboard />
            </ProtectedClientRoute>
          }
        >
          <Route index element={<ClientHome />} />
          <Route path="products" element={<ClientProducts />} />
          <Route path="faqs" element={<ClientFAQs />} />
          <Route path="profile" element={<ClientProfile />} />
        </Route>

        {/* Default Redirects */}
        <Route
          path="/"
          element={
            user ? (
              user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/client/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
