import React from "react";
import UserHome from "./user/home/page";
import LeadForGrowWidget from "./Enquiry";

export default function page() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "LeadForGrow",
            "url": "https://www.leadforgrow.com",
            "logo": "https://www.leadforgrow.com/logo.png"
          }),
        }}
      />
      <UserHome></UserHome>
      {/* <LeadForGrowWidget></LeadForGrowWidget> */}
      <div className="flex justify-center py-8">
        <a 
          href="https://www.producthunt.com/products/leadforgrow?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-leadforgrow" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <img 
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1061110&theme=dark&t=1768075503703" 
            alt="LeadForGrow - The missing layer between enquiry and revenue. | Product Hunt" 
            width="250" 
            height="54" 
          />
        </a>
      </div>
    </div>
  );
}
