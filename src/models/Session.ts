import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

// Stores a SHA-256 hash of the session token; the raw token only lives in the HTTP-only cookie.
const SessionSchema = new Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: ["admin", "customer"], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export type SessionDoc = InferSchemaType<typeof SessionSchema>;
export const Session = (models.Session as Model<SessionDoc>) || model("Session", SessionSchema);
