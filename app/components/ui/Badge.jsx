import React from 'react';

/**
 * Premium SaaS Badge Component
 * @param {'default'|'success'|'warning'|'error'|'indigo'} variant
 */
export default function Badge({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}) {
  const baseStyles = "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors";
  
  const variants = {
    default: "bg-slate-100 text-slate-600 border border-slate-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    error: "bg-red-50 text-red-700 border border-red-100",
    indigo: "bg-indigo-50 text-indigo-700 border border-indigo-100"
  };

  return (
    <span 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
