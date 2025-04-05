import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface OnboardingLayoutProps {
  children: React.ReactNode;
  steps: OnboardingStep[];
  currentStep: number;
  title: string;
  subtitle: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function OnboardingLayout({
  children,
  steps,
  currentStep,
  title,
  subtitle,
  onBack,
  showBackButton = true
}: OnboardingLayoutProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="absolute left-4 top-4 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-gray-600"
        >
          {subtitle}
        </motion.p>
      </div>

      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className={`relative ${index !== 0 ? 'pl-6 ml-6' : ''} ${
                  index !== steps.length - 1 ? 'pr-6 mr-6' : ''
                }`}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < currentStep
                        ? 'bg-purple-600 text-white'
                        : index === currentStep
                        ? 'border-2 border-purple-600 text-purple-600'
                        : 'border-2 border-gray-300 text-gray-500'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{step.title}</p>
                    <p className="text-sm text-gray-500">{step.description}</p>
                  </div>
                </motion.div>
                {index !== steps.length - 1 && (
                  <div className="absolute top-4 right-0 -mr-6 w-6 h-0.5 bg-gray-300" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        {children}
      </motion.div>
    </div>
  );
}