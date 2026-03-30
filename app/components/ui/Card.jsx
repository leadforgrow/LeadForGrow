import React from 'react';

/**
 * Premium SaaS Card Component
 * @param {'default'|'bordered'|'minimal'|'highlight'} variant
 */
export default function Card({ 
  children, 
  variant = 'default', 
  className = '', 
  padding = 'p-6',
  ...props 
}) {
  const baseStyles = "bg-white rounded-lg transition-all duration-300";
  
  const variants = {
    default: "border border-slate-200 shadow-sm",
    bordered: "border border-slate-200 shadow-none",
    minimal: "border-none shadow-none bg-slate-50/50",
    highlight: "border border-indigo-100 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/5"
  };

  return (
    <div 
      className={`${baseStyles} ${variants[variant]} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
