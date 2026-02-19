import request from 'supertest';
import app from '../app';
import { Attraction } from '../models/Attraction';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { verifyToken } from '../utils/jwt';

jest.mock('../utils/jwt', () => ({
  ...jest.requireActual('../utils/jwt'),
  verifyToken: jest.fn(),
}));

jest.mock('../models/Attraction', () => ({
  Attraction: {
    findById: jest.fn(),
  },
}));

jest.mock('../models/Booking', () => ({
  Booking: {
    create: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

jest.mock('../models/User', () => ({
  User: {
    findById: jest.fn(),
  },
}));

describe('API security and pricing guards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const adminUser = {
    _id: { toString: () => 'admin-1' },
    role: 'brand-admin',
    status: 'active',
    assignedTenants: ['tenant-1'],
  };

  it('requires authentication for protected booking/payment endpoints', async () => {
    const [cancelRes, ticketRes, createIntentRes, paymentStatusRes] = await Promise.all([
      request(app).patch('/api/bookings/booking-id/cancel'),
      request(app).get('/api/bookings/booking-id/ticket'),
      request(app).post('/api/payments/create-intent').send({ bookingId: 'booking-id' }),
      request(app).get('/api/payments/booking-id/status'),
    ]);

    expect(cancelRes.status).toBe(401);
    expect(ticketRes.status).toBe(401);
    expect(createIntentRes.status).toBe(401);
    expect(paymentStatusRes.status).toBe(401);
  });

  it('recalculates booking line-item prices on the server', async () => {
    (Attraction.findById as jest.Mock).mockResolvedValue({
      _id: 'attr-1',
      currency: 'USD',
      tenantIds: ['tenant-1'],
      pricingOptions: [
        { id: 'adult-option', name: 'Adult Ticket', price: 50 },
      ],
    });

    (Booking.create as jest.Mock).mockImplementation(async (payload) => payload);

    const response = await request(app)
      .post('/api/bookings')
      .send({
        attractionId: 'attr-1',
        items: [
          {
            optionId: 'adult-option',
            optionName: 'Tampered Name',
            date: '2026-03-10',
            quantities: { adults: 2, children: 1, infants: 0 },
            unitPrice: 0.01,
            totalPrice: 0.01,
          },
        ],
        guestDetails: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+123456789',
          country: 'US',
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items[0].optionName).toBe('Adult Ticket');
    expect(response.body.data.items[0].unitPrice).toBe(50);
    expect(response.body.data.items[0].totalPrice).toBe(150);
    expect(response.body.data.subtotal).toBe(150);
    expect(response.body.data.fees).toBe(7.5);
    expect(response.body.data.total).toBe(157.5);
  });

  it('rejects unknown pricing options', async () => {
    (Attraction.findById as jest.Mock).mockResolvedValue({
      _id: 'attr-1',
      currency: 'USD',
      tenantIds: ['tenant-1'],
      pricingOptions: [{ id: 'known-option', name: 'Known', price: 40 }],
    });

    const response = await request(app)
      .post('/api/bookings')
      .send({
        attractionId: 'attr-1',
        items: [
          {
            optionId: 'unknown-option',
            optionName: 'Unknown',
            date: '2026-03-10',
            quantities: { adults: 1, children: 0, infants: 0 },
            unitPrice: 1,
            totalPrice: 1,
          },
        ],
        guestDetails: {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+123456789',
          country: 'US',
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid pricing option selected');
  });

  it('blocks tenant admins from cancelling bookings outside assigned tenants', async () => {
    (verifyToken as jest.Mock).mockReturnValue({ userId: 'admin-1' });
    (User.findById as jest.Mock).mockResolvedValue(adminUser);
    (Booking.findById as jest.Mock).mockResolvedValue({
      _id: 'booking-1',
      userId: { toString: () => 'customer-1' },
      tenantId: { toString: () => 'tenant-2' },
      status: 'pending',
      paymentStatus: 'pending',
    });

    const response = await request(app)
      .patch('/api/bookings/booking-1/cancel')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Not authorized to cancel this booking');
  });

  it('blocks tenant admins from reading payment status outside assigned tenants', async () => {
    (verifyToken as jest.Mock).mockReturnValue({ userId: 'admin-1' });
    (User.findById as jest.Mock).mockResolvedValue(adminUser);

    const selectMock = jest.fn().mockResolvedValue({
      _id: 'booking-1',
      reference: 'AN-TEST123',
      paymentStatus: 'pending',
      status: 'pending',
      total: 100,
      currency: 'USD',
      userId: { toString: () => 'customer-1' },
      tenantId: { toString: () => 'tenant-2' },
    });

    (Booking.findById as jest.Mock).mockReturnValue({ select: selectMock });

    const response = await request(app)
      .get('/api/payments/booking-1/status')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Not authorized to view this payment');
  });

  it('scopes admin booking stats to assigned tenants when tenant context is absent', async () => {
    (verifyToken as jest.Mock).mockReturnValue({ userId: 'admin-1' });
    (User.findById as jest.Mock).mockResolvedValue({
      ...adminUser,
      role: 'manager',
      assignedTenants: ['tenant-1', 'tenant-2'],
    });

    (Booking.countDocuments as jest.Mock)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(2);
    (Booking.aggregate as jest.Mock).mockResolvedValue([{ total: 1500 }]);

    const response = await request(app)
      .get('/api/bookings/admin/stats')
      .set('Authorization', 'Bearer valid-token');

    expect(response.status).toBe(200);
    const firstStatsQuery = (Booking.countDocuments as jest.Mock).mock.calls[0][0];
    expect(firstStatsQuery).toHaveProperty('tenantId');
    expect(firstStatsQuery.tenantId).toHaveProperty('$in');
    expect(firstStatsQuery.tenantId.$in).toEqual(['tenant-1', 'tenant-2']);
  });
});
