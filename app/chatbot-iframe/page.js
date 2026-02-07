'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Chatbot from '@/app/components/Chatbot';
import '@/app/globals.css';

function ChatbotWidgetContent() {
  const searchParams = useSearchParams();
  const businessId = searchParams.get('bizId');
  const position = searchParams.get('pos') || 'right';

  if (!businessId) {
    return <div className="p-4 text-red-500 font-bold">Error: Business ID is required</div>;
  }

  return (
    <div className="bg-transparent">
      <Chatbot businessId={businessId} position={position} />
      <style jsx global>{`
        body { 
          background: transparent !important; 
          margin: 0 !important; 
          padding: 0 !important; 
          overflow: hidden !important;
        }
        /* Override the fixed positioning to be relative to the iframe's viewport */
        .fixed { 
          position: absolute !important; 
          bottom: 0 !important; 
          right: 0 !important; 
          left: auto !important; 
          margin: 0 !important;
        }
        ${position === 'left' ? '.fixed { left: 0 !important; right: auto !important; }' : ''}
      `}</style>
    </div>
  );
}

export default function ChatbotWidgetPage() {
  return (
    <Suspense fallback={null}>
      <ChatbotWidgetContent />
    </Suspense>
  );
}
