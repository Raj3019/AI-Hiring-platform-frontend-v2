import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2, ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, setMonth, setYear, getYear, getMonth } from 'date-fns';

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
        yellow: "bg-neo-yellow text-neo-black",
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

// --- NeoCheckbox ---
export const NeoCheckbox = React.forwardRef(({ className, checked, onCheckedChange, label, id, disabled, ...props }, ref) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div 
        className={cn(
          "w-6 h-6 border-2 border-neo-black bg-white flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none dark:border-white dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] dark:bg-zinc-900",
           checked && "bg-neo-yellow dark:bg-neo-yellow",
           disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && onCheckedChange(!checked)}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
      >
        {checked && <Check className="w-4 h-4 text-neo-black stroke-[4]" />}
      </div>
      {label && (
        <label 
          htmlFor={id} 
          className={cn("font-bold text-sm uppercase cursor-pointer dark:text-white select-none", disabled && "cursor-not-allowed text-gray-400")}
          onClick={() => !disabled && onCheckedChange(!checked)}
        >
          {label}
        </label>
      )}
    </div>
  );
});
NeoCheckbox.displayName = "NeoCheckbox";

// --- NeoDatePicker ---
export const NeoDatePicker = ({ value, onChange, label, placeholder = "Select date", minDate, maxDate, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(value ? new Date(value) : new Date());
  
  // Handle outside click to close
  const containerRef = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update view date if value changes externally
  React.useEffect(() => {
    if (value) setViewDate(new Date(value));
  }, [value]);

  const handleDateClick = (day) => {
    // Return formatted date string YYYY-MM-DD
    const formatted = format(day, "yyyy-MM-dd");
    onChange({ target: { name: props.name, value: formatted } });
    setIsOpen(false);
  };

  const years = Array.from({ length: 100 }, (_, i) => getYear(new Date()) - i); // Last 100 years
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && <label className="block text-sm font-bold text-neo-black dark:text-white mb-1.5">{label}</label>}
      
      <div 
        className="w-full bg-white border-2 border-neo-black p-3 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-neo-yellow dark:bg-zinc-900 dark:border-white dark:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={cn("font-mono text-sm", !value && "text-gray-500")}>
          {value ? format(new Date(value), "dd MMM yyyy") : placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 opacity-50" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white border-2 border-neo-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-[320px] dark:bg-black dark:border-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] animate-in fade-in zoom-in-95 duration-200">
           
           {/* Header Controls */}
           <div className="flex justify-between items-center mb-4 gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setViewDate(subMonths(viewDate, 1)); }}
                className="p-1 border-2 border-neo-black hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-zinc-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex gap-2">
                 <select 
                   value={getMonth(viewDate)} 
                   onChange={(e) => setViewDate(setMonth(viewDate, parseInt(e.target.value)))}
                   className="font-bold text-xs bg-transparent border-none focus:outline-none dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 p-1 rounded"
                   onClick={(e) => e.stopPropagation()}
                 >
                    {months.map((m, i) => <option key={i} value={i} className="text-black">{m}</option>)}
                 </select>
                 <select 
                   value={getYear(viewDate)} 
                   onChange={(e) => setViewDate(setYear(viewDate, parseInt(e.target.value)))}
                   className="font-bold text-xs bg-transparent border-none focus:outline-none dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 p-1 rounded"
                   onClick={(e) => e.stopPropagation()}
                 >
                    {years.map((y) => <option key={y} value={y} className="text-black">{y}</option>)}
                 </select>
              </div>

              <button 
                 onClick={(e) => { e.stopPropagation(); setViewDate(addMonths(viewDate, 1)); }}
                 className="p-1 border-2 border-neo-black hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-zinc-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
           </div>

           {/* Days Grid */}
           <div className="grid grid-cols-7 mb-2 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-xs font-black text-gray-400 uppercase">{d}</div>
              ))}
           </div>
           
           <div className="grid grid-cols-7 gap-1">
              {eachDayOfInterval({
                 start: startOfWeek(startOfMonth(viewDate)),
                 end: endOfWeek(endOfMonth(viewDate))
              }).map((day, idx) => {
                 const isSelected = value && isSameDay(new Date(value), day);
                 const isCurrentMonth = isSameMonth(day, viewDate);
                 
                 return (
                   <button
                     key={idx}
                     onClick={(e) => { e.stopPropagation(); handleDateClick(day); }}
                     className={cn(
                       "h-8 w-8 flex items-center justify-center text-sm font-bold border-2 border-transparent relative hover:border-neo-black dark:hover:border-white dark:text-white transition-all rounded-sm",
                       !isCurrentMonth && "text-gray-300 dark:text-zinc-700",
                       isSelected && "bg-neo-yellow text-neo-black border-neo-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10",
                       isSameDay(day, new Date()) && !isSelected && "border-neo-black border-dashed"
                     )}
                   >
                     {format(day, 'd')}
                   </button>
                 );
              })}
           </div>
        </div>
      )}
    </div>
  );
};
