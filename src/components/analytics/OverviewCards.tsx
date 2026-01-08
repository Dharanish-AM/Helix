"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, GitFork, Code2, Users } from "lucide-react";

interface OverviewCardsProps {
  stats: {
    totalStars: number;
    totalForks: number;
    topLanguages: { name: string; count: number }[];
  };
}

export function OverviewCards({ stats }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStars}</div>
          <p className="text-xs text-muted-foreground">
            Across all repositories
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Forks</CardTitle>
          <GitFork className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalForks}</div>
          <p className="text-xs text-muted-foreground">Community derivations</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Language</CardTitle>
          <Code2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.topLanguages[0]?.name || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">Most used in repos</p>
        </CardContent>
      </Card>
      {/* Placeholder for 4th metric */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">--</div>
          <p className="text-xs text-muted-foreground">(Coming soon)</p>
        </CardContent>
      </Card>
    </div>
  );
}
