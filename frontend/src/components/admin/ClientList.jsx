import React, { useState, useEffect } from 'react';
import { api } from '../../services';
import toast from 'react-hot-toast';
import { Plus, Building2, Phone, Globe, Edit, Trash2, Database } from 'lucide-react';
import CreateClientModal from './CreateClientModal';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.get('/admin/clients');
      setClients(response.data.clients);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      await api.delete(`/clients/${id}`);
      toast.success('Client deleted successfully');
      loadClients();
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  const seedSampleData = async () => {
    try {
      await api.post('/admin/seed');
      toast.success('Sample data seeded successfully!');
      loadClients();
    } catch (error) {
      toast.error('Failed to seed data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your WhatsApp business clients</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={seedSampleData} className="btn-secondary">
            <Database className="w-5 h-5 mr-2 inline" />
            Seed Sample Data
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-5 h-5 mr-2 inline" />
            Add Client
          </button>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No clients yet</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first client or seeding sample data</p>
          <div className="flex justify-center space-x-3">
            <button onClick={seedSampleData} className="btn-secondary">
              Seed Sample Data
            </button>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              Add First Client
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {client.businessName}
                  </h3>
                  <p className="text-sm text-gray-500">{client.industry}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    client.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {client.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {client.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {client.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {client.whatsappPhoneNumber}
                </div>
                {client.website && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="w-4 h-4 mr-2" />
                    {client.website}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  className="text-primary-600 hover:text-primary-700 p-2 rounded-lg hover:bg-primary-50"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(client._id)}
                  className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateClientModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadClients();
          }}
        />
      )}
    </div>
  );
};

export default ClientList;
