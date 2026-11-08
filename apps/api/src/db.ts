import mongoose from "mongoose";
import { config } from "./config";

mongoose.set("strictQuery", true);

let connectionPromise: ReturnType<typeof mongoose.connect> | null = null;

export async function connectDb() {
  if (mongoose.connection.readyState === 1) return mongoose;

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(config.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
        bufferCommands: true,
      })
      .then((conn) => {
        console.log("MongoDB connected");
        return conn;
      })
      .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        throw err;
      })
      .finally(() => {
        connectionPromise = null;
      });
  }

  return connectionPromise!;
}
