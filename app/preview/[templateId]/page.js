"use client";

import React, { Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import TemplateRenderer from '../../components/templates/TemplateRenderer';
import { defaultContent } from '../../components/templates/content/defaultContent';

function PreviewContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const templateId = params.templateId;
  const projectId = searchParams.get('id');
  const [content, setContent] = React.useState(null);

  React.useEffect(() => {
    const loadProject = async () => {
      if (projectId) {
        try {
          const res = await fetch(`/api/websites/${projectId}`);
          const result = await res.json();
          if (result.success) {
            const project = result.data;
            if (Object.keys(project.content || {}).length === 0) {
              const base = defaultContent[templateId];
              setContent({
                ...base,
                hero: { ...base.hero, heading: `${project.websiteName}: ${base.hero.heading}` },
                footer: { ...base.footer, companyName: project.brandName }
              });
            } else {
              setContent(project.content);
            }
          }
        } catch (error) {
          console.error("Failed to load project:", error);
        }
      } else {
        // Fallback or demo
        const base = defaultContent[templateId];
        if (base) setContent(base);
      }
    };
    loadProject();
  }, [templateId, projectId]);

  if (!content) return null;

  const isPublic = searchParams.get('mode') === 'public';

  return (
    <div className="min-h-screen relative">
      {!isPublic && (
        <button 
          onClick={() => router.push('/website-funnel/dashboard')}
          className="fixed top-8 left-8 z-[100] p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white hover:bg-indigo-600 hover:text-white transition-all group active:scale-95"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest leading-none">Back to Dashboard</span>
          </div>
        </button>
      )}
      <TemplateRenderer templateId={templateId} content={content} />
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-medium">Launching your website...</div>}>
      <PreviewContent />
    </Suspense>
  );
}
