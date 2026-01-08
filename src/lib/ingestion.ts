import { octokit } from "./github";
import Repository from "@/models/Repository";
import dbConnect from "./db";

/**
 * Ingests repository data from GitHub, calculates metrics, and updates the DB.
 */
export async function ingestRepository(owner: string, name: string) {
  await dbConnect();

  console.log(`Ingesting ${owner}/${name}...`);

  try {
    // 1. Fetch Repository Details
    const { data: repo } = await octokit.rest.repos.get({
      owner,
      repo: name,
    });

    // 2. Fetch Recent Activity (Last 100 commits)
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo: name,
      per_page: 100,
    });

    // 3. Fetch Contributors (Top 100)
    const { data: contributors } = await octokit.rest.repos.listContributors({
      owner,
      repo: name,
      per_page: 100,
    });

    // --- Metric Calculation ---

    // A. Activity Score (Simple heuristic: commit frequency in last 100 commits)
    // We look at the date of the oldest commit in the batch to determine density.
    let activityScore = 0;
    if (commits.length > 0) {
      const lastCommitDate = new Date(
        commits[0].commit.author?.date || new Date()
      );
      const oldestCommitDate = new Date(
        commits[commits.length - 1].commit.author?.date || new Date()
      );
      const daysDiff =
        (lastCommitDate.getTime() - oldestCommitDate.getTime()) /
        (1000 * 3600 * 24);

      // Commits per day avg in this window
      const commitsPerDay =
        daysDiff > 0 ? commits.length / daysDiff : commits.length;
      // Normalize: 5+ commits/day = 100 score
      activityScore = Math.min(Math.round((commitsPerDay / 5) * 100), 100);
    }

    // B. Bus Factor (Risk that project dies if top contributor leaves)
    // Heuristic: % of commits by top contributor (using contribution data)
    let busFactor = 0; // Low risk (high number) is better, but let's define as "Risk Score" or similar?
    // Actually PRD says "maintainer dependency risk".
    // Let's calculate "Bus Factor Risk": High score = High Risk.
    if (contributors && contributors.length > 0) {
      const totalContributions = contributors.reduce(
        (acc, c) => acc + c.contributions,
        0
      );
      const topContributor = contributors[0].contributions;
      // If top contributor has 80% of commits -> High Risk (80).
      busFactor = Math.round((topContributor / totalContributions) * 100);
    }

    // C. Health Score (Combination of recent update, issues, activity)
    // - Recency: Updated in last 30 days?
    const daysSincePush =
      (new Date().getTime() -
        new Date(repo.pushed_at || new Date()).getTime()) /
      (1000 * 3600 * 24);
    const recencyScore =
      daysSincePush < 30 ? 100 : Math.max(0, 100 - (daysSincePush - 30));

    // - Stars/Forks (Social Proof)
    const popularityScore = Math.min(100, (repo.stargazers_count / 1000) * 20); // 5000 stars = 100

    const healthScore = Math.round(
      recencyScore * 0.4 + activityScore * 0.4 + popularityScore * 0.2
    );

    // --- Persist ---

    await Repository.findOneAndUpdate(
      { githubId: repo.id },
      {
        githubId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        owner: {
          login: repo.owner.login,
          id: repo.owner.id,
          avatarUrl: repo.owner.avatar_url,
        },
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        topics: repo.topics,
        stats: {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          issues: repo.open_issues_count,
          subscribers: repo.subscribers_count,
        },
        metrics: {
          healthScore,
          activityScore,
          busFactor, // High value = High Risk
        },
        lastIngestedAt: new Date(),
        created_at: repo.created_at,
        updated_at: repo.updated_at,
      },
      { upsert: true, new: true }
    );

    console.log(
      `Ingested ${name}: Health=${healthScore}, Activity=${activityScore}`
    );
  } catch (error) {
    console.error(`Failed to ingest ${owner}/${name}:`, error);
    throw error;
  }
}

/**
 * Placeholder for user contribution ingestion logic.
 */
export async function ingestUserDrawData(username: string) {
  await dbConnect();
  // TODO: Fetch contributions via GraphQL API
  // TODO: Update User stats and Snapshots
  console.log(`Ingesting user ${username}...`);
}
