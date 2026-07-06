import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import { ApiError } from "../utils/ApiError.js";

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  duration?: number;
}

export interface UploadOptions {
  transformation?: Record<string, unknown>;
  resourceType?: "image" | "video" | "raw" | "auto";
}

/**
 * Upload a buffer to Cloudinary.
 * Generic and reusable — pass any folder (journey-covers, albums, timeline, etc.)
 */
export async function uploadImage(
  buffer: Buffer,
  folder: string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: options.resourceType ?? "auto",
        ...(options.transformation && {
          transformation: options.transformation,
        }),
      },
      (error, result) => {
        if (error) {
          reject(
            ApiError.internal(`Cloudinary upload failed: ${error.message}`)
          );
          return;
        }

        if (!result) {
          reject(ApiError.internal("Cloudinary returned no result"));
          return;
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          duration: result.duration,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Delete an asset from Cloudinary by its public_id.
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to delete Cloudinary asset ${publicId}:`, message);
    // Don't throw — deletion failure shouldn't block the main operation
  }
}
