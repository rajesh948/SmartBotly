import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { MessageCircle, Search } from 'lucide-react';
import ChatWindow from './ChatWindow';

const ChatInbox = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await api.get(`/conversations?clientId=${user.clientId}`);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Chat Inbox</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm mt-2">WhatsApp messages will appear here</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?._id === conv._id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900">
                    {conv.customerName || conv.customerPhone}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{conv.customerPhone}</p>
                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                    conv.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : conv.status === 'escalated'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {conv.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-24 h-24 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInbox;
