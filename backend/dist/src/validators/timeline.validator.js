import { z } from "zod";
export const createTimelineEntrySchema = z.object({
    body: z.object({
        date: z.string().datetime({ offset: true, message: "Date must be a valid ISO date" })
            .or(z.string().date("Date must be a valid date")),
        time: z.string().min(1, "Time is required"),
        location: z.string().min(1, "Location is required"),
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        sortOrder: z.number().int().optional(),
        albumMediaIds: z.array(z.string()).optional(),
    }),
});
export const updateTimelineEntrySchema = z.object({
    params: z.object({
        journeyId: z.string().min(1),
        entryId: z.string().min(1),
    }),
    body: z.object({
        date: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
        time: z.string().min(1).optional(),
        location: z.string().min(1).optional(),
        title: z.string().min(1).optional(),
        description: z.string().nullish(),
        sortOrder: z.number().int().optional(),
        albumMediaIds: z.array(z.string()).optional(),
    }),
});
export const timelineEntryIdParamSchema = z.object({
    params: z.object({
        journeyId: z.string().min(1),
        entryId: z.string().min(1),
    }),
});
