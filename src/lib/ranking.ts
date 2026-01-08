import User from "@/models/User";
import dbConnect from "@/lib/db";

/**
 * Calculates a standardized contribution score based on weighted metrics.
 * Heuristic:
 * - PR Merged: 10 points
 * - Code Reviews: 5 points
 * - Stars Received: 2 points
 * - Commits/Activity: 0.5 points
 * - Followers: 1 point
 */
export function calculateContributorScore(stats: any) {
  const score =
    (stats.prMerged || 0) * 10 +
    (stats.reviews || 0) * 5 +
    (stats.totalStars || 0) * 2 +
    (stats.followers || 0) * 1;
  // We can add more activity-based metrics later

  return Math.round(score);
}

/**
 * Updates global rankings for all users.
 * Should be run via a scheduled job (cron) in production.
 */
export async function updateLeaderboard() {
  await dbConnect();

  // 1. Fetch all users needed for ranking (or use aggregation for scale)
  const users = await User.find({}).select("stats scores");

  // 2. Calculate scores
  const overrides = users.map((user) => {
    const score = calculateContributorScore(user.stats || {});
    return {
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { "scores.contributionScore": score } },
      },
    };
  });

  if (overrides.length > 0) {
    await User.bulkWrite(overrides);
  }

  // 3. Assign Ranks (Sort by score desc)
  const rankedUsers = await User.find({})
    .sort({ "scores.contributionScore": -1 })
    .select("_id");

  const rankUpdates = rankedUsers.map((user, index) => ({
    updateOne: {
      filter: { _id: user._id },
      update: { $set: { "scores.globalRank": index + 1 } },
    },
  }));

  if (rankUpdates.length > 0) {
    await User.bulkWrite(rankUpdates);
  }

  console.log(`Updated leaderboard for ${users.length} users.`);
}

/**
 * Get top N users for the leaderboard.
 */
export async function getLeaderboard(limit = 50) {
  await dbConnect();
  return User.find({})
    .sort({ "scores.contributionScore": -1 })
    .limit(limit)
    .select("name username image stats scores badges")
    .lean();
}
