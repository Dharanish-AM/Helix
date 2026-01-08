import { NextResponse } from "next/server";
import Repository from "@/models/Repository";
import dbConnect from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "health"; // 'health', 'stars', 'activity', 'newest'
  const language = searchParams.get("language");
  const minStars = parseInt(searchParams.get("minStars") || "0");
  const hasGoodFirstIssues = searchParams.get("hasGoodFirstIssues") === "true";

  await dbConnect();

  const query: any = {};

  if (language && language !== "All") {
    query.language = language;
  }

  if (minStars > 0) {
    query["stats.stars"] = { $gte: minStars };
  }

  if (hasGoodFirstIssues) {
    query["stats.issues"] = { $gt: 0 }; // Approximation: repos with issues might have GFI
    // In a real app, we'd specifically index 'good-first-issue' label count
  }

  let sortOptions: any = {};
  switch (sort) {
    case "stars":
      sortOptions = { "stats.stars": -1 };
      break;
    case "activity":
      sortOptions = { "metrics.activityScore": -1 };
      break;
    case "newest":
      sortOptions = { created_at: -1 };
      break;
    case "health":
    default:
      sortOptions = { "metrics.healthScore": -1 };
      break;
  }

  try {
    const repos = await Repository.find(query)
      .sort(sortOptions)
      .limit(50)
      .lean();

    return NextResponse.json(repos);
  } catch (error) {
    console.error("Discovery Search Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}
