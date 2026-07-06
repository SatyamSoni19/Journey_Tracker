import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
export const prisma = global.prismaGlobal ??
    new PrismaClient({
        adapter,
        log: env.isDevelopment ? ["query", "error", "warn"] : ["error"],
    });
if (env.isDevelopment) {
    global.prismaGlobal = prisma;
}
export async function connectDatabase() {
    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully");
    }
    catch (error) {
        console.error("❌ Failed to connect to database:", error);
        process.exit(1);
    }
}
export async function disconnectDatabase() {
    await prisma.$disconnect();
    console.log("🔌 Database disconnected");
}
