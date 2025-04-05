import { supabase } from './supabase';
import zxcvbn from 'zxcvbn';

// Error class
class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Types
export type UserRole = 'subscriber' | 'mentor' | 'team_member' | 'team_admin' | 'system_admin';

export interface RolePermissions {
  canBookSessions: boolean;
  canSpendCredits: boolean;
  canSendMessages: boolean;
  canSetRates: boolean;
  canManageAvailability: boolean;
  canHostMasterclasses: boolean;
  canManageTeam: boolean;
  canPurchaseCredits: boolean;
  canViewTeamUsage: boolean;
  canApproveUsers: boolean;
  canSendGlobalMessages: boolean;
  canViewAnalytics: boolean;
}

interface PasswordStrength {
  score: number;
  feedback: {
    warning: string;
    suggestions: string[];
  };
}

interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  feedback?: {
    warning: string;
    suggestions: string[];
  };
  code?: string;
}

interface SignUpData {
  full_name: string;
  role: UserRole;
}

// Role permissions definition
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  subscriber: {
    canBookSessions: true,
    canSpendCredits: true,
    canSendMessages: true,
    canSetRates: false,
    canManageAvailability: false,
    canHostMasterclasses: false,
    canManageTeam: false,
    canPurchaseCredits: false,
    canViewTeamUsage: false,
    canApproveUsers: false,
    canSendGlobalMessages: false,
    canViewAnalytics: false,
  },
  mentor: {
    canBookSessions: false,
    canSpendCredits: false,
    canSendMessages: true,
    canSetRates: true,
    canManageAvailability: true,
    canHostMasterclasses: true,
    canManageTeam: false,
    canPurchaseCredits: false,
    canViewTeamUsage: false,
    canApproveUsers: false,
    canSendGlobalMessages: false,
    canViewAnalytics: false,
  },
  team_member: {
    canBookSessions: true,
    canSpendCredits: true,
    canSendMessages: true,
    canSetRates: false,
    canManageAvailability: false,
    canHostMasterclasses: false,
    canManageTeam: false,
    canPurchaseCredits: false,
    canViewTeamUsage: false,
    canApproveUsers: false,
    canSendGlobalMessages: false,
    canViewAnalytics: false,
  },
  team_admin: {
    canBookSessions: true,
    canSpendCredits: true,
    canSendMessages: true,
    canSetRates: false,
    canManageAvailability: false,
    canHostMasterclasses: false,
    canManageTeam: true,
    canPurchaseCredits: true,
    canViewTeamUsage: true,
    canApproveUsers: false,
    canSendGlobalMessages: false,
    canViewAnalytics: false,
  },
  system_admin: {
    canBookSessions: true,
    canSpendCredits: true,
    canSendMessages: true,
    canSetRates: true,
    canManageAvailability: true,
    canHostMasterclasses: true,
    canManageTeam: true,
    canPurchaseCredits: true,
    canViewTeamUsage: true,
    canApproveUsers: true,
    canSendGlobalMessages: true,
    canViewAnalytics: true,
  },
};

function checkPasswordStrength(password: string): PasswordStrength {
  try {
    const result = zxcvbn(password);
    return {
      score: result.score,
      feedback: result.feedback,
    };
  } catch (error) {
    console.error('Error checking password strength:', error);
    throw new AuthError('Failed to check password strength');
  }
}

async function signUpUser(
  email: string,
  password: string,
  data: SignUpData
): Promise<AuthResult> {
  console.log('Starting signUpUser process...');
  
  try {
    if (!email || !password) {
      console.log('Missing email or password');
      return {
        success: false,
        error: 'Email and password are required',
        code: 'MISSING_FIELDS',
      };
    }

    const strength = checkPasswordStrength(password);
    if (strength.score < 3) {
      console.log('Password strength insufficient:', strength.score);
      return {
        success: false,
        error: 'Please choose a stronger password',
        feedback: strength.feedback,
        code: 'WEAK_PASSWORD',
      };
    }

    console.log('Creating auth user...');
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: data.role,
          full_name: data.full_name
        },
      },
    });

    if (signUpError) {
      console.error('Signup error:', signUpError);
      if (signUpError.message.includes('User already registered')) {
        return {
          success: false,
          error: 'This email is already registered. Please log in or use a different email.',
          code: 'EMAIL_EXISTS'
        };
      }

      return {
        success: false,
        error: signUpError.message,
        code: 'SIGNUP_FAILED',
      };
    }

    if (!authData?.user) {
      console.error('No user data returned from signup');
      return {
        success: false,
        error: 'Signup failed. No user object returned.',
        code: 'SIGNUP_FAILED',
      };
    }

    console.log('Auth user created successfully, waiting for profile creation...');
    
    // Wait for the trigger to create the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify profile creation
    const { data: profile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileCheckError || !profile) {
      console.log('Profile not created by trigger, creating manually...');
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: data.full_name,
          role: data.role,
          email: email
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        await supabase.auth.signOut();
        return {
          success: false,
          error: 'Failed to create user profile',
          code: 'PROFILE_CREATION_FAILED',
        };
      }
    }

    console.log('Registration completed successfully');
    return {
      success: true,
      user: authData.user,
    };
  } catch (error) {
    console.error('Signup exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'UNKNOWN_ERROR',
    };
  }
}

async function hasPermission(
  userId: string,
  permission: keyof RolePermissions
): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile) return false;

    const role = profile.role as UserRole;
    return ROLE_PERMISSIONS[role][permission];
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

// Function to resend verification email
async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-verification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to resend verification email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error resending verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend verification email',
    };
  }
}

export { signUpUser, hasPermission, checkPasswordStrength, resendVerificationEmail };