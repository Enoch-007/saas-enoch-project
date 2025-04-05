import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { Users, Activity, AlertTriangle, Settings, TrendingUp, MessageSquare } from 'lucide-react';

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalMentors: number;
  pendingApprovals: number;
  totalSessions: number;
  totalCredits: number;
}

export function SystemAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMentors: 0,
    pendingApprovals: 0,
    totalSessions: 0,
    totalCredits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      // Fetch user stats
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      const { count: totalMentors } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'mentor');

      // Fetch session stats
      const { count: totalSessions } = await supabase
        .from('sessions')
        .select('*', { count: 'exact' });

      // Mock some stats that would require more complex queries
      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: Math.floor((totalUsers || 0) * 0.7), // Mock active users
        totalMentors: totalMentors || 0,
        pendingApprovals: 5, // Mock pending approvals
        totalSessions: totalSessions || 0,
        totalCredits: 10000 // Mock total credits in system
      });
    } catch (error) {
      console.error('Error fetching platform stats:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">System Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and management</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Users</h2>
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          <p className="text-gray-600">{stats.activeUsers} active users</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mentors</h2>
            <Activity className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalMentors}</p>
          <p className="text-gray-600">{stats.pendingApprovals} pending approvals</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sessions</h2>
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
          <p className="text-gray-600">Total sessions completed</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              to="/admin/users"
              className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/approvals"
              className="block w-full px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 text-center flex items-center justify-center"
            >
              <AlertTriangle className="h-5 w-5 mr-2" />
              Pending Approvals ({stats.pendingApprovals})
            </Link>
            <Link
              to="/admin/settings"
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
            >
              Platform Settings
            </Link>
          </div>
        </div>

        

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">System Notifications</h2>
            </div>
            <div className="p-6">
              <Link
                to="/admin/notifications"
                className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center flex items-center justify-center"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Send System Message
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
            </div>
            <div className="p-6">
              <Link
                to="/admin/analytics"
                className="block w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 text-center flex items-center justify-center"
              >
                <Settings className="h-5 w-5 mr-2" />
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}