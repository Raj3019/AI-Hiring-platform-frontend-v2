import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Assuming you have this utility
import { Loader2 } from 'lucide-react';

// --- Button ---
const buttonVariants = cva(
  "font-bold py-2 px-6 border-2 border-neo-black dark:border-white transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-mono text-sm sm:text-base inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        primary: "bg-neo-yellow text-neo-black shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] hover:bg-[#ffe066]",
        secondary: "bg-white text-neo-black shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] hover:bg-gray-50 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
        danger: "bg-neo-pink text-white shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] hover:brightness-110",
        ghost: "bg-transparent border-transparent shadow-none hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-white border-none active:translate-x-0 active:translate-y-0",
        outline: "bg-transparent border-2 border-neo-black text-neo-black hover:bg-gray-100", // Added outline as generic fallback
      },
      size: {
        default: "h-auto",
        sm: "py-1 px-3 text-xs",
        icon: "h-10 w-10 p-2",
      },
      fullWidth: {
        true: "w-full",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export const NeoButton = React.forwardRef(({ className, variant, size, fullWidth, isLoading, children, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      ref={ref}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});
NeoButton.displayName = "NeoButton";

// --- Card ---
export const NeoCard = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-white border-2 border-neo-black shadow-neo dark:bg-[#1E1E1E] dark:border-white dark:shadow-[4px_4px_0px_0px_#ffffff] dark:text-white p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
NeoCard.displayName = "NeoCard";

// --- Input ---
export const NeoInput = React.forwardRef(({ className, type, label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-bold text-neo-black dark:text-white">{label}</label>}
      <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            type={type}
            className={cn(
              "w-full bg-white border-2 border-neo-black p-3 focus:outline-none focus:ring-2 focus:ring-neo-yellow focus:ring-offset-0 font-mono text-sm dark:bg-zinc-800 dark:border-white dark:text-white dark:focus:ring-neo-blue dark:placeholder-gray-500",
              Icon && "pl-10",
              error && "border-neo-red",
              className
            )}
            ref={ref}
            {...props}
          />
      </div>
      {error && <span className="text-xs font-bold text-neo-red">{error}</span>}
    </div>
  );
});
NeoInput.displayName = "NeoInput";

// --- Badge ---
const badgeVariants = cva(
  "inline-flex items-center px-2 py-1 text-xs font-bold border-2 border-neo-black dark:border-white shadow-neo-sm dark:shadow-[2px_2px_0px_0px_#ffffff]",
  {
    variants: {
      variant: {
        green: "bg-neo-green text-white",
        blue: "bg-neo-blue text-white",
        pink: "bg-neo-pink text-white",
        red: "bg-neo-red text-white",
        outline: "bg-white text-neo-black", // Fallback
        default: "bg-neo-blue text-white",
      },
    },
    defaultVariants: {
      variant: "blue",
    },
  }
);

export function NeoBadge({ className, variant, children, ...props }) {
  // Map legacy variants to new ones if needed, or just let cva handle it
  // cva is safer than the object lookup in the reference
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}

// --- Modal ---
export const NeoModal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', contentClassName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`w-full ${maxWidth} relative animate-in fade-in zoom-in duration-200`}>
        <NeoCard className="relative bg-white dark:bg-[#121212] max-h-[90vh] flex flex-col border-4">
          <div className="flex justify-between items-center mb-4 border-b-2 border-neo-black dark:border-white pb-4 shrink-0">
            <h2 className="text-xl md:text-2xl font-black font-sans uppercase dark:text-white tracking-tight">{title}</h2>
            <button onClick={onClose} className="hover:bg-neo-pink hover:text-white p-2 border-2 border-transparent hover:border-neo-black dark:hover:border-white dark:text-white transition-colors rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className={cn("overflow-y-auto p-1", contentClassName)}>
            {children}
          </div>
        </NeoCard>
      </div>
    </div>
  );
};
