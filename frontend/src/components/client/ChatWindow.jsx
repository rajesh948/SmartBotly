import React, { useState, useEffect } from 'react';
import { api } from '../../services';
import { Bot, User, Phone } from 'lucide-react';
import { format } from 'date-fns';

const ChatWindow = ({ conversation }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [conversation]);

  const loadMessages = async () => {
    try {
      const response = await api.get(`/conversations/${conversation._id}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {conversation.customerName || 'Customer'}
            </h3>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-1" />
              {conversation.customerPhone}
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              conversation.status === 'active'
                ? 'bg-green-100 text-green-700'
                : conversation.status === 'escalated'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {conversation.status}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="text-center py-8">Loading messages...</div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.direction === 'inbound' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    msg.direction === 'inbound'
                      ? 'bg-white text-gray-900'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {msg.direction === 'inbound' && (
                      <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{msg.content}</p>
                      {msg.mediaUrl && (
                        <img
                          src={msg.mediaUrl}
                          alt="Media"
                          className="mt-2 rounded max-w-sm"
                        />
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {format(new Date(msg.timestamp), 'hh:mm a')}
                      </p>
                    </div>
                    {msg.direction === 'outbound' && (
                      <Bot className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
