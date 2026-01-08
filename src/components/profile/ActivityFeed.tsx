import React from "react";
import {
  GitCommit,
  GitPullRequest,
  Star,
  Plus,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityItem {
  id: string;
  type: string;
  repo: string;
  createdAt: string;
  payload: any;
}

const EventIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "PushEvent":
      return <GitCommit className="w-4 h-4 text-blue-500" />;
    case "PullRequestEvent":
      return <GitPullRequest className="w-4 h-4 text-purple-500" />;
    case "WatchEvent":
      return <Star className="w-4 h-4 text-yellow-500" />;
    case "CreateEvent":
      return <Plus className="w-4 h-4 text-green-500" />;
    case "IssuesEvent":
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    default:
      return <div className="w-4 h-4 rounded-full bg-gray-500" />;
  }
};

const EventDescription = ({ event }: { event: ActivityItem }) => {
  const repoLink = (
    <Link
      href={`https://github.com/${event.repo}`}
      target="_blank"
      className="font-medium hover:underline"
    >
      {event.repo}
    </Link>
  );

  switch (event.type) {
    case "PushEvent":
      const commitCount = event.payload.size || 1;
      return (
        <span>
          Pushed {commitCount} commit{commitCount > 1 ? "s" : ""} to {repoLink}
        </span>
      );
    case "PullRequestEvent":
      return (
        <span>
          {event.payload.action} PR in {repoLink}
        </span>
      );
    case "WatchEvent":
      return <span>Starred {repoLink}</span>;
    case "CreateEvent":
      return (
        <span>
          Created {event.payload.ref_type} {event.payload.ref || ""} in{" "}
          {repoLink}
        </span>
      );
    case "IssuesEvent":
      return (
        <span>
          {event.payload.action} issue in {repoLink}
        </span>
      );
    default:
      return <span>Activity in {repoLink}</span>;
  }
};

export function ActivityFeed({ events }: { events: ActivityItem[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-4">
        No recent activity found.
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {events.map((event, i) => (
          <div key={event.id} className="flex gap-4 relative">
            {/* Timeline Line */}
            {i !== events.length - 1 && (
              <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-border/50" />
            )}

            <div className="relative z-10 mt-1">
              <EventIcon type={event.type} />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm text-foreground/90">
                <EventDescription event={event} />
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(event.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
