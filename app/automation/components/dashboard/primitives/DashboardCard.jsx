'use client';

export default function DashboardCard({
  children,
  className = '',
  padding = 'p-5',
  hover = false,
  ...props
}) {
  return (
    <div
      className={[
        'bg-white dark:bg-slate-900',
        'border border-slate-200/80 dark:border-slate-800',
        'rounded-xl shadow-sm',
        hover ? 'transition-shadow hover:shadow-md' : '',
        padding,
        className
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}
