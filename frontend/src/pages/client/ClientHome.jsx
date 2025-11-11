import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Package, HelpCircle, TrendingUp, Activity } from 'lucide-react';
import { api } from '../../services';

/**
 * Client Home/Dashboard Page
 * Overview of client's products, FAQs, and quick stats
 */
export default function ClientHome() {
  const { user } = useOutletContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStockProducts: 0,
    totalFaqs: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentFaqs, setRecentFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch products and FAQs in parallel
      const [productsRes, faqsRes] = await Promise.all([
        api.get('/products'),
        api.get('/faqs'),
      ]);

      const products = productsRes.data.products;
      const faqs = faqsRes.data.faqs;

      // Calculate stats
      setStats({
        totalProducts: products.length,
        inStockProducts: products.filter((p) => p.inStock).length,
        totalFaqs: faqs.length,
      });

      // Get recent items (last 5)
      setRecentProducts(products.slice(0, 5));
      setRecentFaqs(faqs.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your account
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          onClick={() => navigate('/client/dashboard/products')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-sm text-green-600 mt-2">
                {stats.inStockProducts} in stock
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/client/dashboard/faqs')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total FAQs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalFaqs}</p>
              <p className="text-sm text-gray-500 mt-2">
                Knowledge base items
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Account Status</p>
              <p className="text-3xl font-bold text-green-600">Active</p>
              <p className="text-sm text-gray-500 mt-2">
                All systems operational
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products and FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Products
            </h2>
            <button
              onClick={() => navigate('/client/dashboard/products')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All ’
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {recentProducts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No products yet</p>
              </div>
            ) : (
              recentProducts.map((product) => (
                <div key={product._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-semibold text-blue-600">${product.price}</p>
                      <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                        product.inStock
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent FAQs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent FAQs
            </h2>
            <button
              onClick={() => navigate('/client/dashboard/faqs')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All ’
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {recentFaqs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No FAQs yet</p>
              </div>
            ) : (
              recentFaqs.map((faq) => (
                <div key={faq._id} className="p-4 hover:bg-gray-50">
                  <h3 className="font-medium text-gray-900">{faq.question}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Ready to get started?</h2>
        <p className="mb-4 text-blue-100">
          Manage your products and FAQs to provide better service to your customers
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/client/dashboard/products')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
          >
            Manage Products
          </button>
          <button
            onClick={() => navigate('/client/dashboard/faqs')}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors font-medium"
          >
            Manage FAQs
          </button>
        </div>
      </div>
    </div>
  );
}
