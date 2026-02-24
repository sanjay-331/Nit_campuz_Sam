
import React, { createContext, useContext, useState, forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

const useTabs = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('Tabs components must be used within a Tabs component');
    }
    return context;
};

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ defaultValue, value, onValueChange, children, ...props }) => {
    const [internalActiveTab, setInternalActiveTab] = useState(defaultValue);
    
    const isControlled = value !== undefined;
    const activeTab = isControlled ? value : internalActiveTab;
    
    const setActiveTab = (newValue: string) => {
        if (!isControlled) {
            setInternalActiveTab(newValue);
        }
        if (onValueChange) {
            onValueChange(newValue);
        }
    };
    
    return (
        <TabsContext.Provider value={{ activeTab: activeTab || '', setActiveTab }}>
            <div {...props}>{children}</div>
        </TabsContext.Provider>
    );
};


const TabsList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500',
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";


const TabsTrigger = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab, setActiveTab } = useTabs();
    const isActive = activeTab === value;
    return (
      <button
        ref={ref}
        onClick={() => setActiveTab(value)}
        className={cn(
          'relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
          className
        )}
        {...props}
      >
        {isActive && (
            <motion.span
                layoutId="active-tab-indicator"
                className="absolute inset-0 z-10 bg-white rounded-md shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-20">{children}</span>
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";


const TabsContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className, value, ...props }, ref) => {
    const { activeTab } = useTabs();
    if (activeTab !== value) return null;
    return <div ref={ref} className={cn('mt-4', className)} {...props} />;
  }
);
TabsContent.displayName = "TabsContent";


export { Tabs, TabsList, TabsTrigger, TabsContent };
    