import mongoose from "mongoose";
import { config } from "./config";

mongoose.set("strictQuery", true);

const connectionPromise = mongoose
  .connect(config.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
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
  return connectionPromise;
}
