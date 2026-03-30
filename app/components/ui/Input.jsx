import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider ml-0.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
          error ? 'border-red-500 focus-visible:ring-red-500/20' : 'hover:border-slate-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] font-medium text-red-500 ml-0.5">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
