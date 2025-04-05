import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/store';
import { format } from 'date-fns';
import { MessageSquare, Send } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  sender: {
    full_name: string;
    avatar_url: string;
  };
  receiver: {
    full_name: string;
    avatar_url: string;
  };
}

interface MessageListProps {
  recipientId?: string;
}

export function MessageList({ recipientId }: MessageListProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [user, recipientId]);

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id (
            full_name,
            avatar_url
          ),
          receiver:profiles!receiver_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (recipientId) {
        query = query.or(`and(sender_id.eq.${user?.id},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${user?.id})`);
      } else {
        query = query.or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      if (recipientId) {
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('receiver_id', user?.id)
          .eq('sender_id', recipientId)
          .is('read_at', null);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: recipientId
          ? `or(and(sender_id=eq.${user?.id},receiver_id=eq.${recipientId}),and(sender_id=eq.${recipientId},receiver_id=eq.${user?.id}))`
          : `or(sender_id=eq.${user?.id},receiver_id=eq.${user?.id})`
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user?.id,
          receiver_id: recipientId,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center">
          <MessageSquare className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <div className="divide-y">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 ${
              message.sender_id === user?.id ? 'bg-indigo-50' : 'bg-white'
            }`}
          >
            <div className="flex items-start space-x-3">
              <img
                src={message.sender.avatar_url || 'https://via.placeholder.com/40'}
                alt={message.sender.full_name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {message.sender.full_name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(message.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="mt-1 text-gray-600">{message.content}</p>
              </div>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No messages yet
          </div>
        )}
      </div>

      {recipientId && (
        <div className="p-4 border-t">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              <Send className="h-5 w-5 mr-2" />
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}