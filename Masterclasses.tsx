import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Video, Play, LogIn } from 'lucide-react';
import { supabase, type Masterclass } from '../lib/supabase';
import { format } from 'date-fns';
import { useAuth } from '../lib/store';
import { useNavigate } from 'react-router-dom';

export function Masterclasses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'recorded'>('live');
  const [registeredMasterclasses, setRegisteredMasterclasses] = useState<string[]>([]);

  useEffect(() => {
    fetchMasterclasses();
    if (user) {
      fetchRegistrations();
    }
  }, [activeTab, user]);

  const fetchMasterclasses = async () => {
    try {
      let query = supabase
        .from('masterclasses')
        .select(`
          *,
          mentor:profiles!mentor_id(*),
          registrations:masterclass_registrations(count)
        `)
        .eq('type', activeTab);

      if (activeTab === 'live') {
        query = query
          .gte('scheduled_for', new Date().toISOString())
          .order('scheduled_for', { ascending: true });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      const transformedData = data?.map(masterclass => ({
        ...masterclass,
        _count: {
          registrations: masterclass.registrations[0]?.count || 0
        }
      })) || [];

      setMasterclasses(transformedData);
    } catch (error) {
      console.error('Error fetching masterclasses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('masterclass_registrations')
        .select('masterclass_id')
        .eq('profile_id', user!.id);

      if (error) throw error;
      setRegisteredMasterclasses(data.map(r => r.masterclass_id));
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleRegister = async (masterclassId: string) => {
    if (!user) {
      navigate('/login', { state: { from: '/masterclasses' } });
      return;
    }

    try {
      const { error } = await supabase
        .from('masterclass_registrations')
        .insert({ masterclass_id: masterclassId, profile_id: user.id });

      if (error) throw error;
      
      setRegisteredMasterclasses([...registeredMasterclasses, masterclassId]);
      fetchMasterclasses();
    } catch (error) {
      console.error('Error registering for masterclass:', error);
      alert('Failed to register. The class might be full.');
    }
  };

  const handleCancelRegistration = async (masterclassId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('masterclass_registrations')
        .delete()
        .eq('masterclass_id', masterclassId)
        .eq('profile_id', user.id);

      if (error) throw error;
      
      setRegisteredMasterclasses(registeredMasterclasses.filter(id => id !== masterclassId));
      fetchMasterclasses();
    } catch (error) {
      console.error('Error canceling registration:', error);
    }
  };

  const handleWatchRecorded = (masterclassId: string) => {
    if (!user) {
      navigate('/login', { state: { from: '/masterclasses' } });
      return;
    }
    // Handle watching recorded masterclass
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Masterclasses</h1>
        <p className="mt-2 text-gray-600">
          Learn from expert mentors through live webinars and recorded sessions.
        </p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('live')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'live'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <Users className="inline-block h-4 w-4 mr-2" />
              Live Sessions
            </button>
            <button
              onClick={() => setActiveTab('recorded')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'recorded'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <Video className="inline-block h-4 w-4 mr-2" />
              Recorded Sessions
            </button>
          </nav>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {masterclasses.map((masterclass) => (
          <div key={masterclass.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {masterclass.title}
              </h3>
              
              <div className="flex items-center text-gray-500 mb-4">
                <Users className="h-4 w-4 mr-2" />
                <span>with {masterclass.mentor?.full_name}</span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">
                {masterclass.description}
              </p>

              {masterclass.type === 'live' ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {format(new Date(masterclass.scheduled_for!), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {format(new Date(masterclass.scheduled_for!), 'h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {masterclass._count?.registrations || 0} / {masterclass.max_seats} seats taken
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    {user ? (
                      registeredMasterclasses.includes(masterclass.id) ? (
                        <div className="space-y-3">
                          <a
                            href={masterclass.meeting_link!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            Join Session
                          </a>
                          <button
                            onClick={() => handleCancelRegistration(masterclass.id)}
                            className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Cancel Registration
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegister(masterclass.id)}
                          disabled={masterclass._count?.registrations === masterclass.max_seats}
                          className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                        >
                          {masterclass._count?.registrations === masterclass.max_seats
                            ? 'Class Full'
                            : 'Reserve Your Seat'}
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => handleRegister(masterclass.id)}
                        className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                      >
                        <LogIn className="h-5 w-5 mr-2" />
                        Sign in to Reserve
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-6">
                  <button
                    onClick={() => handleWatchRecorded(masterclass.id)}
                    className="block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                  >
                    {user ? (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Watch Now
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-2" />
                        Sign in to Watch
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {masterclasses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">
              No {activeTab} masterclasses available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}