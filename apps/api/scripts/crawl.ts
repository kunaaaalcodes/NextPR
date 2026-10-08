import "dotenv/config";
import mongoose from "mongoose";
import { config } from "../src/config";
import { crawlIssues } from "../src/services/crawler";
import { connectDb } from "../src/db";

async function main() {
  console.log("Starting scheduled crawl...");
  console.log("Environment:", config.NODE_ENV);

  try {
    await connectDb();
    console.log("Connected to MongoDB");

    const result = await crawlIssues();
    console.log("Crawl finished:", result);

    if (result.rateLimited) {
      console.warn("Crawl was rate limited by GitHub API");
      process.exit(1);
    }

    console.log("Crawl completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Crawl failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();