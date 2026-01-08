"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export function ContributionHeatmap({
  data,
}: {
  data: ContributionCalendar | null;
}) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
  } | null>(null);

  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-muted-foreground" />
            Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            Unable to load contributions.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate color map for manual override if needed (Github colors are hex strings)
  // or just use the color from API.
  // Let's create a mapping for "shadcn" style if we want complete control,
  // but for now, using the hex provided by GitHub is easiest but might clash with theme.
  // Actually, GitHub returns colors like `#ebedf0`, `#9be9a8`, `#40c463`, `#30a14e`, `#216e39` (for light mode)
  // We can map these "levels" to our own classes if we want dark mode support.
  // But for simple "real data" rendering, let's use the color for now or map standard levels.

  const getLevelColor = (color: string, count: number) => {
    // Simple heuristic for dark mode compatibility if we ignore the specific hex
    if (count === 0) return "bg-secondary";
    if (count <= 3) return "bg-green-900/40 border-green-900";
    if (count <= 6) return "bg-green-700/60 border-green-700";
    if (count <= 10) return "bg-green-500/80 border-green-500";
    return "bg-green-400 border-green-400";
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2 border-b mb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-primary" />
            Contribution Activity
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {data.totalContributions} contributions in the last year
          </span>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto pb-6">
        <div className="flex gap-1 min-w-max">
          {data.weeks.map((week, wIndex) => (
            <div key={wIndex} className="flex flex-col gap-1">
              {week.contributionDays.map((day, dIndex) => {
                // Some logic to handle 'color' or 'count'
                const levelClass = getLevelColor(
                  day.color,
                  day.contributionCount
                );

                return (
                  <TooltipProvider key={day.date}>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-sm border-[0.5px] ${levelClass} transition-colors hover:ring-1 hover:ring-ring`}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        {day.contributionCount} contributions on{" "}
                        {new Date(day.date).toLocaleDateString()}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground justify-end pr-4">
          <span>Less</span>
          <div className={`w-3 h-3 rounded-sm ${getLevelColor("", 0)}`} />
          <div className={`w-3 h-3 rounded-sm ${getLevelColor("", 2)}`} />
          <div className={`w-3 h-3 rounded-sm ${getLevelColor("", 5)}`} />
          <div className={`w-3 h-3 rounded-sm ${getLevelColor("", 8)}`} />
          <div className={`w-3 h-3 rounded-sm ${getLevelColor("", 12)}`} />
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
