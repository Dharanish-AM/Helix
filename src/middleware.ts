import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/leaderboard/:path*",
    "/discovery/:path*",
    "/repository/:path*",
    "/u/:path*",
  ],
};
