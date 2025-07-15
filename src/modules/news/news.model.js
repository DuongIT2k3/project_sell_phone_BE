import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true
    },
    seoTitle: {
        type: String,
        trim: true,
        maxlength: 60
    },
    seoDescription: {
        type: String,
        trim: true,
        maxlength: 160
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: null
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

// Index cho tìm kiếm
newsSchema.index({ title: 'text', content: 'text', tags: 'text' });
newsSchema.index({ slug: 1 }, { unique: true });
newsSchema.index({ authorId: 1 });
newsSchema.index({ isPublished: 1 });
newsSchema.index({ deletedAt: 1 });
newsSchema.index({ createdAt: -1 });
newsSchema.index({ tags: 1 });

// Virtual để tự động set publishedAt khi isPublished = true
newsSchema.pre('save', function(next) {
    if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    if (!this.isPublished) {
        this.publishedAt = null;
    }
    next();
});

const News = mongoose.model("News", newsSchema);
export default News;