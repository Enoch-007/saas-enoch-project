import { create } from 'zustand';
import { supabase, type Profile } from './supabase';
import { type UserRole, type RolePermissions, ROLE_PERMISSIONS } from './auth';

// Maximum number of retries for database operations
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to add retry logic
async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Operation failed (attempt ${i + 1}/${MAX_RETRIES}):`, error);
      lastError = error;
      if (i < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)));
      }
    }
  }
  throw lastError;
}

interface AuthState {
  user: Profile | null;
  loading: boolean;
  setUser: (user: Profile | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ user: any, session: any } | null>;
  signOut: () => Promise<void>;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  getRole: () => UserRole | null;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  setUser: (user) => {
    console.log('Setting user state:', user ? { ...user, id: user.id } : null);
    set({ user, loading: false });
  },
  
  signIn: async (email: string, password: string) => {
    console.log('Starting signIn process...');
    let profileTimer: string | null = null;
    
    try {
      // Clear any existing session data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();

      const { data: authData, error: signInError } = await withRetry(() => 
        supabase.auth.signInWithPassword({
          email,
          password,
        })
      );
      
      if (signInError) {
        console.error('SignIn error:', signInError);
        set({ user: null, loading: false });
        throw signInError;
      }

      console.log('Auth successful:', { ...authData, access_token: '[REDACTED]' });

      if (!authData.user) {
        set({ user: null, loading: false });
        throw new Error('No user data received after successful auth');
      }

      profileTimer = `profile-fetch-${Date.now()}`;
      console.time(profileTimer);
      console.log('Fetching profile for user:', authData.user.id);

      const { data: profile, error: profileError } = await withRetry(() =>
        supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user!.id)
          .single()
      );

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        set({ user: null, loading: false });
        throw profileError;
      }

      console.log('Profile fetched successfully:', { ...profile, id: profile.id });
      if (profileTimer) console.timeEnd(profileTimer);
      
      set({ user: profile, loading: false });
      console.log('SignIn completed successfully');
    } catch (error) {
      console.error('Error in signIn process:', error);
      if (profileTimer) console.timeEnd(profileTimer);
      set({ user: null, loading: false });
      throw error;
    }
  },
  
  signUp: async (email: string, password: string, fullName: string) => {
    console.log('Starting signUp process...');
    try {
      // Clear any existing session data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();

      const { data: authData, error: signUpError } = await withRetry(() =>
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })
      );
      
      if (signUpError) {
        console.error('SignUp error:', signUpError);
        set({ user: null, loading: false });
        throw signUpError;
      }

      console.log('SignUp successful:', { ...authData, session: '[REDACTED]' });
      return authData;
    } catch (error) {
      console.error('Error in signUp process:', error);
      set({ user: null, loading: false });
      throw error;
    }
  },
  
  signOut: async () => {
    console.log('Starting signOut process...');
    try {
      const { error } = await withRetry(() => supabase.auth.signOut());
      if (error) {
        console.error('SignOut error:', error);
        throw error;
      }
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cached data
      await supabase.auth.refreshSession();
      
      console.log('SignOut successful');
      set({ user: null, loading: false });
    } catch (error) {
      console.error('Error in signOut process:', error);
      set({ user: null, loading: false });
      throw error;
    }
  },

  hasPermission: (permission: keyof RolePermissions) => {
    const user = get().user;
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role as UserRole][permission];
  },

  getRole: () => {
    const user = get().user;
    return user ? user.role as UserRole : null;
  },
}));

// Initialize auth state with retry logic
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event);
  console.log('Session:', session ? { ...session, access_token: '[REDACTED]' } : null);

  // If no session, clear user state immediately
  if (!session?.user) {
    console.log('No session, setting user to null');
    useAuth.getState().setUser(null);
    return;
  }

  try {
    // Try to refresh the session first
    const { error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.error('Session refresh failed:', refreshError);
      useAuth.getState().setUser(null);
      return;
    }

    const profileTimer = `profile-load-${Date.now()}`;
    console.time(profileTimer);
    console.log('Fetching profile for user:', session.user.id);
    
    const { data: profile, error } = await withRetry(() =>
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user!.id)
        .maybeSingle()
    );

    console.timeEnd(profileTimer);

    if (error) {
      console.error('Error fetching profile:', error);
      useAuth.getState().setUser(null);
      return;
    }

    if (!profile) {
      console.log('No profile found, waiting for creation...');
      // Wait briefly for profile creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try one more time
      const { data: retryProfile, error: retryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (retryError || !retryProfile) {
        console.error('Profile still not found after retry:', retryError);
        useAuth.getState().setUser(null);
        return;
      }

      console.log('Profile found on retry:', { ...retryProfile, id: retryProfile.id });
      useAuth.getState().setUser(retryProfile);
    } else {
      console.log('Profile fetched:', { ...profile, id: profile.id });
      useAuth.getState().setUser(profile);
    }
  } catch (error) {
    console.error('Error in auth state change:', error);
    useAuth.getState().setUser(null);
  }
});