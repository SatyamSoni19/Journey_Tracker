import { z } from "zod";

export const createAlbumMediaSchema = z.object({
  body: z.object({
    type: z.enum(["PHOTO", "VIDEO"]),
    publicId: z.string().min(1, "Public ID is required"),
    secureUrl: z.string().url("Must be a valid URL"),
    resourceType: z.string().min(1),
    format: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    duration: z.number().positive().optional(),
    bytes: z.number().int().nonnegative(),
    caption: z.string().optional(),
  }),
});

export const albumMediaIdParamSchema = z.object({
  params: z.object({
    journeyId: z.string().min(1),
    mediaId: z.string().min(1),
  }),
});
