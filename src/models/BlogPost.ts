import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
  tenantId?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category?: string;
  tags: string[];
  author: string;
  metaTitle?: string;
  metaDescription?: string;
  readTime?: number;
  status: 'draft' | 'published';
  featured: boolean;
  publishedAt?: Date;
  translations?: Record<
    string,
    {
      title?: string;
      excerpt?: string;
      content?: string;
      metaTitle?: string;
      metaDescription?: string;
    }
  >;
  // FAQ pairs from the content engine → FAQPage JSON-LD (rich results).
  faqs?: { question: string; answer: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogTranslationSchema = new Schema(
  {
    title: { type: String, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
  },
  { _id: false }
);

const blogPostSchema = new Schema<IBlogPost>(
  {
    // Optional tenant scope. Posts with no tenantId belong to the default site.
    tenantId: { type: String, trim: true, index: true },
    slug: { type: String, required: true, lowercase: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    featuredImage: { type: String, trim: true },
    category: { type: String, trim: true, index: true },
    tags: { type: [String], default: [] },
    author: { type: String, trim: true, default: 'Editorial Team' },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    readTime: { type: Number },
    status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, index: true },
    translations: { type: Map, of: BlogTranslationSchema },
    faqs: {
      type: [{ question: { type: String, trim: true }, answer: { type: String, trim: true }, _id: false }],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        const obj = ret as Record<string, unknown>;
        delete obj.__v;
        return obj;
      },
    },
  }
);

// Same slug may exist per tenant, but is unique within a tenant.
blogPostSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
blogPostSchema.index({ status: 1, publishedAt: -1 });

blogPostSchema.pre('save', function (next) {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
