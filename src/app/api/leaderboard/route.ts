import { NextResponse } from "next/server";
import { getLeaderboard, updateLeaderboard } from "@/lib/ranking";
import { seedBadges, evaluateBadges } from "@/lib/gamification";

export async function GET() {
  try {
    // In production, updateLeaderboard() should be a cron job.
    // For MVP, we'll trigger it occasionally or on-read (with caching ideally).
    // Let's run it here for demo purposes to ensure ranks are fresh.
    await seedBadges();
    await updateLeaderboard();

    const leaderboard = await getLeaderboard();
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
