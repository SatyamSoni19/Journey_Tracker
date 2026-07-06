import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
async function startServer() {
    await connectDatabase();
    const server = app.listen(env.PORT, () => {
        console.log(`🚀 Server running on http://localhost:${env.PORT}`);
        console.log(`📦 Environment: ${env.NODE_ENV}`);
    });
    const shutdown = async (signal) => {
        console.log(`\n${signal} received. Shutting down gracefully...`);
        server.close(async () => {
            await disconnectDatabase();
            process.exit(0);
        });
    };
    process.on("SIGINT", () => void shutdown("SIGINT"));
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
}
startServer().catch((error) => {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
});
