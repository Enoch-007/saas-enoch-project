import React, { useState } from 'react';
import { Shield, Lock, Cookie } from 'lucide-react';

type PolicySection = 'terms' | 'privacy' | 'cookies';

export function Policies() {
  const [activeSection, setActiveSection] = useState<PolicySection>('terms');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Policies and Terms of Use</h1>
        <p className="text-xl text-gray-600">
          Our commitment to transparency and user protection
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveSection('terms')}
            className={`flex-1 px-6 py-4 text-center ${
              activeSection === 'terms'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Shield className="h-6 w-6 mx-auto mb-2" />
            Terms of Service
          </button>
          <button
            onClick={() => setActiveSection('privacy')}
            className={`flex-1 px-6 py-4 text-center ${
              activeSection === 'privacy'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Lock className="h-6 w-6 mx-auto mb-2" />
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveSection('cookies')}
            className={`flex-1 px-6 py-4 text-center ${
              activeSection === 'cookies'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Cookie className="h-6 w-6 mx-auto mb-2" />
            Cookie Policy
          </button>
        </div>

        <div className="p-6">
          {activeSection === 'terms' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
              <p className="text-gray-600">
                These Terms of Service ("Terms") govern your access to and use of LinkedLeaders'
                website, services, and applications ("Services").
              </p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h3>
                <p className="text-gray-600">
                  By accessing or using our Services, you agree to be bound by these Terms. If you
                  disagree with any part of the terms, you may not access the Services.
                </p>

                <h3 className="text-xl font-semibold text-gray-900">2. User Accounts</h3>
                <p className="text-gray-600">
                  When you create an account with us, you must provide accurate, complete, and
                  current information. Failure to do so constitutes a breach of the Terms.
                </p>

                <h3 className="text-xl font-semibold text-gray-900">3. Intellectual Property</h3>
                <p className="text-gray-600">
                  The Service and its original content, features, and functionality are owned by
                  LinkedLeaders and are protected by international copyright, trademark, patent,
                  trade secret, and other intellectual property laws.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
              <p className="text-gray-600">
                Your privacy is important to us. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">1. Information Collection</h3>
                <p className="text-gray-600">
                  We collect information that you provide directly to us when you register for an
                  account, make a purchase, or communicate with us.
                </p>

                <h3 className="text-xl font-semibold text-gray-900">2. Use of Information</h3>
                <p className="text-gray-600">
                  We use the information we collect to provide, maintain, and improve our Services,
                  to process your transactions, and to communicate with you.
                </p>

                <h3 className="text-xl font-semibold text-gray-900">3. Information Sharing</h3>
                <p className="text-gray-600">
                  We do not sell, trade, or rent your personal information to third parties. We may
                  share your information as described in this policy.
                </p>
              </div>
            </div>
          )}

          {activeSection === 'cookies' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Cookie Policy</h2>
              <p className="text-gray-600">
                We use cookies and similar tracking technologies to track activity on our Service
                and hold certain information.
              </p>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">1. What Are Cookies</h3>
                <p className="text-gray-600">
                  Cookies are files with small amount of data which may include an anonymous unique
                  identifier. They are sent to your browser from a website and stored on your device.
                </p>

                <h3 className="text-xl font-semibold text-gray-900">2. Types of Cookies We Use</h3>
                <p className="text-gray-600">
                  We use session cookies for operation of our service, and preference cookies to
                  remember your preferences and various settings.
                </p>

                <h3 className="text-xl font-semibold text-gray-900">3. Cookie Control</h3>
                <p className="text-gray-600">
                  You can instruct your browser to refuse all cookies or to indicate when a cookie
                  is being sent. However, if you do not accept cookies, you may not be able to use
                  some portions of our Service.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-gray-600">
        <p>Last updated: March 23, 2024</p>
        <p className="mt-2">
          If you have any questions about our policies, please{' '}
          <Link to="/contact" className="text-purple-600 hover:text-purple-700">
            contact us
          </Link>
          .
        </p>
      </div>
    </div>
  );
}