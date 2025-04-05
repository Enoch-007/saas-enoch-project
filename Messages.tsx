import React from 'react';
import { MessageInbox } from '../components/messaging/MessageInbox';

export function Messages() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="mt-2 text-gray-600">
          Communicate directly with mentors and team members
        </p>
      </div>

      <MessageInbox />
    </div>
  );
}