import { dbConnect } from "@/lib/mongodb";
import Website from "@/models/Website";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const website = await Website.findById(id);
    
    if (!website) {
      return NextResponse.json({ success: false, error: "Website not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: website });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const data = await req.json();

    const website = await Website.findByIdAndUpdate(id, data, { new: true });
    
    if (!website) {
      return NextResponse.json({ success: false, error: "Website not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: website });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const website = await Website.findByIdAndDelete(id);
    
    if (!website) {
      return NextResponse.json({ success: false, error: "Website not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Website deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
