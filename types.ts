export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  features: string[];
  stripe_price_id: string | null;
}

export interface Subscription {
  id: string;
  profile_id: string;
  tier_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  stripe_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at: string | null;
  canceled_at: string | null;
}

export interface Organization {
  id: string;
  name: string;
  subscription_id: string | null;
  stripe_customer_id: string | null;
}

export interface OrganizationMember {
  organization_id: string;
  profile_id: string;
  role: 'admin' | 'member';
}

export type UserType = 'mentor' | 'individual' | 'organization';

export interface RegistrationData {
  email: string;
  password: string;
  full_name: string;
  user_type: UserType;
  organization_name?: string;
  subscription_tier?: string;
}