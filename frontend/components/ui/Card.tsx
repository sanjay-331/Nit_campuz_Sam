

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardChildProps {
    children: ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <motion.div 
      className={cn('bg-white rounded-2xl overflow-hidden shadow-md', className)}
    >
      {children}
    </motion.div>
  );
};


export const CardHeader: React.FC<CardChildProps> = ({ children, className = '' }) => {
    return (
      <div className={cn('p-6 border-b border-slate-200', className)}>
        {children}
      </div>
    );
};

export const CardTitle: React.FC<CardChildProps> = ({ children, className = '' }) => {
    return (
      <h3 className={cn('text-xl font-bold text-slate-900', className)}>
        {children}
      </h3>
    );
};

export const CardDescription: React.FC<CardChildProps> = ({ children, className = '' }) => {
    return (
        <p className={cn('text-sm text-slate-600 mt-1', className)}>
            {children}
        </p>
    );
};
  
export const CardContent: React.FC<CardChildProps> = ({ children, className = '' }) => {
    return (
      <div className={cn('p-6', className)}>
        {children}
      </div>
    );
};

export const CardFooter: React.FC<CardChildProps> = ({ children, className = '' }) => {
    return (
      <div className={cn('flex items-center p-4 border-t border-slate-200', className)}>
        {children}
      </div>
    );
};