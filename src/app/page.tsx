import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <h1 className="text-4xl font-bold">Welcome to Helix</h1>
      <p className="text-muted-foreground">GitHub Analytics for Developers</p>
      <Link href="/api/auth/signin">
        <Button>Login with GitHub</Button>
      </Link>
    </div>
  );
}
