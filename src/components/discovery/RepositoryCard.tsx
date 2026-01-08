import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, HeartPulse, Activity } from "lucide-react";

interface RepositoryCardProps {
  repo: any; // Type accurately in real app
}

export function RepositoryCard({ repo }: RepositoryCardProps) {
  return (
    <Link
      href={`/repository/${repo.owner.login}/${repo.name}`}
      className="block transition-transform hover:scale-[1.01]"
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle
              className="text-lg font-bold truncate pr-2"
              title={repo.fullName}
            >
              {repo.owner.login} /{" "}
              <span className="text-primary">{repo.name}</span>
            </CardTitle>
            <Badge
              variant={repo.metrics?.healthScore > 80 ? "default" : "secondary"}
            >
              {repo.metrics?.healthScore ?? "?"} Health
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {repo.description || "No description provided."}
          </p>

          <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" /> {repo.stats.stars}
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-4 h-4" /> {repo.stats.forks}
            </div>
            <div className="flex items-center gap-1">
              <Activity className="w-4 h-4" />{" "}
              {repo.metrics?.activityScore ?? 0}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex flex-wrap gap-1">
            {repo.language && (
              <Badge variant="outline" className="text-xs">
                {repo.language}
              </Badge>
            )}
            {repo.topics?.slice(0, 2).map((t: string) => (
              <Badge
                key={t}
                variant="secondary"
                className="text-xs bg-muted/50"
              >
                {t}
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
