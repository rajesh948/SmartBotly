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
