import { NextResponse } from "next/server";
import { ingestRepository } from "@/lib/ingestion";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Basic security: Must be logged in
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { owner, name } = await req.json();

    if (!owner || !name) {
      return NextResponse.json(
        { error: "Owner and Name are required" },
        { status: 400 }
      );
    }

    await ingestRepository(owner, name);

    return NextResponse.json({
      success: true,
      message: `Ingested ${owner}/${name}`,
    });
  } catch (error: any) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to ingest repository" },
      { status: 500 }
    );
  }
}
