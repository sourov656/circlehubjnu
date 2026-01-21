import { mongodb } from "@/config/env";
import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var mongoose: any; // This must be a `var` and not a `let / const`
}

// Import all models to ensure they are registered
import "@/lib/init-models";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!mongodb) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(mongodb, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
