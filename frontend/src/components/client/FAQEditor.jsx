import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services';
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
