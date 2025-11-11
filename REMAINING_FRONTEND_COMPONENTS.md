# Remaining Frontend Components

This file contains the remaining frontend components needed to complete the SmartBotly application.

---

## Admin Components (Continued)

### frontend/src/components/admin/CreateClientModal.jsx

```jsx
import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const CreateClientModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    whatsappPhoneNumber: '',
    description: '',
    website: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/clients', formData);
      toast.success('Client created successfully!');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add New Client</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry *
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="input-field"
              placeholder="e.g., Fashion & Apparel"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Phone Number *
            </label>
            <input
              type="tel"
              value={formData.whatsappPhoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, whatsappPhoneNumber: e.target.value })
              }
              className="input-field"
              placeholder="+919876543210"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Brief description of the business..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="input-field"
              placeholder="https://example.com"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClientModal;
```

### frontend/src/components/admin/PromptEditor.jsx

```jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Save, FileText } from 'lucide-react';

const PromptEditor = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptName, setPromptName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadPrompts();
    }
  }, [selectedClient]);

  const loadClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.clients);
    } catch (error) {
      toast.error('Failed to load clients');
    }
  };

  const loadPrompts = async () => {
    try {
      const response = await api.get(`/prompts?clientId=${selectedClient}`);
      setPrompts(response.data.prompts);

      const systemPrompt = response.data.prompts.find((p) => p.type === 'system');
      if (systemPrompt) {
        setCurrentPrompt(systemPrompt.content);
        setPromptName(systemPrompt.name);
      }
    } catch (error) {
      toast.error('Failed to load prompts');
    }
  };

  const handleSave = async () => {
    if (!selectedClient || !currentPrompt) {
      toast.error('Please select a client and enter a prompt');
      return;
    }

    setLoading(true);

    try {
      await api.post('/prompts', {
        clientId: selectedClient,
        name: promptName || 'System Prompt',
        type: 'system',
        content: currentPrompt,
        variables: ['businessName', 'industry'],
      });

      toast.success('Prompt saved successfully!');
      loadPrompts();
    } catch (error) {
      toast.error('Failed to save prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Prompt Editor</h1>
        <p className="text-gray-600 mt-1">Customize AI assistant behavior for each client</p>
      </div>

      <div className="card mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Client
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="input-field"
          >
            <option value="">-- Select a client --</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.businessName}
              </option>
            ))}
          </select>
        </div>

        {selectedClient && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Name
              </label>
              <input
                type="text"
                value={promptName}
                onChange={(e) => setPromptName(e.target.value)}
                className="input-field"
                placeholder="e.g., Elegant Threads AI Assistant"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt
              </label>
              <textarea
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                className="input-field font-mono text-sm"
                rows="20"
                placeholder="Enter the system prompt for the AI assistant..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Use {{`{{businessName}}`}} and {{`{{industry}}`}} as variables
              </p>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} disabled={loading} className="btn-primary">
                <Save className="w-4 h-4 mr-2 inline" />
                {loading ? 'Saving...' : 'Save Prompt'}
              </button>
            </div>
          </>
        )}
      </div>

      {selectedClient && prompts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Existing Prompts</h3>
          <div className="space-y-2">
            {prompts.map((prompt) => (
              <div
                key={prompt._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{prompt.name}</p>
                    <p className="text-xs text-gray-500">
                      {prompt.type} • Updated {new Date(prompt.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
```

### frontend/src/components/admin/ProductImport.jsx

```jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Upload, Download } from 'lucide-react';

const ProductImport = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.clients);
    } catch (error) {
      toast.error('Failed to load clients');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!selectedClient || !file) {
      toast.error('Please select a client and file');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', selectedClient);

    try {
      const response = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(response.data.message);
      setFile(null);
    } catch (error) {
      toast.error('Failed to import products');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,description,price,currency,category,sku,stock,tags
"Royal Blue Silk Saree","Handwoven pure silk saree",8500,INR,Sarees,SS001,5,"silk,wedding,traditional"
"Cotton Kurta Set","Comfortable cotton kurta with palazzo",2499,INR,"Kurta Sets",CK002,12,"cotton,casual"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_import_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Import</h1>
        <p className="text-gray-600 mt-1">Bulk import products via CSV</p>
      </div>

      <div className="card mb-6">
        <div className="mb-6">
          <button onClick={downloadTemplate} className="btn-secondary">
            <Download className="w-4 h-4 mr-2 inline" />
            Download CSV Template
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Client
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="input-field"
          >
            <option value="">-- Select a client --</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.businessName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload CSV File
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="input-field"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedClient || !file || uploading}
          className="btn-primary disabled:opacity-50"
        >
          <Upload className="w-4 h-4 mr-2 inline" />
          {uploading ? 'Uploading...' : 'Import Products'}
        </button>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-3">CSV Format Guide</h3>
        <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono">
          <p className="mb-2">Required columns:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>name - Product name</li>
            <li>description - Product description</li>
            <li>price - Price (number)</li>
            <li>currency - Currency code (USD, INR, etc.)</li>
          </ul>
          <p className="mt-3 mb-2">Optional columns:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>category - Product category</li>
            <li>sku - Stock keeping unit</li>
            <li>stock - Available quantity</li>
            <li>tags - Comma-separated tags</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductImport;
```

### frontend/src/components/admin/ChatSimulator.jsx

```jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Send, Bot, User } from 'lucide-react';

const ChatSimulator = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.clients);
    } catch (error) {
      toast.error('Failed to load clients');
    }
  };

  const handleSend = async () => {
    if (!selectedClient || !input.trim()) {
      toast.error('Please select a client and enter a message');
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // This would call a test endpoint that simulates the LLM response
      // For now, we'll just add a placeholder response
      setTimeout(() => {
        const botMessage = {
          role: 'assistant',
          content: 'This is a simulated response. Connect the real LLM endpoint for actual responses.',
        };
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to get response');
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chat Simulator</h1>
        <p className="text-gray-600 mt-1">Test AI responses for your clients</p>
      </div>

      <div className="card mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Client
        </label>
        <select
          value={selectedClient}
          onChange={(e) => {
            setSelectedClient(e.target.value);
            setMessages([]);
          }}
          className="input-field"
        >
          <option value="">-- Select a client --</option>
          {clients.map((client) => (
            <option key={client._id} value={client._id}>
              {client.businessName}
            </option>
          ))}
        </select>
      </div>

      {selectedClient && (
        <div className="card h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Start a conversation to test the AI assistant</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {msg.role === 'assistant' && (
                        <Bot className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      )}
                      <p className="text-sm">{msg.content}</p>
                      {msg.role === 'user' && (
                        <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="input-field flex-1"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="btn-primary disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSimulator;
```

### frontend/src/components/admin/AdminStats.jsx

```jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Users, Package, MessageCircle, ShoppingCart, FileText, TrendingUp } from 'lucide-react';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading stats...</div>;
  }

  const statCards = [
    { label: 'Total Clients', value: stats?.clients || 0, icon: Users, color: 'blue' },
    { label: 'Products', value: stats?.products || 0, icon: Package, color: 'green' },
    { label: 'FAQs', value: stats?.faqs || 0, icon: FileText, color: 'purple' },
    { label: 'Conversations', value: stats?.conversations || 0, icon: MessageCircle, color: 'indigo' },
    { label: 'Messages', value: stats?.messages || 0, icon: TrendingUp, color: 'pink' },
    { label: 'Orders', value: stats?.orders || 0, icon: ShoppingCart, color: 'orange' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600 mt-1">Overview of system metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                  <Icon className={`w-8 h-8 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminStats;
