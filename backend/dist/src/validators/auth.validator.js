import { z } from "zod";
export const registerSchema = z.object({
    body: z.object({
        name: z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name must be at most 50 characters"),
        email: z.string().trim().toLowerCase().email("Invalid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(72, "Password must be at most 72 characters")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
    }),
});
export const loginSchema = z.object({
    body: z.object({
        email: z.string().trim().toLowerCase().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});
