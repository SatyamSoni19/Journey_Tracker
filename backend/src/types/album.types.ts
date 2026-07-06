import type { Media } from "../generated/prisma/client.js";

export type { Media as AlbumMedia };

export interface CreateAlbumMediaInput {
  type: "PHOTO" | "VIDEO";
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  caption?: string;
}
