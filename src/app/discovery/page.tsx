import { FilterBar } from "@/components/discovery/FilterBar";
import { RepositoryCard } from "@/components/discovery/RepositoryCard";
import { headers } from "next/headers";

// Helper to fetch data on server
async function getRepositories(searchParams: any) {
  // In a real production app, call DB specific logic directly to avoid self-request overhead
  // But we'll reuse the logic for simplicity or call the API URL if absolute URL is constructed
  // Here we'll just replicate the DB call pattern to stay efficient in Server Component

  // Dynamic import to avoid build-time static errors if dependent on specific env
  const { default: Repository } = await import("@/models/Repository");
  const { default: dbConnect } = await import("@/lib/db");

  await dbConnect();

  const { language, sort, minStars } = searchParams;
  const query: any = {};
  if (language && language !== "All") query.language = language;
  if (minStars) query["stats.stars"] = { $gte: parseInt(minStars) };

  let sortOptions: any = {};
  switch (sort) {
    case "stars":
      sortOptions = { "stats.stars": -1 };
      break;
    case "activity":
      sortOptions = { "metrics.activityScore": -1 };
      break;
    case "newest":
      sortOptions = { created_at: -1 };
      break;
    case "health":
    default:
      sortOptions = { "metrics.healthScore": -1 };
      break;
  }

  const repos = await Repository.find(query).sort(sortOptions).limit(50).lean();
  return JSON.parse(JSON.stringify(repos)); // Serialization for client component props
}

export const dynamic = "force-dynamic";

export default async function DiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const params = await searchParams; // Await params in next 15
  const repos = await getRepositories(params);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Discovery Engine</h2>
        <p className="text-muted-foreground">
          Find high-quality open-source projects.
        </p>
      </div>

      <FilterBar />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {repos.length > 0 ? (
          repos.map((repo: any) => (
            <RepositoryCard key={repo._id} repo={repo} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No repositories found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
