import Badge from "@/models/Badge";
import User from "@/models/User";
import Activity from "@/models/Activity";
import dbConnect from "@/lib/db";

// Hardcoded badge definitions for MVP
// In a real app, these might come from the DB, but logic needs to be code-side anyway.
const BADGE_DEFINITIONS = [
  {
    id: "early-adopter",
    name: "Early Adopter",
    description: "Joined Helix during the beta phase.",
    icon: "🚀",
    type: "special",
    check: (user: any) => user.githubId && true, // Everyone gets it for now
  },
  {
    id: "star-magnet",
    name: "Star Magnet",
    description: "Received over 100 stars across repositories.",
    icon: "⭐",
    type: "achievement",
    check: (user: any) => (user.stats?.totalStars || 0) >= 100,
  },
  {
    id: "open-source-hero",
    name: "Open Source Hero",
    description: "Merged over 50 Pull Requests.",
    icon: "🦸",
    type: "rank",
    check: (user: any) => (user.stats?.prMerged || 0) >= 50,
  },
];

/**
 * Seeds default badges into the database if they don't exist.
 */
export async function seedBadges() {
  await dbConnect();
  for (const def of BADGE_DEFINITIONS) {
    await Badge.findOneAndUpdate(
      { id: def.id },
      {
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        type: def.type,
      },
      { upsert: true }
    );
  }
}

/**
 * Checks and awards badges for a specific user.
 */
export async function evaluateBadges(userId: string) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) return;

  const awardedBadgeIds = new Set(
    user.badges?.map((b: any) => b.badgeId) || []
  );
  const newBadges: { id: string; name: string; icon: string }[] = [];

  for (const def of BADGE_DEFINITIONS) {
    if (!awardedBadgeIds.has(def.id) && def.check(user)) {
      newBadges.push({ id: def.id, name: def.name, icon: def.icon });
    }
  }

  if (newBadges.length > 0) {
    // Award Badge
    await User.findByIdAndUpdate(userId, {
      $push: {
        badges: {
          $each: newBadges.map((b) => ({
            badgeId: b.id,
            awardedAt: new Date(),
          })),
        },
      },
    });

    // Log Activities
    for (const badge of newBadges) {
      await Activity.create({
        userId: user._id,
        type: "badge",
        content: `earned the '${badge.name}' badge!`,
        meta: badge.icon,
      });
    }
    console.log(
      `Awarded badges [${newBadges.map((b) => b.id).join(", ")}] to ${
        user.username
      }`
    );
  }
}
