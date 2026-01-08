import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRepository extends Document {
  githubId: number;
  name: string;
  fullName: string;
  owner: {
    login: string;
    id: number;
    avatarUrl: string;
  };
  description?: string;
  url: string;
  language?: string;
  topics: string[];
  stats: {
    stars: number;
    forks: number;
    issues: number;
    subscribers: number;
  };
  metrics?: {
    healthScore: number;
    activityScore: number;
    busFactor?: number;
  };
  lastIngestedAt: Date;
  created_at: Date; // GitHub creation date
  updated_at: Date; // GitHub update date
  isFeatured: boolean;
}

const RepositorySchema: Schema = new Schema(
  {
    githubId: { type: Number, unique: true, required: true },
    name: { type: String, required: true },
    fullName: { type: String, required: true, unique: true },
    owner: {
      login: { type: String, required: true },
      id: { type: Number, required: true },
      avatarUrl: { type: String },
    },
    description: { type: String },
    url: { type: String, required: true },
    language: { type: String },
    topics: [{ type: String }],
    stats: {
      stars: { type: Number, default: 0 },
      forks: { type: Number, default: 0 },
      issues: { type: Number, default: 0 },
      subscribers: { type: Number, default: 0 },
    },
    metrics: {
      healthScore: { type: Number, default: 0 },
      activityScore: { type: Number, default: 0 },
      busFactor: { type: Number },
      growthVelocity: { type: Number, default: 0 }, // New: Rate of star acquisition
      communityScore: { type: Number, default: 0 }, // New: Engagement level
    },
    lastIngestedAt: { type: Date, default: null },
    created_at: { type: Date },
    updated_at: { type: Date },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Optimize for discovery queries
RepositorySchema.index({ "stats.stars": -1 });
RepositorySchema.index({ "metrics.activityScore": -1 });
RepositorySchema.index({ "metrics.healthScore": -1 });
RepositorySchema.index({ topics: 1 });
RepositorySchema.index({ language: 1 });

const Repository: Model<IRepository> =
  mongoose.models.Repository ||
  mongoose.model<IRepository>("Repository", RepositorySchema);

export default Repository;
