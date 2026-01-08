import { NextResponse } from "next/server";
import Repository from "@/models/Repository";
import dbConnect from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ owner: string; name: string }> }
) {
  const { owner, name } = await params;

  await dbConnect();

  // Find by full name (case insensitive ideally, but strict for now)
  const fullName = `${owner}/${name}`;
  const repo = await Repository.findOne({ fullName });

  if (!repo) {
    return NextResponse.json(
      { error: "Repository not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(repo);
}
