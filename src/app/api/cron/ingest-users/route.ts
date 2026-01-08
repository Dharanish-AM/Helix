import { NextRequest, NextResponse } from "next/server";
import { ingestUserPublicData } from "@/services/github.service";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 1. Security Check
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow development testing if no secret is set (WARN: Remove in prod if stricter)
    // But better to enforce it.
    // Checking query param for ease of testing in browser: ?key=SECRET
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (key !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  await dbConnect();

  // 2. Fetch Users
  // Limiting to 10 for now to avoid timeout in serverless functions
  const users = await User.find({}).sort({ lastIngestedAt: 1 }).limit(10);

  const results = [];

  for (const user of users) {
    try {
      console.log(`Ingesting ${user.username}...`);
      await ingestUserPublicData(user.username);
      results.push({ username: user.username, status: "success" });
    } catch (e: any) {
      console.error(`Failed to ingest ${user.username}`, e);
      results.push({
        username: user.username,
        status: "failed",
        error: e.message,
      });
    }
  }

  return NextResponse.json({
    success: true,
    processed: results.length,
    details: results,
  });
}
