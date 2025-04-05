import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { BookingModal } from '../components/BookingModal';
import { Star, Clock, Globe, Users, Briefcase, GraduationCap, Award, Calendar, LogIn } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../lib/store';

interface MentorProfile {
  id: string;
  full_name: string;
  headline: string;
  detailed_bio: string;
  avatar_url: string;
  expertise_areas: string[];
  mentor_experience: string[];
  languages_spoken: string[];
  years_of_experience: number;
  session_rate: number;
  education: string[];
  certifications: string[];
  time_zone: string;
  availability_status: string;
}

interface Review {
  id: string;
  rating: number;
  review_text: string;
  expertise_rating: number;
  communication_rating: number;
  helpfulness_rating: number;
  created_at: string;
  reviewer: {
    full_name: string;
    avatar_url: string;
  };
}

export function MentorProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratings, setRatings] = useState({
    average: 0,
    total: 0,
    expertise: 0,
    communication: 0,
    helpfulness: 0
  });
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorProfile();
  }, [id]);

  const fetchMentorProfile = async () => {
    try {
      // Fetch mentor profile
      const { data: mentorData, error: mentorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (mentorError) throw mentorError;
      setMentor(mentorData);

      // Fetch mentor ratings
      const { data: ratingData } = await supabase.rpc('get_mentor_rating', {
        mentor_id: id
      });

      if (ratingData) {
        setRatings({
          average: ratingData.average_rating || 0,
          total: ratingData.total_reviews || 0,
          expertise: ratingData.expertise_rating || 0,
          communication: ratingData.communication_rating || 0,
          helpfulness: ratingData.helpfulness_rating || 0
        });
      }

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('mentor_reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id (
            full_name,
            avatar_url
          )
        `)
        .eq('mentor_id', id)
        .order('created_at', { ascending: false });

      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error fetching mentor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingClick = () => {
    if (!user) {
      navigate('/login', { state: { from: `/mentors/${id}` } });
      return;
    }
    setShowBooking(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Mentor not found</h2>
        <Link
          to="/search"
          className="mt-4 inline-block text-indigo-600 hover:text-indigo-700"
        >
          Back to search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-6">
              <img
                src={mentor.avatar_url || 'https://via.placeholder.com/150'}
                alt={mentor.full_name}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{mentor.full_name}</h1>
                <p className="text-lg text-gray-600 mb-4">{mentor.headline}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="ml-1 font-semibold">{ratings.average}</span>
                    <span className="ml-1 text-gray-500">({ratings.total} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="ml-1 text-gray-500">
                      {mentor.years_of_experience}+ years experience
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About Me</h2>
            <p className="text-gray-600 whitespace-pre-line">{mentor.detailed_bio}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Expertise</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise_areas?.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Experience</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.mentor_experience?.map((exp) => (
                    <span
                      key={exp}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.languages_spoken?.map((lang) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Education & Certifications</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Education</h3>
                <ul className="space-y-2">
                  {mentor.education?.map((edu, index) => (
                    <li key={index} className="flex items-center">
                      <GraduationCap className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Certifications</h3>
                <ul className="space-y-2">
                  {mentor.certifications?.map((cert, index) => (
                    <li key={index} className="flex items-center">
                      <Award className="h-5 w-5 text-gray-400 mr-2" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
              <div className="flex items-center">
                <Star className="h-6 w-6 text-yellow-400" />
                <span className="ml-2 text-2xl font-bold">{ratings.average}</span>
                <span className="ml-2 text-gray-500">({ratings.total} reviews)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Expertise</p>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 font-semibold">{ratings.expertise}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Communication</p>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 font-semibold">{ratings.communication}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Helpfulness</p>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 font-semibold">{ratings.helpfulness}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-t pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <img
                        src={review.reviewer.avatar_url || 'https://via.placeholder.com/40'}
                        alt={review.reviewer.full_name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {review.reviewer.full_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(review.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 font-semibold">{review.rating}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600">{review.review_text}</p>
                </div>
              ))}

              {reviews.length === 0 && (
                <p className="text-center text-gray-500">No reviews yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Booking Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-gray-900">
                {mentor.session_rate} credits
              </p>
              <p className="text-gray-500">per hour</p>
            </div>

            <button
              onClick={handleBookingClick}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center"
            >
              {user ? (
                <>
                  <Calendar className="h-5 w-5 mr-2" />
                  Book a Session
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign in to Book
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Availability</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  Status: {mentor.availability_status}
                </span>
              </div>
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  Time Zone: {mentor.time_zone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal
          mentor={mentor}
          onClose={() => setShowBooking(false)}
          onBook={async () => {
            setShowBooking(false);
          }}
        />
      )}
    </div>
  );
}