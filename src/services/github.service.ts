import { getUserOctokit } from "@/lib/github";
import User from "@/models/User";
import Snapshot from "@/models/Snapshot";
import dbConnect from "@/lib/db";

export const getProfileStats = async (accessToken: string, email: string) => {
  const octokit = getUserOctokit(accessToken);

  // Parallelize requests for speed
  const [user, repos] = await Promise.all([
    octokit.rest.users.getAuthenticated(),
    octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100, // Fetch top 100 recent repos
      type: "all", // Include pushed, details, etc.
    }),
  ]);

  const userData = user.data;
  const repoData = repos.data;

  // Calculate aggregated stats
  const totalStars = repoData.reduce(
    (acc, repo) => acc + (repo.stargazers_count || 0),
    0
  );
  const totalForks = repoData.reduce(
    (acc, repo) => acc + (repo.forks_count || 0),
    0
  );
  // Rough estimate of languages
  const languages: Record<string, number> = {};
  repoData.forEach((repo) => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  // Sort languages by usage
  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Update Database with latest info
  await dbConnect();
  // Update user in DB
  // Construct update data, excluding null/undefined fields
  const updateData: any = {
    name: userData.name,
    image: userData.avatar_url,
    username: userData.login,
    bio: userData.bio,
    stats: {
      totalStars,
      totalForks,
      totalRepos: repos.data.length,
      followers: userData.followers,
      following: userData.following,
    },
    topRepos: repos.data.slice(0, 6).map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
    })),
    lastIngestedAt: new Date(),
  };

  if (userData.email) {
    updateData.email = userData.email;
  }

  // Update user in DB
  const userFromDb = await User.findOneAndUpdate(
    { githubId: String(user.data.id) },
    updateData,
    { new: true } // Removed upsert: true, as user should exist from login. If not, we shouldn't create a broken partial user.
  ).lean();

  if (!userFromDb) {
    // Should not happen if authenticated properly
    throw new Error("User not found in database");
  }

  // Create Snapshot for Growth Chart
  await Snapshot.create({
    entityId: userFromDb._id,
    entityType: "USER",
    data: {
      stars: totalStars,
      followers: userData.followers,
    },
    date: new Date(),
  });

  // Fetch historical snapshots for Growth Chart
  const history = await Snapshot.find({
    entityId: userFromDb._id,
    entityType: "USER",
  })
    .sort({ date: 1 })
    .select("date data")
    .lean();

  return {
    profile: {
      login: userData.login,
      name: userData.name,
      avatarUrl: userData.avatar_url,
      bio: userData.bio,
      publicRepos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      createdAt: userData.created_at,
    },
    stats: {
      totalStars,
      totalForks,
      topLanguages,
    },
    scores: userFromDb.scores,
    badges: userFromDb.badges,
    history: history.map((h: any) => ({
      date: h.date.toISOString().split("T")[0],
      stars: h.data.stars || 0,
      followers: h.data.followers || 0,
    })),
  }; // We will implement contribution graph scraping or GraphQL fetching separately as it's complex
};
