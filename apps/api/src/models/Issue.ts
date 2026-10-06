import { Schema, model } from "mongoose";

const issueSchema = new Schema({
  githubId: { type: Number, required: true, unique: true },
  repoFullName: { type: String, required: true, index: true },
  number: { type: Number, required: true },
  title: { type: String, required: true },
  bodySnippet: String,
  url: { type: String, required: true },
  labels: [String],
  language: { type: String, index: true },
  comments: { type: Number, default: 0 },
  assigned: { type: Boolean, default: false },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  status: { type: String, enum: ["open", "stale"], default: "open", index: true },
  ghCreatedAt: Date,
  ghUpdatedAt: { type: Date, index: true },
  repoStars: { type: Number, default: 0 },
  // refreshed on every crawl sighting; documents unseen for 30 days are removed automatically
  crawledAt: { type: Date, default: Date.now, index: { expireAfterSeconds: 60 * 60 * 24 * 30 } },
});

issueSchema.index({ status: 1, language: 1, ghUpdatedAt: -1 });
issueSchema.index({ repoStars: 1 });

export const Issue = model("Issue", issueSchema);
