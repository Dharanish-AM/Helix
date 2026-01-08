import User from "@/models/User";
import dbConnect from "@/lib/db";

export async function followUser(followerId: string, targetId: string) {
  await dbConnect();

  if (followerId === targetId) return false; // Cannot follow self

  // Add target to follower's 'following'
  await User.findByIdAndUpdate(followerId, {
    $addToSet: { "social.following": targetId },
  });

  // Add follower to target's 'followers'
  await User.findByIdAndUpdate(targetId, {
    $addToSet: { "social.followers": followerId },
    $inc: { "stats.followers": 1 },
  });

  // Update follower's stats
  await User.findByIdAndUpdate(followerId, {
    $inc: { "stats.following": 1 },
  });

  return true;
}

export async function unfollowUser(followerId: string, targetId: string) {
  await dbConnect();

  // Remove target from follower's 'following'
  await User.findByIdAndUpdate(followerId, {
    $pull: { "social.following": targetId },
  });

  // Remove follower to target's 'followers'
  await User.findByIdAndUpdate(targetId, {
    $pull: { "social.followers": followerId },
    $inc: { "stats.followers": -1 },
  });

  await User.findByIdAndUpdate(followerId, {
    $inc: { "stats.following": -1 },
  });

  return true;
}

export async function isFollowing(followerId: string, targetId: string) {
  if (!followerId) return false;
  await dbConnect();
  const user = await User.findById(followerId).select("social.following");
  if (!user || !user.social?.following) return false;
  // @ts-ignore
  return user.social.following.includes(targetId);
}
