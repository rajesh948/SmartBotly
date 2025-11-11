import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Send, Bot, User } from 'lucide-react';
import { fetchClients } from '../../redux/slices/clientsSlice';

const ChatSimulator = () => {
  const dispatch = useDispatch();
  const { list: clients, loading: clientsLoading } = useSelector((state) => state.clients);

  const [selectedClient, setSelectedClient] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch clients on mount (Redux will handle caching)
    dispatch(fetchClients());
  }, [dispatch]);

  const handleSend = async () => {
    if (!selectedClient || !input.trim()) {
      toast.error('Please select a client and enter a message');
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Simulated response - implement real endpoint later
      setTimeout(() => {
        const botMessage = {
          role: 'assistant',
          content: 'This is a simulated response. Connect the backend to see real AI responses.',
        };
        setMessages((prev) => [...prev, botMessage]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to get response');
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chat Simulator</h1>
        <p className="text-gray-600 mt-1">Test AI responses for your clients</p>
      </div>

      <div className="card mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Client
        </label>
        <select
          value={selectedClient}
          onChange={(e) => {
            setSelectedClient(e.target.value);
            setMessages([]);
          }}
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
        <div className="card h-[600px] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Start a conversation to test the AI assistant</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {msg.role === 'assistant' && (
                        <Bot className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      )}
                      <p className="text-sm">{msg.content}</p>
                      {msg.role === 'user' && (
                        <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="input-field flex-1"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="btn-primary"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSimulator;
