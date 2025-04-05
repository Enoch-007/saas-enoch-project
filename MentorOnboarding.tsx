import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/store';
import { MENTOR_EXPERIENCES, EXPERTISE_AREAS, COMMON_LANGUAGES, MEETING_PLATFORMS, type MeetingPlatform } from '../../lib/supabase';
import { AlertCircle, ArrowRight, Calendar, Check } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: 'expertise',
    title: 'Your Expertise',
    description: 'Tell us about your experience and areas of expertise'
  },
  {
    id: 'background',
    title: 'Professional Background',
    description: 'Share your professional journey and achievements'
  },
  {
    id: 'availability',
    title: 'Availability',
    description: 'Set up your calendar and meeting preferences'
  }
];

export function MentorOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    headline: '',
    detailed_bio: '',
    mentor_experience: [] as string[],
    expertise_areas: [] as string[],
    languages_spoken: [] as string[],
    years_of_experience: 0,
    session_rate: 1,
    education: [''],
    certifications: [''],
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    calendar_30min: '',
    calendar_60min: '',
    meeting_platform: 'zoom' as MeetingPlatform,
    meeting_link: '',
    meeting_password: ''
  });

  useEffect(() => {
    // Load existing data if available
    const loadExistingData = async () => {
      if (!user?.id) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const { data: calendar } = await supabase
          .from('mentor_calendars')
          .select('*')
          .eq('mentor_id', user.id)
          .single();

        if (profile) {
          setFormData(prev => ({
            ...prev,
            headline: profile.headline || '',
            detailed_bio: profile.detailed_bio || '',
            mentor_experience: profile.mentor_experience || [],
            expertise_areas: profile.expertise_areas || [],
            languages_spoken: profile.languages_spoken || [],
            years_of_experience: profile.years_of_experience || 0,
            session_rate: profile.session_rate || 1,
            education: profile.education || [''],
            certifications: profile.certifications || [''],
            time_zone: profile.time_zone || prev.time_zone,
          }));
        }

        if (calendar) {
          setFormData(prev => ({
            ...prev,
            calendar_30min: calendar.calendar_30min || '',
            calendar_60min: calendar.calendar_60min || '',
            meeting_platform: calendar.meeting_platform || 'zoom',
            meeting_link: calendar.meeting_link || '',
            meeting_password: calendar.meeting_password || ''
          }));
        }
      } catch (error) {
        console.error('Error loading existing data:', error);
      }
    };

    loadExistingData();
  }, [user?.id]);

  const validateStep = () => {
    setError('');
    
    switch (currentStep) {
      case 0:
        if (formData.mentor_experience.length === 0) {
          setError('Please select at least one area of experience');
          return false;
        }
        if (formData.expertise_areas.length === 0) {
          setError('Please select at least one area of expertise');
          return false;
        }
        if (formData.languages_spoken.length === 0) {
          setError('Please select at least one language');
          return false;
        }
        if (formData.years_of_experience < 0) {
          setError('Years of experience cannot be negative');
          return false;
        }
        if (formData.session_rate < 1) {
          setError('Session rate must be at least 1 credit');
          return false;
        }
        return true;

      case 1:
        if (!formData.headline.trim()) {
          setError('Please provide a professional headline');
          return false;
        }
        if (!formData.detailed_bio.trim()) {
          setError('Please provide a detailed bio');
          return false;
        }
        if (!formData.education[0]?.trim()) {
          setError('Please provide at least one education entry');
          return false;
        }
        return true;

      case 2:
        if (!formData.meeting_link.trim()) {
          setError('Please provide a meeting link');
          return false;
        }
        if (!formData.calendar_30min.trim() && !formData.calendar_60min.trim()) {
          setError('Please provide at least one calendar link');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleExperienceChange = (experience: string) => {
    setFormData(prev => ({
      ...prev,
      mentor_experience: prev.mentor_experience.includes(experience)
        ? prev.mentor_experience.filter(e => e !== experience)
        : [...prev.mentor_experience, experience]
    }));
  };

  const handleExpertiseChange = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.includes(expertise)
        ? prev.expertise_areas.filter(e => e !== expertise)
        : [...prev.expertise_areas, expertise]
    }));
  };

  const handleLanguageChange = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages_spoken: prev.languages_spoken.includes(language)
        ? prev.languages_spoken.filter(l => l !== language)
        : [...prev.languages_spoken, language]
    }));
  };

  const handleEducationChange = (index: number, value: string) => {
    const newEducation = [...formData.education];
    newEducation[index] = value;
    setFormData({ ...formData, education: newEducation });
  };

  const handleCertificationChange = (index: number, value: string) => {
    const certifications = [...formData.certifications];
    certifications[index] = value;
    setFormData({ ...formData, certifications });
  };

  const addEducation = () => {
    setFormData({ ...formData, education: [...formData.education, ''] });
  };

  const addCertification = () => {
    setFormData({ ...formData, certifications: [...formData.certifications, ''] });
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          headline: formData.headline,
          detailed_bio: formData.detailed_bio,
          mentor_experience: formData.mentor_experience,
          expertise_areas: formData.expertise_areas,
          languages_spoken: formData.languages_spoken,
          years_of_experience: formData.years_of_experience,
          session_rate: formData.session_rate,
          education: formData.education.filter(Boolean),
          certifications: formData.certifications.filter(Boolean),
          time_zone: formData.time_zone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Save calendar settings
      const { error: calendarError } = await supabase
        .from('mentor_calendars')
        .upsert({
          mentor_id: user?.id,
          calendar_30min: formData.calendar_30min,
          calendar_60min: formData.calendar_60min,
          meeting_platform: formData.meeting_platform,
          meeting_link: formData.meeting_link,
          meeting_password: formData.meeting_password,
          updated_at: new Date().toISOString()
        });

      if (calendarError) throw calendarError;

      // Only navigate after both operations complete successfully
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving mentor profile:', err);
      setError('Failed to save your profile. Please try again.');
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    setError('');
    
    if (currentStep === STEPS.length - 1) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Areas of Experience
              </label>
              <div className="grid grid-cols-2 gap-4">
                {MENTOR_EXPERIENCES.map((experience) => (
                  <label key={experience} className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={formData.mentor_experience.includes(experience)}
                        onChange={() => handleExperienceChange(experience)}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="text-gray-700">{experience}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Areas of Expertise
              </label>
              <div className="grid grid-cols-2 gap-4">
                {EXPERTISE_AREAS.map((expertise) => (
                  <label key={expertise} className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={formData.expertise_areas.includes(expertise)}
                        onChange={() => handleExpertiseChange(expertise)}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="text-gray-700">{expertise}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Languages Spoken
              </label>
              <div className="grid grid-cols-3 gap-4">
                {COMMON_LANGUAGES.map((language) => (
                  <label key={language} className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={formData.languages_spoken.includes(language)}
                        onChange={() => handleLanguageChange(language)}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="text-gray-700">{language}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.years_of_experience}
                  onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Session Rate (credits/hour)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.session_rate}
                  onChange={(e) => setFormData({ ...formData, session_rate: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Professional Headline
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="e.g., High School Principal with 15+ years experience"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Detailed Bio
              </label>
              <textarea
                rows={4}
                value={formData.detailed_bio}
                onChange={(e) => setFormData({ ...formData, detailed_bio: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Share your professional journey and what makes you a great mentor..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education
              </label>
              {formData.education.map((edu, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={edu}
                    onChange={(e) => handleEducationChange(index, e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="e.g., M.Ed. in Educational Leadership"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addEducation}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                + Add Education
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certifications
              </label>
              {formData.certifications.map((cert, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => handleCertificationChange(index, e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="e.g., Principal Certification"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addCertification}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                + Add Certification
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                30-Minute Session Calendar Link
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  cal.com/
                </span>
                <input
                  type="text"
                  value={formData.calendar_30min}
                  onChange={(e) => setFormData({ ...formData, calendar_30min: e.target.value })}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="your-username/30min"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter your Cal.com link for 30-minute sessions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                60-Minute Session Calendar Link
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  cal.com/
                </span>
                <input
                  type="text"
                  value={formData.calendar_60min}
                  onChange={(e) => setFormData({ ...formData, calendar_60min: e.target.value })}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="your-username/60min"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter your Cal.com link for 60-minute sessions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meeting Platform
              </label>
              <select
                value={formData.meeting_platform}
                onChange={(e) => setFormData({ ...formData, meeting_platform: e.target.value as MeetingPlatform })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                {Object.entries(MEETING_PLATFORMS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meeting Link
              </label>
              <input
                type="url"
                value={formData.meeting_link}
                onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder={`Your ${MEETING_PLATFORMS[formData.meeting_platform]} meeting link`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meeting Password
              </label>
              <input
                type="text"
                value={formData.meeting_password}
                onChange={(e) => setFormData({ ...formData, meeting_password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Optional meeting password"
              />
              <p className="mt-2 text-sm text-gray-500">
                If your meeting requires a password, enter it here
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time Zone
              </label>
              <select
                value={formData.time_zone}
                onChange={(e) => setFormData({ ...formData, time_zone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                {Intl.supportedValuesOf('timeZone').map((zone) => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Mentor Profile</h1>
        <p className="mt-2 text-gray-600">
          Help us match you with the right mentees by sharing your expertise
        </p>
      </div>

      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {STEPS.map((step, index) => (
              <li key={step.id} className={`relative ${index !== 0 ? 'pl-6 ml-6' : ''} ${index !== STEPS.length - 1 ? 'pr-6 mr-6' : ''}`}>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < currentStep
                        ? 'bg-purple-600 text-white'
                        : index === currentStep
                        ? 'border-2 border-purple-600 text-purple-600'
                        : 'border-2 border-gray-300 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{step.title}</p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index !== STEPS.length - 1 && (
                  <div className="absolute top-4 right-0 -mr-6 w-6 h-0.5 bg-gray-300" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        {renderStep()}

        <div className="mt-6 flex justify-end space-x-3">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : currentStep === STEPS.length - 1 ? (
              'Complete Profile'
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}