import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          // Attach user ID from DB to session
          // @ts-ignore
          session.user.id = dbUser._id.toString();
          // @ts-ignore
          session.user.username = dbUser.username;
        }
        // @ts-ignore
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        await dbConnect();
        try {
          const { email, name, image } = user;
          // @ts-ignore - profile type is generic, need casting or ignore for MVP
          const { id: githubId, login: username } = profile;

          if (!email) return false;

          // 1. Try to find by GitHub ID first (immutable stable ID)
          let existingUser = await User.findOne({ githubId: String(githubId) });

          if (!existingUser) {
            // 2. Fallback: Find by email if not found by GitHub ID (handle legacy/email changes)
            existingUser = await User.findOne({ email });

            if (existingUser) {
              // Link GitHub ID to existing account found by email
              existingUser.githubId = String(githubId);
            }
          }

          if (!existingUser) {
            // 3. Create new user if not found by ID or Email
            await User.create({
              name: name || username || "Developer",
              email,
              image: image || "",
              githubId: String(githubId),
              username,
            });
          } else {
            // 4. Update data for existing user
            existingUser.email = email; // Sync email if changed
            existingUser.name = name || existingUser.name;
            existingUser.image = image || existingUser.image;
            existingUser.username = username || existingUser.username;
            await existingUser.save();
          }
          return true;
        } catch (error) {
          console.error("Error saving user to DB", error);
          return false;
        }
      }
      return true;
    },
  },

  session: {
    strategy: "jwt",
  },
};
