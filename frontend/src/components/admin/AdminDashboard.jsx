import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { clearSelectedClient } from '../../redux/slices/clientsSlice';
import {
  Users,
  Package,
  MessageSquare,
  LogOut,
  Bot,
  BarChart3,
  X,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { selectedClient } = useSelector((state) => state.clients);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClearSelection = () => {
    dispatch(clearSelectedClient());
    toast.success('Client selection cleared');
    navigate('/admin');
  };

  const navigation = [
    { id: 'clients', name: 'Clients', icon: Users, path: '/admin', requiresClient: false },
    { id: 'prompts', name: 'Prompts', icon: MessageSquare, path: '/admin/prompts', requiresClient: true },
    { id: 'products', name: 'Products', icon: Package, path: '/admin/products', requiresClient: true },
    { id: 'simulator', name: 'Chat Simulator', icon: Bot, path: '/admin/simulator', requiresClient: true },
    { id: 'stats', name: 'Statistics', icon: BarChart3, path: '/admin/stats', requiresClient: true },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SmartBotly</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Selected Client Indicator */}
        {selectedClient && (
          <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">Selected Client</span>
              </div>
              <button
                onClick={handleClearSelection}
                className="text-blue-600 hover:text-blue-800"
                title="Clear Selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-medium text-gray-900">{selectedClient.company}</p>
            <p className="text-xs text-gray-600">{selectedClient.email}</p>
          </div>
        )}

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isDisabled = item.requiresClient && !selectedClient;

            if (isDisabled) {
              return (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed opacity-50"
                  title="Please select a client first"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
