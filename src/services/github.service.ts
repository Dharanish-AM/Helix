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

/**
 * Ingests public data for a user using system credentials (for Cron Jobs).
 * DOES NOT require user access token.
 */
/**
 * Ingests public data for a user using system credentials (for Cron Jobs).
 * DOES NOT require user access token.
 */
export const ingestUserPublicData = async (username: string) => {
  const { octokit } = await import("@/lib/github");

  // Parallelize requests
  // TODO: Add events/activity fetch if needed for heatmap
  const [userRes, reposRes, orgsRes] = await Promise.all([
    octokit.rest.users.getByUsername({ username }),
    octokit.rest.repos.listForUser({
      username,
      sort: "updated",
      per_page: 100,
      type: "all",
    }),
    octokit.rest.orgs.listForUser({ username }),
  ]);

  const userData = userRes.data;
  const repoData = reposRes.data;
  const orgsData = orgsRes.data;

  // Calculate stats logic (DUPLICATED temporarily from getProfileStats - Refactor later if needed)
  const totalStars = repoData.reduce(
    (acc, repo) => acc + (repo.stargazers_count || 0),
    0
  );
  const totalForks = repoData.reduce(
    (acc, repo) => acc + (repo.forks_count || 0),
    0
  );

  // Advanced Language Stats
  const languages: Record<string, number> = {};
  repoData.forEach((repo) => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  const languageStats = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8) // Top 8
    .map(([name, count]) => ({ name, count }));

  await dbConnect();

  const updateData: any = {
    name: userData.name || userData.login,
    image: userData.avatar_url,
    username: userData.login,
    bio: userData.bio,
    // Detailed Profile Info
    company: userData.company,
    location: userData.location,
    blog: userData.blog,
    twitterUsername: userData.twitter_username,
    organizations: orgsData.map((org) => ({
      name: org.login,
      avatarUrl: org.avatar_url,
      description: org.description,
    })),
    languages: languageStats,

    stats: {
      totalStars,
      totalForks,
      totalRepos: repoData.length,
      followers: userData.followers,
      following: userData.following,
    },
    topRepos: repoData.slice(0, 6).map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
    })),
    lastIngestedAt: new Date(),
  };

  const userFromDb = await User.findOneAndUpdate(
    { username: username }, // Find by username for cron
    updateData,
    { new: true }
  ).lean();

  if (!userFromDb) {
    // If user doesn't exist in DB, we skip creating them via Cron for now
    // (Only ingest users who have signed up)
    console.warn(`User ${username} not found in DB during ingestion.`);
    return null;
  }

  // Snapshot
  await Snapshot.create({
    entityId: userFromDb._id,
    entityType: "USER",
    data: {
      stars: totalStars,
      followers: userData.followers,
    },
    date: new Date(),
  });

  return userFromDb;
};

/**
 * Fetches recent public activity for a user (stars, pushes, PRs).
 * Validates against the authenticated user (or utilizes public data).
 */
export const fetchUserActivity = async (username: string) => {
  const { octokit } = await import("@/lib/github");

  try {
    const { data } = await octokit.rest.activity.listPublicEventsForUser({
      username,
      per_page: 20,
    });

    // Filter for interesting events
    const relevantEvents = data.filter((event) =>
      [
        "PushEvent",
        "PullRequestEvent",
        "WatchEvent",
        "CreateEvent",
        "IssuesEvent",
      ].includes(event.type!)
    );

    return relevantEvents.map((event) => ({
      id: event.id,
      type: event.type,
      repo: event.repo.name,
      createdAt: event.created_at,
      payload: event.payload, // Contains commits, PR details etc.
    }));
  } catch (err) {
    console.error("Error fetching activity:", err);
    return [];
  }
};

interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export const fetchContributionCalendar = async (
  username: string
): Promise<ContributionCalendar | null> => {
  const { octokit } = await import("@/lib/github");

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response: any = await octokit.graphql(query, { username });
    return response.user.contributionsCollection.contributionCalendar;
  } catch (err) {
    console.error("Error fetching contribution calendar:", err);
    return null;
  }
};

export const getUserByUsername = async (username: string) => {
  await dbConnect();
  // Case-insensitive regex search could be slow, generally standard username matching is preferred.
  // MongoDB default string collation is exact.
  const user = await User.findOne({ username }).lean();
  return user;
};
