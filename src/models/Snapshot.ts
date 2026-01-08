import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISnapshot extends Document {
  entityType: "USER" | "REPO";
  entityId: mongoose.Types.ObjectId; // Reference to User or Repository _id
  date: Date;
  data: Record<string, any>; // Flexible JSON for arbitrary metrics
}

const SnapshotSchema: Schema = new Schema(
  {
    entityType: { type: String, enum: ["USER", "REPO"], required: true },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "entityType",
    },
    date: { type: Date, required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

// Ensure unique snapshot per entity per day/week
SnapshotSchema.index({ entityType: 1, entityId: 1, date: 1 }, { unique: true });

const Snapshot: Model<ISnapshot> =
  mongoose.models.Snapshot ||
  mongoose.model<ISnapshot>("Snapshot", SnapshotSchema);

export default Snapshot;
