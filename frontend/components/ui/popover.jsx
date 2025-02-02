import React from 'react';

const Popover = ({ children, className = '', ...props }) => (
    <div className={`relative ${className}`} {...props}>
        {children}
    </div>
);

const PopoverTrigger = ({ children, className = '', ...props }) => (
    <div className={className} {...props}>
        {children}
    </div>
);

const PopoverContent = ({ 
    children, 
    className = '', 
    align = 'center',
    sideOffset = 4,
    ...props 
}) => (
    <div
        className={`
            z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 
            bg-white p-1 text-slate-950 shadow-md 
            data-[side=bottom]:slide-in-from-top-2 
            data-[side=left]:slide-in-from-right-2 
            data-[side=right]:slide-in-from-left-2 
            data-[side=top]:slide-in-from-bottom-2 
            dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50
            ${className}
        `}
        {...props}
    >
        {children}
    </div>
);

export { Popover, PopoverTrigger, PopoverContent }; 