import React from 'react';

const Badge = ({ 
    children, 
    className = '', 
    variant = 'default',
    ...props 
}) => {
    const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2';
    
    const variants = {
        default: 'bg-slate-900 text-slate-50 hover:bg-slate-900/80',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80',
        destructive: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
        outline: 'text-slate-950 border border-slate-200 hover:bg-slate-100'
    };

    return (
        <div 
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export { Badge }; 