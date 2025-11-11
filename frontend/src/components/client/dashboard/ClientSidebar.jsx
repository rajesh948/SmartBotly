import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LayoutDashboard, Package, HelpCircle, User, LogOut, Building2 } from 'lucide-react';
import { clearUser } from '../../../redux/slices/userSlice';

/**
 * Client Sidebar Navigation
 * Sidebar for client dashboard with navigation links and logout
 */
export default function ClientSidebar({ user }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    localStorage.clear();
    dispatch(clearUser());
    navigate('/login');
  };

  const navLinks = [
    {
      to: '/client/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      end: true,
    },
    {
      to: '/client/dashboard/products',
      icon: Package,
      label: 'Products',
    },
    {
      to: '/client/dashboard/faqs',
      icon: HelpCircle,
      label: 'FAQs',
    },
    {
      to: '/client/dashboard/profile',
      icon: User,
      label: 'Profile',
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header - Company Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">
              {user?.company || 'Client Portal'}
            </h2>
            <p className="text-xs text-gray-500 truncate">{user?.name}</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer - Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
