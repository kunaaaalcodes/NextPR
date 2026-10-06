import crypto from "crypto";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config";
import { encrypt } from "../lib/crypto";
import { HttpError, asyncHandler } from "../lib/http";
import { User } from "../models/User";
import { exchangeCodeForToken, getAuthedUser } from "../services/github";
import { analyzeProfile, applyAnalysis } from "../services/profile";

const router = Router();

// Step 1: send the browser here (e.g. <a href="http://localhost:4000/auth/github">)
router.get("/github", (_req, res) => {
  const state = jwt.sign({ n: crypto.randomUUID() }, config.JWT_SECRET, { expiresIn: "10m" });
  const params = new URLSearchParams({
    client_id: config.GITHUB_CLIENT_ID,
    redirect_uri: config.GITHUB_CALLBACK_URL,
    scope: "read:user",
    state,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// Step 2: GitHub redirects back here, we redirect to the frontend with a JWT
router.get(
  "/github/callback",
  asyncHandler(async (req, res) => {
    const { code, state } = z.object({ code: z.string(), state: z.string() }).parse(req.query);
    try {
      jwt.verify(state, config.JWT_SECRET);
    } catch {
      throw new HttpError(400, "Invalid or expired OAuth state");
    }

    const ghToken = await exchangeCodeForToken(code);
    const ghUser = await getAuthedUser(ghToken);
    const analysis = await analyzeProfile(ghUser, ghToken);

    let user = await User.findOne({ githubId: ghUser.id });
    if (!user) user = new User({ githubId: ghUser.id });
    user.login = ghUser.login;
    user.name = ghUser.name ?? undefined;
    user.avatarUrl = ghUser.avatar_url;
    user.encryptedToken = encrypt(ghToken);
    applyAnalysis(user, analysis);
    await user.save();

    const token = jwt.sign({ sub: user.id }, config.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${config.FRONTEND_URL}/auth/callback?token=${token}`);
  })
);

export default router;
