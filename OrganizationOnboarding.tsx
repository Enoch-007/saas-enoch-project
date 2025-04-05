import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/store';
import { Building2, Users, Target, AlertCircle } from 'lucide-react';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { OnboardingButton } from '../../components/onboarding/OnboardingButton';

const STEPS = [
  {
    id: 'organization',
    title: 'Organization Details',
    description: 'Tell us about your organization',
    icon: <Building2 className="h-4 w-4" />
  },
  {
    id: 'team',
    title: 'Team Information',
    description: 'Share details about your team',
    icon: <Users className="h-4 w-4" />
  },
  {
    id: 'goals',
    title: 'Organization Goals',
    description: 'What do you want to achieve?',
    icon: <Target className="h-4 w-4" />
  }
];

const ORGANIZATION_TYPES = [
  'Public School District',
  'Private School Network',
  'Charter School Network',
  'International School System',
  'Education Non-profit',
  'Other'
];

export function OrganizationOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    organization_type: '',
    location: '',
    website: '',
    team_size: '',
    leadership_roles: [] as string[],
    development_areas: [] as string[],
    goals: '',
    timeline: '',
    additional_info: ''
  });

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          type: formData.organization_type,
          location: formData.location,
          website: formData.website,
          team_size: formData.team_size,
          leadership_roles: formData.leadership_roles,
          development_areas: formData.development_areas,
          goals: formData.goals,
          timeline: formData.timeline,
          additional_info: formData.additional_info
        })
        .eq('owner_id', user?.id);

      if (updateError) throw updateError;

      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving organization profile:', err);
      setError('Failed to save organization profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      leadership_roles: prev.leadership_roles.includes(role)
        ? prev.leadership_roles.filter(r => r !== role)
        : [...prev.leadership_roles, role]
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="organization_type" className="block text-sm font-medium text-gray-700">
                Organization Type
              </label>
              <select
                id="organization_type"
                value={formData.organization_type}
                onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">Select organization type...</option>
                {ORGANIZATION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="City, State/Province, Country"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="https://www.example.com"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="team_size" className="block text-sm font-medium text-gray-700">
                Team Size
              </label>
              <select
                id="team_size"
                value={formData.team_size}
                onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">Select team size...</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501+">501+ employees</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leadership Roles in Your Organization
              </label>
              <div className="space-y-2">
                {[
                  'Principals',
                  'Assistant Principals',
                  'Department Heads',
                  'Program Directors',
                  'Curriculum Coordinators',
                  'Other Administrators'
                ].map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.leadership_roles.includes(role)}
                      onChange={() => handleRoleToggle(role)}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="goals" className="block text-sm font-medium text-gray-700">
                What are your organization's primary goals for leadership development?
              </label>
              <textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="e.g., Improve leadership capacity, develop succession planning..."
              />
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">
                What is your timeline for achieving these goals?
              </label>
              <select
                id="timeline"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              >
                <option value="">Select timeline...</option>
                <option value="0-3 months">0-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6-12 months">6-12 months</option>
                <option value="1+ year">1+ year</option>
              </select>
            </div>

            <div>
              <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700">
                Additional Information
              </label>
              <textarea
                id="additional_info"
                value={formData.additional_info}
                onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                placeholder="Any other information you'd like to share..."
              />
            </div>
          </div>
        );
    }
  };

  return (
    <OnboardingLayout
      steps={STEPS}
      currentStep={currentStep}
      title="Complete Organization Profile"
      subtitle="Help us understand your organization's needs"
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