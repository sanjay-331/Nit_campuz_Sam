import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { SpinnerIcon } from '../icons/Icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Button: React.FC<ButtonProps & MotionProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  leftIcon,
  rightIcon,
  className = '',
  loading = false,
  ...props 
}) => {
  const buttonType = props.type ?? 'button';
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400',
    ghost: 'bg-transparent text-slate-800 hover:bg-slate-100 focus-visible:ring-slate-400',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSpacing = 'mx-1.5';

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      whileHover={!loading ? { y: -2, transition: { type: 'spring', stiffness: 300 } } : {}}
      whileTap={!loading ? { scale: 0.98, transition: { type: 'spring', stiffness: 400, damping: 15 } } : {}}
      disabled={props.disabled || loading}
      type={buttonType}
      {...props}
    >
      {loading ? (
        <SpinnerIcon className="animate-spin h-5 w-5" />
      ) : (
        <>
          {leftIcon && <span className={iconSpacing}>{leftIcon}</span>}
          {children}
          {rightIcon && <span className={iconSpacing}>{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default Button;
