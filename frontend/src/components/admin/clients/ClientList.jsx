import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, RefreshCw, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../../../services';
import { fetchClients, setSelectedClient } from '../../../redux/slices/clientsSlice';
import CreateClientModal from './CreateClientModal';
import EditClientModal from './EditClientModal';
import toast from 'react-hot-toast';

/**
 * Admin Client List Component
 * Displays all clients with CRUD operations
 */
export default function ClientList() {
  const dispatch = useDispatch();
  const { list: clients, loading, error, selectedClient: activeClient } = useSelector((state) => state.clients);

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    // Fetch clients on mount (Redux will handle caching)
    dispatch(fetchClients());
  }, [dispatch]);

  const handleRefresh = () => {
    // Force refresh by passing true
    dispatch(fetchClients(true));
  };

  const handleToggleStatus = async (clientId) => {
    try {
      await api.patch(`/admin/clients/${clientId}/toggle-status`);
      dispatch(fetchClients(true)); // Force refresh
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle client status');
    }
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('Are you sure? This will delete all client data including products and FAQs!')) {
      return;
    }

    try {
      await api.delete(`/admin/clients/${clientId}`);
      dispatch(fetchClients(true)); // Force refresh
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowEditModal(true);
  };

  const handleSelectClient = (client) => {
    dispatch(setSelectedClient(client));
    toast.success(`Selected client: ${client.company}`);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Users className="w-7 h-7" />
            Client Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all client accounts and their access
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Clients</p>
          <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Active Clients</p>
          <p className="text-2xl font-bold text-green-600">
            {clients.filter((c) => c.status === 'Active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Inactive Clients</p>
          <p className="text-2xl font-bold text-gray-400">
            {clients.filter((c) => c.status === 'Inactive').length}
          </p>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No clients found matching your search' : 'No clients yet. Create your first client!'}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = activeClient?._id === client._id;
                  return (
                    <tr
                      key={client._id}
                      className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isSelected && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          <div>
                            <p className="font-medium text-gray-900">{client.name}</p>
                            <p className="text-sm text-gray-500">{client.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{client.company}</p>
                        {client.phone && (
                          <p className="text-sm text-gray-500">{client.phone}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            client.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(client.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!isSelected && client.status === 'Active' && (
                            <button
                              onClick={() => handleSelectClient(client)}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              title="Select Client"
                            >
                              Select
                            </button>
                          )}
                          {isSelected && (
                            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg font-medium">
                              Selected
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleStatus(client._id)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={client.status === 'Active' ? 'Deactivate' : 'Activate'}
                          >
                            {client.status === 'Active' ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(client)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(client._id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateClientModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            dispatch(fetchClients(true)); // Force refresh
          }}
        />
      )}

      {showEditModal && editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => {
            setShowEditModal(false);
            setEditingClient(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingClient(null);
            dispatch(fetchClients(true)); // Force refresh
          }}
        />
      )}
    </div>
  );
}
