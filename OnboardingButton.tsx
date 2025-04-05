import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface OnboardingButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  className?: string;
}

export function OnboardingButton({
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  children,
  variant = 'primary',
  icon,
  className = ''
}: OnboardingButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg flex items-center justify-center transition-colors';
  const variantStyles = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300',
    secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
      ) : (
        icon && <span className="mr-2">{icon}</span>
      )}
      {children}
    </motion.button>
  );
}