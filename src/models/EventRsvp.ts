import mongoose, { Document, Schema, Types } from 'mongoose';

export type EventRsvpStatus = 'pending' | 'confirmed' | 'cancelled';

export interface IEventRsvp extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  eventSlug: string;
  eventName: string;
  eventDate: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  adultsCount: number;
  childrenCount: number;
  message?: string;
  status: EventRsvpStatus;
  createdAt: Date;
  updatedAt: Date;
}

const eventRsvpSchema = new Schema<IEventRsvp>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    eventSlug: {
      type: String,
      required: true,
      index: true,
    },
    eventName: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    adultsCount: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    childrenCount: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
      default: 0,
    },
    message: {
      type: String,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        const obj = ret as Record<string, unknown>;
        delete obj.__v;
        return obj;
      },
    },
  }
);

eventRsvpSchema.index({ tenantId: 1, eventSlug: 1, createdAt: -1 });
eventRsvpSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
eventRsvpSchema.index({ email: 1 });

export const EventRsvp = mongoose.model<IEventRsvp>('EventRsvp', eventRsvpSchema);
