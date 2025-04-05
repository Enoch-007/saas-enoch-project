import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/store';
import { format } from 'date-fns';
import { MessageSquare, Plus, Search, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Discussion {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: {
    full_name: string;
    avatar_url: string;
  };
  replies_count: number;
}

export function DiscussionList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          author:profiles!author_id (
            full_name,
            avatar_url
          ),
          replies:discussion_replies(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the expected format
      const transformedData = data?.map(discussion => ({
        ...discussion,
        replies_count: discussion.replies[0]?.count || 0
      })) || [];

      setDiscussions(transformedData);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: '/discussions' } });
      return;
    }

    try {
      const { error } = await supabase
        .from('discussions')
        .insert({
          author_id: user.id,
          title: newDiscussion.title,
          content: newDiscussion.content
        });

      if (error) throw error;

      setNewDiscussion({ title: '', content: '' });
      setShowNewDiscussion(false);
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const handleNewDiscussionClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/discussions' } });
      return;
    }
    setShowNewDiscussion(true);
  };

  const filteredDiscussions = discussions.filter(
    disc => disc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           disc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleNewDiscussionClick}
          className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
        >
          {user ? (
            <>
              <Plus className="h-5 w-5 mr-2" />
              New Discussion
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-2" />
              Sign in to Post
            </>
          )}
        </button>
      </div>

      {showNewDiscussion && user && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Start a New Discussion
          </h3>
          <form onSubmit={handleCreateDiscussion} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={newDiscussion.title}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content
              </label>
              <textarea
                id="content"
                value={newDiscussion.content}
                onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewDiscussion(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Create Discussion
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {filteredDiscussions.map((discussion) => (
          <Link
            key={discussion.id}
            to={`/discussions/${discussion.id}`}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={discussion.author.avatar_url || 'https://via.placeholder.com/40'}
                  alt={discussion.author.full_name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {discussion.title}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Posted by {discussion.author.full_name} •{' '}
                    {format(new Date(discussion.created_at), 'MMM d, yyyy')}
                  </p>
                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {discussion.content}
                  </p>
                  <div className="mt-4 flex items-center text-gray-500">
                    <MessageSquare className="h-5 w-5 mr-1" />
                    {discussion.replies_count} replies
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {filteredDiscussions.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No discussions found</p>
          </div>
        )}
      </div>
    </div>
  );
}