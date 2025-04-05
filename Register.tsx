import React from 'react';
import { RegistrationWizard } from '../components/registration/RegistrationWizard';

export function Register() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Join LinkedLeaders</h1>
        <p className="mt-2 text-gray-600">
          Create your account and start your leadership journey
        </p>
      </div>

      <RegistrationWizard />
    </div>
  );
}