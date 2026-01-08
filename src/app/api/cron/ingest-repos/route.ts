import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Repository from "@/models/Repository";
import Snapshot from "@/models/Snapshot";

export const dynamic = "force-dynamic";

async function ingestRepo(owner: string, name: string) {
  const { octokit } = await import("@/lib/github");

  // 1. Fetch from GitHub
  const { data: repoData } = await octokit.rest.repos.get({
    owner,
    repo: name,
  });

  await dbConnect();

  // 2. Update DB
  const repo = await Repository.findOneAndUpdate(
    { fullName: repoData.full_name },
    {
      name: repoData.name,
      owner: repoData.owner.login,
      description: repoData.description,
      url: repoData.html_url,
      language: repoData.language,
      stats: {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        issues: repoData.open_issues_count,
      },
      topics: repoData.topics,
      lastIngestedAt: new Date(),
    },
    { new: true, upsert: true } // Upsert is okay for repos if we discover them
  );

  // 3. Create Snapshot
  await Snapshot.create({
    entityId: repo._id,
    entityType: "REPO",
    data: {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      issues: repoData.open_issues_count,
    },
    date: new Date(),
  });

  return repo;
}

export async function GET(req: NextRequest) {
  // 1. Security Check
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    key !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  // 2. Fetch Repos to update
  // Limit 10 to prevent timeout
  const repos = await Repository.find({}).sort({ lastIngestedAt: 1 }).limit(10);

  const results = [];

  for (const r of repos) {
    try {
      console.log(`Ingesting Repo ${r.fullName}...`);
      await ingestRepo(r.owner.login, r.name);
      results.push({ repo: r.fullName, status: "success" });
    } catch (e: any) {
      console.error(`Failed to ingest repo ${r.fullName}`, e);
      results.push({ repo: r.fullName, status: "failed", error: e.message });
    }
  }

  return NextResponse.json({
    success: true,
    processed: results.length,
    details: results,
  });
}
