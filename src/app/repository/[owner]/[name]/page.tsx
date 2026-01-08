import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { GrowthChart } from "@/components/analytics/GrowthChart";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  GitFork,
  Star,
  CircleAlert,
  Activity,
  HeartPulse,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getRepositoryData(owner: string, name: string) {
  const { octokit } = await import("@/lib/github");
  const { default: Repository } = await import("@/models/Repository");
  const { default: Snapshot } = await import("@/models/Snapshot");
  const { default: dbConnect } = await import("@/lib/db");

  await dbConnect();
  const fullName = `${owner}/${name}`;
  const repo = await Repository.findOne({ fullName }).lean();

  if (!repo) return null;

  // Fetch history
  const history = await Snapshot.find({
    entityId: repo._id,
    entityType: "REPO",
  })
    .sort({ date: 1 })
    .lean();

  return {
    repo,
    history: history.map((h: any) => ({
      date: h.date.toISOString().split("T")[0],
      stars: h.data.stars || 0,
      // Repos don't have "followers" usually, maybe forks? Or just stars.
      // GrowthChart might expect 'followers' key if reused. Let's map forks to followers or 0?
      // Let's check GrowthChart. If it's generic, it might be fine.
      // For now assume stars is main metric.
      followers: h.data.forks || 0,
    })),
  };
}

export default async function RepositoryPage({
  params,
}: {
  params: Promise<{ owner: string; name: string }>;
}) {
  const { owner, name } = await params;
  const data = await getRepositoryData(owner, name);

  if (!data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Repository Not Analyzed</h1>
        <p>
          We haven't ingested {owner}/{name} yet.
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const { repo, history } = data;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{repo.fullName}</h2>
          <p className="text-muted-foreground">{repo.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={repo.url} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {repo.metrics?.healthScore ?? "N/A"}/100
            </div>
            <p className="text-xs text-muted-foreground">Community vitality</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Activity Score
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {repo.metrics?.activityScore ?? "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Commit frequency</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bus Factor Risk
            </CardTitle>
            <CircleAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {repo.metrics?.busFactor ?? "N/A"}%
            </div>
            <p className="text-xs text-muted-foreground">
              Top contributor dominance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stars</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repo.stats.stars}</div>
            <p className="text-xs text-muted-foreground">Total stargazers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <GrowthChart data={history} />{" "}
        {/* Placeholder for commit history if we store snapshots */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {repo.topics.map((topic) => (
                <Badge key={topic} variant="secondary">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
