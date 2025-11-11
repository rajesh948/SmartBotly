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
