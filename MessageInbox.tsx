import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/store';
import { format } from 'date-fns';
import { MessageSquare, Search } from 'lucide-react';
import { MessageList } from './MessageList';

interface Conversation {
  user_id: string;
  full_name: string;
  avatar_url: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export function MessageInbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      const { data: messages } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          read_at,
          sender:profiles!sender_id (
            full_name,
            avatar_url
          ),
          receiver:profiles!receiver_id (
            full_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (!messages) return;

      // Process messages into conversations
      const conversationMap = new Map<string, Conversation>();

      messages.forEach((message) => {
        const otherUserId = message.sender_id === user?.id
          ? message.receiver_id
          : message.sender_id;

        const otherUser = message.sender_id === user?.id
          ? message.receiver
          : message.sender;

        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            user_id: otherUserId,
            full_name: otherUser.full_name,
            avatar_url: otherUser.avatar_url,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: message.receiver_id === user?.id && !message.read_at ? 1 : 0
          });
        } else if (message.receiver_id === user?.id && !message.read_at) {
          const conv = conversationMap.get(otherUserId)!;
          conv.unread_count++;
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center">
            <MessageSquare className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Conversations</h2>
          </div>
        </div>

        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="divide-y max-h-[600px] overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.user_id}
              onClick={() => setSelectedUser(conv.user_id)}
              className={`w-full p-4 text-left hover:bg-gray-50 ${
                selectedUser === conv.user_id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={conv.avatar_url || 'https://via.placeholder.com/40'}
                  alt={conv.full_name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 truncate">
                      {conv.full_name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(conv.last_message_time), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.last_message}
                  </p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            </button>
          ))}

          {filteredConversations.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No conversations found
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        {selectedUser ? (
          <MessageList recipientId={selectedUser} />
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Select a conversation
            </h3>
            <p className="text-gray-500">
              Choose a conversation from the list to view messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
}