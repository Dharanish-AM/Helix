"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [language, setLanguage] = useState(
    searchParams.get("language") || "All"
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "health");

  const handleApply = () => {
    const params = new URLSearchParams();
    if (language && language !== "All") params.set("language", language);
    if (sort) params.set("sort", sort);

    router.push(`/discovery?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 items-end">
      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">Language</label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger>
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Languages</SelectItem>
            <SelectItem value="TypeScript">TypeScript</SelectItem>
            <SelectItem value="JavaScript">JavaScript</SelectItem>
            <SelectItem value="Python">Python</SelectItem>
            <SelectItem value="Go">Go</SelectItem>
            <SelectItem value="Rust">Rust</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-2">
        <label className="text-sm font-medium">Sort By</label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue placeholder="Sort Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="health">Health Score</SelectItem>
            <SelectItem value="activity">Activity Level</SelectItem>
            <SelectItem value="stars">Stars</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleApply} className="w-full md:w-auto">
        Apply Filters
      </Button>
    </div>
  );
}
