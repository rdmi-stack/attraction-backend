import { Response, NextFunction } from 'express';
import { Category } from '../models/Category';
import { Attraction } from '../models/Attraction';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { includeCount = 'true' } = req.query;

    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    if (includeCount === 'true') {
      // Get attraction counts for each category
      const counts = await Attraction.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]);

      const countMap = new Map(counts.map((c) => [c._id, c.count]));

      const categoriesWithCount = categories.map((cat) => ({
        ...cat,
        count: countMap.get(cat.slug) || 0,
      }));

      sendSuccess(res, categoriesWithCount);
    } else {
      sendSuccess(res, categories);
    }
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, isActive: true }).lean();

    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }

    // Get attraction count
    const count = await Attraction.countDocuments({
      category: slug,
      status: 'active',
    });

    sendSuccess(res, { ...category, count });
  } catch (error) {
    next(error);
  }
};

// Admin endpoints
export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.create(req.body);
    sendSuccess(res, category, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }

    sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if category has attractions
    const category = await Category.findById(id);
    if (!category) {
      sendError(res, 'Category not found', 404);
      return;
    }

    const attractionCount = await Attraction.countDocuments({
      category: category.slug,
    });

    if (attractionCount > 0) {
      sendError(res, 'Cannot delete category with attractions', 400);
      return;
    }

    await Category.findByIdAndDelete(id);

    sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
