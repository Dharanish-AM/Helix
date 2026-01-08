import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
