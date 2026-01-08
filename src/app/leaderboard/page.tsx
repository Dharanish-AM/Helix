import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Star, GitCommit, Activity } from "lucide-react";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { FollowButton } from "@/components/social/FollowButton";
import { StaggerChildren, MotionItem } from "@/components/ui/motion";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";

async function getLeaderboardData() {
  const { default: dbConnect } = await import("@/lib/db");
  const { default: User } = await import("@/models/User");
  const { default: Repository } = await import("@/models/Repository");

  await dbConnect();

  const [users, repos] = await Promise.all([
    User.find({}).sort({ "scores.contributionScore": -1 }).limit(50).lean(),
    Repository.find({})
      .sort({ "metrics.activityScore": -1 }) // Active repos
      .limit(50)
      .lean(),
  ]);

  return { users, repos };
}

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const { users, repos } = await getLeaderboardData();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
          <p className="text-muted-foreground">
            Top contributors and active projects.
          </p>
        </div>
      </div>

      <Tabs defaultValue="contributors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contributors">Contributors</TabsTrigger>
          <TabsTrigger value="repos">Repositories</TabsTrigger>
        </TabsList>
        <TabsContent value="contributors" className="space-y-4">
          <StaggerChildren className="space-y-4">
            {users.map((user: any, index: number) => (
              <MotionItem key={user._id}>
                <Card className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 font-bold text-lg text-muted-foreground">
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/u/${user.username}`}
                        className="font-semibold flex items-center gap-2 hover:underline"
                      >
                        {user.name}
                        {index === 0 && (
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        )}
                        {index === 1 && (
                          <Medal className="w-4 h-4 text-gray-400" />
                        )}
                        {index === 2 && (
                          <Medal className="w-4 h-4 text-amber-600" />
                        )}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        @{user.username}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <FollowButton targetId={user._id.toString()} />
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-lg">
                        {user.scores?.contributionScore ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Score
                      </span>
                    </div>
                    {/* ... other user stats ... */}
                    <div className="hidden md:flex flex-col items-end w-16">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />{" "}
                        {user.stats?.totalStars ?? 0}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Stars
                      </span>
                    </div>
                  </div>
                </Card>
              </MotionItem>
            ))}
          </StaggerChildren>
        </TabsContent>
        <TabsContent value="repos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo: any, index: number) => (
              <Card key={repo._id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Link
                      href={`/repository/${repo.fullName}`}
                      className="font-semibold hover:underline flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      {repo.name}
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                      {repo.description}
                    </p>
                  </div>
                  <Badge variant="secondary">#{index + 1}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="font-bold">
                      {repo.metrics?.activityScore || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{repo.stats.stars}</span>
                  </div>
                  {repo.language && (
                    <Badge variant="outline" className="text-xs">
                      {repo.language}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
