import React from 'react';
import { Briefcase, Heart, Star, Coffee } from 'lucide-react';

const openPositions = [
  {
    title: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time'
  },
  {
    title: 'Education Success Manager',
    department: 'Customer Success',
    location: 'San Francisco, CA',
    type: 'Full-time'
  },
  {
    title: 'Content Marketing Specialist',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time'
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time'
  }
];

export function Careers() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
        <p className="text-xl text-gray-600">
          Help us transform education leadership through technology and connection
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Heart className="h-8 w-8 text-purple-600" />
            <h2 className="text-xl font-semibold ml-3">Our Mission</h2>
          </div>
          <p className="text-gray-600">
            We're building the future of education leadership development through
            meaningful connections and technology-enabled mentorship.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Star className="h-8 w-8 text-purple-600" />
            <h2 className="text-xl font-semibold ml-3">Our Values</h2>
          </div>
          <p className="text-gray-600">
            We believe in empowering educators, fostering connections, and driving
            positive change in education through innovation.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits & Perks</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Health & Wellness</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Comprehensive health insurance</li>
              <li>Mental health support</li>
              <li>Wellness stipend</li>
              <li>Flexible PTO</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Growth</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Learning & development budget</li>
              <li>Conference attendance</li>
              <li>Mentorship programs</li>
              <li>Career coaching</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Lifestyle</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Remote-first culture</li>
              <li>Home office stipend</li>
              <li>Team retreats</li>
              <li>Flexible hours</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
        <div className="space-y-4">
          {openPositions.map((position, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {position.title}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-gray-600">{position.department}</p>
                    <p className="text-gray-600">{position.location}</p>
                    <p className="text-gray-600">{position.type}</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-purple-50 p-8 rounded-lg text-center">
        <Coffee className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Don't see the right role?</h2>
        <p className="text-gray-600 mb-6">
          We're always looking for talented people to join our team. Send us your resume
          and we'll keep you in mind for future opportunities.
        </p>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Submit Resume
        </button>
      </div>
    </div>
  );
}