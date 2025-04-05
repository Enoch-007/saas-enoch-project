import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/store';
import { format } from 'date-fns';
import { ArrowLeft, MessageSquare, DollarSign, Clock } from 'lucide-react';

interface Discussion {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

interface Reply {
  id: string;
  content: string;
  created_at: string;
  is_mentor_bid: boolean;
  bid_credits?: number;
  bid_hours?: number;
  author: {
    id: string;
    full_name: string;
    avatar_url: string;
    role: string;
  };
}

export function DiscussionDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isBid, setIsBid] = useState(false);
  const [bidDetails, setBidDetails] = useState({
    credits: 0,
    hours: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDiscussion();
      fetchReplies();
    }
  }, [id]);

  const fetchDiscussion = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          *,
          author:profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setDiscussion(data);
    } catch (error) {
      console.error('Error fetching discussion:', error);
      setError('Failed to load discussion');
    }
  };

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('discussion_replies')
        .select(`
          *,
          author:profiles (
            id,
            full_name,
            avatar_url,
            role
          )
        `)
        .eq('discussion_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newReply.trim()) return;

    try {
      const replyData = {
        discussion_id: id,
        author_id: user.id,
        content: newReply.trim(),
        is_mentor_bid: isBid,
        ...(isBid ? {
          bid_credits: bidDetails.credits,
          bid_hours: bidDetails.hours
        } : {})
      };

      const { error } = await supabase
        .from('discussion_replies')
        .insert(replyData);

      if (error) throw error;

      setNewReply('');
      setIsBid(false);
      setBidDetails({ credits: 0, hours: 0 });
      fetchReplies();
    } catch (error) {
      console.error('Error posting reply:', error);
      setError('Failed to post reply');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Discussion not found</h2>
        <Link
          to="/discussions"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
        >
          Back to discussions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/discussions"
        className="inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Discussions
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start space-x-4">
          <img
            src={discussion.author.avatar_url || 'https://via.placeholder.com/40'}
            alt={discussion.author.full_name}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{discussion.title}</h1>
            <p className="text-gray-500 text-sm">
              Posted by {discussion.author.full_name} •{' '}
              {format(new Date(discussion.created_at), 'MMM d, yyyy')}
            </p>
            <div className="mt-4 prose max-w-none">
              {discussion.content}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center">
            <MessageSquare className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Replies ({replies.length})
            </h2>
          </div>
        </div>

        <div className="divide-y">
          {replies.map((reply) => (
            <div key={reply.id} className="p-6">
              <div className="flex items-start space-x-4">
                <img
                  src={reply.author.avatar_url || 'https://via.placeholder.com/40'}
                  alt={reply.author.full_name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-gray-900">
                        {reply.author.full_name}
                      </span>
                      {reply.author.role === 'mentor' && (
                        <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                          Mentor
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(reply.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <div className="mt-2 text-gray-600">{reply.content}</div>
                  {reply.is_mentor_bid && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900">Mentor Bid</h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center text-green-800">
                          <DollarSign className="h-5 w-5 mr-2" />
                          {reply.bid_credits} credits
                        </div>
                        <div className="flex items-center text-green-800">
                          <Clock className="h-5 w-5 mr-2" />
                          {reply.bid_hours} hours
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {replies.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No replies yet
            </div>
          )}
        </div>

        {user && (
          <div className="p-6 border-t">
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div>
                <label htmlFor="reply" className="block text-sm font-medium text-gray-700">
                  Your Reply
                </label>
                <textarea
                  id="reply"
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {user.role === 'mentor' && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isBid}
                      onChange={(e) => setIsBid(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Include a bid for mentoring
                    </span>
                  </label>

                  {isBid && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Credits
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={bidDetails.credits}
                          onChange={(e) => setBidDetails(prev => ({
                            ...prev,
                            credits: parseInt(e.target.value)
                          }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required={isBid}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Hours
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={bidDetails.hours}
                          onChange={(e) => setBidDetails(prev => ({
                            ...prev,
                            hours: parseInt(e.target.value)
                          }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required={isBid}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Post Reply
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}