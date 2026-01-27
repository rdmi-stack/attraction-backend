"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const hash_1 = require("../utils/hash");
const bookingSchema = new mongoose_1.Schema({
    reference: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    tenantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true,
    },
    attractionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Attraction',
        required: true,
    },
    items: [{
            optionId: { type: String, required: true },
            optionName: { type: String, required: true },
            date: { type: String, required: true },
            time: { type: String },
            quantities: {
                adults: { type: Number, required: true, min: 0 },
                children: { type: Number, required: true, min: 0 },
                infants: { type: Number, required: true, min: 0 },
            },
            unitPrice: { type: Number, required: true },
            totalPrice: { type: Number, required: true },
        }],
    guestDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, lowercase: true },
        phone: { type: String, required: true },
        country: { type: String, required: true },
        specialRequests: { type: String },
    },
    subtotal: {
        type: Number,
        required: true,
    },
    fees: {
        type: Number,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        default: 'USD',
    },
    promoCode: {
        type: String,
    },
    paymentMethod: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded'],
        default: 'pending',
        index: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
        default: 'pending',
        index: true,
    },
    stripePaymentIntentId: {
        type: String,
    },
    ticketPdfUrl: {
        type: String,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            const obj = ret;
            delete obj.__v;
            return obj;
        },
    },
});
// Generate booking reference before saving
bookingSchema.pre('save', function (next) {
    if (!this.reference) {
        this.reference = (0, hash_1.generateBookingReference)();
    }
    next();
});
// Indexes for queries
bookingSchema.index({ 'guestDetails.email': 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
exports.Booking = mongoose_1.default.model('Booking', bookingSchema);
//# sourceMappingURL=Booking.js.map