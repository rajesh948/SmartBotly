import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../../services';
import toast from 'react-hot-toast';
import { Save, FileText } from 'lucide-react';
import { fetchClients } from '../../redux/slices/clientsSlice';

const PromptEditor = () => {
  const dispatch = useDispatch();
  const { list: clients, loading: clientsLoading } = useSelector((state) => state.clients);

  const [selectedClient, setSelectedClient] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [promptName, setPromptName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch clients on mount (Redux will handle caching)
    dispatch(fetchClients());
  }, [dispatch]);

  useEffect(() => {
    if (selectedClient) {
      loadPrompts();
    }
  }, [selectedClient]);

  const loadPrompts = async () => {
    try {
      const response = await api.get(`/prompts?clientId=${selectedClient}`);
      setPrompts(response.data.prompts);

      const systemPrompt = response.data.prompts.find((p) => p.type === 'system');
      if (systemPrompt) {
        setCurrentPrompt(systemPrompt.content);
        setPromptName(systemPrompt.name);
      }
    } catch (error) {
      toast.error('Failed to load prompts');
    }
  };

  const handleSave = async () => {
    if (!selectedClient || !currentPrompt) {
      toast.error('Please select a client and enter a prompt');
      return;
    }

    setLoading(true);

    try {
      await api.post('/prompts', {
        clientId: selectedClient,
        name: promptName || 'System Prompt',
        type: 'system',
        content: currentPrompt,
        variables: ['businessName', 'industry'],
      });

      toast.success('Prompt saved successfully!');
      loadPrompts();
    } catch (error) {
      toast.error('Failed to save prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Prompt Editor</h1>
        <p className="text-gray-600 mt-1">Customize AI assistant behavior for each client</p>
      </div>

      <div className="card mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Client
          </label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="input-field"
          >
            <option value="">-- Select a client --</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.businessName}
              </option>
            ))}
          </select>
        </div>

        {selectedClient && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Name
              </label>
              <input
                type="text"
                value={promptName}
                onChange={(e) => setPromptName(e.target.value)}
                className="input-field"
                placeholder="e.g., Elegant Threads AI Assistant"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt
              </label>
              <textarea
                value={currentPrompt}
                onChange={(e) => setCurrentPrompt(e.target.value)}
                className="input-field font-mono text-sm"
                rows="20"
                placeholder="Enter the system prompt for the AI assistant..."
              />
              <p className="text-xs text-gray-500 mt-2">
                Use {'{'}{'{'}}businessName{'}'}{'}'} and {'{'}{'{'}}industry{'}'}{'}'} as variables
              </p>
            </div>

            <div className="flex justify-end">
              <button onClick={handleSave} disabled={loading} className="btn-primary">
                <Save className="w-4 h-4 mr-2 inline" />
                {loading ? 'Saving...' : 'Save Prompt'}
              </button>
            </div>
          </>
        )}
      </div>

      {selectedClient && prompts.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Existing Prompts</h3>
          <div className="space-y-2">
            {prompts.map((prompt) => (
              <div
                key={prompt._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{prompt.name}</p>
                    <p className="text-xs text-gray-500">
                      {prompt.type} • Updated {new Date(prompt.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
