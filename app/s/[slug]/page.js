"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import TemplateRenderer from '../../components/templates/TemplateRenderer';

function PublicWebsiteContent() {
  const params = useParams();
  const slug = params.slug;
  const [website, setWebsite] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        let actualSlug = decodeURIComponent(slug).trim();
        // Handle malformed links like /s/slug&mode=public where & was captured in the path
        if (actualSlug.includes('&')) {
          actualSlug = actualSlug.split('&')[0];
        }

        const res = await fetch(`/api/websites?slug=${encodeURIComponent(actualSlug)}&status=published`);
        const result = await res.json();
        
        if (result.success && result.data.length > 0) {
          setWebsite(result.data[0]);
        } else {
          setError("Website not found or not published.");
        }
      } catch (err) {
        setError("Error loading website.");
      }
    };

    if (slug) fetchWebsite();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">404</h1>
        <p className="text-slate-500 font-medium mb-8 max-w-sm">{error}</p>
        <a href="/" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
          Go Back Home
        </a>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Launching Website...</p>
        </div>
      </div>
    );
  }

  return <TemplateRenderer templateId={website.templateId} content={website.content} />;
}

export default function PublicWebsitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PublicWebsiteContent />
    </Suspense>
  );
}
