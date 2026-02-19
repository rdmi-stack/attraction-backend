import { Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';
import { uploadImage } from '../services/upload.service';

export const uploadSingleImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file uploaded', 400);
      return;
    }

    const result = await uploadImage(req.file.path);

    sendSuccess(res, {
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
    }, 'Image uploaded successfully');
  } catch (error) {
    next(error);
  }
};

export const uploadMultipleImages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      sendError(res, 'No files uploaded', 400);
      return;
    }

    const results = await Promise.all(
      files.map((file) => uploadImage(file.path))
    );

    sendSuccess(res, results.map((r) => ({
      url: r.url,
      publicId: r.publicId,
      width: r.width,
      height: r.height,
    })), 'Images uploaded successfully');
  } catch (error) {
    next(error);
  }
};
