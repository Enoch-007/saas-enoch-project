import React, { useState } from 'react';
import { MessagesSquare, Flame } from 'lucide-react';
import { DiscussionList } from '../components/discussions/DiscussionList';
import { FiresideList } from '../components/fireside/FiresideList';

type Tab = 'coffee-talk' | 'fireside';

export function Commons() {
  const [activeTab, setActiveTab] = useState<Tab>('coffee-talk');

  return (
    <div className="max-w-7xl mx-auto">
      {/* Mobile Toggle */}
      <div className="md:hidden mb-6">
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            onClick={() => setActiveTab('coffee-talk')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'coffee-talk'
                ? 'bg-white text-purple-600 shadow'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <MessagesSquare className="h-4 w-4 mr-2" />
            Coffee Talk
          </button>
          <button
            onClick={() => setActiveTab('fireside')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'fireside'
                ? 'bg-white text-orange-600 shadow'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Flame className="h-4 w-4 mr-2" />
            Fireside Chats
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex gap-8">
        {/* Main content area (70%) */}
        <div className="w-[70%]">
          <div className="mb-8 flex items-center">
            <MessagesSquare className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coffee Talk</h1>
              <p className="mt-2 text-gray-600">
                Connect, share, and learn from fellow education leaders in a casual setting
              </p>
            </div>
          </div>

          <DiscussionList />
        </div>

        {/* Sidebar (30%) */}
        <div className="w-[30%]">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <Flame className="h-6 w-6 text-orange-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Fireside Chats</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Join intimate group sessions with experienced mentors to discuss specific topics in education leadership.
            </p>
          </div>

          <FiresideList />
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden">
        {activeTab === 'coffee-talk' ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Coffee Talk</h1>
              <p className="mt-2 text-gray-600">
                Connect, share, and learn from fellow education leaders in a casual setting
              </p>
            </div>
            <DiscussionList />
          </>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Fireside Chats</h2>
              <p className="mt-2 text-gray-600">
                Join intimate group sessions with experienced mentors to discuss specific topics in education leadership.
              </p>
            </div>
            <FiresideList />
          </>
        )}
      </div>
    </div>
  );
}