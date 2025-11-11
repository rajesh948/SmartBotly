import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Bot, Mail, Lock } from 'lucide-react';
import api from '../../utils/api';
import { setUser } from '../../redux/slices/userSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return; // Prevent multiple submissions

    setLoading(true);

    // Try admin login first
    try {
      const adminResponse = await api.post('/auth/login', { email, password });

      // Store ONLY token in localStorage
      localStorage.setItem('authToken', adminResponse.data.token);

      // Store user data in Redux
      dispatch(setUser(adminResponse.data.user));

      toast.success('Welcome Admin!');
      setTimeout(() => navigate('/admin'), 100);
      return;
    } catch (adminError) {
      // Admin login failed, try client login
      try {
        const clientResponse = await api.post('/client/login', { email, password });

        // Store ONLY token in localStorage
        localStorage.setItem('authToken', clientResponse.data.token);

        // Store user data in Redux
        dispatch(setUser(clientResponse.data.user));

        toast.success('Welcome to your dashboard!');
        setTimeout(() => navigate('/client/dashboard'), 100);
      } catch (clientError) {
        // Both failed, show appropriate error message
        const errorMsg = clientError.response?.data?.error || 'Invalid email or password';
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-100 p-4 rounded-full mb-4">
            <Bot className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">SmartBotly</h1>
          <p className="text-gray-600 mt-2">AI WhatsApp Business Assistant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-11"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-11"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700 font-semibold mb-2">Demo Credentials:</p>
          <p className="text-xs text-gray-600">
            Admin: admin@smartbotly.com / admin123
          </p>
          <p className="text-xs text-gray-600">
            Client: testuser@gmail.com / (set by admin)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
