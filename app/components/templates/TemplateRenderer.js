"use client";

import React from 'react';
import LeadBoostTemplate from './layouts/LeadBoostTemplate';
import QuickLeadTemplate from './layouts/QuickLeadTemplate';
import ServiceProTemplate from './layouts/ServiceProTemplate';
import LocalBizTemplate from './layouts/LocalBizTemplate';
import LaunchFlowTemplate from './layouts/LaunchFlowTemplate';
import WaitlistProTemplate from './layouts/WaitlistProTemplate';
import AgencyPrimeTemplate from './layouts/AgencyPrimeTemplate';
import BusinessBrandTemplate from './layouts/BusinessBrandTemplate';

export default function TemplateRenderer({ templateId, content }) {
  if (!content) return <div className="p-20 text-center font-bold">No content found for this template.</div>;

  const brandName = content.footer?.companyName || 'Brand';

  const renderTemplate = () => {
    switch (templateId) {
      case 'leadboost-funnel':
        return <LeadBoostTemplate content={content} brandName={brandName} />;
      case 'quicklead-page':
        return <QuickLeadTemplate content={content} brandName={brandName} />;
      case 'servicepro-website':
        return <ServiceProTemplate content={content} brandName={brandName} />;
      case 'localbiz-website':
        return <LocalBizTemplate content={content} brandName={brandName} />;
      case 'launchflow-funnel':
        return <LaunchFlowTemplate content={content} brandName={brandName} />;
      case 'waitlistpro-page':
        return <WaitlistProTemplate content={content} brandName={brandName} />;
      case 'agencyprime-website':
        return <AgencyPrimeTemplate content={content} brandName={brandName} />;
      case 'businessbrand-website':
        return <BusinessBrandTemplate content={content} brandName={brandName} />;
      default:
        return <div className="p-20 text-center font-bold text-red-500 bg-red-50">Invalid template ID: {templateId}</div>;
    }
  };

  return (
    <div 
      className="template-root" 
      style={{ fontFamily: content.theme?.bodyFont ? `'${content.theme.bodyFont}', sans-serif` : 'inherit' }}
    >
      {renderTemplate()}
    </div>
  );
}
