import { ImageResponse } from "next/og";
import { getUserByUsername } from "@/services/github.service";

export const alt = "Helix Developer Profile";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: "#09090b",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          User not found
        </div>
      ),
      {
        ...size,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #09090b, #18181b)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "white",
          position: "relative",
        }}
      >
        {/* Background Patterns */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%)",
            backgroundSize: "100px 100px",
          }}
        />

        <div
          style={{ display: "flex", alignItems: "center", gap: 32, zIndex: 10 }}
        >
          {/* Avatar */}
          <img
            src={user.image}
            alt={user.name}
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "8px solid rgba(255,255,255,0.1)",
              objectFit: "cover",
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1
              style={{
                fontSize: 64,
                fontWeight: "bold",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {user.name}
            </h1>
            <p style={{ fontSize: 32, color: "#a1a1aa", margin: 0 }}>
              @{user.username}
            </p>

            {/* Badges/Rank */}
            {user.scores?.globalRank && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(234, 179, 8, 0.2)",
                  border: "1px solid rgba(234, 179, 8, 0.5)",
                  color: "#fbbf24",
                  padding: "8px 16px",
                  borderRadius: 100,
                  fontSize: 24,
                  marginTop: 16,
                  width: "fit-content",
                }}
              >
                Build Rank #{user.scores.globalRank}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 64,
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 48, fontWeight: "bold" }}>
              {user.scores?.contributionScore || 0}
            </div>
            <div style={{ fontSize: 24, color: "#a1a1aa" }}>Contributions</div>
          </div>
          <div
            style={{
              width: 1,
              height: 80,
              background: "rgba(255,255,255,0.1)",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 48, fontWeight: "bold" }}>
              {user.stats?.totalStars || 0}
            </div>
            <div style={{ fontSize: 24, color: "#a1a1aa" }}>Stars</div>
          </div>
          <div
            style={{
              width: 1,
              height: 80,
              background: "rgba(255,255,255,0.1)",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 48, fontWeight: "bold" }}>
              {user.stats?.followers || 0}
            </div>
            <div style={{ fontSize: 24, color: "#a1a1aa" }}>Followers</div>
          </div>
        </div>

        {/* Helix Brand */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: 0.5,
          }}
        >
          <div
            style={{ fontSize: 24, fontWeight: "bold", letterSpacing: "0.1em" }}
          >
            HELIX
          </div>
          <div style={{ fontSize: 24 }}>|</div>
          <div style={{ fontSize: 20 }}>Developer Identity Platform</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
