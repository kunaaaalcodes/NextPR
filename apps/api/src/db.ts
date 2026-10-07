import mongoose from "mongoose";
import { config } from "./config";

let connectionPromise: Promise<typeof mongoose> | undefined;

export function connectDb() {
  mongoose.set("strictQuery", true);
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(config.MONGODB_URI).then((connection) => {
      console.log("MongoDB connected");
      return connection;
    });
  }

  return connectionPromise;
}
