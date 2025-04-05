import React from 'react';
import { Handshake, Users, Globe, TrendingUp, CheckCircle } from 'lucide-react';

export function Partner() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Partner with LinkedLeaders</h1>
        <p className="text-xl text-gray-600">
          Join us in transforming education leadership through meaningful partnerships
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Globe className="h-8 w-8 text-purple-600" />
            <h2 className="text-xl font-semibold ml-3">Global Impact</h2>
          </div>
          <p className="text-gray-600">
            Partner with us to reach education leaders across the globe and make a lasting
            impact on school communities worldwide.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <h2 className="text-xl font-semibold ml-3">Growth Opportunities</h2>
          </div>
          <p className="text-gray-600">
            Access a growing network of education leaders and expand your organization's
            reach in the education sector.
          </p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Partnership Options</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Content Partner</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-2" />
                <span>Co-create educational content</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-2" />
                <span>Host joint webinars</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-2" />
                <span>Develop resources</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Technology Partner</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-2" />
                <span>API integration</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-2" />
                <span>Platform enhancement</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-2" />
                <span>Technical collaboration</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Strategic Partner</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-2" />
                <span>Joint initiatives</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-2" />
                <span>Market expansion</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-600 mt-1 mr-2" />
                <span>Shared resources</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 p-8 rounded-lg">
        <div className="flex items-center mb-6">
          <Handshake className="h-10 w-10 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900 ml-4">Become a Partner</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Ready to explore partnership opportunities? Contact our partnerships team to
          discuss how we can work together.
        </p>
        <a
          href="/contact"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
        >
          Get in Touch
        </a>
      </div>
    </div>
  );
}