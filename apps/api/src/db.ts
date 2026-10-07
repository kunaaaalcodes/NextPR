import mongoose from "mongoose";
import { config } from "./config";

mongoose.set("strictQuery", true);

const connectionPromise = mongoose
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
  });

export async function connectDb() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (mongoose.connection.readyState === 2) {
    await new Promise((r) => setTimeout(r, 100));
    return connectDb();
  }
  return connectionPromise;
}
