import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProfileStats } from "@/services/github.service";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // @ts-ignore
  const accessToken = session.accessToken;

  if (!accessToken) {
    return NextResponse.json(
      { error: "Access Token missing" },
      { status: 401 }
    );
  }

  try {
    const stats = await getProfileStats(accessToken, session.user.email!);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
