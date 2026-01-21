/**
 * Instrumentation File
 * This file is executed once when the Next.js server starts (both dev and production)
 * Perfect for initializing models, connections, and other one-time setup tasks
 */

export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Import models to register them with mongoose
    await import("./lib/init-models");
    console.log("🚀 Server instrumentation completed - Models initialized");
  }
}
