import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cron from "node-cron";
import { config } from "./config";
import { connectDb } from "./db";
import { errorHandler, notFound } from "./middleware/error";
import authRoutes from "./routes/auth";
import issueRoutes from "./routes/issues";
import meRoutes from "./routes/me";
import { crawlIssues, isCrawling } from "./services/crawler";

export const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: config.FRONTEND_URL }));
app.use(express.json({ limit: "100kb" }));

// Vercel imports this Express app as a serverless function. Ensure the
// database connection is ready before a route uses Mongoose.
app.use(async (_req, _res, next) => {
  try {
    await connectDb();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/auth", rateLimit({ windowMs: 60_000, limit: 20 }), authRoutes);
app.use("/api", rateLimit({ windowMs: 60_000, limit: 120 }), issueRoutes, meRoutes);

app.use(notFound);
app.use(errorHandler);

function startScheduledCrawl() {
  cron.schedule(config.CRAWL_CRON, () => {
    if (isCrawling()) return;
    crawlIssues()
      .then((r) => console.log("Scheduled crawl finished", r))
      .catch((e) => console.error("Scheduled crawl failed", e));
  });
}

// Vercel functions must export a handler and must not call app.listen().
// node-cron also is not reliable in serverless instances, so keep it local.
if (!process.env.VERCEL) {
  connectDb()
    .then(() => {
      app.listen(config.PORT, () => console.log(`API listening on port ${config.PORT}`));
      startScheduledCrawl();
    })
    .catch((e) => {
      console.error("Fatal startup error", e);
      process.exit(1);
    });
}

export default app;
