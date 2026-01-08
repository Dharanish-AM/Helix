import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Github,
  Trophy,
  Medal,
  Star,
  GitFork,
  BookOpen,
  Calendar,
  Users,
  MapPin,
  Building2,
  Link as LinkIcon,
  Code2,
  Twitter,
} from "lucide-react";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Link from "next/link";
import { FollowButton } from "@/components/social/FollowButton";
import { FadeIn, SlideUp, StaggerChildren } from "@/components/ui/motion";

export const dynamic = "force-dynamic";

async function getUserByUsername(username: string) {
  await dbConnect();
  // Case-insensitive regex search could be slow, generally standard username matching is preferred.
  // For now, assume exact match or let's do simple case-insensitive if possible?
  // MongoDB default string collation is exact.
  // Let's try exact first.
  const user = await User.findOne({ username }).lean();
  return user;
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = params as any; // Next 15 params are async, need await or unwrap. But here we awaited.
  const user: any = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  // Calculate Language percentages for bar
  const totalLanguageCount =
    user.languages?.reduce((a: any, b: any) => a + b.count, 0) || 0;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <FadeIn>
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                {user.name}
                {user.scores?.globalRank && (
                  <Badge
                    variant="outline"
                    className="ml-2 border-yellow-500 text-yellow-600 bg-yellow-500/10"
                  >
                    <Trophy className="w-3 h-3 mr-1" /> Rank #
                    {user.scores.globalRank}
                  </Badge>
                )}
              </h1>
              <p className="text-xl text-muted-foreground flex items-center gap-2">
                <Github className="w-5 h-5" /> @{user.username}
              </p>
              {user.bio && (
                <p className="text-base max-w-2xl text-foreground/80 mt-2 leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Meta Details */}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {user.company && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> {user.company}
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {user.location}
                  </div>
                )}
                {user.blog && (
                  <Link
                    href={
                      user.blog.startsWith("http")
                        ? user.blog
                        : `https://${user.blog}`
                    }
                    target="_blank"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" /> Website
                  </Link>
                )}
                {user.twitterUsername && (
                  <Link
                    href={`https://twitter.com/${user.twitterUsername}`}
                    target="_blank"
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Twitter className="w-4 h-4" /> @{user.twitterUsername}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <FollowButton targetId={user._id.toString()} />
            <Link href={`https://github.com/${user.username}`} target="_blank">
              <Button variant="outline">
                <Github className="w-4 h-4 mr-2" /> View on GitHub
              </Button>
            </Link>
          </div>
        </div>
      </FadeIn>

      <SlideUp delay={0.1}>
        {/* TECH STACK & ORGS */}
        <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-3">
          {/* Tech Stack Bar */}
          {user.languages && user.languages.length > 0 && (
            <div className="md:col-span-2 p-4 border rounded-lg bg-card/50">
              <h3 className="text-sm font-semibold mb-3 flex items-center">
                <Code2 className="w-4 h-4 mr-2 text-primary" /> Most Used
                Languages
              </h3>
              <div className="w-full h-3 bg-secondary rounded-full overflow-hidden flex">
                {user.languages.map((lang: any, index: number) => {
                  const percent = (lang.count / totalLanguageCount) * 100;
                  // Generate consistent color based on string hash or simple cycle
                  const colors = [
                    "bg-blue-500",
                    "bg-yellow-500",
                    "bg-red-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-pink-500",
                    "bg-indigo-500",
                    "bg-orange-500",
                  ];
                  const colorClass = colors[index % colors.length];

                  return (
                    <div
                      key={lang.name}
                      className={`h-full ${colorClass}`}
                      style={{ width: `${percent}%` }}
                      title={`${lang.name}: ${Math.round(percent)}%`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                {user.languages.map((lang: any, index: number) => {
                  const percent = (lang.count / totalLanguageCount) * 100;
                  const colors = [
                    "bg-blue-500",
                    "bg-yellow-500",
                    "bg-red-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-pink-500",
                    "bg-indigo-500",
                    "bg-orange-500",
                  ];
                  const colorClass = colors[index % colors.length];
                  return (
                    <div
                      key={lang.name}
                      className="flex items-center text-xs text-muted-foreground"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-1 ${colorClass}`}
                      ></div>
                      <span className="font-medium">{lang.name}</span>
                      <span className="ml-1 opacity-70">
                        {Math.round(percent)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Organizations */}
          {user.organizations && user.organizations.length > 0 && (
            <div className="md:col-span-1 p-4 border rounded-lg bg-card/50">
              <h3 className="text-sm font-semibold mb-3 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-primary" />{" "}
                Organizations
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.organizations.map((org: any) => (
                  <Avatar
                    key={org.name}
                    className="h-10 w-10 border"
                    title={org.name}
                  >
                    <AvatarImage src={org.avatarUrl} alt={org.name} />
                    <AvatarFallback>{org.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* METRICS GRID */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Contribution Score
              </CardTitle>
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.scores?.contributionScore || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total impact calculated
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stars</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.stats?.totalStars || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all repositories
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Followers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.stats?.followers || 0}
              </div>
              <p className="text-xs text-muted-foreground">GitHub community</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PRs Merged</CardTitle>
              <GitFork className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.stats?.prMerged || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Code contributions
              </p>
            </CardContent>
          </Card>
        </div>
      </SlideUp>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Repositories</CardTitle>
          </CardHeader>
          <CardContent>
            {user.topRepos && user.topRepos.length > 0 ? (
              <div className="space-y-4">
                {user.topRepos.map((repo: any) => (
                  <div
                    key={repo.name}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <Link
                        href={repo.url}
                        target="_blank"
                        className="font-semibold hover:underline flex items-center gap-2"
                      >
                        <BookOpen className="w-3 h-3 text-muted-foreground" />
                        {repo.name}
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                        {repo.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {repo.stars}
                      </div>
                      {repo.language && (
                        <Badge variant="secondary" className="text-xs">
                          {repo.language}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No repositories showcased yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {user.badges && user.badges.length > 0 ? (
                user.badges.map((badge: any) => (
                  <div
                    key={badge.badgeId}
                    className="flex flex-col items-center gap-2 p-4 bg-secondary/50 rounded-lg w-24"
                    title={`Awarded on ${new Date(
                      badge.awardedAt
                    ).toLocaleDateString()}`}
                  >
                    <div className="text-3xl">
                      {badge.badgeId === "early-adopter"
                        ? "🚀"
                        : badge.badgeId === "star-magnet"
                        ? "⭐"
                        : "🏅"}
                    </div>
                    <span className="text-xs font-medium text-center capitalize">
                      {badge.badgeId.replace("-", " ")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-muted-foreground text-center w-full">
                  No badges earned yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground mt-8 text-center">
        Joined {new Date(user.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
