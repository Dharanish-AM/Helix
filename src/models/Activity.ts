import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  type: "badge" | "rank" | "contribution" | "follow";
  content: string; // "earned the Star Magnet badge"
  meta: string; // Icon or metadata (e.g., "⭐")
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["badge", "rank", "contribution", "follow"],
      required: true,
    },
    content: { type: String, required: true },
    meta: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Activity: Model<IActivity> =
  mongoose.models.Activity ||
  mongoose.model<IActivity>("Activity", ActivitySchema);

export default Activity;
