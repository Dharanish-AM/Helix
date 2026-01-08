"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch("/api/activity");
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (error) {
        console.error("Failed to load activity", error);
      }
    };
    fetchActivity();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Community Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full pr-4">
          <div className="space-y-6">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity.
              </p>
            ) : (
              activities.map((activity) => (
                <div key={activity._id} className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src={activity.userId?.image} />
                    <AvatarFallback>
                      {activity.userId?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <span className="font-semibold">
                        {activity.userId?.name}
                      </span>
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        {activity.content}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {activity.type === "badge" && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1"
                        >
                          {activity.meta} Badge
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
