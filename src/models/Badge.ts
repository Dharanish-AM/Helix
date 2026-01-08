import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBadge extends Document {
  id: string; // Unique slug, e.g., "early-adopter"
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  type: "achievement" | "rank" | "special";
  criteria?: Record<string, any>; // JSON logic or description of criteria
}

const BadgeSchema = new Schema<IBadge>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    type: {
      type: String,
      enum: ["achievement", "rank", "special"],
      default: "achievement",
    },
    criteria: { type: Object },
  },
  { timestamps: true }
);

// Prevent overwrite during hot reload
const Badge: Model<IBadge> =
  mongoose.models.Badge || mongoose.model<IBadge>("Badge", BadgeSchema);

export default Badge;
