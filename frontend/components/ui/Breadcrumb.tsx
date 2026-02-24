import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '../icons/Icons';
import { cn } from '../../lib/utils';

// FIX: Export BreadcrumbItem interface to allow for type usage in other components.
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn(className)}>
      <ol className="flex items-center space-x-1 text-sm text-slate-500">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <ChevronRightIcon className="w-4 h-4 text-slate-400 mx-1" />}
            {index < items.length - 1 ? (
              item.href ? (
                <Link to={item.href} className="hover:text-indigo-600 transition-colors">{item.label}</Link>
              ) : item.onClick ? (
                <button onClick={item.onClick} className="hover:text-indigo-600 transition-colors">{item.label}</button>
              ) : (
                <span>{item.label}</span>
              )
            ) : (
              <span className="font-medium text-slate-700">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
