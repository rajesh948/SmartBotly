import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  clearError,
} from '../../redux/slices/productsSlice';
import { fetchClients } from '../../redux/slices/clientsSlice';
import ProductTable from '../shared/ProductTable';
import ProductForm from '../shared/ProductForm';

/**
 * AdminProducts Component
 * Allows admin to manage products for all clients
 */
export default function AdminProducts() {
  const dispatch = useDispatch();
  const { list: products, loading, actionLoading, error } = useSelector((state) => state.products);
  const { list: clients, selectedClient } = useSelector((state) => state.clients);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (selectedClient) {
      // Fetch products for the selected client
      dispatch(fetchProducts({ clientId: selectedClient.clientProfileId._id }));
    }
  }, [dispatch, selectedClient]);

  // Note: Removed global error toast for fetch operations
  // Errors are now only shown for user actions (create/update/delete)

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.productName}"?`)) {
      try {
        await dispatch(deleteProduct(product._id)).unwrap();
        toast.success('Product deleted successfully');
      } catch (err) {
        // Error already handled by useEffect
      }
    }
  };

  const handleSubmitProduct = async (formData) => {
    try {
      // Add selected client ID to form data
      if (selectedClient && !editingProduct) {
        formData.append('clientId', selectedClient.clientProfileId._id);
      }

      if (editingProduct) {
        await dispatch(updateProduct({ productId: editingProduct._id, formData })).unwrap();
        toast.success('Product updated successfully');
      } else {
        await dispatch(createProduct(formData)).unwrap();
        toast.success('Product created successfully');
      }
      setShowForm(false);
      setEditingProduct(null);
    } catch (err) {
      // Error already handled by useEffect
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleApplyFilters = () => {
    const filters = { clientId: selectedClient.clientProfileId._id };
    if (categoryFilter) filters.category = categoryFilter;
    if (searchTerm) filters.search = searchTerm;
    dispatch(fetchProducts(filters));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    dispatch(fetchProducts({ clientId: selectedClient.clientProfileId._id }));
  };

  // Get unique categories for filter
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  // Show message if no client is selected
  if (!selectedClient) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Client Selected</h2>
          <p className="text-gray-600 mb-4">Please select a client from the Clients page to manage their products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600 mt-1">Manage products for {selectedClient.company}</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600">Total Products</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{products.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600">Total Value</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            ${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600">Total Stock</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {products.reduce((sum, p) => sum + p.stock, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-sm text-gray-600">Categories</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{categories.length}</div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <ProductTable
          products={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          loading={loading}
          showClient={true}
        />
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleSubmitProduct}
          onClose={handleCloseForm}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
