# Attractions Network - Backend API

Express.js + TypeScript + MongoDB backend for the Attractions Network platform.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.x
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (access + refresh tokens)
- **Payments:** Stripe
- **Email:** Nodemailer
- **File Upload:** Cloudinary
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/attractions-network
JWT_SECRET=your-secure-secret-key
STRIPE_SECRET_KEY=sk_test_xxx
```

4. Seed the database:
```bash
npm run seed
```

5. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Attractions
- `GET /api/attractions` - List attractions (with filters)
- `GET /api/attractions/featured` - Featured attractions
- `GET /api/attractions/:slug` - Get by slug
- `GET /api/attractions/:id/reviews` - Get reviews
- `GET /api/attractions/:id/availability` - Get availability
- `POST /api/attractions` - Create (admin)
- `PATCH /api/attractions/:id` - Update (admin)
- `DELETE /api/attractions/:id` - Delete (admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/reference/:reference` - Get by reference
- `GET /api/bookings/my` - User's bookings
- `PATCH /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/:id/ticket` - Download ticket
- `GET /api/bookings/admin` - All bookings (admin)
- `GET /api/bookings/admin/stats` - Booking stats (admin)
- `PATCH /api/bookings/admin/:id` - Update status (admin)

### Categories
- `GET /api/categories` - List categories
- `GET /api/categories/:slug` - Get by slug
- `POST /api/categories` - Create (admin)
- `PATCH /api/categories/:id` - Update (admin)
- `DELETE /api/categories/:id` - Delete (admin)

### Destinations
- `GET /api/destinations` - List destinations
- `GET /api/destinations/featured` - Featured destinations
- `GET /api/destinations/:slug` - Get by slug
- `POST /api/destinations` - Create (admin)
- `PATCH /api/destinations/:id` - Update (admin)
- `DELETE /api/destinations/:id` - Delete (admin)

### Tenants (Multi-tenant)
- `GET /api/tenants/by-slug/:slug` - Get by slug (public)
- `GET /api/tenants` - List (admin)
- `GET /api/tenants/:id` - Get by ID (admin)
- `GET /api/tenants/:id/stats` - Get stats (admin)
- `POST /api/tenants` - Create (super-admin)
- `PATCH /api/tenants/:id` - Update (super-admin)
- `DELETE /api/tenants/:id` - Delete (super-admin)

### Users
- `GET /api/users/profile` - Get profile
- `GET /api/users/wishlist` - Get wishlist
- `POST /api/users/wishlist/:attractionId` - Add to wishlist
- `DELETE /api/users/wishlist/:attractionId` - Remove from wishlist
- `GET /api/users` - List users (admin)
- `POST /api/users/invite` - Invite user (admin)
- `PATCH /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Payments
- `POST /api/payments/create-intent` - Create Stripe PaymentIntent
- `POST /api/payments/webhook` - Stripe webhook
- `GET /api/payments/:bookingId/status` - Get payment status
- `POST /api/payments/:bookingId/refund` - Refund payment (admin)

## Test Accounts

After seeding:
- **Admin:** admin@attractions-network.com / Admin@123456
- **Customer:** customer@example.com / Customer@123

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run seed     # Seed database
```

## Project Structure

```
/backend
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   ├── scripts/        # CLI scripts (seed, etc.)
│   └── app.ts          # Express app entry
├── package.json
├── tsconfig.json
└── .env.example
```

## Multi-tenant Support

The API supports multi-tenancy via:
- `X-Tenant-ID` header
- `tenantId` query parameter
- Subdomain resolution

Tenants can have their own branding, settings, and attractions.

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on all endpoints
- CORS configuration
- Helmet security headers
- Input validation with Zod
- Role-based access control

## License

Proprietary - Attractions Network
