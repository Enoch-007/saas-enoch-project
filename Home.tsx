import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Building2, Users, ArrowRight, Clock, Video, Lightbulb, GraduationCap, School, Trophy, Star, Coffee, CheckCircle, Calendar, PlayCircle, MessageSquare, Archive, Globe } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'mentor' | 'individual' | 'organization' | null>(null);

  const handleContinue = () => {
    if (selectedType) {
      navigate('/register', { state: { userType: selectedType } });
    }
  };

  return (
    <div className="space-y-16">
      {/* Split Screen Section */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50">
        {/* Left Side - Hero Section */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <div className="max-w-xl mx-auto">
            <div className="flex justify-center mb-6">
              <img
                src="https://qgwbmluufjxgkjnxfwqm.supabase.co/storage/v1/object/public/media-linkedleaders//no%20background%20%20bulb%20(Twitch%20Logo)%20(1).png"
                alt="Education Leaders"
                className="w-24 md:w-32 h-24 md:h-32 object-cover"
              />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
              Because School Leadership is the Hardest Job in the World
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 text-center">
              We make leadership less lonely, more sustainable—and deeply impactful, one connection at a time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
                <div className="text-purple-600 font-semibold mb-2 text-center">For Mentors</div>
                <p className="text-sm text-gray-600 text-center">Share your expertise and make a lasting impact on the next generation of leaders.</p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
                <div className="text-purple-600 font-semibold mb-2 text-center">For Leaders</div>
                <p className="text-sm text-gray-600 text-center">Get personalized guidance and support from experienced mentors who've been there.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign Up Section */}
        <div className="w-full md:w-1/2 bg-white p-6 md:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Join LinkedLeaders</h2>
            <p className="text-gray-600 mb-6 md:mb-8">Choose how you want to use the platform:</p>

            <div className="space-y-4">
              <button
                onClick={() => setSelectedType('mentor')}
                className={`w-full p-4 md:p-6 text-left border-2 rounded-lg transition-all ${
                  selectedType === 'mentor'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${
                    selectedType === 'mentor' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <User className={`h-5 w-5 md:h-6 md:w-6 ${
                      selectedType === 'mentor' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Become a Mentor</h3>
                    <p className="text-sm text-gray-600">Share your expertise and help other leaders grow</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('individual')}
                className={`w-full p-4 md:p-6 text-left border-2 rounded-lg transition-all ${
                  selectedType === 'individual'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${
                    selectedType === 'individual' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <Users className={`h-5 w-5 md:h-6 md:w-6 ${
                      selectedType === 'individual' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Individual Account</h3>
                    <p className="text-sm text-gray-600">Access personalized, on-demand support and resources.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('organization')}
                className={`w-full p-4 md:p-6 text-left border-2 rounded-lg transition-all ${
                  selectedType === 'organization'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${
                    selectedType === 'organization' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <Building2 className={`h-5 w-5 md:h-6 md:w-6 ${
                      selectedType === 'organization' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Organization</h3>
                    <p className="text-sm text-gray-600">Enable personalized, on-demand support and resources for your entire team.</p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleContinue}
                disabled={!selectedType}
                className={`w-full mt-4 md:mt-6 px-4 md:px-6 py-3 flex items-center justify-center rounded-lg text-white transition-all ${
                  selectedType
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Value Propositions */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Radically Simple. Seriously Impactful.</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center p-6">
              <div className="bg-purple-100 p-4 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-4">
                <Video className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Live</h3>
              <p className="text-sm md:text-base text-gray-600">Real-time coaching, mentoring, informal fireside chats and live masterclasses from highly experienced leaders in K12 education</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 p-4 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">On-Demand</h3>
              <p className="text-sm md:text-base text-gray-600">Access expertise and peers when you need it with On-Demand Masterclasses, Peer to Peer Discussions, and a robust resource library and directory.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 p-4 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Personalized</h3>
              <p className="text-sm md:text-base text-gray-600">Tailored guidance and support based on your needs, goals and specific context</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 p-4 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Transformative</h3>
              <p className="text-sm md:text-base text-gray-600">Meaningful change and growth in your professional life and a new sense of balance in your personal life.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Flexible Credit-Based Pricing</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose the plan that works best for you or your organization. Each credit can be used for one hour of personalized mentoring.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center justify-center mb-4">
                <GraduationCap className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Hall Pass</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-900">Free</div>
                <p className="text-gray-600">Limited Access</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>1 Hr of 1:1 mentoring</span>
                </li>
                <li className="flex items-center">
                  <Users className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>Full access to all mentors</span>
                </li>
                <li className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>On-demand scheduling</span>
                </li>
                <li className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>Access to Coffee Talk</span>
                </li>
                <li className="flex items-center">
                  <Clock className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>Flexible credit use</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="block w-full py-2 px-4 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 text-center"
              >
                Get Started
              </Link>
            </div>
            
            <div className="bg-purple-600 rounded-lg shadow-md p-8 text-white transform scale-105">
              <div className="flex items-center justify-center mb-4">
                <School className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Study Hall</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold">6 Credits</div>
                <p className="opacity-80">Individual Package</p>
                <div className="mt-2">
                  <span className="text-lg line-through opacity-75">$599</span>
                  <span className="text-3xl font-bold ml-2">$499</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>6+ Hrs of 1:1 mentoring or coaching</span>
                </li>
                <li className="flex items-center">
                  <Users className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>Full access to all mentors</span>
                </li>
                <li className="flex items-center">
                  <Calendar className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>On-demand scheduling</span>
                </li>
                <li className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>Access to Coffee Talk</span>
                </li>
                <li className="flex items-center">
                  <Coffee className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>Access to Fireside Chats</span>
                </li>
                <li className="flex items-center">
                  <PlayCircle className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>Live and On-demand masterclasses</span>
                </li>
                <li className="flex items-center">
                  <Archive className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>Access to Resource Vault</span>
                </li>
                <li className="flex items-center">
                  <Globe className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>Access to Product Directory</span>
                </li>
                <li className="flex items-center">
                  <Clock className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>Flexible credit use</span>
                </li>
                <li className="flex items-center">
                  <Lightbulb className="h-5 w-5 text-white mr-2 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full py-2 px-4 bg-white text-purple-600 rounded-lg hover:bg-purple-50">
                Purchase Credits
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center justify-center mb-4">
                <Trophy className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">Honor Roll</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-900">20 Credits</div>
                <p className="text-gray-600">Team Package</p>
                <div className="mt-2">
                  <span className="text-lg text-gray-500 line-through">$1,599</span>
                  <span className="text-3xl font-bold text-gray-900 ml-2">$1,399</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>20+ Hrs of 1:1 mentoring or coaching</span>
                </li>
                <li className="flex items-center">
                  <Users className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>Full access to all mentors</span>
                </li>
                <li className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>On-demand scheduling</span>
                </li>
                <li className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>Access to Coffee Talk</span>
                </li>
                <li className="flex items-center">
                  <Coffee className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>Access to Fireside Chats</span>
                </li>
                <li className="flex items-center">
                  <PlayCircle className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>Live and On-demand masterclasses</span>
                </li>
                <li className="flex items-center">
                  <Archive className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>Access to Resource Vault</span>
                </li>
                <li className="flex items-center">
                  <Globe className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>Access to Product Directory</span>
                </li>
                <li className="flex items-center">
                  <Clock className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>Flexible credit use</span>
                </li>
                <li className="flex items-center">
                  <Users className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>Unlimited team members</span>
                </li>
                <li className="flex items-center">
                  <Lightbulb className="h-5 w-5 text-purple-600 mr-2 flex-shrink-0" />
                  <span>Dedicated success manager</span>
                </li>
              </ul>
              <button className="w-full py-2 px-4 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50">
                Purchase Credits
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}