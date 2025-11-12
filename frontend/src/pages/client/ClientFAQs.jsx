import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HelpCircle, Plus, Edit2, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchFAQs, createFAQ, updateFAQ, deleteFAQ, fetchFAQCategories, clearError } from '../../redux/slices/faqsSlice';
import FAQForm from '../../components/shared/FAQForm';

/**
 * Client FAQs Page
 * Allows clients to view and manage their own FAQs
 */
export default function ClientFAQs() {
  const dispatch = useDispatch();
  const { list: faqs, loading, actionLoading, categories, error } = useSelector((state) => state.faqs);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    dispatch(fetchFAQs());
    dispatch(fetchFAQCategories());
  }, [dispatch]);

  // Note: Removed global error toast for fetch operations
  // Errors are now only shown for user actions (create/update/delete)

  const handleDelete = async (faqId) => {
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

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFaq(null);
  };

  const handleSubmitFAQ = async (faqData) => {
    try {
      if (editingFaq) {
        await dispatch(updateFAQ({ faqId: editingFaq._id, faqData })).unwrap();
        toast.success('FAQ updated successfully');
      } else {
        await dispatch(createFAQ(faqData)).unwrap();
        toast.success('FAQ created successfully');
      }
      handleCloseModal();
    } catch (err) {
      // Error handled by useEffect
    }
  };

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-7 h-7" />
            My FAQs
          </h1>
          <p className="text-gray-600 mt-1">
            Manage frequently asked questions for your customers
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add FAQ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Total FAQs</p>
          <p className="text-2xl font-bold text-gray-900">{faqs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Categories</p>
          <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* FAQs List */}
      <div className="bg-white rounded-lg shadow">
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No FAQs found matching your search' : 'No FAQs yet. Add your first FAQ!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFaqs.map((faq) => (
              <div key={faq._id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Question */}
                  <button
                    onClick={() => toggleFaq(faq._id)}
                    className="flex-1 text-left flex items-start gap-3 group"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {expandedFaq === faq._id ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {faq.question}
                        </h3>
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {faq.category}
                        </span>
                      </div>
                      {expandedFaq === faq._id && (
                        <p className="mt-3 text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ Modal */}
      {showModal && (
        <FAQForm
          faq={editingFaq}
          onSubmit={handleSubmitFAQ}
          onClose={handleCloseModal}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
