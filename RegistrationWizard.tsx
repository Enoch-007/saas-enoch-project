import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserType, RegistrationData, SubscriptionTier } from '../../lib/types';
import { supabase } from '../../lib/supabase';
import { signUpUser } from '../../lib/auth';
import { useAuth } from '../../lib/store';
import { AlertCircle, ArrowRight, Building2, User, Users, Eye, EyeOff } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    id: 'user-type',
    title: 'Choose Account Type',
    description: 'Select how you want to use LinkedLeaders'
  },
  {
    id: 'account-details',
    title: 'Account Details',
    description: 'Enter your basic information'
  },
  {
    id: 'subscription',
    title: 'Choose Your Plan',
    description: 'Select the subscription that fits your needs'
  },
  {
    id: 'organization',
    title: 'Organization Details',
    description: 'Tell us about your organization'
  }
];

export function RegistrationWizard() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscriptionTiers, setSubscriptionTiers] = useState<SubscriptionTier[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegistrationData & { confirmPassword: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    user_type: 'individual',
    organization_name: '',
    subscription_tier: ''
  });

  useEffect(() => {
    if (formData.user_type !== 'mentor') {
      fetchSubscriptionTiers();
    }
  }, [formData.user_type]);

  const fetchSubscriptionTiers = async () => {
    const { data } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('price');
    
    if (data) {
      const transformedTiers = data.map(tier => ({
        ...tier,
        features: tier.features?.features || []
      }));
      setSubscriptionTiers(transformedTiers);
    }
  };

  const handleUserTypeSelect = (type: UserType) => {
    setFormData({ ...formData, user_type: type });
    setCurrentStep(1);
  };

  const handleSubscriptionSelect = (tierId: string) => {
    setFormData({ ...formData, subscription_tier: tierId });
    if (formData.user_type === 'organization') {
      setCurrentStep(3);
    } else {
      handleSubmit();
    }
  };

  const validateAccountDetails = () => {
    if (!formData.email || !formData.password || !formData.full_name || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      console.log('Starting registration process...');
      const result = await signUpUser(formData.email, formData.password, {
        full_name: formData.full_name,
        role: formData.user_type === 'mentor' ? 'mentor' : 'subscriber'
      });

      if (!result.success) {
        console.error('Registration failed:', result.error);
        setError(result.error || 'Registration failed');
        return;
      }

      console.log('Registration successful, attempting sign in...');
      
      // Explicitly sign in after successful registration
      await signIn(formData.email, formData.password);

      // If organization, create org and add user as admin
      if (formData.user_type === 'organization' && formData.organization_name) {
        const { error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: formData.organization_name,
            subscription_id: formData.subscription_tier
          });

        if (orgError) throw orgError;
      }

      // Redirect to appropriate onboarding flow
      if (formData.user_type === 'mentor') {
        navigate('/onboarding/mentor');
      } else if (formData.user_type === 'organization') {
        navigate('/onboarding/organization');
      } else {
        navigate('/onboarding/individual');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('An unexpected error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAccountDetails()) {
      return;
    }
    
    if (formData.user_type === 'mentor') {
      await handleSubmit();
    } else {
      setCurrentStep(2);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <button
              onClick={() => handleUserTypeSelect('mentor')}
              className="w-full p-6 text-left border rounded-lg hover:border-purple-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
            >
              <div className="flex items-center">
                <User className="h-6 w-6 text-purple-600" />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Become a Mentor</h3>
                  <p className="text-gray-500">Share your expertise and help other leaders grow</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleUserTypeSelect('individual')}
              className="w-full p-6 text-left border rounded-lg hover:border-purple-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
            >
              <div className="flex items-center">
                <Users className="h-6 w-6 text-purple-600" />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Individual Account</h3>
                  <p className="text-gray-500">Get personalized mentorship and resources</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleUserTypeSelect('organization')}
              className="w-full p-6 text-left border rounded-lg hover:border-purple-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors"
            >
              <div className="flex items-center">
                <Building2 className="h-6 w-6 text-purple-600" />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Organization</h3>
                  <p className="text-gray-500">Enable mentorship for your entire team</p>
                </div>
              </div>
            </button>
          </div>
        );

      case 1:
        return (
          <form onSubmit={handleAccountSubmit} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? (
                  'Creating Account...'
                ) : (
                  <>
                    {formData.user_type === 'mentor' ? 'Create Account' : 'Continue'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        );

      case 2:
        return (
          <div className="space-y-6">
            {subscriptionTiers.map((tier) => (
              <div
                key={tier.id}
                className="border rounded-lg p-6 hover:border-purple-500 cursor-pointer transition-colors"
                onClick={() => handleSubscriptionSelect(tier.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{tier.name}</h3>
                    <p className="text-gray-500">{tier.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ${tier.price}
                    </p>
                    <p className="text-gray-500">{tier.credits} credits</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <ArrowRight className="h-4 w-4 mr-2 text-purple-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case 3:
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }} className="space-y-6">
            <div>
              <label htmlFor="org_name" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                type="text"
                id="org_name"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? (
                  'Creating Account...'
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
        <p className="mt-2 text-gray-600">
          {formData.user_type === 'mentor' 
            ? 'Help us match you with the right mentees by sharing your expertise'
            : 'Create your account and start your leadership journey'}
        </p>
      </div>

      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {STEPS.slice(0, formData.user_type === 'mentor' ? 2 : formData.user_type === 'organization' ? undefined : 3).map((step, index) => (
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
                    {index + 1}
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
      </div>
    </div>
  );
}