```

---

## Client Components

### frontend/src/components/client/ClientDashboard.jsx

```jsx
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
```

### frontend/src/components/client/ChatInbox.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { MessageCircle, Search } from 'lucide-react';
import ChatWindow from './ChatWindow';

const ChatInbox = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await api.get(`/conversations?clientId=${user.clientId}`);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Chat Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?._id === conv._id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900">
                    {conv.customerName || conv.customerPhone}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{conv.customerPhone}</p>
                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                    conv.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : conv.status === 'escalated'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {conv.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-24 h-24 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInbox;
```

### frontend/src/components/client/ChatWindow.jsx

```jsx
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Bot, User, Phone } from 'lucide-react';
import { format } from 'date-fns';

const ChatWindow = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [conversation]);

  const loadMessages = async () => {
    try {
      const response = await api.get(`/conversations/${conversation._id}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {conversation.customerName || 'Customer'}
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-1" />
              {conversation.customerPhone}
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              conversation.status === 'active'
                ? 'bg-green-100 text-green-700'
                : conversation.status === 'escalated'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {conversation.status}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="text-center py-8">Loading messages...</div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.direction === 'inbound' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    msg.direction === 'inbound'
                      ? 'bg-white text-gray-900'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {msg.direction === 'inbound' && (
                      <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{msg.content}</p>
                      {msg.mediaUrl && (
                        <img
                          src={msg.mediaUrl}
                          alt="Media"
                          className="mt-2 rounded max-w-sm"
                        />
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {format(new Date(msg.timestamp), 'hh:mm a')}
                      </p>
                    </div>
                    {msg.direction === 'outbound' && (
                      <Bot className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
```

### frontend/src/components/client/ProductCatalog.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductCatalog = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get(`/products?clientId=${user.clientId}`);
      setProducts(response.data.products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="p-8">Loading products...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2 inline" />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-6">Add your first product to get started</p>
          <button className="btn-primary">Add First Product</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="card">
              {product.imageUrls[0] && (
                <img
                  src={product.imageUrls[0]}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-primary-600">
                  {product.currency} {product.price}
                </span>
                {product.stock !== undefined && (
                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button className="text-primary-600 hover:text-primary-700 p-2">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-red-600 hover:text-red-700 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
```

### frontend/src/components/client/FAQEditor.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FAQEditor = () => {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const response = await api.get(`/faqs?clientId=${user.clientId}`);
      setFaqs(response.data.faqs);
    } catch (error) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this FAQ?')) return;

    try {
      await api.delete(`/faqs/${id}`);
      toast.success('FAQ deleted');
      loadFAQs();
    } catch (error) {
      toast.error('Failed to delete FAQ');
    }
  };

  if (loading) {
    return <div className="p-8">Loading FAQs...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FAQs</h1>
          <p className="text-gray-600 mt-1">Manage frequently asked questions</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2 inline" />
          Add FAQ
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="card text-center py-12">
          <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No FAQs yet</h3>
          <p className="text-gray-500 mb-6">Add your first FAQ to help customers</p>
          <button className="btn-primary">Add First FAQ</button>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 flex-1">{faq.question}</h3>
                <div className="flex space-x-2">
                  <button className="text-primary-600 hover:text-primary-700 p-2">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq._id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-3">{faq.answer}</p>
              <div className="flex items-center justify-between text-sm">
                {faq.category && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {faq.category}
                  </span>
                )}
                <span className="text-gray-500">Priority: {faq.priority}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQEditor;
```

### frontend/src/components/client/Settings.jsx

```jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={user.name} className="input-field" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={user.email} className="input-field" readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
```

---

## Shared Components

### frontend/src/components/shared/LoadingSpinner.jsx

```jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
};

export default LoadingSpinner;
```

---

## Installation Commands Summary

```bash
# Install all frontend components:
cd frontend
npm install

# Run development server:
npm run dev

# Build for production:
npm run build
```

---

That completes all the frontend components for the SmartBotly application!
