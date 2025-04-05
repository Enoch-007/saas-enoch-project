import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/store';
import { EXPERTISE_AREAS } from '../../lib/supabase';
import { Book, Target, Briefcase, AlertCircle } from 'lucide-react';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { OnboardingButton } from '../../components/onboarding/OnboardingButton';

const STEPS = [
  {
    id: 'interests',
    title: 'Your Interests',
    description: 'Tell us what areas you want to focus on',
    icon: <Book className="h-4 w-4" />
  },
  {
    id: 'goals',
    title: 'Your Goals',
    description: 'Help us understand what you want to achieve',
    icon: <Target className="h-4 w-4" />
  },
  {
    id: 'background',
    title: 'Your Background',
    description: 'Share your professional experience',
    icon: <Briefcase className="h-4 w-4" />
  }
];

export function IndividualOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    interests: [] as string[],
    goals: '',
    role_title: '',
    years_experience: 0,
    school_type: '',
    challenges: ''
  });

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          interests: formData.interests,
          goals: formData.goals,
          role_title: formData.role_title,
          years_experience: formData.years_experience,
          school_type: formData.school_type,
          challenges: formData.challenges
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                What areas are you most interested in improving?
              </label>
              <div className="grid grid-cols-2 gap-4">
                {EXPERTISE_AREAS.map((area) => (
                  <label key={area} className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(area)}
                        onChange={() => handleInterestToggle(area)}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <span className="text-gray-700">{area}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="goals" className="block text-sm font-medium text-gray-700">
                What are your primary goals for seeking mentorship?
              </label>
              <textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="e.g., Improve leadership skills, navigate career transition..."
              />
            </div>

            <div>
              <label htmlFor="challenges" className="block text-sm font-medium text-gray-700">
                What are your biggest challenges right now?
              </label>
              <textarea
                id="challenges"
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="e.g., Staff retention, budget management..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="role_title" className="block text-sm font-medium text-gray-700">
                Current Role
              </label>
              <input
                type="text"
                id="role_title"
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="e.g., Assistant Principal, Department Head..."
              />
            </div>

            <div>
              <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700">
                Years of Experience in Education
              </label>
              <input
                type="number"
                id="years_experience"
                min="0"
                value={formData.years_experience}
                onChange={(e) => setFormData({ ...formData, years_experience: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div>
              <label htmlFor="school_type" className="block text-sm font-medium text-gray-700">
                Type of School
              </label>
              <select
                id="school_type"
                value={formData.school_type}
                onChange={(e) => setFormData({ ...formData, school_type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">Select a school type...</option>
                <option value="public">Public School</option>
                <option value="private">Private School</option>
                <option value="charter">Charter School</option>
                <option value="international">International School</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        );
    }
  };

  return (
    <OnboardingLayout
      steps={STEPS}
      currentStep={currentStep}
      title="Complete Your Profile"
      subtitle="Help us personalize your experience"
      onBack={currentStep > 0 ? () => setCurrentStep(currentStep - 1) : undefined}
    >
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {renderStep()}

      <div className="mt-6 flex justify-end space-x-3">
        {currentStep > 0 && (
          <OnboardingButton
            variant="secondary"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Back
          </OnboardingButton>
        )}
        <OnboardingButton
          onClick={() => {
            if (currentStep === STEPS.length - 1) {
              handleSubmit();
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
          loading={loading}
          disabled={loading}
        >
          {currentStep === STEPS.length - 1 ? 'Complete Profile' : 'Continue'}
        </OnboardingButton>
      </div>
    </OnboardingLayout>
  );
}