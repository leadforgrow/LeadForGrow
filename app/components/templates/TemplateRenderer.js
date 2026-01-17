"use client";

import React from 'react';

export default function TemplateRenderer({ templateId, content }) {
  if (!content) return <div className="p-20 text-center font-bold">No content found for this template.</div>;

  return (
    <div className="p-20 text-center font-bold text-indigo-600 bg-indigo-50">
      System Ready: Funnel infrastructure in place. Pre-built templates have been cleared.
      <div className="mt-4 text-sm text-slate-500 font-normal">
        Template ID: {templateId}
      </div>
    </div>
  );
}
