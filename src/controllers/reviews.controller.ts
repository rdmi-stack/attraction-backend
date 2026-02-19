import { Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const getRecentReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 6 } = req.query;
    const reviewLimit = Math.min(Number(limit) || 6, 50);

    const reviews = await Review.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(reviewLimit)
      .populate('attractionId', 'title slug')
      .lean();

    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 6 } = req.query;
    const reviewLimit = Math.min(Number(limit) || 6, 50);

    // Get highest rated and verified reviews
    const reviews = await Review.find({
      status: 'approved',
      verified: true,
    })
      .sort({ rating: -1, helpful: -1, createdAt: -1 })
      .limit(reviewLimit)
      .populate('attractionId', 'title slug')
      .lean();

    sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
};

export const getReviewsByAttractionId = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attractionId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(Math.max(1, Number(limit) || 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find({
        attractionId,
        status: 'approved',
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments({
        attractionId,
        status: 'approved',
      }),
    ]);

    sendSuccess(res, {
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      attractionId,
      rating,
      title,
      content,
      author,
      country,
      images,
    } = req.body;

    // Validation
    if (!attractionId || !rating || !title || !content || !author || !country) {
      sendError(
        res,
        'Missing required fields: attractionId, rating, title, content, author, country',
        400
      );
      return;
    }

    if (rating < 1 || rating > 5) {
      sendError(res, 'Rating must be between 1 and 5', 400);
      return;
    }

    const review = await Review.create({
      attractionId,
      rating,
      title,
      content,
      author,
      country,
      images: images || [],
      userId: req.user?._id,
      status: 'pending', // Reviews need moderation
      verified: !!req.user?._id, // Verified if user is authenticated
    });

    sendSuccess(res, await review.populate('attractionId', 'title slug'), 'Review created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId).populate(
      'attractionId',
      'title slug'
    );

    if (!review) {
      sendError(res, 'Review not found', 404);
      return;
    }

    sendSuccess(res, review);
  } catch (error) {
    next(error);
  }
};
