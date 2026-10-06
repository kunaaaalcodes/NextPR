import { HydratedDocument, InferSchemaType, Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    githubId: { type: Number, required: true, unique: true },
    login: { type: String, required: true },
    name: String,
    avatarUrl: String,
    encryptedToken: { type: String, required: true, select: false },
    profile: {
      languages: [{ _id: false, name: String, weight: Number }],
      topics: [String],
      experience: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
      experienceLocked: { type: Boolean, default: false },
      extraLanguages: [String],
      analyzedAt: Date,
    },
    savedIssues: [{ type: Schema.Types.ObjectId, ref: "Issue" }],
  },
  { timestamps: true }
);

export type UserAttrs = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<UserAttrs>;
export const User = model("User", userSchema);
