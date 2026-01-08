"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";

interface FollowButtonProps {
  targetId: string;
  initialIsFollowing?: boolean;
}

export function FollowButton({
  targetId,
  initialIsFollowing = false,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    setLoading(true);
    const action = isFollowing ? "unfollow" : "follow";

    try {
      const res = await fetch("/api/user/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, action }),
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error("Failed to toggle follow", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "secondary" : "default"}
      size="sm"
      onClick={toggleFollow}
      disabled={loading}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-4 h-4 mr-2" /> Following
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" /> Follow
        </>
      )}
    </Button>
  );
}
