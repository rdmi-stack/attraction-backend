import { Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { AuthRequest } from '../types';

export const getMyNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { page = 1, limit = 20, status, type } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const query: Record<string, unknown> = { userId: req.user._id };
    if (status) query.status = status;
    if (type) query.type = type;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
    ]);

    sendPaginated(res, notifications, pageNum, limitNum, total);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const count = await Notification.countDocuments({
      userId: req.user._id,
      status: 'unread',
    });

    sendSuccess(res, { count });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      sendError(res, 'Notification not found', 404);
      return;
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      sendError(res, 'Not authorized', 403);
      return;
    }

    notification.status = 'read';
    await notification.save();

    sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    await Notification.updateMany(
      { userId: req.user._id, status: 'unread' },
      { $set: { status: 'read' } }
    );

    sendSuccess(res, {}, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      sendError(res, 'Notification not found', 404);
      return;
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      sendError(res, 'Not authorized', 403);
      return;
    }

    await Notification.findByIdAndDelete(id);
    sendSuccess(res, {}, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};

export const clearAll = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Not authenticated', 401);
      return;
    }

    await Notification.deleteMany({ userId: req.user._id });
    sendSuccess(res, {}, 'All notifications cleared');
  } catch (error) {
    next(error);
  }
};
