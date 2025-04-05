import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { Users, CreditCard, TrendingUp, Settings } from 'lucide-react';

interface TeamStats {
  totalMembers: number;
  activeUsers: number;
  creditBalance: number;
  creditUsage: number;
}

export function TeamAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TeamStats>({
    totalMembers: 0,
    activeUsers: 0,
    creditBalance: 0,
    creditUsage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamStats();
  }, [user]);

  const fetchTeamStats = async () => {
    try {
      // Fetch organization data
      const { data: org } = await supabase
        .from('organizations')
        .select('*, organization_members(*)')
        .eq('owner_id', user?.id)
        .single();

      if (org) {
        // Get credit usage for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: usage } = await supabase
          .from('credits_transactions')
          .select('amount')
          .eq('organization_id', org.id)
          .gte('created_at', thirtyDaysAgo.toISOString());

        const creditUsage = usage?.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) || 0;

        setStats({
          totalMembers: org.organization_members.length,
          activeUsers: org.organization_members.filter((m: any) => m.last_active_at > thirtyDaysAgo).length,
          creditBalance: org.credit_balance,
          creditUsage
        });
      }
    } catch (error) {
      console.error('Error fetching team stats:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Team Admin Dashboard</h1>
        <p className="text-gray-600">Manage your team and monitor credit usage</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
          <p className="text-gray-600">{stats.activeUsers} active this month</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Credit Balance</h2>
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.creditBalance}</p>
          <Link
            to="/team/credits"
            className="text-indigo-600 hover:text-indigo-700"
          >
            Purchase more →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Credit Usage</h2>
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.creditUsage}</p>
          <p className="text-gray-600">Last 30 days</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            <Settings className="h-6 w-6 text-gray-600" />
          </div>
          <Link
            to="/team/settings"
            className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Manage Team
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              to="/team/members"
              className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
            >
              Manage Team Members
            </Link>
            <Link
              to="/team/credits"
              className="block w-full px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 text-center"
            >
              Purchase Credits
            </Link>
            <Link
              to="/team/usage"
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
            >
              View Usage Reports
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {/* Add recent activity feed here */}
            <p className="text-center text-gray-500">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}