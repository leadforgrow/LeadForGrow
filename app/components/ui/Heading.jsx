import React from 'react';

/**
 * Reusable Heading component to enforce typography standards.
 * @param {1|2|3|4} level - The heading level (h1, h2, h3, h4).
 * @param {string} className - Optional spacing or alignment classes.
 * @param {React.ReactNode} children - The content of the heading.
 */
export default function Heading({ level = 1, children, className = "" }) {
  const Tag = `h${level}`;
  
  // Note: Standard hierarchy is enforced in globals.css @layer base.
  // Level 1: 2xl, Level 2: xl, Level 3: lg, Level 4: base.
  // All are font-semibold (600) by default per refactor requirements.
  return (
    <Tag className={`${className}`}>
      {children}
    </Tag>
  );
}
