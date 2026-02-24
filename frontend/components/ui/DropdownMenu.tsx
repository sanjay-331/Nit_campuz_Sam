import React, { createContext, useContext, useState, useRef, useEffect, forwardRef, HTMLAttributes, PropsWithChildren } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextType | null>(null);

const useDropdownMenu = () => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('useDropdownMenu must be used within a DropdownMenu');
  }
  return context;
};

const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">{children}</div>
    </DropdownMenuContext.Provider>
  );
};

// FIX: Correctly type DropdownMenuTrigger to accept children with PropsWithChildren, resolving TS errors.
const DropdownMenuTrigger = ({ children, asChild }: PropsWithChildren<{ asChild?: boolean }>) => {
  const { open, setOpen } = useDropdownMenu();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };
  
  if (asChild) {
      if (!React.isValidElement(children)) {
          return null;
      }
      const child = children as React.ReactElement<any>;
      return React.cloneElement(child, {
          onClick: (e: React.MouseEvent) => {
              if (child.props.onClick) {
                  child.props.onClick(e);
              }
              handleClick(e);
          },
          'aria-expanded': open,
          'aria-haspopup': 'menu',
      });
  }

  return (
    <button onClick={handleClick} aria-expanded={open} aria-haspopup="menu">
      {children}
    </button>
  );
};


const DropdownMenuContent = forwardRef<HTMLDivElement, Omit<React.ComponentProps<typeof motion.div>, 'ref'> & { align?: 'start' | 'end' }>(({ className, align = 'start', children, ...props }, ref) => {
    const { open, setOpen } = useDropdownMenu();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        if(open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, setOpen]);


    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                        'absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-xl border bg-white p-1 text-gray-900 shadow-md',
                        align === 'end' ? 'right-0' : 'left-0',
                        className
                    )}
                    {...props}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
});
DropdownMenuContent.displayName = "DropdownMenuContent";


const DropdownMenuItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
    const { setOpen } = useDropdownMenu();
    return (
        <div
            ref={ref}
            onClick={() => setOpen(false)}
            className={cn(
                'relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuLabel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props} />
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

const DropdownMenuSeparator: React.FC<React.HTMLAttributes<HTMLHRElement>> = ({ className, ...props }) => (
  <hr className={cn('-mx-1 my-1 h-px bg-gray-100', className)} {...props} />
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';


export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};