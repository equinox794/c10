import React from 'react';

const Select = ({ children, className = '', ...props }) => (
    <select 
        className={`
            h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
            disabled:cursor-not-allowed disabled:opacity-50
            dark:border-slate-800 dark:bg-slate-950
            ${className}
        `}
        {...props}
    >
        {children}
    </select>
);

const SelectTrigger = ({ children, className = '', ...props }) => (
    <div 
        className={`
            flex h-10 w-full items-center justify-between rounded-md border border-slate-200 
            bg-white px-3 py-2 text-sm placeholder:text-slate-500 
            focus:outline-none focus:ring-2 focus:ring-slate-400 
            disabled:cursor-not-allowed disabled:opacity-50
            dark:border-slate-800 dark:bg-slate-950
            ${className}
        `}
        {...props}
    >
        {children}
    </div>
);

const SelectContent = ({ children, className = '', ...props }) => (
    <div 
        className={`
            relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 
            bg-white text-slate-950 shadow-md
            dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50
            ${className}
        `}
        {...props}
    >
        <div className="p-1">{children}</div>
    </div>
);

const SelectItem = ({ children, className = '', ...props }) => (
    <div
        className={`
            relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 
            text-sm outline-none focus:bg-slate-100 focus:text-slate-900
            dark:focus:bg-slate-800 dark:focus:text-slate-50
            ${className}
        `}
        {...props}
    >
        {children}
    </div>
);

const SelectValue = ({ children, className = '', ...props }) => (
    <span className={`block truncate ${className}`} {...props}>
        {children}
    </span>
);

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }; 