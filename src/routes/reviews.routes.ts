import { Router } from 'express';
import {
  getRecentReviews,
  getFeaturedReviews,
  getReviewsByAttractionId,
  createReview,
  getReviewById,
} from '../controllers/reviews.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /reviews/recent:
 *   get:
 *     summary: Get recent approved reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *           maximum: 50
 *         description: Number of reviews to return
 *     responses:
 *       200:
 *         description: List of recent reviews
 */
router.get('/recent', optionalAuth, getRecentReviews);

/**
 * @swagger
 * /reviews/featured:
 *   get:
 *     summary: Get featured reviews (highest rated and verified)
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *           maximum: 50
 *         description: Number of reviews to return
 *     responses:
 *       200:
 *         description: List of featured reviews
 */
router.get('/featured', optionalAuth, getFeaturedReviews);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attractionId
 *               - rating
 *               - title
 *               - content
 *               - author
 *               - country
 *             properties:
 *               attractionId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               country:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Review created successfully (pending moderation)
 *       400:
 *         description: Validation error
 */
router.post('/', optionalAuth, createReview);

/**
 * @swagger
 * /reviews/attraction/{attractionId}:
 *   get:
 *     summary: Get reviews for a specific attraction
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: attractionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *     responses:
 *       200:
 *         description: Paginated reviews for the attraction
 */
router.get('/attraction/:attractionId', optionalAuth, getReviewsByAttractionId);

/**
 * @swagger
 * /reviews/{reviewId}:
 *   get:
 *     summary: Get a specific review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review found
 *       404:
 *         description: Review not found
 */
router.get('/:reviewId', optionalAuth, getReviewById);

export default router;
