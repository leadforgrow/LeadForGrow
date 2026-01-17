import { dbConnect } from "@/lib/mongodb";
import Website from "@/models/Website";
import PublicWebsite from "../renderWebsite";

export default async function WebsitePage({ params }) {
  const { slug } = await params;
  
  await dbConnect();
  const website = await Website.findOne({ slug }).lean();

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col p-6 text-center">
         <h1 className="text-3xl font-bold text-slate-900 mb-2">404 - Not Found</h1>
         <p className="text-slate-500">This website doesn't exist.</p>
      </div>
    );
  }

  // Pass plain object (lean) to client component
  return <PublicWebsite website={JSON.parse(JSON.stringify(website))} />;
}
