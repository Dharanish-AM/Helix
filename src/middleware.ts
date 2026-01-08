import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    // Protect these specific routes
    "/dashboard/:path*",
    "/leaderboard/:path*",
    "/discovery/:path*",
    "/repository/:path*",
    "/u/:path*",
    // Explicitly do NOT match api routes (redundant given above, but safe)
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
