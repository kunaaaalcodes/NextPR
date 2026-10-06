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

async function main() {
  await connectDb();

  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: config.FRONTEND_URL }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/auth", rateLimit({ windowMs: 60_000, limit: 20 }), authRoutes);
  app.use("/api", rateLimit({ windowMs: 60_000, limit: 120 }), issueRoutes, meRoutes);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(config.PORT, () => console.log(`API running on http://localhost:${config.PORT}`));

  cron.schedule(config.CRAWL_CRON, () => {
    if (isCrawling()) return;
    crawlIssues()
      .then((r) => console.log("Scheduled crawl finished", r))
      .catch((e) => console.error("Scheduled crawl failed", e));
  });
}

main().catch((e) => {
  console.error("Fatal startup error", e);
  process.exit(1);
});
