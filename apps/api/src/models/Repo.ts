import { Schema, model } from "mongoose";

const repoSchema = new Schema({
  fullName: { type: String, required: true, unique: true },
  stars: { type: Number, default: 0 },
  language: String,
  topics: [String],
  archived: { type: Boolean, default: false },
  pushedAt: Date,
  responsiveness: {
    score: { type: Number, default: 30 }, // 0-100
    mergeRate: { type: Number, default: 0 }, // 0-1
    medianMergeHours: { type: Number, default: null },
    sampleSize: { type: Number, default: 0 },
  },
  fetchedAt: { type: Date, default: Date.now },
});

export const Repo = model("Repo", repoSchema);
