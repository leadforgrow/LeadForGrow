import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";

import User from "@/models/User";
import Agency from "@/models/Agency";
import AgencyUsage from "@/models/AgencyUsage";
import Business from "@/models/Business";
import Client from "@/models/Client";
import Form from "@/models/Form";
import Invoice from "@/models/Invoice";
import OnboardingCall from "@/models/OnboardingCall";
import Website from "@/models/Website";

const models = {
  User,
  Agency,
  AgencyUsage,
  Business,
  Client,
  Form,
  Invoice,
  OnboardingCall,
  Website,
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { password, action, modelName, id, updateData, query } = body;

    if (password !== "lfg") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    if (action === "listModels") {
      return NextResponse.json({ data: Object.keys(models) });
    }

    const Model = models[modelName];
    if (!Model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    switch (action) {
      case "find":
        const findQuery = query || {};
        const docs = await Model.find(findQuery).sort({ createdAt: -1 }).limit(200).lean();

        const schemaDef = {};
        if (Model.schema && Model.schema.paths) {
          for (const [key, value] of Object.entries(Model.schema.paths)) {
            // Include basic type info and any enums defined for string dropdowns
            schemaDef[key] = {
              type: value.instance,
              enumValues: value.enumValues && value.enumValues.length ? value.enumValues : null,
            };
          }
        }
        return NextResponse.json({ data: docs, schema: schemaDef });

      case "delete":
        await Model.findByIdAndDelete(id);
        return NextResponse.json({ success: true });

      case "update":
        let cleanData = { ...updateData };
        delete cleanData._id; // prevent _id modification
        const updated = await Model.findByIdAndUpdate(id, cleanData, { new: true }).lean();
        return NextResponse.json({ data: updated });

      case "create":
        const created = await Model.create(updateData);
        return NextResponse.json({ data: created });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin DB API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
