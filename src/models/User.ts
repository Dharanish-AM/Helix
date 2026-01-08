import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  githubId: string;
  username: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string;
  twitterUsername?: string;
  organizations?: Array<{
    name: string;
    avatarUrl: string;
    description?: string;
  }>;
  languages?: Array<{ name: string; count: number }>;
  badges?: Array<{ badgeId: string; awardedAt: Date }>;
  scores?: {
    contributionScore: number;
    activityScore: number;
    globalRank: number;
  };
  social?: {
    followers: string[];
    following: string[];
  };
  stats?: {
    totalStars: number;
    totalForks: number;
    totalRepos: number;
    followers: number;
    following: number;
    prMerged: number;
    reviews: number;
  };
  topRepos?: Array<{
    name: string;
    url: string;
    description?: string;
    stars: number;
    language?: string;
  }>;
  lastIngestedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    image: { type: String },
    githubId: { type: String, unique: true, required: true },
    username: { type: String, required: true },
    bio: { type: String },

    // Identity & Gamification
    badges: [
      {
        badgeId: { type: String, required: true }, // Slug referencing Badge.id
        awardedAt: { type: Date, default: Date.now },
      },
    ],
    scores: {
      contributionScore: { type: Number, default: 0 },
      activityScore: { type: Number, default: 0 },
      globalRank: { type: Number, default: 0 },
    },

    // Extended Profile
    company: String,
    location: String,
    blog: String,
    twitterUsername: String,
    organizations: [
      {
        name: String,
        avatarUrl: String,
        description: String,
      },
    ],
    languages: [
      {
        name: String,
        count: Number,
      },
    ],

    // Social Graph (MVP: Arrays)
    social: {
      followers: [{ type: String }], // Array of User IDs or Usernames
      following: [{ type: String }],
    },

    // Extended Stats
    stats: {
      totalStars: { type: Number, default: 0 },
      totalForks: { type: Number, default: 0 },
      totalRepos: { type: Number, default: 0 },
      followers: { type: Number, default: 0 }, // GitHub Followers
      following: { type: Number, default: 0 }, // GitHub Following
      prMerged: { type: Number, default: 0 }, // New
      reviews: { type: Number, default: 0 }, // New
    },

    topRepos: [
      {
        name: String,
        url: String,
        description: String,
        stars: Number,
        language: String,
      },
    ],

    lastIngestedAt: { type: Date },
  },
  { timestamps: true }
);

// Check if model is already defined to prevent overwriting during hot reload
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
