import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/store';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Flame, Users, Calendar, LogIn } from 'lucide-react';

interface FiresideChat {
  id: string;
  title: string;
  description: string;
  scheduled_for: string;
  max_seats: number;
  meeting_link: string;
  mentor: {
    full_name: string;
    avatar_url: string;
  };
  registrations_count: number;
}

export function FiresideList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [firesideChats, setFiresideChats] = useState<FiresideChat[]>([]);
  const [registeredChats, setRegisteredChats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiresideChats();
    if (user) {
      fetchRegistrations();
    }
  }, [user]);

  const fetchFiresideChats = async () => {
    try {
      const { data, error } = await supabase
        .from('fireside_chats')
        .select(`
          *,
          mentor:profiles!mentor_id (*),
          registrations:fireside_chat_registrations(count)
        `)
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match the expected format
      const transformedData = data?.map(chat => ({
        ...chat,
        registrations_count: chat.registrations[0]?.count || 0
      })) || [];
      
      setFiresideChats(transformedData);
    } catch (error) {
      console.error('Error fetching fireside chats:', error);
      setError('Failed to load fireside chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data } = await supabase
        .from('fireside_chat_registrations')
        .select('fireside_chat_id')
        .eq('profile_id', user!.id);

      setRegisteredChats(data?.map(r => r.fireside_chat_id) || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleRegister = async (firesideId: string) => {
    if (!user) {
      navigate('/login', { state: { from: '/commons' } });
      return;
    }

    try {
      const { error } = await supabase
        .from('fireside_chat_registrations')
        .insert({ fireside_chat_id: firesideId, profile_id: user.id });

      if (error) throw error;
      
      setRegisteredChats([...registeredChats, firesideId]);
      fetchFiresideChats();
    } catch (error) {
      console.error('Error registering for fireside chat:', error);
      setError('Failed to register. The session might be full.');
    }
  };

  const handleCancelRegistration = async (firesideId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('fireside_chat_registrations')
        .delete()
        .eq('fireside_chat_id', firesideId)
        .eq('profile_id', user.id);

      if (error) throw error;
      
      setRegisteredChats(registeredChats.filter(id => id !== firesideId));
      fetchFiresideChats();
    } catch (error) {
      console.error('Error canceling registration:', error);
      setError('Failed to cancel registration');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {firesideChats.map((chat) => (
        <div key={chat.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{chat.title}</h3>
              <p className="text-gray-500 mt-1">with {chat.mentor.full_name}</p>
              <p className="mt-2 text-gray-600">{chat.description}</p>
              <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(chat.scheduled_for), 'MMM d, yyyy h:mm a')}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {chat.registrations_count} / {chat.max_seats} seats taken
                </div>
              </div>
            </div>

            <div>
              {user ? (
                registeredChats.includes(chat.id) ? (
                  <div className="space-y-2">
                    <a
                      href={chat.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Join Chat
                    </a>
                    <button
                      onClick={() => handleCancelRegistration(chat.id)}
                      className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel Registration
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRegister(chat.id)}
                    disabled={chat.registrations_count >= chat.max_seats}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    {chat.registrations_count >= chat.max_seats
                      ? 'Session Full'
                      : 'Reserve Seat'}
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleRegister(chat.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign in to Reserve
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {firesideChats.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Flame className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Fireside Chats Scheduled</h3>
          <p className="text-gray-500">
            Check back later for upcoming sessions
          </p>
        </div>
      )}
    </div>
  );
}