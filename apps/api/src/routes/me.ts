import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { decrypt } from "../lib/crypto";
import { HttpError, asyncHandler } from "../lib/http";
import { Issue } from "../models/Issue";
import { Repo } from "../models/Repo";
import { User } from "../models/User";
import { requireAuth } from "../middleware/auth";
import { DEFAULT_LANGUAGES } from "../services/crawler";
import { getAuthedUser } from "../services/github";
import { analyzeProfile, applyAnalysis } from "../services/profile";
import { mergeChance } from "../services/scoring";

const router = Router();
router.use(requireAuth);

const canonicalLanguage = (l: string) =>
  DEFAULT_LANGUAGES.find((d) => d.toLowerCase() === l.toLowerCase()) ?? l;
const publicUser = (u: any) => ({
  id: u._id,
  login: u.login,
  name: u.name,
  avatarUrl: u.avatarUrl,
  profile: u.profile,
  savedCount: u.savedIssues?.length ?? 0,
});

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).lean();
    if (!user) throw new HttpError(401, "User not found");
    res.json(publicUser(user));
  })
);

router.post(
  "/me/refresh-profile",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select("+encryptedToken");
    if (!user) throw new HttpError(401, "User not found");
    const token = decrypt(user.encryptedToken);
    const ghUser = await getAuthedUser(token);
    applyAnalysis(user, await analyzeProfile(ghUser, token));
    await user.save();
    res.json(publicUser(user.toObject()));
  })
);

router.patch(
  "/me/preferences",
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        experience: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        extraLanguages: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
      })
      .parse(req.body);

    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(401, "User not found");
    if (body.experience) {
      user.set("profile.experience", body.experience);
      user.set("profile.experienceLocked", true);
    }
    if (body.extraLanguages)
      user.set("profile.extraLanguages", body.extraLanguages.map(canonicalLanguage));
    await user.save();
    res.json(publicUser(user.toObject()));
  })
);

router.delete(
  "/me",
  asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.userId);
    res.status(204).end();
  })
);

// ---- Saved issues ----
const idParam = z.object({ issueId: z.string().refine(mongoose.isValidObjectId, "Invalid id") });

router.get(
  "/saved",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).lean();
    if (!user) throw new HttpError(401, "User not found");
    const issues = await Issue.find({ _id: { $in: user.savedIssues } }).lean();
    const repos = await Repo.find({ fullName: { $in: issues.map((i) => i.repoFullName) } }).lean();
    const byName = new Map(repos.map((r) => [r.fullName, r]));
    res.json({
      data: issues.map((i) => {
        const repo = byName.get(i.repoFullName);
        return {
          id: i._id,
          title: i.title,
          url: i.url,
          labels: i.labels,
          difficulty: i.difficulty,
          status: i.status,
          repo: {
            fullName: i.repoFullName,
            stars: repo?.stars,
            language: repo?.language,
            responsiveness: repo?.responsiveness?.score,
          },
          mergeChance: mergeChance(repo?.responsiveness?.score),
          updatedAt: i.ghUpdatedAt,
        };
      }),
    });
  })
);

router.put(
  "/saved/:issueId",
  asyncHandler(async (req, res) => {
    const { issueId } = idParam.parse(req.params);
    if (!(await Issue.exists({ _id: issueId }))) throw new HttpError(404, "Issue not found");
    await User.updateOne({ _id: req.userId }, { $addToSet: { savedIssues: issueId } });
    res.status(204).end();
  })
);

router.delete(
  "/saved/:issueId",
  asyncHandler(async (req, res) => {
    const { issueId } = idParam.parse(req.params);
    await User.updateOne({ _id: req.userId }, { $pull: { savedIssues: issueId } });
    res.status(204).end();
  })
);

export default router;
