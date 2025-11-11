import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientDashboard from './components/client/dashboard/ClientDashboard';
import ClientHome from './pages/client/ClientHome';
import ClientProducts from './pages/client/ClientProducts';
import ClientFAQs from './pages/client/ClientFAQs';
import ClientProfile from './pages/client/ClientProfile';
import ClientList from './components/admin/clients/ClientList';
import PromptEditor from './components/admin/PromptEditor';
import ProductImport from './components/admin/ProductImport';
import ChatSimulator from './components/admin/ChatSimulator';
import AdminStats from './components/admin/AdminStats';

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
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminDashboard />}>
          <Route index element={<ClientList />} />
          <Route path="clients" element={<ClientList />} />
          <Route path="prompts" element={<PromptEditor />} />
          <Route path="products" element={<ProductImport />} />
          <Route path="simulator" element={<ChatSimulator />} />
          <Route path="stats" element={<AdminStats />} />
        </Route>

        {/* Client Routes */}
        <Route path="/client/dashboard" element={<ClientDashboard />}>
          <Route index element={<ClientHome />} />
          <Route path="products" element={<ClientProducts />} />
          <Route path="faqs" element={<ClientFAQs />} />
          <Route path="profile" element={<ClientProfile />} />
        </Route>

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
