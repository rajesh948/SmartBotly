import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  MessageSquare,
  Package,
  HelpCircle,
  Settings,
  LogOut,
  Bot,
} from 'lucide-react';
import ChatInbox from './ChatInbox';
import ProductCatalog from './ProductCatalog';
import FAQEditor from './FAQEditor';
import ClientSettings from './Settings';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { id: 'chats', name: 'Chat Inbox', icon: MessageSquare, path: '/' },
    { id: 'products', name: 'Products', icon: Package, path: '/products' },
    { id: 'faqs', name: 'FAQs', icon: HelpCircle, path: '/faqs' },
    { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SmartBotly</h1>
              <p className="text-xs text-gray-500">Client Portal</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
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
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
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

      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<ChatInbox />} />
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/faqs" element={<FAQEditor />} />
          <Route path="/settings" element={<ClientSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default ClientDashboard;
