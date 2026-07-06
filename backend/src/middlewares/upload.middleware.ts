import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";
import { ApiError } from "../utils/ApiError.js";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const storage = multer.memoryStorage();

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type: ${file.mimetype}. Allowed types: jpg, jpeg, png, webp, mp4, mov`
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

/**
 * Middleware for uploading a single image file.
 * Usage: `uploadSingle("image")` — expects form field named "image".
 */
export function uploadSingle(fieldName: string) {
  return upload.single(fieldName);
}

/**
 * Middleware for uploading multiple image files.
 * Usage: `uploadMultiple("images", 10)` — up to 10 files under "images" field.
 */
export function uploadMultiple(fieldName: string, maxCount: number) {
  return upload.array(fieldName, maxCount);
}

export { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE };
