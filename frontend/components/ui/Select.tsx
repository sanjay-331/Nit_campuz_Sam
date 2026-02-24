import React, { createContext, useContext, useState, useRef, useEffect, forwardRef, HTMLAttributes, ButtonHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ChevronDownIcon } from '../icons/Icons';

interface SelectContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  selectedNode: React.ReactNode;
  setSelectedNode: (node: React.ReactNode) => void;
  onValueChange?: (value: string) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('useSelect must be used within a Select provider');
  return context;
};

const Select: React.FC<{ children: React.ReactNode; value?: string; onValueChange?: (value: string) => void }> = ({ children, value = '', onValueChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const [selectedNode, setSelectedNode] = useState<React.ReactNode>(null);
  
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    if (value && children) {
        let foundNode: React.ReactNode = null;
        const findNode = (nodes: React.ReactNode) => {
             React.Children.forEach(nodes, child => {
                if (React.isValidElement(child)) {
                    const props = child.props as { value?: string; children?: React.ReactNode };
                    if ((child.type as any).displayName === 'SelectItem' && props.value === value) {
                        foundNode = props.children;
                    } 
                    else if (props.children) {
                        findNode(props.children);
                    }
                }
            });
        }
        findNode(children);
        setSelectedNode(foundNode);
    } else {
        setSelectedNode(null);
    }
  }, [value, children]);


  return (
    <SelectContext.Provider value={{ open, setOpen, selectedValue, setSelectedValue, selectedNode, setSelectedNode, onValueChange }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};


const SelectTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect();
    return (
        <button
            ref={ref}
            onClick={() => setOpen(!open)}
            className={cn("flex h-11 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50", className)}
            {...props}
        >
            {children}
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </button>
    );
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const { selectedNode } = useSelect();
  return <span className={cn(!selectedNode && "text-gray-500")}>{selectedNode || placeholder}</span>;
};

const SelectContent = forwardRef<HTMLDivElement, Omit<React.ComponentProps<typeof motion.div>, 'ref'>>(({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect();
    const contentRef = useRef<HTMLDivElement>(null);
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        if(open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, setOpen]);
    
    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={contentRef}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.1 }}
                    className={cn("absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-xl border bg-white p-1 text-gray-900 shadow-md", className)}
                    {...props}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
});
SelectContent.displayName = 'SelectContent';

const SelectItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { value: string }>(
  ({ className, children, value, ...props }, ref) => {
    const { setSelectedValue, setOpen, onValueChange, setSelectedNode } = useSelect();

    return (
      <div
        ref={ref}
        onClick={() => {
            setSelectedValue(value);
            setSelectedNode(children);
            onValueChange?.(value);
            setOpen(false);
        }}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 px-3 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[state=selected]:bg-gray-100",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };