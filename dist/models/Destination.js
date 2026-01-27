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
exports.Destination = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const destinationSchema = new mongoose_1.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    country: {
        type: String,
        required: true,
        index: true,
    },
    continent: {
        type: String,
        required: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
    },
    shortDescription: {
        type: String,
        required: true,
    },
    images: [{
            type: String,
        }],
    heroImage: {
        type: String,
        required: true,
    },
    highlights: [{
            type: String,
        }],
    bestTimeToVisit: {
        type: String,
    },
    timezone: {
        type: String,
    },
    language: {
        type: String,
    },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    tags: [{
            type: String,
        }],
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    sortOrder: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (_, ret) => {
            const obj = ret;
            delete obj.__v;
            return obj;
        },
    },
});
// Virtual for counting attractions (will be populated in controller)
destinationSchema.virtual('attractionCount', {
    ref: 'Attraction',
    localField: 'name',
    foreignField: 'destination.city',
    count: true,
});
destinationSchema.index({ name: 'text', country: 'text' });
destinationSchema.index({ sortOrder: 1, isActive: 1 });
exports.Destination = mongoose_1.default.model('Destination', destinationSchema);
//# sourceMappingURL=Destination.js.map