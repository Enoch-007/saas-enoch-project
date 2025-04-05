import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'linkedleaders-web'
    }
  },
  // Add retryOnError configuration
  retryOnError: {
    maxRetries: 3,
    retryInterval: 1000
  }
});

// Log database queries in development
if (import.meta.env.DEV) {
  const channel = supabase.channel('db-changes');
  
  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles'
      },
      (payload) => {
        console.log('Profile table change:', payload);
      }
    )
    .subscribe();
}

export const MENTOR_EXPERIENCES = [
  'Charter School Experience',
  'Elementary School Expertise',
  'High School Expertise',
  'High-Performing School Experience',
  'International School',
  'International Schools',
  'Low-Income Community',
  'Middle School Expertise',
  'New School Startup',
  'Post-Secondary Expertise',
  'Private School Experience',
  'Rural Education',
  'Suburban Education',
  'Title I School Expertise',
  'Traditional Public School Experience',
  'Turnaround School Experience',
  'Urban Education'
] as const;

export const EXPERTISE_AREAS = [
  'Artificial Intelligence',
  'Budget and Finance',
  'Career and Technical Education (CTE)',
  'College and Career Readiness',
  'Community Partnerships',
  'Conflict Resolution',
  'Conflict Resolution and Handliing Difficult Conversations',
  'Counseling and Mental Health',
  'Crisis Management',
  'Curriculum and Instruction',
  'Data-Driven Instruction',
  'English Language Learners (ELL)',
  'Extracurricular Programs',
  'Grant Writing and Fundraising',
  'Instructional Leadership and Coaching Teachers',
  'Parental and Family Engagement',
  'School Culture Development',
  'School Governance and Policy',
  'School Improvement and Strategic Planning',
  'School Operations Management',
  'School Safety and Security',
  'Social-Emotional Learning (SEL)',
  'Special Education Populations',
  'Specialized Academic Programs (IB, AP, GATE)',
  'Staff Morale & Well-Being',
  'Student Discipline and Behavior Management',
  'Teacher Development & Coaching',
  'Team Building & Collaboration',
  'Technology Integration'
] as const;

export const COMMON_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Mandarin',
  'Arabic',
  'Hindi',
  'Portuguese',
  'Japanese',
  'Korean'
] as const;

export const MEETING_PLATFORMS = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  teams: 'Microsoft Teams'
} as const;

type MentorExperience = typeof MENTOR_EXPERIENCES[number];
type ExpertiseArea = typeof EXPERTISE_AREAS[number];
type Language = typeof COMMON_LANGUAGES[number];
export type MeetingPlatform = keyof typeof MEETING_PLATFORMS;

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'mentor' | 'mentee';
  credits: number;
  mentor_experience: MentorExperience[];
  expertise_areas: ExpertiseArea[];
  years_of_experience: number | null;
  languages_spoken: string[];
  session_rate: number | null;
  professional_background: string | null;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
};

export type OrganizationMember = {
  organization_id: string;
  profile_id: string;
  role: 'admin' | 'member';
  created_at: string;
};