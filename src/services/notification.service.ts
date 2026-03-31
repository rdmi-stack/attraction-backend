import { Notification } from '../models/Notification';
import { NotificationType } from '../types';

export const createNotification = async (params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
  tenantId?: string;
}) => {
  return Notification.create({
    userId: params.userId,
    tenantId: params.tenantId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
    data: params.data,
    status: 'unread',
  });
};

export const createAdminNotifications = async (params: {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  data?: Record<string, unknown>;
  tenantId?: string;
}) => {
  // Import User model lazily to avoid circular dependency
  const { User } = await import('../models/User');

  const adminRoles = ['super-admin', 'brand-admin', 'manager'];
  const query: Record<string, unknown> = { role: { $in: adminRoles }, status: 'active' };

  if (params.tenantId) {
    query.$or = [
      { role: 'super-admin' },
      { assignedTenants: params.tenantId },
    ];
  }

  const admins = await User.find(query).select('_id').lean();

  const notifications = admins.map(admin => ({
    userId: admin._id,
    tenantId: params.tenantId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
    data: params.data,
    status: 'unread' as const,
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  return notifications.length;
};
