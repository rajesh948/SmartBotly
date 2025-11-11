import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ClientSidebar from './ClientSidebar';
import { validateAndFetchUser } from '../../../redux/slices/userSlice';

/**
 * Client Dashboard Layout
 * Main container for all client pages with sidebar navigation
 */
export default function ClientDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.user);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      navigate('/login');
      return;
    }

    // Check if user is loaded and is a client
    if (user) {
      if (user.role !== 'client') {
        navigate('/login');
      }
    }
  }, [user, navigate]);

  const refreshUser = () => {
    dispatch(validateAndFetchUser());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <ClientSidebar user={user} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet context={{ user, refreshUser }} />
      </div>
    </div>
  );
}
