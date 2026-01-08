import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GrowthChart } from "@/components/analytics/GrowthChart";
import { ContributionHeatmap } from "@/components/analytics/ContributionHeatmap";
import { OverviewCards } from "@/components/analytics/OverviewCards";
import { Badge } from "@/components/ui/badge";
import { ActivityFeed } from "@/components/social/ActivityFeed";
import { FadeIn, SlideUp } from "@/components/ui/motion";
import { getProfileStats } from "@/services/github.service";
import { Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !(session as any).accessToken) {
    redirect("/api/auth/signin");
  }

  // @ts-ignore
  const accessToken = session.accessToken;

  let profileStats = null;
  let error = null;

  try {
    // We fetch directly on server component instead of client-side API call for better SEO/Perf
    // Note: In a real app, we might check DB first. Svc does update DB.
    profileStats = await getProfileStats(accessToken, session.user!.email!);
  } catch (e: any) {
    console.error("Dashboard fetch error:", e);
    // error = "Failed to load GitHub data. Please define your .env.local variables.";
    error = `Error: ${e.message || JSON.stringify(e)}`;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <FadeIn>
        <div className="flex items-center justify-between space-y-2">
          {profileStats && (
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                {(profileStats as any).scores?.globalRank && (
                  <Badge
                    variant="outline"
                    className="text-sm border-yellow-500 text-yellow-600"
                  >
                    <Trophy className="w-3 h-3 mr-1" /> Rank #
                    {(profileStats as any).scores.globalRank}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Welcome back, {profileStats.profile.name}
              </p>
            </div>
          )}

          {profileStats && (
            <div className="flex items-center space-x-2">
              {(profileStats as any).badges?.map((b: any) => (
                <div key={b.badgeId} className="text-2xl" title={b.badgeId}>
                  {b.badgeId === "early-adopter"
                    ? "🚀"
                    : b.badgeId === "star-magnet"
                    ? "⭐"
                    : "🏅"}
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {error && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {profileStats && (
        <SlideUp delay={0.1}>
          <OverviewCards stats={profileStats.stats} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
            <div className="col-span-4">
              {/* <GrowthChart data={(profileStats as any).history || []} /> */}
              <div className="h-[350px] w-full flex items-center justify-center border rounded-md">
                Chart Temporarily Disabled
              </div>
            </div>
            <div className="col-span-3">
              <ActivityFeed />
            </div>
          </div>
          <div className="mt-4">
            <ContributionHeatmap />
          </div>
        </SlideUp>
      )}
    </div>
  );
}
