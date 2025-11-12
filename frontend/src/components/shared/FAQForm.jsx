import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * FAQ Form Component
 * Reusable form for creating/editing FAQs
 */
export default function FAQForm({ faq, onSubmit, onClose, loading, clients = null }) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    clientId: '',
  });

  useEffect(() => {
    if (faq) {
      setFormData({
        question: faq.question || '',
        answer: faq.answer || '',
        category: faq.category || 'General',
        clientId: faq.clientId?._id || '',
      });
    }
  }, [faq]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.question.trim()) {
      alert('Please enter a question');
      return;
    }
    if (!formData.answer.trim()) {
      alert('Please enter an answer');
      return;
    }
    if (clients && !formData.clientId) {
      alert('Please select a client');
      return;
    }

    const data = {
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      category: formData.category,
    };

    if (clients) {
      data.clientId = formData.clientId;
    }

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {faq ? 'Edit FAQ' : 'Add New FAQ'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Client Selection (Admin only) */}
          {clients && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!faq}
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client._id} value={client.clientProfileId._id}>
                    {client.company}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question *
            </label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the question"
              required
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer *
            </label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter the answer"
              rows={6}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., General, Pricing, Support"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : faq ? 'Update FAQ' : 'Create FAQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
