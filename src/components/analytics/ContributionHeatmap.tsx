"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, subDays, eachDayOfInterval } from "date-fns";

export function ContributionHeatmap() {
  // Generate last 365 days
  const today = new Date();
  const days = eachDayOfInterval({
    start: subDays(today, 364),
    end: today,
  });

  // Mock intensity for now
  const getIntensity = (day: Date) => {
    // Deterministic random based on date
    const val = (day.getDate() * day.getMonth()) % 5;
    return val;
  };

  const getColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-muted"; // 0 contributions
      case 1:
        return "bg-emerald-900"; // 1-3
      case 2:
        return "bg-emerald-700"; // 4-6
      case 3:
        return "bg-emerald-500"; // 7-9
      case 4:
        return "bg-emerald-300"; // 10+
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className="col-span-4 lg:col-span-7">
      <CardHeader>
        <CardTitle>Contribution Activity</CardTitle>
        <CardDescription>
          Daily contribution visualization for the last year.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {days.map((day, i) => (
            <div
              key={i}
              className={cn("w-3 h-3 rounded-sm", getColor(getIntensity(day)))}
              title={`${format(day, "MMM dd, yyyy")}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
