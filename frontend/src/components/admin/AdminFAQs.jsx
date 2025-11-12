import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageSquare, Plus, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchFAQs, createFAQ, updateFAQ, deleteFAQ, fetchFAQCategories, clearError } from '../../redux/slices/faqsSlice';
import { fetchClients } from '../../redux/slices/clientsSlice';
import FAQForm from '../shared/FAQForm';
import FAQTable from '../shared/FAQTable';

/**
 * AdminFAQs Component
 * Allows admin to manage FAQs for all clients
 */
export default function AdminFAQs() {
  const dispatch = useDispatch();
  const { list: faqs, loading, actionLoading, categories, error } = useSelector((state) => state.faqs);
  const { list: clients, selectedClient } = useSelector((state) => state.clients);

  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (selectedClient) {
      dispatch(fetchFAQs({ clientId: selectedClient.clientProfileId._id }));
      dispatch(fetchFAQCategories(selectedClient.clientProfileId._id));
    }
    dispatch(fetchClients());
  }, [dispatch, selectedClient]);

  // Note: Removed global error toast for fetch operations
  // Errors are now only shown for user actions (create/update/delete)

  const handleAddFAQ = () => {
    setEditingFAQ(null);
    setShowForm(true);
  };

  const handleEditFAQ = (faq) => {
    setEditingFAQ(faq);
    setShowForm(true);
  };

  const handleDeleteFAQ = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    try {
      await dispatch(deleteFAQ(faqId)).unwrap();
      toast.success('FAQ deleted successfully');
    } catch (err) {
      // Error handled by Redux
    }
  };

  const handleSubmitFAQ = async (faqData) => {
    try {
      if (!selectedClient) {
        faqData.clientId = selectedClient.clientProfileId._id;
      }

      if (editingFAQ) {
        await dispatch(updateFAQ({ faqId: editingFAQ._id, faqData })).unwrap();
        toast.success('FAQ updated successfully');
      } else {
        await dispatch(createFAQ(faqData)).unwrap();
        toast.success('FAQ created successfully');
      }
      setShowForm(false);
      setEditingFAQ(null);
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingFAQ(null);
  };

  const handleApplyFilters = () => {
    const filters = { clientId: selectedClient.clientProfileId._id };
    if (categoryFilter) filters.category = categoryFilter;
    if (searchTerm) filters.search = searchTerm;
    dispatch(fetchFAQs(filters));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    dispatch(fetchFAQs({ clientId: selectedClient.clientProfileId._id }));
  };

  // Show message if no client is selected
  if (!selectedClient) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Client Selected</h2>
          <p className="text-gray-600 mb-4">Please select a client from the Clients page to manage their FAQs.</p>
        </div>
      </div>
    );
  }

  // Get active clients for dropdown
  const activeClients = clients.filter((c) => c.status === 'Active');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600 mt-1">Manage FAQs for {selectedClient.company}</p>
        </div>
        <button
          onClick={handleAddFAQ}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add FAQ
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Total FAQs</p>
          <p className="text-2xl font-bold text-gray-900">{faqs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Categories</p>
          <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Client</p>
          <p className="text-lg font-semibold text-gray-900 truncate">{selectedClient.company}</p>
        </div>
      </div>

      {/* FAQ Table */}
      <FAQTable
        faqs={faqs}
        onEdit={handleEditFAQ}
        onDelete={handleDeleteFAQ}
        loading={loading}
        showClient={false}
      />

      {/* FAQ Form Modal */}
      {showForm && (
        <FAQForm
          faq={editingFAQ}
          onSubmit={handleSubmitFAQ}
          onClose={handleCloseForm}
          loading={actionLoading}
          clients={activeClients}
        />
      )}
    </div>
  );
}
