import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { Calendar, MessageSquare, CreditCard, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function SubscriberDashboard() {
  const { user } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch upcoming sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select(`
          *,
          mentor:profiles!mentor_id (
            full_name,
            expertise_areas
          )
        `)
        .eq('mentee_id', user?.id)
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(5);

      setUpcomingSessions(sessions || []);

      // Fetch unread message count
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('receiver_id', user?.id)
        .eq('is_read', false);

      setUnreadMessages(count || 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.full_name}</h1>
        <p className="text-gray-600">Here's what's happening with your mentorship journey</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Credits</h2>
            <CreditCard className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{user?.credits || 0}</p>
          <Link
            to="/credits"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
          >
            Purchase more credits →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <MessageSquare className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{unreadMessages}</p>
          <p className="text-gray-600">unread messages</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Next Session</h2>
            <Calendar className="h-6 w-6 text-indigo-600" />
          </div>
          {upcomingSessions[0] ? (
            <>
              <p className="font-semibold text-gray-900">
                with {upcomingSessions[0].mentor.full_name}
              </p>
              <p className="text-gray-600">
                {format(new Date(upcomingSessions[0].scheduled_for), 'MMM d, h:mm a')}
              </p>
            </>
          ) : (
            <p className="text-gray-600">No upcoming sessions</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
          </div>
          <div className="divide-y">
            {upcomingSessions.map((session: any) => (
              <div key={session.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Session with {session.mentor.full_name}
                    </h3>
                    <div className="flex items-center text-gray-500 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      {format(new Date(session.scheduled_for), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Join
                  </button>
                </div>
                <div className="mt-2">
                  {session.mentor.expertise_areas?.slice(0, 2).map((area: string) => (
                    <span
                      key={area}
                      className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full mr-2"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {upcomingSessions.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No upcoming sessions scheduled
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              to="/search"
              className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
            >
              Find a Mentor
            </Link>
            <Link
              to="/masterclasses"
              className="block w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 text-center"
            >
              Browse Masterclasses
            </Link>
            <Link
              to="/profile"
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}