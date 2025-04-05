import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/store';
import { supabase, MENTOR_EXPERIENCES, EXPERTISE_AREAS, COMMON_LANGUAGES, MEETING_PLATFORMS, type MeetingPlatform } from '../lib/supabase';

export function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calUsername, setCalUsername] = useState('');
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>('zoom');
  const [meetingLink, setMeetingLink] = useState('');
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    role: user?.role || 'mentee',
    mentor_experience: user?.mentor_experience || [],
    expertise_areas: user?.expertise_areas || [],
    years_of_experience: user?.years_of_experience || 0,
    languages_spoken: user?.languages_spoken || [],
    session_rate: user?.session_rate || 0,
    professional_background: user?.professional_background || '',
  });

  useEffect(() => {
    if (user?.role === 'mentor') {
      const fetchMentorSettings = async () => {
        const { data } = await supabase
          .from('mentor_calendars')
          .select('cal_username, meeting_platform, meeting_link')
          .eq('mentor_id', user.id)
          .single();
        
        if (data) {
          setCalUsername(data.cal_username);
          setMeetingPlatform(data.meeting_platform);
          setMeetingLink(data.meeting_link || '');
        }
      };

      fetchMentorSettings();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user?.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update calendar and meeting settings if mentor
      if (formData.role === 'mentor' && (calUsername || meetingLink)) {
        const { error: calError } = await supabase
          .from('mentor_calendars')
          .upsert({
            mentor_id: user?.id,
            cal_username: calUsername,
            meeting_platform: meetingPlatform,
            meeting_link: meetingLink,
            updated_at: new Date().toISOString(),
          });

        if (calError) throw calError;
      }

      if (data) {
        setUser(data);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceChange = (experience: string) => {
    const newExperience = formData.mentor_experience.includes(experience)
      ? formData.mentor_experience.filter(e => e !== experience)
      : [...formData.mentor_experience, experience];
    setFormData({ ...formData, mentor_experience: newExperience });
  };

  const handleExpertiseChange = (expertise: string) => {
    const newExpertise = formData.expertise_areas.includes(expertise)
      ? formData.expertise_areas.filter(e => e !== expertise)
      : [...formData.expertise_areas, expertise];
    setFormData({ ...formData, expertise_areas: newExpertise });
  };

  const handleLanguageChange = (language: string) => {
    const newLanguages = formData.languages_spoken.includes(language)
      ? formData.languages_spoken.filter(l => l !== language)
      : [...formData.languages_spoken, language];
    setFormData({ ...formData, languages_spoken: newLanguages });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'mentor' | 'mentee' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="mentee">Mentee</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          {formData.role === 'mentor' && (
            <>
              <div>
                <label htmlFor="cal_username" className="block text-sm font-medium text-gray-700">
                  Cal.com Username
                </label>
                <input
                  type="text"
                  id="cal_username"
                  value={calUsername}
                  onChange={(e) => setCalUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="your-username"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter your Cal.com username to enable calendar booking
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="meeting_platform" className="block text-sm font-medium text-gray-700">
                    Meeting Platform
                  </label>
                  <select
                    id="meeting_platform"
                    value={meetingPlatform}
                    onChange={(e) => setMeetingPlatform(e.target.value as MeetingPlatform)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    {Object.entries(MEETING_PLATFORMS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="meeting_link" className="block text-sm font-medium text-gray-700">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    id="meeting_link"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={`Your ${MEETING_PLATFORMS[meetingPlatform]} meeting link`}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This link will be shared with mentees when they book a session
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="years_of_experience" className="block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    id="years_of_experience"
                    min="0"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="session_rate" className="block text-sm font-medium text-gray-700">
                    Session Rate (credits/hour)
                  </label>
                  <input
                    type="number"
                    id="session_rate"
                    min="0"
                    value={formData.session_rate}
                    onChange={(e) => setFormData({ ...formData, session_rate: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="professional_background" className="block text-sm font-medium text-gray-700">
                  Professional Background
                </label>
                <textarea
                  id="professional_background"
                  rows={4}
                  value={formData.professional_background}
                  onChange={(e) => setFormData({ ...formData, professional_background: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe your professional background and qualifications..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages Spoken
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {COMMON_LANGUAGES.map((language) => (
                    <label
                      key={language}
                      className="relative flex items-start py-2"
                    >
                      <div className="min-w-0 flex-1 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.languages_spoken.includes(language)}
                          onChange={() => handleLanguageChange(language)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                        />
                        {language}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas of Experience
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MENTOR_EXPERIENCES.map((experience) => (
                    <label
                      key={experience}
                      className="relative flex items-start py-2"
                    >
                      <div className="min-w-0 flex-1 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.mentor_experience.includes(experience)}
                          onChange={() => handleExperienceChange(experience)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                        />
                        {experience}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Areas of Expertise
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EXPERTISE_AREAS.map((expertise) => (
                    <label
                      key={expertise}
                      className="relative flex items-start py-2"
                    >
                      <div className="min-w-0 flex-1 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.expertise_areas.includes(expertise)}
                          onChange={() => handleExpertiseChange(expertise)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                        />
                        {expertise}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}