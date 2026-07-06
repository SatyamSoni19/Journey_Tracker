import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("5000"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
    JWT_ACCESS_EXPIRY: z.string().default("15m"),
    JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
    JWT_REFRESH_EXPIRY: z.string().default("30d"),
    CLIENT_URL: z.string().default("http://localhost:5173"),
    CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
    CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsedEnv.error.flatten().fieldErrors);
    process.exit(1);
}
export const env = {
    NODE_ENV: parsedEnv.data.NODE_ENV,
    PORT: parseInt(parsedEnv.data.PORT, 10),
    DATABASE_URL: parsedEnv.data.DATABASE_URL,
    JWT_ACCESS_SECRET: parsedEnv.data.JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRY: parsedEnv.data.JWT_ACCESS_EXPIRY,
    JWT_REFRESH_SECRET: parsedEnv.data.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRY: parsedEnv.data.JWT_REFRESH_EXPIRY,
    CLIENT_URL: parsedEnv.data.CLIENT_URL,
    CLOUDINARY_CLOUD_NAME: parsedEnv.data.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: parsedEnv.data.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: parsedEnv.data.CLOUDINARY_API_SECRET,
    isProduction: parsedEnv.data.NODE_ENV === "production",
    isDevelopment: parsedEnv.data.NODE_ENV === "development",
};
