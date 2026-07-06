import { z } from "zod";
const journeyStatusEnum = z.enum(["PLANNED", "ONGOING", "COMPLETED"]);
export const createJourneySchema = z.object({
    body: z
        .object({
        title: z
            .string()
            .trim()
            .min(1, "Title is required")
            .max(100, "Title must be at most 100 characters"),
        destination: z
            .string()
            .trim()
            .min(1, "Destination is required")
            .max(100, "Destination must be at most 100 characters"),
        description: z
            .string()
            .trim()
            .max(1000, "Description must be at most 1000 characters")
            .optional(),
        coverImage: z.string().optional(),
        coverImagePublicId: z.string().optional(),
        budget: z
            .number({ message: "Budget must be a number" })
            .positive("Budget must be a positive number"),
        startDate: z
            .string()
            .datetime({ offset: true, message: "Start date must be a valid ISO date" })
            .or(z.string().date("Start date must be a valid date")),
        endDate: z
            .string()
            .datetime({ offset: true, message: "End date must be a valid ISO date" })
            .or(z.string().date("End date must be a valid date")),
        status: journeyStatusEnum.optional(),
    })
        .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
        message: "End date must be on or after start date",
        path: ["endDate"],
    }),
});
export const updateJourneySchema = z.object({
    params: z.object({
        id: z.string().min(1, "Journey ID is required"),
    }),
    body: z
        .object({
        title: z
            .string()
            .trim()
            .min(1, "Title is required")
            .max(100, "Title must be at most 100 characters")
            .optional(),
        destination: z
            .string()
            .trim()
            .min(1, "Destination is required")
            .max(100, "Destination must be at most 100 characters")
            .optional(),
        description: z
            .string()
            .trim()
            .max(1000, "Description must be at most 1000 characters")
            .nullish(),
        coverImage: z
            .string()
            .nullish(),
        coverImagePublicId: z
            .string()
            .nullish(),
        budget: z
            .number({ message: "Budget must be a number" })
            .positive("Budget must be a positive number")
            .optional(),
        startDate: z
            .string()
            .datetime({ offset: true, message: "Start date must be a valid ISO date" })
            .or(z.string().date("Start date must be a valid date"))
            .optional(),
        endDate: z
            .string()
            .datetime({ offset: true, message: "End date must be a valid ISO date" })
            .or(z.string().date("End date must be a valid date"))
            .optional(),
        status: journeyStatusEnum.optional(),
    })
        .refine((data) => {
        if (data.startDate && data.endDate) {
            return new Date(data.endDate) >= new Date(data.startDate);
        }
        return true;
    }, {
        message: "End date must be on or after start date",
        path: ["endDate"],
    }),
});
export const journeyIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Journey ID is required"),
    }),
});
