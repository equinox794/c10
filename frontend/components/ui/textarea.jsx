import React from 'react';
import { clsx } from 'clsx';

const Textarea = React.forwardRef(({ 
    className,
    label,
    error,
    ...props 
}, ref) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-slate-300">
                    {label}
                </label>
            )}
            <textarea
                className={clsx(
                    "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-500 resize-none",
                    error && "border-red-500",
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export { Textarea }; 