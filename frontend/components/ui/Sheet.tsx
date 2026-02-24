import React, { forwardRef, HTMLAttributes, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

const Sheet: React.FC<SheetProps> = ({ open, onOpenChange, children }) => {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60"
                        onClick={() => onOpenChange(false)}
                    />
                    {children}
                </div>
            )}
        </AnimatePresence>
    );
}

const SheetContent = forwardRef<HTMLDivElement, Omit<React.ComponentProps<typeof motion.div>, 'ref'> & { side?: 'left' | 'right' }>(
    ({ side = 'right', className, children, ...props }, ref) => {
        const variants = {
            left: { x: '-100%' },
            right: { x: '100%' }
        };
        return (
            <motion.div
                ref={ref}
                initial={variants[side]}
                animate={{ x: 0 }}
                exit={variants[side]}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={cn(
                    "fixed top-0 h-full w-full max-w-md bg-white shadow-lg",
                    side === 'right' ? 'right-0' : 'left-0',
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);
SheetContent.displayName = "SheetContent";

const SheetHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2 ref={ref} className={cn("text-lg font-semibold text-slate-900", className)} {...props} />
    )
);
SheetTitle.displayName = "SheetTitle";

const SheetDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm text-slate-600", className)} {...props} />
    )
);
SheetDescription.displayName = "SheetDescription";

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription };
