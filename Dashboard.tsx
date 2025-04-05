import React from 'react';
import { useAuth } from '../lib/store';
import { SubscriberDashboard } from '../components/dashboards/SubscriberDashboard';
import { MentorDashboard } from '../components/dashboards/MentorDashboard';
import { TeamAdminDashboard } from '../components/dashboards/TeamAdminDashboard';
import { SystemAdminDashboard } from '../components/dashboards/SystemAdminDashboard';

export function Dashboard() {
  const { user, getRole } = useAuth();
  const role = getRole();

  if (!user) return null;

  switch (role) {
    case 'mentor':
      return <MentorDashboard />;
    case 'team_admin':
      return <TeamAdminDashboard />;
    case 'system_admin':
      return <SystemAdminDashboard />;
    default:
      return <SubscriberDashboard />;
  }
}