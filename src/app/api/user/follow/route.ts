import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { followUser, unfollowUser } from "@/lib/social";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { targetId, action } = await req.json(); // action: 'follow' | 'unfollow'
    // @ts-ignore
    const followerId = session.user.id;

    if (!targetId) {
      return NextResponse.json(
        { error: "Target ID required" },
        { status: 400 }
      );
    }

    if (action === "follow") {
      await followUser(followerId, targetId);
    } else if (action === "unfollow") {
      await unfollowUser(followerId, targetId);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    console.error("Follow Error:", error);
    return NextResponse.json(
      { error: "Failed to update social status" },
      { status: 500 }
    );
  }
}
