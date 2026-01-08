"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Compass, LogOut, Trophy } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Don't show on login page or home if not logged in (optional logic, keeping simple)
  if (pathname === "/" || pathname?.startsWith("/api/auth")) return null;

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="mr-8 hidden md:flex">
          <Link
            href="/"
            className="mr-6 flex items-center space-x-2 font-bold text-xl"
          >
            Helix
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/dashboard"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </span>
            </Link>
            <Link
              href="/discovery"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/discovery")
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4" /> Discovery
              </span>
            </Link>
            <Link
              href="/leaderboard"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname?.startsWith("/leaderboard")
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Leaderboard
              </span>
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {session?.user && (
            <div className="flex items-center gap-4">
              <Link href={`/u/${(session.user as any).username || "me"}`}>
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage
                      src={session.user.image!}
                      alt={session.user.name!}
                    />
                    <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline-block">
                    {session.user.name}
                  </span>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
