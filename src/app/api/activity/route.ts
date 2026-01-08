import { NextResponse } from "next/server";
import Activity from "@/models/Activity";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  await dbConnect();
  try {
    // Populate user info for the feed
    const activities = await Activity.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "name username image")
      .lean();

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Activity API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
