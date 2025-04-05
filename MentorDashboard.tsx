import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { Calendar, DollarSign, Users, Star, Clock, ChevronRight, Flame } from 'lucide-react';
import { format } from 'date-fns';

export function MentorDashboard() {
  const { user } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [upcomingFiresideChats, setUpcomingFiresideChats] = useState([]);
  const [earnings, setEarnings] = useState({ total: 0, pending: 0 });
  const [reviews, setReviews] = useState({ count: 0, average: 0 });
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
          mentee:profiles!mentee_id (
            full_name
          )
        `)
        .eq('mentor_id', user?.id)
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(5);

      setUpcomingSessions(sessions || []);

      // Fetch upcoming fireside chats
      const { data: firesideChats } = await supabase
        .from('fireside_chats')
        .select(`
          *,
          _count { registrations }
        `)
        .eq('mentor_id', user?.id)
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true });

      setUpcomingFiresideChats(firesideChats || []);

      // Fetch earnings data
      const { data: transactions } = await supabase
        .from('credits_transactions')
        .select('amount')
        .eq('profile_id', user?.id)
        .eq('transaction_type', 'session_payment');

      const totalEarnings = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

      // Fetch pending earnings
      const { data: escrow } = await supabase
        .from('credit_escrow')
        .select('amount')
        .eq('status', 'pending')
        .in('session_id', sessions?.map(s => s.id) || []);

      const pendingEarnings = escrow?.reduce((sum, e) => sum + e.amount, 0) || 0;

      setEarnings({
        total: totalEarnings,
        pending: pendingEarnings
      });

      // Mock reviews data (implement actual reviews later)
      setReviews({
        count: 12,
        average: 4.8
      });
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
        <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
        <p className="text-gray-600">Manage your mentoring activities and earnings</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Total Earnings</h2>
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{earnings.total}</p>
          <p className="text-gray-600">credits earned</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pending</h2>
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{earnings.pending}</p>
          <p className="text-gray-600">credits in escrow</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Rating</h2>
            <Star className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{reviews.average}</p>
          <p className="text-gray-600">{reviews.count} reviews</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sessions</h2>
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{upcomingSessions.length}</p>
          <p className="text-gray-600">upcoming</p>
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
                      Session with {session.mentee.full_name}
                    </h3>
                    <div className="flex items-center text-gray-500 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(session.scheduled_for), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Start
                  </button>
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

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link
                to="/mentor/availability"
                className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
              >
                Manage Availability
              </Link>
              <button
                onClick={() => setShowFiresideModal(true)}
                className="block w-full px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 text-center flex items-center justify-center"
              >
                <Flame className="h-5 w-5 mr-2" />
                Schedule Fireside Chat
              </button>
              <Link
                to="/mentor/masterclasses"
                className="block w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 text-center"
              >
                Create Masterclass
              </Link>
              <Link
                to="/profile"
                className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Fireside Chats</h2>
            </div>
            <div className="divide-y">
              {upcomingFiresideChats.map((chat: any) => (
                <div key={chat.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{chat.title}</h3>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(chat.scheduled_for), 'MMM d, yyyy h:mm a')}
                      </div>
                      <div className="flex items-center text-gray-500 mt-1">
                        <Users className="h-4 w-4 mr-1" />
                        {chat._count.registrations} / {chat.max_seats} registered
                      </div>
                    </div>
                    <a
                      href={chat.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Start Chat
                    </a>
                  </div>
                </div>
              ))}
              {upcomingFiresideChats.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No upcoming fireside chats
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Recent Reviews</h2>
            </div>
            <div className="p-6">
              <div className="text-center">
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900 mb-1">{reviews.average}</p>
                <p className="text-gray-600">{reviews.count} total reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}