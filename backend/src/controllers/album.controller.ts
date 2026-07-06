import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  addAlbumMedia as createService,
  getAlbumMedia as getListService,
  deleteAlbumMedia as deleteService,
} from "../services/album.service.js";
import type { CreateAlbumMediaInput } from "../types/album.types.js";

export const addAlbumMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const journeyId = req.params.journeyId as string;
  const input = req.body as CreateAlbumMediaInput;

  const media = await createService(journeyId, req.user.id, input);

  res.status(201).json(new ApiResponse(201, "Media added to album", { media }));
});

export const getAlbumMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const journeyId = req.params.journeyId as string;
  const mediaList = await getListService(journeyId, req.user.id);

  res.status(200).json(new ApiResponse(200, "Album media fetched", { media: mediaList }));
});

export const deleteAlbumMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const journeyId = req.params.journeyId as string;
  const mediaId = req.params.mediaId as string;

  await deleteService(mediaId, journeyId, req.user.id);

  res.status(200).json(new ApiResponse(200, "Media deleted from album"));
});
